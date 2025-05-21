import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Bot, User, LoaderCircle } from 'lucide-react';

const MessageBubble = ({ message, isUser }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 10 }}
    className={`flex gap-2 items-end mb-2 ${isUser ? 'justify-end' : 'justify-start'} ${message.isTemporary ? 'opacity-70' : 'opacity-100'}`}
  >
    {!isUser && <Bot className="w-5 h-5 text-primary" />}
    <div className={`rounded-2xl px-4 py-2 max-w-xs ${isUser ? 'bg-primary text-white border-none' : 'bg-base-200 text-white border border-white border-opacity-10'} shadow-sm`}>
      {isUser ? (
        // User messages are displayed as plain text
        <span className="text-sm">{message.text}</span>
      ) : (
        // System messages can contain HTML with prose styling
        <div 
          className="html-message prose prose-sm prose-invert max-w-none prose-headings:text-white prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-code:p-0.5 prose-code:rounded prose-pre:text-xs"
          dangerouslySetInnerHTML={{ __html: message.text }} 
        />
      )}
    </div>
    {isUser && <User className="w-5 h-5 text-primary" />}
  </motion.div>
);

const ChatMessages = ({ messages, loading, messagesEndRef }) => (
  <div className="flex-1 overflow-y-auto pb-2 pr-1 custom-scrollbar"
    style={{
      scrollbarWidth: 'thin',
      scrollbarColor: 'var(--color-primary) var(--color-base-300)'
    }}
  >
    <AnimatePresence initial={false}>
      {messages.map((msg) => (
        <MessageBubble key={msg.id} message={msg} isUser={msg.user} />
      ))}
      {loading && (
        <motion.div 
          key="loading" 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }} 
          className="flex justify-start mb-2"
        >
          <div className="flex items-center gap-2 bg-base-300 border border-white border-opacity-10 rounded-2xl px-4 py-2 shadow-sm">
            <LoaderCircle className="w-4 h-4 text-primary animate-spin" />
            <span>Thinking...</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
    <div ref={messagesEndRef} />
  </div>
);

export default ChatMessages;
