import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// Create the store with persistence to localStorage
const useStore = create(
  persist(
    (set, get) => ({
      // Session state
      session: null,
      isInitialized: false,
      
      // UI state
      isOpen: false,
      currentView: 'home', // 'home' or 'chat'
      loading: false,
      error: null,
      activeTab: 0, // For tab navigation
      
      // Messages state
      messages: [],
      
      // Supabase state
      supabase: null,
      supabaseInitialized: false,
      
      // File state
      files: [],
      
      // Actions
      
      // Session actions
      setSession: (session) => set({ session }),
      
      // Initialize the agent
      initialize: async (config) => {
        try {
          set({ loading: true, error: null });
          
          // Check for existing session in localStorage (handled by persist middleware)
          const { session } = get();
          console.log('[GutenVibes] Initializing with session:', session);
          
          // Send CONFIG request to n8n
          const response = await fetch(config.globalConfig?.load, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              route: 'CONFIG',
              config,
              session: session || null
            })
          });
          
          if (!response.ok) {
            throw new Error(`Backend responded with status: ${response.status}`);
          }
          
          const data = await response.json();
          
          // Store session ID
          set({ session: data.session });
          
          // Initialize Supabase if credentials are provided
          if (data.supabase_url && data.supabase_key) {
            // We'll implement Supabase initialization in a separate function
            await get().initializeSupabase(data.supabase_url, data.supabase_key);
          }
          
          set({ isInitialized: true, loading: false });
          return true;
        } catch (error) {
          console.error('[GutenVibes] Initialization error:', error);
          set({ error: error.message, loading: false });
          return false;
        }
      },
      
      // Initialize Supabase
      initializeSupabase: async (url, key) => {
        try {
          const { session } = get();
          
          if (!session) {
            console.error('[GutenVibes] Cannot initialize Supabase without a session ID');
            return false;
          }
          
          // Import Supabase utilities dynamically to avoid circular dependencies
          const { 
            initializeSupabase: initSupabase, 
            subscribeToMessages, 
            loadMessageHistory 
          } = await import('./supabaseClient');
          
          // Initialize Supabase client
          const supabase = await initSupabase(url, key);
          
          // Store Supabase client in state
          set({ supabase });
          
          // Load message history
          const messages = await loadMessageHistory(supabase, session);
          
          // Update messages in state
          if (messages && messages.length > 0) {
            set({ messages });
            console.log(`[GutenVibes] Loaded ${messages.length} messages from history`);
          }
          
          // Subscribe to new messages
          const subscription = subscribeToMessages(supabase, session, (newMessage) => {
            // Use the addMessage action to add new messages from Supabase
            get().addMessage(newMessage);
          });
          
          set({ supabaseInitialized: true });
          console.log('[GutenVibes] Supabase initialized successfully');
          return true;
        } catch (error) {
          console.error('[GutenVibes] Supabase initialization error:', error);
          set({ error: error.message });
          return false;
        }
      },
      
      // Send a message to n8n
      sendMessage: async (content, config, meta = {}) => {
        try {
          const { session, messages, files } = get();
          
          // Generate a temporary ID for the message
          const tempId = `temp-${Date.now()}`;
          
          // Create message object with a temporary flag
          const message = {
            id: tempId,
            session_id: session,
            content,
            role: 'user',
            created_at: new Date().toISOString(),
            meta,
            isTemporary: true // Flag to indicate this is a temporary message
          };
          
          // Add message to state immediately for UI feedback
          set({ messages: [...messages, message], loading: true });
          
          // Prepare file metadata for the payload
          const fileMetadata = files.map(file => ({
            id: file.id,
            name: file.name,
            size: file.size,
            type: file.type
          }));
          
          // Include files in the meta data if any
          if (files.length > 0) {
            // Create FormData for file uploads
            const formData = new FormData();
            
            // Add each file to FormData
            files.forEach(file => {
              formData.append('files[]', file.file, file.name);
            });
            
            // Store FormData for use in the fetch request
            meta.formData = formData;
          }
          
          // Determine the endpoint to use
          const endpoint = config.globalConfig?.chat;
          
          if (!endpoint) {
            throw new Error('Chat endpoint is not defined in configuration');
          }
          
          let response;
          
          // Prepare files array for the payload
          const filesForPayload = files.length > 0 ? fileMetadata : [];
          
          // If we have files, use FormData for the request
          if (meta.formData) {
            // Add basic fields directly
            meta.formData.append('route', 'MESSAGE');
            meta.formData.append('message', JSON.stringify(message));
            meta.formData.append('session', session);
            meta.formData.append('files', JSON.stringify(fileMetadata));
            
            // Files are already added as 'files[]' in the FormData above
            
            // Send the request with appropriate headers
            response = await fetch(endpoint, {
              method: 'POST',
              // Don't set Content-Type header - browser will set it with boundary parameter
              // Setting it manually can cause issues with multipart/form-data
              headers: {
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
              },
              body: meta.formData
            });
          } else {
            // Regular JSON request without files
            response = await fetch(endpoint, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                route: 'MESSAGE',
                message,
                session,
                files: filesForPayload
              })
            });
          }
          
          if (!response.ok) {
            throw new Error(`Backend responded with status: ${response.status}`);
          }
          
          // We don't need to parse the response as JSON since we're using Supabase for updates
          console.log('[GutenVibes] Message sent successfully to n8n');
          
          // Clear files after sending
          if (files.length > 0) {
            set({ files: [] });
          }
          
          set({ loading: false });
          return true;
        } catch (error) {
          console.error('[GutenVibes] Error sending message:', error);
          
          // Remove the temporary message
          const { messages } = get();
          set({ 
            messages: messages.filter(m => !m.id.startsWith('temp-')),
            loading: false,
            error: error.message
          });
          
          return false;
        }
      },
      
      // Add a new message (from Supabase subscription)
      addMessage: (message) => {
        const { messages } = get();
        
        // Check if this is a user message that might be a duplicate of a temporary message
        if (message.role === 'user') {
          // Look for a temporary message with similar content
          const tempMessageIndex = messages.findIndex(m => 
            m.id.startsWith('temp-') && 
            m.role === 'user' && 
            m.content === message.content
          );
          
          if (tempMessageIndex !== -1) {
            // Replace the temporary message with the real one
            const updatedMessages = [...messages];
            updatedMessages[tempMessageIndex] = message;
            set({ messages: updatedMessages });
            return;
          }
        }
        
        // If no temporary message found or this is a system message, add it normally
        set({ messages: [...messages, message] });
      },
      
      // UI actions
      openChat: () => set({ isOpen: true }),
      closeChat: () => set({ isOpen: false }),
      toggleChat: () => set(state => ({ isOpen: !state.isOpen })),
      setCurrentView: (view) => set({ currentView: view }),
      setActiveTab: (tabIndex) => set({ activeTab: tabIndex }),
      
      // Navigation actions
      navigateTo: (view, tabIndex = null) => {
        const updates = { currentView: view };
        if (tabIndex !== null) updates.activeTab = tabIndex;
        set(updates);
      },
      
      // File actions
      addFile: (file) => {
        const { files } = get();
        const newFile = {
          id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: file.name,
          size: file.size,
          type: file.type,
          file
        };
        set({ files: [...files, newFile] });
      },
      removeFile: (fileId) => {
        const { files } = get();
        set({ files: files.filter(f => f.id !== fileId) });
      },
      clearFiles: () => set({ files: [] })
    }),
    {
      name: 'gutenvibes-storage',
      storage: createJSONStorage(() => localStorage),
      // Only persist these keys to localStorage
      partialize: (state) => ({
        session: state.session,
        messages: state.messages,
        currentView: state.currentView,
        activeTab: state.activeTab,
        isOpen: state.isOpen
      })
    }
  )
);

export default useStore;
