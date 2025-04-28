interface ErrorMessageProps {
  errorDetails: string;
  onTryAgain: () => void;
}

interface SuccessMessageProps {
  isMultiFormat?: boolean;
}

export function SuccessMessage({ isMultiFormat = false }: SuccessMessageProps) {
  return (
    <div className="mb-6 fade-in">
      <div className="bg-success-light bg-opacity-20 border border-success rounded-lg p-4">
        <div className="flex">
          <span className="material-icons text-success mr-3">check_circle</span>
          <div className="flex-1">
            <h3 className="font-medium text-success-dark mb-1">Conversion Successful</h3>
            {isMultiFormat ? (
              <>
                <p className="text-sm text-neutral-700">All wallet formats have been generated and packaged in a ZIP file.</p>
                <p className="text-xs text-neutral-600 mt-1">The ZIP file contains all supported formats: Standard Wallet, Bitcoin Core, Electrum, MetaMask, Exodus, and Generic JSON.</p>
              </>
            ) : (
              <p className="text-sm text-neutral-700">Your wallet file has been downloaded.</p>
            )}
            
            {/* Security notice */}
            <div className="mt-3 flex items-center bg-amber-50 p-2 rounded-md border border-amber-200">
              <span className="material-icons text-amber-600 text-sm mr-2">security</span>
              <p className="text-xs text-amber-800">
                <strong>Security Tip:</strong> For security, refresh the page when done to clear any sensitive data from memory.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ErrorMessage({ errorDetails, onTryAgain }: ErrorMessageProps) {
  // Extract error type for specific help tips
  const isContentFormatError = errorDetails.includes('content') || errorDetails.includes('wallet data') || errorDetails.includes('valid wallet');
  const isSizeError = errorDetails.includes('too large') || errorDetails.includes('size exceeds');
  
  return (
    <div className="mb-6 fade-in">
      <div className="bg-error-light bg-opacity-20 border border-error rounded-lg p-4">
        <div className="flex">
          <span className="material-icons text-error mr-3">error</span>
          <div className="flex-1">
            <h3 className="font-medium text-error-dark mb-1">Validation Failed</h3>
            <p className="text-sm text-neutral-700 mb-3">
              {errorDetails || 'Unable to process the file. Please ensure it contains valid data.'}
            </p>
            
            {isContentFormatError && (
              <div className="text-xs bg-neutral-100 p-2 rounded mb-3">
                <p className="font-medium mb-1">Your file should contain one of:</p>
                <ul className="list-disc list-inside space-y-1 ml-1">
                  <li>A private key (hex format, typically 64 characters, may start with 0x)</li>
                  <li>A WIF private key (starts with 5, K, or L, 51-52 characters)</li>
                  <li>A mnemonic seed phrase (3-24 words, typically 12 or 24)</li>
                  <li>JSON wallet data with fields like: wallet_type, keystore, seed, private_key, addresses, etc.</li>
                  <li>An Ethereum keystore file (JSON with crypto and version fields)</li>
                  <li>Extended keys (xprv, yprv, zprv, xpub, ypub, zpub)</li>
                  <li>Cryptocurrency specific formats (look for keywords like bitcoin, ethereum, wallet)</li>
                </ul>
                <p className="mt-2">If your file is in a different format, it may need to be exported from your wallet app in a standard format first.</p>
              </div>
            )}
            
            {isSizeError && (
              <div className="text-xs bg-neutral-100 p-2 rounded mb-3">
                <p>Wallet files should typically be small in size (under 5MB). If your file is larger, it may not be a valid wallet backup.</p>
              </div>
            )}
            
            <button 
              className="text-sm text-primary font-medium mt-2 focus:outline-none hover:text-primary-dark"
              onClick={onTryAgain}
            >
              Try Again with Another File
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
