document.addEventListener('DOMContentLoaded', function() {
  // DOM elements
  const dropZone = document.getElementById('drop_zone');
  const fileInput = document.getElementById('file_input');
  const browseLocalBtn = document.getElementById('browse_local');
  const generateWalletBtn = document.getElementById('generate_wallet');
  const fileInfoContainer = document.getElementById('file_info_container');
  const fileName = document.getElementById('file_name');
  const fileDetails = document.getElementById('file_details');
  const removeFileBtn = document.getElementById('remove_file');
  const walletFormatBtn = document.getElementById('wallet_format');
  const datFormatBtn = document.getElementById('dat_format');
  const processingStatus = document.getElementById('processing_status');
  const successMessage = document.getElementById('success_message');
  const errorMessage = document.getElementById('error_message');
  const errorDetails = document.getElementById('error_details');
  const tryAgainBtn = document.getElementById('try_again');
  
  // File and format state
  let currentFile = null;
  let fileContent = null;
  let outputFormat = 'wallet';
  
  // Event listeners for drag and drop
  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('active');
  });
  
  dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('active');
  });
  
  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('active');
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  });
  
  // Click handlers
  dropZone.addEventListener('click', () => {
    fileInput.click();
  });
  
  fileInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelection(e.target.files[0]);
    }
  });
  
  browseLocalBtn.addEventListener('click', () => {
    fileInput.click();
  });
  
  removeFileBtn.addEventListener('click', () => {
    resetFileSelection();
  });
  
  walletFormatBtn.addEventListener('click', () => {
    outputFormat = 'wallet';
    walletFormatBtn.classList.add('selected');
    datFormatBtn.classList.remove('selected');
  });
  
  datFormatBtn.addEventListener('click', () => {
    outputFormat = 'dat';
    datFormatBtn.classList.add('selected');
    walletFormatBtn.classList.remove('selected');
  });
  
  generateWalletBtn.addEventListener('click', () => {
    if (!currentFile || !fileContent) return;
    
    showProcessing();
    
    // Simulate processing delay for UX - in reality this would be instant
    setTimeout(() => {
      try {
        const walletData = buildWallet(fileContent);
        
        // Send message to the background script to handle the download
        chrome.runtime.sendMessage({
          action: 'download_wallet',
          data: walletData,
          format: outputFormat
        }, function(response) {
          if (chrome.runtime.lastError) {
            showError(chrome.runtime.lastError.message);
          } else {
            showSuccess();
          }
        });
      } catch (error) {
        showError(error.message || 'Failed to generate wallet file');
      }
    }, 1500);
  });
  
  tryAgainBtn.addEventListener('click', () => {
    errorMessage.classList.add('hidden');
    if (currentFile) {
      fileInfoContainer.classList.remove('hidden');
    }
  });
  
  // Functions
  function handleFileSelection(file) {
    currentFile = file;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      fileContent = event.target.result;
      
      fileName.textContent = file.name;
      fileDetails.textContent = `${getFileType(file)} file, ${formatFileSize(file.size)}`;
      
      fileInfoContainer.classList.remove('hidden');
      generateWalletBtn.disabled = false;
      successMessage.classList.add('hidden');
      errorMessage.classList.add('hidden');
    };
    
    reader.onerror = () => {
      showError('Failed to read the file. Please try again.');
    };
    
    reader.readAsText(file);
  }
  
  function resetFileSelection() {
    currentFile = null;
    fileContent = null;
    fileInfoContainer.classList.add('hidden');
    generateWalletBtn.disabled = true;
    successMessage.classList.add('hidden');
    errorMessage.classList.add('hidden');
  }
  
  function showProcessing() {
    fileInfoContainer.classList.add('hidden');
    processingStatus.classList.remove('hidden');
    generateWalletBtn.disabled = true;
    successMessage.classList.add('hidden');
    errorMessage.classList.add('hidden');
  }
  
  function showSuccess() {
    processingStatus.classList.add('hidden');
    successMessage.classList.remove('hidden');
    generateWalletBtn.disabled = false;
  }
  
  function showError(message) {
    processingStatus.classList.add('hidden');
    fileInfoContainer.classList.add('hidden');
    errorMessage.classList.remove('hidden');
    errorDetails.textContent = message || 'Unable to process the file. Please ensure it contains valid data.';
    generateWalletBtn.disabled = false;
  }
  
  // Helper functions
  function getFileType(file) {
    const extension = file.name.split('.').pop()?.toLowerCase() || '';
    
    switch (extension) {
      case 'txt': return 'Text';
      case 'json': return 'JSON';
      case 'dat': return 'DAT';
      case 'wallet': return 'Wallet';
      case 'seed': return 'Seed';
      case 'key': return 'Key';
      default: return 'Unknown';
    }
  }
  
  function formatFileSize(bytes) {
    if (bytes < 1024) return `${bytes} bytes`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
  
  function buildWallet(content) {
    try {
      // Try to parse as JSON first
      JSON.parse(content);
      return transformExistingWallet(content);
    } catch (e) {
      // Not JSON, create new wallet
      return createNewWallet(content);
    }
  }
  
  function transformExistingWallet(walletContent) {
    const wallet = JSON.parse(walletContent);
    
    // If it already has wallet properties, leave it mostly as-is
    if (wallet.wallet_type || wallet.keystore) {
      return JSON.stringify(wallet, null, 2);
    }
    
    // Otherwise convert to our format
    return createNewWallet(JSON.stringify(wallet));
  }
  
  function createNewWallet(rawContent) {
    // Clean up content
    const cleanContent = rawContent.trim().replace(/[\r\n]+/g, ' ');
    
    // Basic Electrum wallet format
    const wallet = {
      "seed_version": 17,
      "wallet_type": "standard",
      "keystore": {
        "type": "imported",
        "keypairs": {
          "address": cleanContent
        }
      },
      "use_encryption": false,
      "labels": {},
      "transactions": {}
    };
    
    return JSON.stringify(wallet, null, 2);
  }
});
