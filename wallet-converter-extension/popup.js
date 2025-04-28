/**
 * Wallet Converter - Chrome Extension
 * popup.js - Main extension script
 */

// DOM Elements
const dropzone = document.getElementById('dropzone');
const fileInput = document.getElementById('file_input');
const browseButton = document.getElementById('browse_button');
const uploadContainer = document.getElementById('upload_container');
const filePreviewSection = document.getElementById('file_preview');
const fileOptionsSection = document.getElementById('file_options');
const removeFileButton = document.getElementById('remove_file');
const formatOptions = document.querySelectorAll('input[name="format"]');
const filenameInput = document.getElementById('filename_input');
const extensionDisplay = document.getElementById('extension_display');
const sizeEstimate = document.getElementById('size_estimate');
const generateButton = document.getElementById('generate_wallet');
const processingStatus = document.getElementById('processing_status');
const successMessage = document.getElementById('success_message');
const errorMessage = document.getElementById('error_message');
const errorDetails = document.getElementById('error_details');
const tryAgainButton = document.getElementById('try_again');

// Global state
let currentFile = null;
let currentContent = null;
let outputFormat = 'wallet'; // Default format
let cryptoType = 'Unknown';

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  initializeApp();
});

function initializeApp() {
  // Setup drag and drop
  dropzone.addEventListener('dragover', handleDragOver);
  dropzone.addEventListener('dragleave', handleDragLeave);
  dropzone.addEventListener('drop', handleDrop);
  
  // Setup file input
  browseButton.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', handleFileInputChange);
  
  // Setup remove file button
  removeFileButton.addEventListener('click', resetFileSelection);
  
  // Setup format options
  formatOptions.forEach(option => {
    option.addEventListener('change', handleFormatChange);
  });
  
  // Setup filename input
  filenameInput.addEventListener('input', handleFilenameChange);
  
  // Setup generate button
  generateButton.addEventListener('click', handleGenerateWallet);
  
  // Setup try again button
  tryAgainButton.addEventListener('click', resetFileSelection);
}

// Drag and drop handlers
function handleDragOver(e) {
  e.preventDefault();
  e.stopPropagation();
  dropzone.classList.add('drag-over');
}

function handleDragLeave(e) {
  e.preventDefault();
  e.stopPropagation();
  dropzone.classList.remove('drag-over');
}

function handleDrop(e) {
  e.preventDefault();
  e.stopPropagation();
  dropzone.classList.remove('drag-over');
  
  if (e.dataTransfer.files.length) {
    handleFile(e.dataTransfer.files[0]);
  }
}

function handleFileInputChange(e) {
  if (e.target.files.length) {
    handleFile(e.target.files[0]);
  }
}

// File handling
function handleFile(file) {
  // Reset UI
  hideElement(errorMessage);
  
  // First check file size (max 5MB)
  const MAX_SIZE = 5 * 1024 * 1024; // 5MB in bytes
  if (file.size > MAX_SIZE) {
    showError(`File is too large (${formatFileSize(file.size)}). Maximum supported size is ${formatFileSize(MAX_SIZE)}.`);
    return;
  }
  
  // Read the file
  const reader = new FileReader();
  
  reader.onload = function(event) {
    const content = event.target.result;
    
    // Validate if the file contains cryptocurrency material
    if (!validateCryptoContent(content)) {
      showError("Invalid file. No cryptocurrency keys, seeds, or wallet data found. Please upload a valid key or wallet file.");
      return;
    }
    
    // Store the content for later use
    currentFile = file;
    currentContent = content;
    cryptoType = detectCryptoContentType(content);
    
    // Set filename
    const baseFilename = file.name.replace(/\.[^/.]+$/, ""); // Remove extension
    filenameInput.value = baseFilename;
    
    // Show file preview and options
    displayFilePreview(file);
    updateOutputSizeEstimate();
    
    // Enable generate button
    generateButton.disabled = false;
  };
  
  reader.onerror = function() {
    showError("Failed to read the file. Please try again.");
  };
  
  reader.readAsText(file);
}

function displayFilePreview(file) {
  // Get file info
  const fileType = getFileType(file);
  const fileSize = formatFileSize(file.size);
  const percentOfLimit = (file.size / (5 * 1024 * 1024)) * 100; // Percentage of 5MB
  
  // Determine progress bar color
  let sizeBarClass = '';
  if (percentOfLimit > 75) sizeBarClass = 'warning';
  if (percentOfLimit > 90) sizeBarClass = 'danger';
  
  // Create file preview HTML
  const previewHTML = `
    <div class="file-preview-header">
      <span class="material-icons">${getFileIcon(fileType)}</span>
      <div class="file-preview-info">
        <div class="file-preview-name">${file.name}</div>
        <div class="file-preview-meta">${fileType} • ${fileSize} • ${cryptoType}</div>
      </div>
    </div>
    
    <div class="file-preview-size-bar">
      <div class="size-bar-labels">
        <span>File Size: ${fileSize}</span>
        <span>Maximum: 5MB</span>
      </div>
      <div class="size-bar">
        <div class="size-bar-fill ${sizeBarClass}" style="width: ${Math.min(percentOfLimit, 100)}%"></div>
      </div>
    </div>
    
    <div class="file-preview-properties">
      <div class="file-preview-property">
        <span class="material-icons">check_circle</span>
        <span>Size: ${fileSize}</span>
      </div>
      <div class="file-preview-property">
        <span class="material-icons">check_circle</span>
        <span>Type: ${fileType}</span>
      </div>
      <div class="file-preview-property">
        <span class="material-icons">check_circle</span>
        <span>Last Modified: ${formatDate(file.lastModified)}</span>
      </div>
      <div class="file-preview-property">
        <span class="material-icons">check_circle</span>
        <span>Crypto: ${cryptoType}</span>
      </div>
    </div>
    
    <div class="file-preview-success">
      <span class="material-icons">check_circle</span>
      <span>File validated successfully and ready for conversion</span>
    </div>
  `;
  
  // Update and show preview
  filePreviewSection.innerHTML = previewHTML;
  showElement(filePreviewSection);
  showElement(fileOptionsSection);
  hideElement(uploadContainer);
}

function getFileIcon(fileType) {
  if (fileType.includes('Text') || fileType.includes('JSON')) return 'description';
  if (fileType.includes('Image')) return 'image';
  if (fileType.includes('Archive')) return 'folder_zip';
  if (fileType.includes('Document')) return 'article';
  if (fileType.includes('Wallet') || fileType.includes('Key')) return 'vpn_key';
  return 'insert_drive_file';
}

function getFileType(file) {
  const extension = file.name.split('.').pop()?.toLowerCase() || '';
  
  // Text and common formats
  if (['txt', 'text', 'csv', 'tsv'].includes(extension)) {
    return 'Text';
  }
  
  // JSON formats (includes Ethereum keystores)
  if (['json', 'keystore'].includes(extension)) {
    return 'JSON';
  }
  
  // Bitcoin and wallet data files
  if (['dat', 'wallet', 'wlt', 'db'].includes(extension)) {
    return 'Wallet Database';
  }
  
  // Seeds and keys
  if (['seed', 'key', 'keys', 'pkey'].includes(extension)) {
    return 'Key/Seed File';
  }
  
  // Common document formats
  if (['pdf', 'doc', 'docx', 'rtf', 'odt'].includes(extension)) {
    return 'Document';
  }
  
  // If we detect an extension, show it
  if (extension) {
    // Capitalize extension for display
    return extension.toUpperCase() + ' File';
  }
  
  // If no extension, show generic
  return 'Data File';
}

function formatDate(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleDateString(undefined, { 
    month: 'short', 
    day: 'numeric',
    year: 'numeric'
  });
}

function resetFileSelection() {
  // Clear state
  currentFile = null;
  currentContent = null;
  cryptoType = 'Unknown';
  
  // Reset UI
  fileInput.value = '';
  filenameInput.value = '';
  hideElement(filePreviewSection);
  hideElement(fileOptionsSection);
  hideElement(errorMessage);
  hideElement(successMessage);
  hideElement(processingStatus);
  showElement(uploadContainer);
  
  // Disable generate button
  generateButton.disabled = true;
}

// Format handling
function handleFormatChange(e) {
  outputFormat = e.target.value;
  extensionDisplay.textContent = outputFormat === 'wallet' ? '.wallet' : '.dat';
  updateOutputSizeEstimate();
}

// Filename handling
function handleFilenameChange(e) {
  // Remove any file extension the user might add
  const cleanFilename = e.target.value.replace(/\.(wallet|dat)$/i, '');
  filenameInput.value = cleanFilename;
}

// Size estimation
function updateOutputSizeEstimate() {
  if (!currentContent) return;
  
  try {
    const estimatedBytes = estimateOutputSize(currentContent, outputFormat);
    sizeEstimate.textContent = formatFileSize(estimatedBytes);
  } catch (error) {
    console.error('Error estimating output size:', error);
    sizeEstimate.textContent = 'Unknown';
  }
}

// Wallet generation
function handleGenerateWallet() {
  if (!currentContent) return;
  
  // Show processing state
  showElement(processingStatus);
  hideElement(filePreviewSection);
  hideElement(fileOptionsSection);
  hideElement(errorMessage);
  hideElement(successMessage);
  generateButton.disabled = true;
  
  // Simulate processing (can be removed in production)
  setTimeout(() => {
    try {
      let walletData;
      let mimeType;
      let fileExtension;
      
      if (outputFormat === 'wallet') {
        walletData = buildWallet(currentContent);
        mimeType = 'application/json';
        fileExtension = '.wallet';
      } else {
        // For wallet.dat, we're getting an ArrayBuffer
        walletData = buildWalletDat(currentContent);
        mimeType = 'application/octet-stream';
        fileExtension = '.dat';
      }
      
      // Generate filename using the user's custom name if provided, otherwise use a default
      const filename = filenameInput.value.trim() || 'wallet';
      downloadWalletFile(walletData, filename + fileExtension, mimeType);
      
      // Show success message
      hideElement(processingStatus);
      showElement(successMessage);
      
      // After a delay, allow the user to generate again or start over
      setTimeout(() => {
        generateButton.disabled = false;
        showElement(filePreviewSection);
        showElement(fileOptionsSection);
      }, 2000);
      
    } catch (error) {
      // Show error message
      hideElement(processingStatus);
      showError(error.message || 'Failed to generate wallet file.');
      generateButton.disabled = false;
      showElement(filePreviewSection);
      showElement(fileOptionsSection);
    }
  }, 1500); // Simulated processing time (1.5 seconds)
}

function downloadWalletFile(data, filename, mimeType) {
  // Use chrome.downloads API for Chrome extensions
  if (typeof chrome !== 'undefined' && chrome.downloads) {
    const blob = new Blob([data], { type: mimeType });
    const url = URL.createObjectURL(blob);
    
    chrome.downloads.download({
      url: url,
      filename: filename,
      saveAs: true
    });
  } else {
    // Fallback for development environment
    const blob = new Blob([data], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

// Helper functions
function showElement(element) {
  element.classList.remove('hidden');
  element.classList.add('fade-in');
}

function hideElement(element) {
  element.classList.add('hidden');
  element.classList.remove('fade-in');
}

function showError(message) {
  errorDetails.textContent = message || 'An unknown error occurred.';
  showElement(errorMessage);
}

// For development/debugging
function logInfo(message) {
  console.log(`[Wallet Converter] ${message}`);
}