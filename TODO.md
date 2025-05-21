# GutenVibes Agent TODO List

This document outlines the missing functionality that needs to be implemented in the new React-based agent to match the capabilities of the legacy agent.

## Core Functionality

### Session Management

- [x] Implement session handling with localStorage
- [x] Check for existing 'x-session' in localStorage on component mount
- [x] Send session ID to n8n with every request
- [x] Store new session ID from n8n response in localStorage

### n8n Integration

- [x] Implement CONFIG route to initialize the agent and get session/Supabase credentials
- [x] Implement MESSAGE route to send messages to n8n
- [x] Handle file uploads through n8n
- [x] Support metadata in message requests (editors, etc.)

### Supabase Integration

- [x] Initialize Supabase client with credentials from n8n
- [x] Implement real-time message subscription
- [x] Load initial message history from Supabase
- [x] Handle new messages from Supabase subscription

## UI Components

### Chat Interface

- [x] Implement proper message rendering with user/bot indicators
- [x] Add support for htmx formatting in messages
- [x] Implement loading/typing indicators
- [x] Add proper error handling and error messages

### File Handling

- [x] Add file attachment functionality
- [x] Implement file selection and display count
- [x] Support multiple file uploads
- [x] Send files as metadata to n8n
- [x] Handle FormData requests with proper headers
- [x] Create n8n code block for processing FormData

### Navigation

- [x] Implement view switching (home/chat)
- [x] Add tab navigation
- [x] Support custom menu items from configuration

## Global API

- [x] Expose global API through window.vibe
- [x] Implement sendMessage method
- [x] Add chat control methods (open, close, toggle)
- [x] Add session management methods (getSession, setSession, clearSession)
- [x] Add history management methods (loadHistoryIntoChat)

## Configuration

- [ ] Support all configuration options from legacy agent
- [ ] Handle fallback endpoints
- [ ] Support data-endpoint attribute
- [ ] Support custom styling

## Event Handling

- [ ] Implement proper event delegation
- [ ] Add keyboard shortcuts (Escape to close, Enter to send)
- [ ] Add click outside handling
- [ ] Dispatch custom events (opened, closed, etc.)

## Performance & Optimization

- [ ] Implement proper cleanup of event listeners
- [ ] Add debouncing for toggle actions
- [ ] Optimize rendering for large message history
- [ ] Implement efficient DOM updates

## Integration with External Systems

- [ ] Support Monaco editor integration
- [ ] Add hooks for external plugins
- [ ] Support custom actions for menu items

## Data Flow Architecture

1. **Initial Load**:

   - Check localStorage for existing session
   - Send CONFIG request to n8n with existing session (if any)
   - Receive session ID and Supabase credentials from n8n
   - Initialize Supabase client
   - Load initial message history from Supabase
   - Subscribe to real-time messages

2. **Sending Messages**:

   - User enters message
   - Add temporary message to UI
   - Send message to n8n endpoint
   - n8n processes message and stores in Supabase
   - Receive message via Supabase subscription
   - Update UI with confirmed message

3. **Receiving Messages**:
   - Bot response is added to Supabase by n8n
   - Receive message via Supabase subscription
   - Add message to UI
   - Scroll to bottom

## Implementation Priority

1. Session management and n8n integration
2. Supabase integration for real-time messages
3. Core UI components and message handling
4. File upload functionality
5. Global API and external integrations
