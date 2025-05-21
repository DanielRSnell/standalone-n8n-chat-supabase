import React from 'react';
import { Home, MessageCircle } from 'lucide-react';
import useStore from '../utils/store';

const Navigation = ({ customMenuItems = [], messagesEndRef }) => {
  const { currentView, setCurrentView } = useStore();
  
  // Function to handle chat tab click
  const handleChatTabClick = () => {
    setCurrentView('chat');
    
    // Add a small delay to ensure the view has switched before scrolling
    setTimeout(() => {
      if (messagesEndRef && messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  return (
    <div id="chat-navigation" className="flex rounded-3xl justify-center py-2 border-t border-neutral bg-base-300">
      <div className="flex gap-4 items-center">
        {/* Home tab */}
        <button
          onClick={() => setCurrentView('home')}
          className={`flex flex-col items-center gap-1 bg-transparent border-none cursor-pointer p-2 rounded transition-colors ${currentView === 'home' ? 'text-primary' : 'text-gray-400'}`}
        >
          <Home size={20} />
          <span className="text-xs">Home</span>
        </button>

        {/* Chat tab */}
        <button
          onClick={handleChatTabClick}
          className={`flex flex-col items-center gap-1 bg-transparent border-none cursor-pointer p-2 rounded transition-colors ${currentView === 'chat' ? 'text-primary' : 'text-gray-400'}`}
        >
          <MessageCircle size={20} />
          <span className="text-xs">Chat</span>
        </button>

        {/* Custom menu items */}
        {customMenuItems.map((item, index) => (
          <button
            key={index}
            onClick={() => {
              if (item.action) item.action();
              if (item.view) setCurrentView(item.view);
            }}
            className={`flex flex-col items-center gap-1 bg-transparent border-none cursor-pointer p-2 rounded transition-colors ${currentView === item.view ? 'text-primary' : 'text-gray-400'}`}
          >
            {item.icon}
            <span className="text-xs">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Navigation;
