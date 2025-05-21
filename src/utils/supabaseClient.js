import { createClient } from '@supabase/supabase-js';

// Store active subscriptions for cleanup
const activeSubscriptions = new Map();

/**
 * Initialize Supabase client with provided credentials
 * 
 * @param {string} supabaseUrl - Supabase project URL
 * @param {string} supabaseKey - Supabase API key
 * @returns {Object} Supabase client instance
 */
export async function initializeSupabase(supabaseUrl, supabaseKey) {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase URL and key are required');
  }
  
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Test connection
    const { data, error } = await supabase.from('messages').select('id').limit(1);
    
    if (error) {
      console.error('[GutenVibes] Supabase connection test failed:', error);
      throw error;
    }
    
    console.log('[GutenVibes] Supabase initialized successfully');
    return supabase;
  } catch (error) {
    console.error('[GutenVibes] Failed to initialize Supabase client:', error);
    throw error;
  }
}

/**
 * Subscribe to real-time messages for a specific session
 * 
 * @param {Object} supabase - Supabase client instance
 * @param {string} sessionId - Session ID to subscribe to
 * @param {Function} onNewMessage - Callback function for new messages
 * @returns {Object} Subscription object
 */
export function subscribeToMessages(supabase, sessionId, onNewMessage) {
  if (!supabase || !sessionId) {
    console.error('[GutenVibes] Cannot subscribe: missing Supabase client or session ID');
    return null;
  }
  
  // Clean up existing subscription for this session if it exists
  if (activeSubscriptions.has(sessionId)) {
    activeSubscriptions.get(sessionId).unsubscribe();
    activeSubscriptions.delete(sessionId);
  }
  
  try {
    // Subscribe to INSERT events on messages table filtered by session_id
    const subscription = supabase
      .channel(`messages-${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `session_id=eq.${sessionId}`
        },
        (payload) => {
          console.log('[GutenVibes] New message received:', payload);
          if (payload.new && typeof onNewMessage === 'function') {
            onNewMessage(payload.new);
          }
        }
      )
      .subscribe();
    
    // Store subscription for later cleanup
    activeSubscriptions.set(sessionId, subscription);
    
    console.log(`[GutenVibes] Subscribed to messages for session: ${sessionId}`);
    return subscription;
  } catch (error) {
    console.error('[GutenVibes] Error subscribing to messages:', error);
    return null;
  }
}

/**
 * Unsubscribe from messages for a specific session
 * 
 * @param {string} sessionId - Session ID to unsubscribe from
 */
export function unsubscribeFromMessages(sessionId) {
  if (activeSubscriptions.has(sessionId)) {
    const subscription = activeSubscriptions.get(sessionId);
    subscription.unsubscribe();
    activeSubscriptions.delete(sessionId);
    console.log(`[GutenVibes] Unsubscribed from messages for session: ${sessionId}`);
  }
}

/**
 * Load initial message history from Supabase
 * 
 * @param {Object} supabase - Supabase client instance
 * @param {string} sessionId - Session ID to load messages for
 * @returns {Array} Array of message objects
 */
export async function loadMessageHistory(supabase, sessionId) {
  if (!supabase || !sessionId) {
    console.error('[GutenVibes] Cannot load history: missing Supabase client or session ID');
    return [];
  }
  
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });
      
    if (error) {
      console.error('[GutenVibes] Error loading message history:', error);
      throw error;
    }
    
    console.log(`[GutenVibes] Loaded ${data?.length || 0} messages for session: ${sessionId}`);
    return data || [];
  } catch (error) {
    console.error('[GutenVibes] Error loading message history:', error);
    return [];
  }
}

/**
 * Clean up all Supabase subscriptions
 */
export function cleanupSupabaseSubscriptions() {
  activeSubscriptions.forEach((subscription, sessionId) => {
    subscription.unsubscribe();
    console.log(`[GutenVibes] Cleaned up subscription for session: ${sessionId}`);
  });
  
  activeSubscriptions.clear();
}
