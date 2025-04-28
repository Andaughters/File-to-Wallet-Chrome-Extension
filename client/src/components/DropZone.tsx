import { useState, useRef } from 'react';

interface DropZoneProps {
  onFileSelected: (file: File) => void;
}

export default function DropZone({ onFileSelected }: DropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleBrowseLocal = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelected(e.target.files[0]);
    }
  };

  const handleZoneClick = () => {
    handleBrowseLocal();
  };

  return (
    <>
      {/* Drop Zone */}
      <div 
        className={`relative border-2 border-dashed border-white border-opacity-50 rounded-lg p-8 mb-4 transition-colors duration-200 hover:border-accent hover:bg-dark cursor-pointer ${isDragging ? 'border-accent bg-dark' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleZoneClick}
      >
        <div className="text-center">
          <span className="material-icons text-accent text-4xl mb-2">cloud_upload</span>
          <p className="text-white mb-1">Drag and drop a file here</p>
          <p className="text-sm text-white text-opacity-80">or use the button below</p>
        </div>
        
        {/* Drag Overlay */}
        {isDragging && (
          <div className="absolute inset-0 bg-accent bg-opacity-10 rounded-lg border-2 border-accent flex items-center justify-center">
            <p className="text-accent font-medium">Release to upload file</p>
          </div>
        )}
      </div>
      
      {/* File Source Button */}
      <div className="mb-4">
        <button 
          className="w-full flex items-center justify-center bg-primary text-white border border-primary rounded-md py-2 px-4 hover:bg-primary hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-opacity-50 transition-colors shadow-sm"
          onClick={handleBrowseLocal}
        >
          <span className="material-icons text-sm mr-2">folder_open</span>
          Browse Files
        </button>
      </div>
      
      {/* Hidden File Input */}
      <input 
        type="file" 
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileInputChange}
      />
    </>
  );
}
