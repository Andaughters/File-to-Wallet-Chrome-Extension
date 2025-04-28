# GitHub Push Commands

Copy and paste these commands in your terminal to push your project to GitHub:

```bash
# Navigate to your project directory
cd /path/to/crypto-wallet-converter

# Initialize git repository
git init

# Add all files to staging
git add .

# Commit with initial message
git commit -m "Initial commit: Crypto Wallet Converter - Secure Cryptocurrency Wallet Format Conversion"

# Create and switch to main branch (if not already on it)
git branch -M main

# Add your remote repository (replace YOURUSERNAME with your GitHub username)
git remote add origin https://github.com/YOURUSERNAME/crypto-wallet-converter.git

# Push to GitHub
git push -u origin main
```

## Repository Structure

```
crypto-wallet-converter/
├── client/                     # React web application
│   ├── src/
│   │   ├── components/         # UI components
│   │   ├── hooks/              # Custom React hooks
│   │   ├── lib/                # Utility functions
│   │   ├── App.tsx             # Main application component
│   │   └── main.tsx            # Entry point
│   └── index.html              # HTML template
├── chrome-extension/           # Chrome extension files
│   ├── manifest.json           # Extension configuration
│   ├── background.js           # Background script
│   ├── popup.html              # Extension popup
│   ├── popup.js                # Popup script
│   ├── wallet-builder.js       # Wallet processing logic
│   └── icons/                  # Extension icons
├── wallet-converter-extension/ # Alternative extension structure
├── server/                     # Express server (minimal)
├── shared/                     # Shared code and types
├── README.md                   # Project documentation
└── LICENSE                     # MIT License
```

## After GitHub Push:

### Testing the Chrome Extension
1. Open Chrome and go to `chrome://extensions/`
2. Enable **Developer Mode** (toggle in top right)
3. Click **Load unpacked** and select the `chrome-extension` folder
4. The extension should appear in your extensions list
5. Click the extension icon to test it

### Testing the Web Application
1. Clone the repository
2. Run `npm install` to install dependencies
3. Run `npm run dev` to start the development server
4. Open your browser to the displayed URL

### Publishing to Chrome Web Store (Optional)
1. Create a developer account on the Chrome Web Store ($5 one-time fee)
2. Prepare promotional images and screenshots
3. Zip the entire extension folder
4. Upload to the Chrome Web Store through the Developer Dashboard
5. Fill in all required information
6. Submit for review