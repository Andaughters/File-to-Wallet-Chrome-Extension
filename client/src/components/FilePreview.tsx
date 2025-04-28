import React from 'react';
import { formatFileSize } from '@/lib/fileUtils';

interface FilePreviewProps {
  file: File;
  fileType: string;
  fileSize: string;
  createdDate?: Date;
}

export default function FilePreview({ file, fileType, fileSize, createdDate }: FilePreviewProps) {
  // Date formatting
  const formattedDate = createdDate 
    ? new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(createdDate)
    : new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }).format(new Date(file.lastModified));

  // Calculate percentage of size limit (5MB)
  const MAX_SIZE = 5 * 1024 * 1024; // 5MB in bytes
  const percentageOfLimit = (file.size / MAX_SIZE) * 100;
  
  // Choose color based on file size
  let sizeBarColor = 'bg-green-500';
  if (percentageOfLimit > 75) sizeBarColor = 'bg-yellow-500';
  if (percentageOfLimit > 90) sizeBarColor = 'bg-red-500';

  // Get appropriate icon based on file type
  const getFileIcon = () => {
    if (fileType.includes('Text') || fileType.includes('JSON')) return 'description';
    if (fileType.includes('Image')) return 'image';
    if (fileType.includes('Archive')) return 'folder_zip';
    if (fileType.includes('Document')) return 'article';
    if (fileType.includes('Wallet') || fileType.includes('Key')) return 'vpn_key';
    return 'insert_drive_file';
  };

  return (
    <div className="mb-6 bg-primary border border-primary rounded-lg shadow-sm overflow-hidden">
      <div className="p-4">
        <div className="flex items-start mb-3">
          <span className="material-icons text-white mr-3 text-2xl">{getFileIcon()}</span>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-medium text-white truncate" title={file.name}>
              {file.name}
            </h3>
            <div className="mt-1 flex flex-wrap text-sm text-white text-opacity-80">
              <span className="mr-3 flex items-center">
                <span className="material-icons text-xs mr-1">label</span>
                {fileType}
              </span>
              <span className="mr-3 flex items-center">
                <span className="material-icons text-xs mr-1">schedule</span>
                {formattedDate}
              </span>
            </div>
          </div>
        </div>

        {/* File size visualization */}
        <div className="mt-3">
          <div className="flex justify-between text-xs text-white mb-1">
            <span>File Size: <span className="font-medium">{fileSize}</span></span>
            <span>Maximum: 5MB</span>
          </div>
          <div className="h-2 bg-white bg-opacity-20 rounded-full overflow-hidden">
            <div 
              className={`h-full bg-accent rounded-full`} 
              style={{ width: `${Math.min(percentageOfLimit, 100)}%` }}
            ></div>
          </div>
        </div>

        {/* File properties */}
        <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-white">
          <div className="flex items-center">
            <span className="material-icons text-accent mr-1 text-sm">check_circle</span>
            <span>Size: {fileSize}</span>
          </div>
          <div className="flex items-center">
            <span className="material-icons text-accent mr-1 text-sm">check_circle</span>
            <span>Type: {fileType}</span>
          </div>
          <div className="flex items-center">
            <span className="material-icons text-accent mr-1 text-sm">check_circle</span>
            <span>File Name: {file.name.length > 20 ? `${file.name.substring(0, 20)}...` : file.name}</span>
          </div>
          <div className="flex items-center">
            <span className="material-icons text-accent mr-1 text-sm">check_circle</span>
            <span>Last Modified: {formattedDate}</span>
          </div>
        </div>
      </div>
      
      {/* Success badge */}
      <div className="bg-secondary px-4 py-2 border-t border-secondary">
        <div className="flex items-center">
          <span className="material-icons text-white mr-2 text-sm">check_circle</span>
          <span className="text-xs text-white">File validated successfully and ready for conversion</span>
        </div>
      </div>
    </div>
  );
}