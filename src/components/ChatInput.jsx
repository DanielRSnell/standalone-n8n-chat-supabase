import React, { useRef, useState } from 'react';
import { Send, Loader2, Paperclip, ChevronDown, ChevronUp, X, ArrowLeft } from 'lucide-react';
import FileAttachments from './FileAttachments';
import useStore from '../utils/store';

const ChatInput = ({ input, setInput, loading, onSend, placeholder, isOpen, disabled = false }) => {
  const { files, addFile } = useStore();
  const fileInputRef = useRef(null);
  const [showFileList, setShowFileList] = useState(false);
  
  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);
    selectedFiles.forEach(file => {
      addFile(file);
    });
    // Reset the input value so the same file can be selected again
    e.target.value = '';
    // Show the file list when files are added
    if (selectedFiles.length > 0) {
      setShowFileList(true);
    }
  };
  
  return (
  <>
    {/* Files tab - only show when files are present */}
    {files.length > 0 && (
      <div 
        className="flex items-center justify-between px-3 py-2 bg-base-300 mx-4 border-t border-l border-r border-neutral text-xs cursor-pointer"
        style={{
          borderBottom: showFileList ? 'none' : '1px solid #333'
        }}
        onClick={() => setShowFileList(!showFileList)}
      >
        <div className="flex items-center gap-1.5">
          <ArrowLeft className="w-4 h-4 text-gray-400" />
          <div className="flex items-center gap-1">
            <Paperclip className="w-4 h-4 text-gray-400" />
            <span className="text-gray-400">
              {files.length} {files.length === 1 ? 'file' : 'files'} with changes
            </span>
          </div>
        </div>
        {showFileList ? (
          <ChevronUp className="w-3.5 h-3.5 text-gray-400" />
        ) : (
          <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
        )}
      </div>
    )}
    
    {/* File list - only show when expanded */}
    {files.length > 0 && showFileList && (
      <div className="mx-4 bg-base-300 border-l border-r border-b border-neutral p-0">
        <FileAttachments />
      </div>
    )}
    
    <form
      className={`px-4 flex gap-2 relative ${files.length > 0 ? 'pb-2' : 'py-2 mt-2'}`}
      onSubmit={(e) => {
        e.preventDefault();
        if (input.trim() && !loading && !disabled) {
          onSend();
        }
      }}
      autoComplete="off"
    >
      <div className="relative flex-1 flex items-center">
        {/* File attachment area with icon outside button */}
        <div className="absolute left-3 flex items-center justify-center z-10">
          <Paperclip className="w-4 h-4 text-gray-400" />
        </div>
        
        {/* File attachment button - transparent overlay */}
        <button
          type="button"
          onClick={() => fileInputRef.current.click()}
          className="absolute left-0 bg-transparent border-none cursor-pointer p-2 w-10 h-full flex items-center justify-center z-20"
          aria-label="Attach file"
        >
          {/* Invisible button that covers the icon */}
        </button>
        
        {/* Hidden file input */}
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileSelect} 
          className="hidden" 
          multiple 
        />
        
        {/* Text input */}
        <input
          className={`w-full py-2.5 px-4 pl-10 rounded-none border border-neutral ${files.length > 0 && !showFileList ? 'border-t-0' : ''} bg-base-300 text-gray-400 outline-none text-sm`}
          type="text"
          placeholder={placeholder}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={disabled}
          autoFocus={isOpen && !disabled}
        />
      </div>
      
      {/* Send button */}
      <button 
        className={`bg-transparent text-primary border-none p-3 ml-1 flex items-center justify-center transition-colors rounded-full hover:bg-base-200 ${loading || !input.trim() ? 'cursor-not-allowed opacity-40' : 'cursor-pointer opacity-100'}`}
        type="submit" 
        disabled={loading || !input.trim() || disabled} 
        aria-label="Send message"
      >
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <Send className="w-5 h-5" />
        )}
      </button>
    </form>
  </>
  );
};

export default ChatInput;
