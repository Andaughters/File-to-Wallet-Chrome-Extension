/**
 * Supported file extensions and their descriptions
 */
export const SUPPORTED_EXTENSIONS = [
  // Common text formats
  'txt', 'text',
  
  // Key and wallet formats
  'json', 'dat', 'wallet', 'seed', 'key', 'keys',
  
  // Currency-specific formats
  'btc', 'eth', 'ltc', 'xrp', 'bch', 'xlm', 'ada', 'xmr', 'neo',
  'bnb', 'trx', 'dot', 'sol', 'link', 'matic', 'doge', 'shib',
  
  // Bitcoin and altcoin wallet extensions
  'wlt', 'wallet.dat', 'db', 'swd', 'mst', 'bip39',
  'bpw', 'kdbx', 'wal', 'awd', 'bwallet',
  
  // Ethereum and token wallet extensions
  'keystore', 'json', 'pkey', 'backup', 'eth',
  
  // Key formats
  'pem', 'p12', 'pfx', 'asc', 'gpg', 'sig', 'pgp',
  
  // Cold storage and hardware wallet exports
  'csv', 'tsv', 'ledger', 'trezor', 'coldcard', 'electrum',
  
  // Encrypted archives (often used for wallets)
  'enc', 'encrypted', 'crypto',
  
  // Blockchain and wallet database formats
  'sqlite', 'db', 'sqlite3', 'leveldb', 'ldb',

  // Exchange backup formats
  'bin', 'backup', 'cert', 'crt', 'der'
];

/**
 * Extension validation result interface
 */
export interface ValidationResult {
  isValid: boolean;
  message?: string;
}

/**
 * Validates if a file has a supported extension
 */
export function validateFileExtension(file: File): ValidationResult {
  const extension = file.name.split('.').pop()?.toLowerCase() || '';
  
  if (SUPPORTED_EXTENSIONS.includes(extension)) {
    return { 
      isValid: true 
    };
  }
  
  return {
    isValid: false,
    message: `File type ".${extension}" is not supported. Please upload a file with one of these extensions: ${SUPPORTED_EXTENSIONS.join(', ')}.`
  };
}

/**
 * Validates file size (max 5MB)
 */
export function validateFileSize(file: File): ValidationResult {
  const MAX_SIZE = 5 * 1024 * 1024; // 5MB
  
  if (file.size <= MAX_SIZE) {
    return { 
      isValid: true 
    };
  }
  
  return {
    isValid: false,
    message: `File is too large (${formatFileSize(file.size)}). Maximum supported size is ${formatFileSize(MAX_SIZE)}.`
  };
}

/**
 * Returns a user-friendly file type based on file extension
 */
export function getFileType(file: File): string {
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
  if (['dat', 'wallet', 'wallet.dat', 'wlt', 'db', 'sqlite', 'sqlite3', 'ldb', 'leveldb'].includes(extension)) {
    return 'Wallet Database';
  }
  
  // Seeds and keys
  if (['seed', 'key', 'keys', 'pkey', 'bip39'].includes(extension)) {
    return 'Key/Seed File';
  }
  
  // PGP/GPG and certificate formats
  if (['asc', 'pem', 'p12', 'pfx', 'gpg', 'pgp', 'sig', 'cert', 'crt', 'der'].includes(extension)) {
    return 'Encrypted Key';
  }
  
  // Hardware wallet formats
  if (['ledger', 'trezor', 'coldcard', 'electrum', 'bpw', 'kdbx'].includes(extension)) {
    return 'Hardware Wallet Backup';
  }
  
  // Cryptocurrency-specific
  if (['btc', 'eth', 'ltc', 'xrp', 'bch', 'xlm', 'ada', 'xmr', 'neo', 'bnb', 'trx', 'dot', 'sol', 'link', 'matic', 'doge', 'shib'].includes(extension)) {
    return extension.toUpperCase() + ' Wallet';
  }
  
  // Encrypted files
  if (['enc', 'encrypted', 'crypto', 'bin', 'backup'].includes(extension)) {
    return 'Encrypted Backup';
  }
  
  // Common document formats
  if (['pdf', 'doc', 'docx', 'rtf', 'odt'].includes(extension)) {
    return 'Document';
  }
  
  // Image formats
  if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp'].includes(extension)) {
    return 'Image';
  }
  
  // Archive formats
  if (['zip', 'rar', '7z', 'tar', 'gz', 'bz2'].includes(extension)) {
    return 'Archive';
  }
  
  // If we detect an extension, show it
  if (extension) {
    // Capitalize extension for display
    return extension.toUpperCase() + ' File';
  }
  
  // If no extension, show generic
  return 'Data File';
}

/**
 * Formats file size in a human-readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} bytes`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Information about a detected wallet entry
 */
export interface WalletEntryInfo {
  content: string;
  type: string;
  index: number;
}

/**
 * Validates if the file content can be processed
 * This function has been modified to be extremely permissive - we accept all file types now
 * @returns An object with validation result and detailed message
 */
export function validateWalletData(content: string): ValidationResult {
  // For binary files and very small files
  if (content.length < 10 || /[\x00-\x08\x0E-\x1F\x7F-\xFF]/.test(content.substring(0, 100))) {
    return { isValid: true };
  }
  
  try {
    // Try to parse as JSON
    JSON.parse(content);
    // If it parses as JSON, we'll accept it - the wallet builder will handle conversion
    return { isValid: true };
  } catch (e) {
    // Not JSON, we'll proceed with other checks but be very permissive
  }
  
  // For any text content, we'll be extremely permissive to allow users to try converting any file
  return { isValid: true };
}

/**
 * Detects multiple wallet entries in a file and returns an array of the entries
 * This allows for batch processing of multiple wallets in a single file
 * 
 * @param content The file content to analyze
 * @returns An array of wallet entries detected in the file
 */
export function detectWalletEntries(content: string): WalletEntryInfo[] {
  const entries: WalletEntryInfo[] = [];
  
  // First, check if it's a JSON file with potentially multiple wallet entries
  try {
    const jsonData = JSON.parse(content);
    
    // If it's an array, each element could be a wallet
    if (Array.isArray(jsonData)) {
      jsonData.forEach((item: any, index: number) => {
        entries.push({
          content: JSON.stringify(item),
          type: 'json',
          index
        });
      });
      return entries;
    }
    
    // If it has a wallets array/object property, it might be a collection
    if (jsonData.wallets && (Array.isArray(jsonData.wallets) || typeof jsonData.wallets === 'object')) {
      if (Array.isArray(jsonData.wallets)) {
        jsonData.wallets.forEach((wallet: any, index: number) => {
          entries.push({
            content: JSON.stringify(wallet),
            type: 'json',
            index
          });
        });
      } else {
        // Object with wallet entries
        Object.entries(jsonData.wallets).forEach(([key, wallet]: [string, any], index: number) => {
          entries.push({
            content: JSON.stringify(wallet),
            type: 'json',
            index
          });
        });
      }
      return entries;
    }
    
    // Single JSON wallet
    entries.push({
      content: content,
      type: 'json',
      index: 0
    });
    return entries;
  } catch (e) {
    // Not JSON, check for text-based formats
  }
  
  // Check for text formats with multiple entries (one per line or separated by delimiters)
  const lines = content.split(/[\r\n]+/).filter(line => line.trim().length > 0);
  
  // Multiple lines could be multiple wallet entries
  if (lines.length > 1) {
    let inJsonBlock = false;
    let jsonBlock = '';
    let blockIndex = 0;
    
    // Process lines, handling potential JSON blocks that span multiple lines
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Skip comments and empty lines
      if (line.startsWith('#') || line.startsWith('//') || line === '') {
        continue;
      }
      
      // Detect start of JSON block
      if (line.startsWith('{') && !inJsonBlock) {
        inJsonBlock = true;
        jsonBlock = line;
        continue;
      }
      
      // Add to JSON block if we're in one
      if (inJsonBlock) {
        jsonBlock += line;
        
        // Check if JSON block is complete
        if (line.endsWith('}')) {
          try {
            JSON.parse(jsonBlock); // Validate JSON
            entries.push({
              content: jsonBlock,
              type: 'json',
              index: blockIndex++
            });
          } catch (e) {
            // Invalid JSON, treat as plain text
            entries.push({
              content: jsonBlock,
              type: 'text',
              index: blockIndex++
            });
          }
          
          inJsonBlock = false;
          jsonBlock = '';
        }
        continue;
      }
      
      // Process non-JSON lines (could be private keys, mnemonics, etc.)
      // We'll treat each line as a potential wallet entry
      entries.push({
        content: line,
        type: detectEntryType(line),
        index: blockIndex++
      });
    }
    
    // If we have entries, return them
    if (entries.length > 0) {
      return entries;
    }
  }
  
  // If we couldn't detect multiple entries, treat the whole content as a single entry
  entries.push({
    content: content,
    type: detectEntryType(content),
    index: 0
  });
  
  return entries;
}

/**
 * Detect the type of wallet entry
 */
function detectEntryType(content: string): string {
  const trimmedContent = content.trim();
  
  try {
    JSON.parse(trimmedContent);
    return 'json';
  } catch (e) {
    // Not JSON
  }
  
  // Check if it looks like a mnemonic
  const wordCount = trimmedContent.split(/\s+/).length;
  if ([12, 15, 18, 21, 24].includes(wordCount)) {
    return 'mnemonic';
  }
  
  // Check if it's a private key
  if (/^(0x)?[0-9a-fA-F]{64}$/.test(trimmedContent)) {
    return 'private_key';
  }
  
  // Check if it's WIF
  if (/^[5KL][1-9A-HJ-NP-Za-km-z]{50,52}$/.test(trimmedContent)) {
    return 'wif';
  }
  
  // Check if it's an extended key
  if (/^(xprv|xpub|yprv|ypub|zprv|zpub)/.test(trimmedContent)) {
    return 'extended_key';
  }
  
  // Default to text
  return 'text';
}
