import { useState } from 'react';
import DropZone from './components/DropZone';
import FileInfo from './components/FileInfo';
import FilePreview from './components/FilePreview';
import InfoBanner from './components/InfoBanner';
import ProcessingStatus from './components/ProcessingStatus';
import { SuccessMessage, ErrorMessage } from './components/StatusMessages';
import { buildWallet, estimateOutputSize, WalletFormat } from './lib/walletBuilder';
import { 
  getFileType, 
  formatFileSize, 
  validateFileSize, 
  validateWalletData,
  detectWalletEntries,
  WalletEntryInfo
} from './lib/fileUtils';
import JSZip from 'jszip';

type FileData = {
  file: File;
  content: string | ArrayBuffer | null;
};

// Use the WalletFormat type from walletBuilder
type OutputFormat = WalletFormat;

// Format information for UI
// Define format information for UI (needs to be non-exported)
const FORMAT_INFO = {
  // Basic formats
  'wallet': {
    extension: '.wallet',
    name: 'Wallet (Generic)',
    description: 'Standard wallet format compatible with most wallets',
    mimeType: 'application/json',
    category: 'basic'
  },
  'dat': {
    extension: '.dat',
    name: 'Bitcoin Core',
    description: 'Compatible with Bitcoin Core wallet.dat format',
    mimeType: 'application/octet-stream',
    category: 'basic'
  },
  'json': {
    extension: '.json',
    name: 'Generic JSON',
    description: 'Standard JSON wallet compatible with many services',
    mimeType: 'application/json',
    category: 'basic'
  },
  
  // Desktop/Mobile wallets
  'electrum': {
    extension: '.wallet',
    name: 'Electrum Wallet',
    description: 'Specialized format for Electrum Bitcoin wallet',
    mimeType: 'application/json',
    category: 'desktop'
  },
  'exodus': {
    extension: '.json',
    name: 'Exodus Wallet',
    description: 'Format compatible with Exodus multi-currency wallet',
    mimeType: 'application/json',
    category: 'desktop'
  },
  'mycelium': {
    extension: '.json',
    name: 'Mycelium',
    description: 'Bitcoin mobile wallet format for Android and iOS',
    mimeType: 'application/json',
    category: 'mobile'
  },
  
  // Hardware wallets
  'trezor': {
    extension: '.json',
    name: 'Trezor Wallet',
    description: 'Import format for Trezor hardware wallet',
    mimeType: 'application/json',
    category: 'hardware'
  },
  'ledger': {
    extension: '.json',
    name: 'Ledger Wallet',
    description: 'Import format for Ledger hardware wallet',
    mimeType: 'application/json',
    category: 'hardware'
  },
  
  // Exchange/Web wallets
  'metamask': {
    extension: '.json',
    name: 'MetaMask/Ethereum',
    description: 'Compatible with MetaMask and other Ethereum wallets',
    mimeType: 'application/json',
    category: 'web'
  },
  'coinbase': {
    extension: '.json',
    name: 'Coinbase Wallet',
    description: 'Format for Coinbase Wallet (formerly Toshi)',
    mimeType: 'application/json',
    category: 'exchange'
  },
  'binance': {
    extension: '.json',
    name: 'Binance Wallet',
    description: 'Format compatible with Binance Chain wallet',
    mimeType: 'application/json',
    category: 'exchange'
  },
  'trustwallet': {
    extension: '.json',
    name: 'Trust Wallet',
    description: 'Multi-currency mobile wallet format',
    mimeType: 'application/json',
    category: 'mobile'
  }
};

function App() {
  const [fileData, setFileData] = useState<FileData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorDetails, setErrorDetails] = useState('');
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('wallet');
  const [outputFilename, setOutputFilename] = useState<string>('');
  const [generateAllFormats, setGenerateAllFormats] = useState<boolean>(false);

  const handleFileSelected = (file: File) => {
    // Only validate the file size
    const sizeValidation = validateFileSize(file);
    if (!sizeValidation.isValid) {
      setErrorDetails(sizeValidation.message || 'File size exceeds the maximum limit.');
      setShowError(true);
      return;
    }
    
    // Read the file content
    const reader = new FileReader();
    
    reader.onload = (event) => {
      const content = event.target?.result || null;
      
      if (content && typeof content === 'string') {
        // Validate the file content
        const contentValidation = validateWalletData(content);
        
        if (!contentValidation.isValid) {
          setErrorDetails(contentValidation.message || 'Invalid wallet data format.');
          setShowError(true);
          return;
        }
        
        // If all validations pass, set the file data
        setFileData({
          file,
          content
        });
        
        // Set a default filename based on the original file's name (without extension)
        const baseFilename = file.name.replace(/\.[^/.]+$/, "");
        setOutputFilename(baseFilename);
        
        // Reset status messages
        setShowSuccess(false);
        setShowError(false);
      } else {
        setErrorDetails('Could not read file content as text. Please ensure it\'s a text-based file.');
        setShowError(true);
      }
    };
    
    reader.onerror = () => {
      setErrorDetails('Failed to read the file. Please try again.');
      setShowError(true);
    };
    
    reader.readAsText(file);
  };

  const handleRemoveFile = () => {
    setFileData(null);
    setShowSuccess(false);
    setShowError(false);
  };

  const handleGenerateWallet = async () => {
    if (!fileData || !fileData.content) return;
    
    setIsProcessing(true);
    
    try {
      // Simulate processing time (would be actual processing in a real implementation)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const content = fileData.content.toString();
      
      // Detect all wallet entries in the file
      const walletEntries = detectWalletEntries(content);
      const entryCount = walletEntries.length;
      
      // Create a zip container for all the generated wallet files
      const zip = new JSZip();
      const baseFilename = outputFilename.trim() || 'wallet';
      
      if (generateAllFormats) {
        // Generate all wallet formats for each entry
        const formats: WalletFormat[] = [
          'wallet', 'dat', 'json',
          'electrum', 'metamask', 'exodus', 
          'trezor', 'ledger', 'coinbase', 
          'binance', 'trustwallet', 'mycelium'
        ];
        
        // If multiple wallet entries were detected, create a folder for each entry
        if (entryCount > 1) {
          for (let i = 0; i < entryCount; i++) {
            const entry = walletEntries[i];
            const entryFolder = zip.folder(`wallet-${i+1}`);
            
            if (entryFolder) {
              // Generate each format for this entry
              for (const format of formats) {
                const walletData = buildWallet(entry.content, format);
                const extension = FORMAT_INFO[format].extension;
                const formatName = FORMAT_INFO[format].name.toLowerCase().replace(/\s+/g, '-');
                const filename = `${baseFilename}-${formatName}${extension}`;
                
                // Add to the entry folder
                entryFolder.file(filename, walletData);
              }
            }
          }
        } else {
          // Single wallet entry with all formats
          const walletFolder = zip.folder("wallet-files");
          
          if (walletFolder) {
            // Generate each wallet format and add to the zip
            for (const format of formats) {
              const walletData = buildWallet(walletEntries[0].content, format);
              const extension = FORMAT_INFO[format].extension;
              const formatName = FORMAT_INFO[format].name.toLowerCase().replace(/\s+/g, '-');
              const filename = `${baseFilename}-${formatName}${extension}`;
              
              // Add file to the zip
              walletFolder.file(filename, walletData);
            }
          }
        }
        
        // Generate the zip file
        const zipBlob = await zip.generateAsync({ type: "blob" });
        const zipUrl = URL.createObjectURL(zipBlob);
        
        // Download the zip file
        const a = document.createElement('a');
        a.href = zipUrl;
        const zipFilename = entryCount > 1 
          ? `${baseFilename}-${entryCount}-wallets-all-formats.zip`
          : `${baseFilename}-all-formats.zip`;
        a.download = zipFilename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } else {
        // Generate single format for all entries
        if (entryCount > 1) {
          // Create a folder for this format
          const formatFolder = zip.folder(FORMAT_INFO[outputFormat].name.toLowerCase().replace(/\s+/g, '-'));
          
          if (formatFolder) {
            // Generate this format for each entry
            for (let i = 0; i < entryCount; i++) {
              const entry = walletEntries[i];
              const walletData = buildWallet(entry.content, outputFormat);
              const extension = FORMAT_INFO[outputFormat].extension;
              const filename = `${baseFilename}-${i+1}${extension}`;
              
              // Add to the format folder
              formatFolder.file(filename, walletData);
            }
          }
          
          // Generate and download the zip file
          const zipBlob = await zip.generateAsync({ type: "blob" });
          const zipUrl = URL.createObjectURL(zipBlob);
          
          // Download the zip file
          const a = document.createElement('a');
          a.href = zipUrl;
          a.download = `${baseFilename}-${entryCount}-wallets-${outputFormat}.zip`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        } else {
          // Single wallet entry with single format
          const walletData = buildWallet(walletEntries[0].content, outputFormat);
          
          // Download the wallet file with the appropriate MIME type
          const mimeType = FORMAT_INFO[outputFormat].mimeType;
          const blob = new Blob([walletData], { type: mimeType });
          const url = URL.createObjectURL(blob);
          
          // Use chrome.downloads API in real extension
          // In development, simulate download with an anchor element
          const a = document.createElement('a');
          a.href = url;
          
          // Generate filename using the user's custom name if provided, otherwise use a default
          const filename = baseFilename;
          const extension = FORMAT_INFO[outputFormat].extension;
          a.download = `${filename}${extension}`;
          
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        }
      }
      
      // Pass the entry count to the success message
      setShowSuccess(true);
    } catch (error) {
      setErrorDetails((error as Error).message || 'Failed to generate wallet file.');
      setShowError(true);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFormatChange = (format: OutputFormat) => {
    setOutputFormat(format);
  };
  
  const handleFilenameChange = (filename: string) => {
    // Remove any file extension the user might add
    // Support all our wallet formats
    const cleanFilename = filename.replace(/\.(wallet|dat|json|electrum|exodus|trezor|ledger|coinbase|binance|trustwallet|mycelium)$/i, '');
    setOutputFilename(cleanFilename);
  };
  
  // Calculate the estimated output size based on the selected format
  const getEstimatedOutputSize = (): string => {
    if (!fileData || !fileData.content || typeof fileData.content !== 'string') {
      return 'Unknown';
    }
    
    try {
      const estimatedBytes = estimateOutputSize(fileData.content, outputFormat);
      return formatFileSize(estimatedBytes);
    } catch (error) {
      console.error('Error estimating output size:', error);
      return 'Unknown';
    }
  };

  const handleTryAgain = () => {
    setShowError(false);
  };

  return (
    <>
      {/* Header */}
      <header className="mb-6 text-center">
        <div className="flex items-center justify-center mb-2">
          <span className="material-icons text-accent text-3xl mr-2">account_balance_wallet</span>
          <h1 className="text-2xl font-bold text-accent">Wallet Converter</h1>
        </div>
        <p className="text-sm text-white">Convert files to multiple cryptocurrency wallet formats</p>
      </header>

      <main>
        {/* Info Banner */}
        <InfoBanner />
        
        {/* File Upload Section */}
        <div className="mb-6">
          <DropZone 
            onFileSelected={handleFileSelected}
          />
        </div>

        {/* File Preview Section */}
        {fileData && !isProcessing && (
          <>
            <FilePreview 
              file={fileData.file}
              fileType={getFileType(fileData.file)}
              fileSize={formatFileSize(fileData.file.size)}
            />
            
            {/* File Output Options */}
            <FileInfo 
              file={fileData.file}
              fileType={getFileType(fileData.file)}
              fileSize={formatFileSize(fileData.file.size)}
              onRemoveFile={handleRemoveFile}
              outputFormat={outputFormat}
              onFormatChange={handleFormatChange}
              estimatedOutputSize={getEstimatedOutputSize()}
              outputFilename={outputFilename}
              onFilenameChange={handleFilenameChange}
              generateAllFormats={generateAllFormats}
              onGenerateAllChange={setGenerateAllFormats}
            />
          </>
        )}

        {/* Processing Status */}
        {isProcessing && <ProcessingStatus />}

        {/* Success Message */}
        {showSuccess && <SuccessMessage isMultiFormat={generateAllFormats} />}

        {/* Error Message */}
        {showError && (
          <ErrorMessage 
            errorDetails={errorDetails} 
            onTryAgain={handleTryAgain} 
          />
        )}

        {/* Generate Button */}
        <div className="mb-3 fade-in">
          <button 
            disabled={!fileData || isProcessing}
            className="w-full text-black py-3 px-4 rounded-lg font-bold hover:bg-yellow-400 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-neutral-400 focus-secondary"
            style={{ backgroundColor: '#FFE600' }}
            onClick={handleGenerateWallet}
          >
            {generateAllFormats ? 'Generate All Wallet Formats' : 'Generate Wallet File'}
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-6">
        <div className="bg-primary border-primary rounded-lg p-3 flex items-start">
          <span className="material-icons text-white mr-2">lock</span>
          <div className="text-sm text-white">
            <p className="font-medium">100% Private & Secure:</p>
            <p>All processing happens locally in your browser.</p>
            <p><strong>No data leaves your device at any time.</strong></p>
          </div>
        </div>
      </footer>
    </>
  );
}

export default App;
