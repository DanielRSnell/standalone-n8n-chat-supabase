import React from 'react';
import { X, Paperclip, File } from 'lucide-react';
import useStore from '../utils/store';

const FileAttachment = ({ file, onRemove }) => {
  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  return (
    <div className="flex items-center bg-base-300 border-b border-neutral px-3 py-2 gap-2">
      <File size={16} className="text-gray-400" />
      <div className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-xs text-gray-400">
        <div>{file.name}</div>
        <div className="text-xs opacity-70">{formatFileSize(file.size)}</div>
      </div>
      <button 
        onClick={() => onRemove(file.id)}
        className="bg-transparent border-none cursor-pointer p-1 rounded-full flex items-center justify-center"
        aria-label="Remove file"
      >
        <X size={16} className="text-gray-400" />
      </button>
    </div>
  );
};

const FileAttachments = () => {
  const { files, removeFile } = useStore();
  
  return (
    <div className="p-0">
      {/* File list */}
      <div>
        {files.map(file => (
          <FileAttachment 
            key={file.id} 
            file={file} 
            onRemove={removeFile} 
          />
        ))}
      </div>
    </div>
  );
};

export default FileAttachments;
