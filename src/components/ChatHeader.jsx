import React from 'react';
import { Bot, X } from 'lucide-react';

const ChatHeader = ({ companyName, onClose }) => (
  <div className="flex p-4 pt-4 items-center justify-between mb-2 py-1 text-white">
    <div className="flex items-center gap-2">
      <Bot className="w-6 h-6 text-primary" />
      <span className="font-bold text-lg">{companyName}</span>
    </div>
    <button 
      onClick={onClose} 
      aria-label="Close chat" 
      className="bg-base-200 hover:bg-base-100 transition-colors border-none cursor-pointer p-2 rounded-full flex items-center justify-center"
    >
      <X className="w-4 h-4 text-white" />
    </button>
  </div>
);

export default ChatHeader;
