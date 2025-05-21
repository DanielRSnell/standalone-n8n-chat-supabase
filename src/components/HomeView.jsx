import React from 'react';
import { Bot } from 'lucide-react';
import useStore from '../utils/store';

const HomeView = () => {
  const { setCurrentView } = useStore();
  
  return (
    <div className="flex flex-col items-center justify-center p-6 h-full text-center text-gray-400">
      <Bot size={48} className="text-primary mb-4" />
      <h2 className="text-xl font-bold mb-2 text-white">
        Welcome to GutenVibes
      </h2>
      <p className="text-sm mb-6 max-w-xs">
        Your AI assistant for WordPress. Ask questions, get help with your site, or just chat!
      </p>
      <button
        onClick={() => setCurrentView('chat')}
        className="bg-primary text-white border-none rounded px-4 py-2.5 text-sm cursor-pointer flex items-center gap-2"
      >
        Start Chatting
      </button>
    </div>
  );
};

export default HomeView;
