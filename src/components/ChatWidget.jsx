import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Bot, AlertCircle } from 'lucide-react';
import ChatHeader from './ChatHeader';
import ChatMessages from './ChatMessages';
import ChatInput from './ChatInput';
import Navigation from './Navigation';
import HomeView from './HomeView';
import useStore from '../utils/store';
import 'daisyui';

function loadConfig(configId = 'agent-config') {
  // Try to find the config element by ID
  const el = document.getElementById(configId);
  if (!el) {
    console.warn(`Config element with ID '${configId}' not found, falling back to default`);
    // If specific ID not found, try the default
    if (configId !== 'agent-config') {
      return loadConfig('agent-config');
    }
    return {};
  }
  
  try {
    return JSON.parse(el.textContent);
  } catch (e) {
    console.error(`Failed to parse config from element '${configId}':`, e);
    return {};
  }
}

// Note: Supabase initialization is now handled directly in the store

const MessageBubble = ({ message, isUser }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 10 }}
    className={`chat-bubble flex gap-2 items-end mb-2 ${isUser ? 'justify-end' : 'justify-start'}`}
  >
    {!isUser && <Bot className="w-5 h-5 text-primary" />}
    <div className={`rounded-2xl px-4 py-2 max-w-xs ${isUser ? 'bg-primary text-primary-content' : 'bg-base-300 text-base-content border'} shadow-sm`}>
      {message.text}
    </div>
    {isUser && <User className="w-5 h-5 text-primary" />}
  </motion.div>
);

const ChatWidget = ({ configId, theme, mode, startOpen: initialOpen }) => {
  // Get state and actions from Zustand store
  const { 
    isOpen, 
    messages, 
    loading, 
    error,
    session,
    isInitialized,
    supabase,
    supabaseInitialized,
    currentView,
    
    // Actions
    initialize,
    sendMessage,
    addMessage,
    openChat,
    closeChat,
    toggleChat,
    setSession,
    setCurrentView
  } = useStore();
  
  // Local state for config
  const configRef = useRef(null);
  const messagesEndRef = useRef(null);
  const [input, setInput] = useState('');

  useEffect(() => {
    // Load configuration
    const loadedConfig = loadConfig(configId);
    configRef.current = loadedConfig;
    
    // Apply prop overrides to the loaded config
    if (theme || mode) {
      if (theme && loadedConfig.globalConfig) {
        loadedConfig.globalConfig.widgetColor = theme;
      }
      
      if (mode && loadedConfig.globalConfig) {
        loadedConfig.globalConfig.mode = mode;
      }
    }
    
    // Set initial open state if provided
    if (initialOpen) {
      openChat();
    }
    
    // Initialize the agent with the loaded config
    if (loadedConfig.globalConfig?.load) {
      console.log('[GutenVibes] Initializing agent with config:', loadedConfig);
      initialize(loadedConfig).then(success => {
        if (success) {
          console.log('[GutenVibes] Agent initialized successfully');
        } else {
          console.error('[GutenVibes] Agent initialization failed');
        }
      });
    } else {
      console.warn('[GutenVibes] No load endpoint found in config');
    }
    
    // Cleanup function
    return () => {
      // Dynamically import and call cleanupSupabaseSubscriptions
      import('../utils/supabaseClient').then(({ cleanupSupabaseSubscriptions }) => {
        cleanupSupabaseSubscriptions();
      });
    };
  }, [configId, theme, mode, initialOpen, initialize, openChat]);

  // Scroll to bottom when messages change, chat is opened, or view changes to chat
  useEffect(() => {
    if (isOpen && currentView === 'chat' && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, currentView]);
  
  // Handle sending a message
  const handleSend = async () => {
    if (!input.trim()) return;
    
    // Send message using the store action
    await sendMessage(input.trim(), configRef.current);
    
    // Clear input field
    setInput('');
  };

  // Log when the component renders for debugging
  useEffect(() => {
    console.log('ChatWidget mounted with config:', configRef.current);
    console.log('isOpen state:', isOpen);
  }, [isOpen]);

  // Format messages for display
  const formattedMessages = messages.map(msg => ({
    id: msg.id,
    text: msg.content || msg.text, // Support both formats
    user: msg.role === 'user' || msg.user === true,
    isTemporary: msg.isTemporary || false // Pass the temporary flag
  }));
  
  return (
    <div data-theme="dark" className="relative rounded-3xl">
      {/* Toggle Button - Fixed position, only show when chat is closed */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ opacity: 1, scale: 1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            className="bg-primary text-white overflow-hidden rounded-full p-3 flex items-center gap-2 cursor-pointer shadow-lg border-none min-w-12 min-h-12 justify-center transition-all hover:shadow-xl hover:scale-105 fixed bottom-6 right-6 z-50"
            onClick={toggleChat}
            aria-label="Open chat"
            style={{
              backgroundColor: configRef.current?.globalConfig?.widgetColor || '#6200EE',
              color: configRef.current?.globalConfig?.textColorOnPrimary || '#FFFFFF'
            }}
          >
            <Bot className="w-5 h-5" />
            <span className="hidden sm:inline font-medium">Chat</span>
          </motion.button>
        )}
      </AnimatePresence>
      
      {/* Chat Drawer - Fixed position */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="w-[95vw] max-w-md bg-base-300 rounded-2xl shadow-2xl fixed bottom-6 right-6 z-50 flex flex-col h-[70vh] border border-opacity-10 border-white font-sans"
          >
            {/* Header */}
            <ChatHeader 
              companyName={'GutenVibes'} 
              onClose={closeChat} 
            />
            
            {/* Error message if there is one */}
            {error && (
              <div className="max-w-sm mx-auto bg-error bg-opacity-10 text-error font-semibold text-error-content px-4 py-2.5 rounded-lg mb-3 flex items-center gap-2 text-sm border border-error border-opacity-20">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}
            
            {/* Main Content Area - Conditionally render based on currentView */}
            <div className="flex-1 overflow-auto pl-4 flex flex-col custom-scrollbar"
              style={{
                scrollbarWidth: 'thin',
                scrollbarColor: 'var(--color-primary) var(--color-base-300)'
              }}
            >
              {currentView === 'chat' ? (
                <>
                  {/* Chat Content */}
                  <ChatMessages 
                    messages={formattedMessages} 
                    loading={loading} 
                    messagesEndRef={messagesEndRef} 
                  />
                  
                  {/* Footer / Input */}
                  <ChatInput
                    input={input}
                    setInput={setInput}
                    loading={loading}
                    onSend={handleSend}
                    placeholder={configRef.current?.globalConfig?.inputPlaceholder || 'Type your message...'}
                    isOpen={isOpen}
                    disabled={!isInitialized || !session}
                  />
                </>
              ) : (
                <HomeView />
              )}
            </div>
            
            {/* Navigation */}
            <Navigation 
              customMenuItems={configRef.current?.globalConfig?.menuItems || []} 
              messagesEndRef={messagesEndRef}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChatWidget;
