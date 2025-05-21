import useStore from './store';

/**
 * Creates and exposes the global API for GutenVibes
 * This allows external scripts to interact with the chat widget
 */
export const initGlobalApi = () => {
  // Get store methods
  const {
    sendMessage,
    openChat,
    closeChat,
    toggleChat,
    setCurrentView,
    navigateTo,
    setSession,
    addMessage,
    clearFiles
  } = useStore.getState();
  
  // We need to define setState separately as it's not a direct method
  const setState = (state) => useStore.setState(state);

  // Create the global API object
  const api = {
    // Chat control methods
    open: () => {
      openChat();
      return api;
    },
    close: () => {
      closeChat();
      return api;
    },
    toggle: () => {
      toggleChat();
      return api;
    },
    
    // Navigation methods
    navigateTo: (view, tabIndex) => {
      navigateTo(view, tabIndex);
      return api;
    },
    
    // Message methods
    sendMessage: (content, meta = {}) => {
      // Get the current config from the store
      const config = window.gutenvibesConfig || {};
      return sendMessage(content, config, meta);
    },
    
    // Session management
    getSession: () => {
      return useStore.getState().session;
    },
    setSession: (sessionId) => {
      setSession(sessionId);
      return api;
    },
    clearSession: () => {
      setSession(null);
      return api;
    },
    
    // History management
    loadHistoryIntoChat: (messages) => {
      // Clear existing messages
      setState({ messages: [] });
      
      // Add each message to the chat
      messages.forEach(message => {
        addMessage(message);
      });
      
      return api;
    },
    
    // File management
    clearFiles: () => {
      clearFiles();
      return api;
    },
    
    // State access (for advanced usage)
    getState: () => {
      return useStore.getState();
    }
  };
  
  // Expose the API globally
  window.vibe = api;
  
  return api;
};

export default initGlobalApi;
