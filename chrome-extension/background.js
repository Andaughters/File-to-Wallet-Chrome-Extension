// Listen for messages from the popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'download_wallet') {
    downloadWalletFile(message.data, message.format);
    sendResponse({success: true});
  }
  return true; // Required to use sendResponse asynchronously
});

// Function to download wallet file
function downloadWalletFile(walletData, format) {
  const blob = new Blob([walletData], {type: 'application/json'});
  const url = URL.createObjectURL(blob);
  
  chrome.downloads.download({
    url: url,
    filename: format === 'dat' ? 'wallet.dat' : 'wallet.wallet',
    saveAs: true
  });
}
