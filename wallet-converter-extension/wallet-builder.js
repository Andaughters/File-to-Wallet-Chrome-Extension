/**
 * Wallet Converter - Crypto Validation and Wallet Builder Functions
 */

// FILE VALIDATION FUNCTIONS
// ------------------------------------------------------------------------

/**
 * Checks if the content is a valid WIF private key
 * WIF keys typically start with 5, K, or L and are 51-52 characters long
 */
function isValidWIF(content) {
  const wifRegex = /^[5KL][1-9A-HJ-NP-Za-km-z]{50,51}$/;
  return wifRegex.test(content.trim());
}

/**
 * Checks if the content is a valid raw private key (64 hex characters)
 */
function isValidPrivateKey(content) {
  // Remove '0x' prefix if present
  const hexContent = content.trim().startsWith('0x') 
    ? content.trim().substring(2) 
    : content.trim();
  
  const hexRegex = /^[0-9a-fA-F]{64}$/;
  return hexRegex.test(hexContent);
}

/**
 * Checks if the content appears to be a valid mnemonic seed phrase
 * Valid BIP39 mnemonics are typically 12, 15, 18, 21, or 24 words
 */
function isValidMnemonic(content) {
  const words = content.trim().split(/\s+/);
  return [12, 15, 18, 21, 24].includes(words.length);
}

/**
 * Checks if the content is a valid extended public or private key
 */
function isValidExtendedKey(content) {
  const trimmedContent = content.trim();
  return (
    trimmedContent.startsWith("xpub") || 
    trimmedContent.startsWith("xprv") ||
    trimmedContent.startsWith("ypub") || 
    trimmedContent.startsWith("yprv") ||
    trimmedContent.startsWith("zpub") || 
    trimmedContent.startsWith("zprv")
  );
}

/**
 * Checks if the content appears to be a valid Ethereum address
 */
function isValidEthereumAddress(content) {
  const ethAddressRegex = /^(0x)?[0-9a-fA-F]{40}$/;
  return ethAddressRegex.test(content.trim());
}

/**
 * Checks if the content is a valid JSON wallet
 */
function isValidWalletJSON(content) {
  try {
    const parsed = JSON.parse(content);
    
    // Check for known wallet JSON structure patterns
    return !!(
      // Electrum wallet format
      (parsed.wallet_type && parsed.seed_version) ||
      
      // Ethereum keystore format
      (parsed.crypto && parsed.version) ||
      
      // Common wallet fields
      (parsed.keystore || parsed.privateKey || parsed.xprv || 
       parsed.seed || parsed.mnemonic || parsed.seedPhrase)
    );
  } catch (e) {
    return false;
  }
}

/**
 * Main function to validate if the file content contains crypto material
 * Returns true if any crypto format is detected
 */
function validateCryptoContent(content) {
  const trimmedContent = content.trim();
  
  // Check for multi-line content (might contain multiple keys)
  if (trimmedContent.includes('\n')) {
    const lines = trimmedContent.split('\n');
    // Check each line for valid crypto content
    for (const line of lines) {
      if (line.trim() && validateCryptoContent(line)) {
        return true;
      }
    }
  }
  
  // Try to parse as JSON wallet first
  if (isValidWalletJSON(trimmedContent)) {
    return true;
  }
  
  // Then check for other formats
  return (
    isValidWIF(trimmedContent) ||
    isValidPrivateKey(trimmedContent) ||
    isValidMnemonic(trimmedContent) ||
    isValidExtendedKey(trimmedContent) ||
    isValidEthereumAddress(trimmedContent)
  );
}

/**
 * Returns the detected cryptocurrency content type
 */
function detectCryptoContentType(content) {
  const trimmedContent = content.trim();
  
  if (isValidWalletJSON(trimmedContent)) {
    return 'Wallet JSON';
  } else if (isValidWIF(trimmedContent)) {
    return 'WIF Private Key';
  } else if (isValidPrivateKey(trimmedContent)) {
    return 'Raw Private Key (Hex)';
  } else if (isValidMnemonic(trimmedContent)) {
    return 'Mnemonic Seed Phrase';
  } else if (isValidExtendedKey(trimmedContent)) {
    return 'Extended Key (xpub/xprv)';
  } else if (isValidEthereumAddress(trimmedContent)) {
    return 'Ethereum Address';
  } else {
    return 'Unknown';
  }
}

// WALLET BUILDER FUNCTIONS
// ------------------------------------------------------------------------

/**
 * Builds a wallet file from the provided content
 * Intelligently detects the input type and creates the appropriate wallet structure
 */
function buildWallet(content) {
  const cleanContent = content.trim();
  
  try {
    // Try to parse as JSON first in case it's already a wallet format
    const parsed = JSON.parse(cleanContent);
    
    // If it already has a wallet_type, assume it's an Electrum wallet
    if (parsed.wallet_type) {
      // Just return as-is, with maybe some validation/fixes
      return JSON.stringify(parsed, null, 2);
    }
    
    // Otherwise, extract any useful info from the JSON and convert
    return createNewWallet(JSON.stringify(parsed));
  } catch (e) {
    // If it's not JSON, assume it's a plaintext private key or mnemonic
    return createNewWallet(cleanContent);
  }
}

/**
 * Creates a new wallet from raw text (private key, mnemonic, etc.)
 * Uses proper format detection to create the appropriate wallet structure
 */
function createNewWallet(rawContent) {
  // Clean up the content (trim whitespace, remove line breaks)
  const cleanContent = rawContent.trim().replace(/[\r\n]+/g, ' ');
  
  let wallet;
  
  if (isValidMnemonic(cleanContent)) {
    // It's a seed phrase - create a BIP39 type wallet
    wallet = {
      "seed_version": 17,
      "wallet_type": "standard",
      "keystore": {
        "type": "bip39",
        "seed": cleanContent,
        "password": null
      },
      "use_encryption": false,
      "labels": {}
    };
  } else if (isValidPrivateKey(cleanContent) || isValidWIF(cleanContent)) {
    // It's a single private key - create an imported wallet
    wallet = {
      "seed_version": 17,
      "wallet_type": "imported",
      "keystore": {
        "type": "imported",
        "keypairs": {
          "imported_address": cleanContent
        }
      },
      "use_encryption": false,
      "labels": {}
    };
  } else if (isValidExtendedKey(cleanContent)) {
    // It's an extended key - create a BIP32 type wallet
    wallet = {
      "seed_version": 17,
      "wallet_type": "standard",
      "keystore": {
        "type": "bip32",
        "xpub": cleanContent
      },
      "use_encryption": false,
      "labels": {}
    };
  } else {
    // Default fallback for other formats
    wallet = {
      "seed_version": 17,
      "wallet_type": "standard",
      "keystore": {
        "type": "imported",
        "keypairs": {
          "imported_address": cleanContent
        }
      },
      "use_encryption": false,
      "labels": {}
    };
  }
  
  return JSON.stringify(wallet, null, 2);
}

/**
 * For wallet.dat format (Bitcoin Core)
 * Note: This is a simplified implementation for demonstration
 */
function buildWalletDat(content) {
  // This is a placeholder - actual wallet.dat files are binary Berkeley DB files
  // For demonstration, we're just creating a text representation
  const walletData = buildWallet(content);
  
  // In a real implementation, this would create a binary format
  // For now we'll just use TextEncoder to create a binary representation
  const encoder = new TextEncoder();
  return encoder.encode(walletData).buffer;
}

/**
 * Calculates the estimated output size for a wallet file
 * based on the input content
 */
function estimateOutputSize(content, format) {
  try {
    // Try to parse as JSON
    const parsed = JSON.parse(content);
    
    // Already a JSON file - estimate based on content size plus overhead
    let estimatedSize = JSON.stringify(parsed, null, 2).length;
    
    // Add overhead for additional wallet fields we might add
    if (!parsed.wallet_type) {
      estimatedSize += 200; // Extra fields for wallet structure
    }
    
    // For wallet.dat format, add a 15% overhead for binary encoding
    if (format === 'dat') {
      estimatedSize = Math.ceil(estimatedSize * 1.15);
    }
    
    return estimatedSize;
  } catch (e) {
    // Not JSON - estimate based on raw content
    const baseSize = content.length;
    
    // For plain text like private keys or mnemonics, estimate wallet overhead
    const walletOverhead = 500; // Basic JSON wallet structure
    
    // For wallet.dat format, add a 15% overhead for binary encoding
    if (format === 'dat') {
      return Math.ceil((baseSize + walletOverhead) * 1.15);
    }
    
    return baseSize + walletOverhead;
  }
}

/**
 * Formats file size in a human-readable format
 */
function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} bytes`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}