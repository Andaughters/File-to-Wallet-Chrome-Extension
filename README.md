Wallet Converter Extension
A Chrome extension that transforms cryptocurrency wallet files with unprecedented flexibility and user-friendly design.

Features
Universal File Acceptance: Any file type is supported for conversion
Smart Crypto Detection: Automatically detects cryptocurrency keys, seeds, and wallet data
Format Options: Convert to .wallet or wallet.dat formats
Custom Output Filenames: Choose your own filename for the converted wallet
Size Estimation: See the estimated output size before conversion
100% Private: All processing happens locally in your browser - no data is sent to any server
Installation (Development Mode)
Download or clone this repository
Open Chrome and navigate to chrome://extensions/
Enable "Developer mode" in the top right corner
Click "Load unpacked" and select the wallet-converter-extension folder
The extension will be added to your browser
Usage
Click the Wallet Converter extension icon in your toolbar
Drag and drop your file or click "Browse Files" to select it
Choose your desired output format (.wallet or .dat)
Customize the output filename if desired
Click "Generate Wallet File" to create and download your wallet
Supported Input Types
The extension can detect and convert these cryptocurrency formats:

Private keys (WIF or hex format)
Mnemonic seed phrases (BIP39)
Extended keys (xpub/xprv)
Ethereum addresses and keystores
Existing wallet files (JSON formats)
Privacy & Security
Zero Data Transmission: All processing happens locally in your browser
No External Dependencies: The extension works entirely offline
No API Calls: No network requests are made to any server
For Developers
The extension uses plain JavaScript and can be easily modified or extended. Key files:

popup.html - The UI for the extension
popup.js - Core functionality and UI logic
wallet-builder.js - Cryptocurrency validation and wallet generation
styles.css - All styling for the extension
License
MIT
