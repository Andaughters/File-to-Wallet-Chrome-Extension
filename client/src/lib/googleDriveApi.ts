/**
 * Interface for file data retrieved from Google Drive
 */
interface DriveFileData {
  id: string;
  name: string;
  mimeType: string;
  size: string;
  content?: string;
}

/**
 * Retrieves a list of files from Google Drive
 */
export async function listFiles(token: string): Promise<DriveFileData[]> {
  try {
    const response = await fetch('https://www.googleapis.com/drive/v3/files?fields=files(id,name,mimeType,size)', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to list files: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.files || [];
  } catch (error) {
    console.error('Error listing Drive files:', error);
    throw error;
  }
}

/**
 * Downloads a file from Google Drive by ID
 */
export async function downloadFile(fileId: string, token: string): Promise<string> {
  try {
    const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to download file: ${response.status} ${response.statusText}`);
    }
    
    return await response.text();
  } catch (error) {
    console.error('Error downloading Drive file:', error);
    throw error;
  }
}

/**
 * Gets metadata about a Google Drive file
 */
export async function getFileMetadata(fileId: string, token: string): Promise<DriveFileData> {
  try {
    const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?fields=id,name,mimeType,size`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to get file metadata: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error getting Drive file metadata:', error);
    throw error;
  }
}
