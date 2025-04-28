/**
 * Utility functions for validating cryptocurrency-related data formats
 */

/**
 * Checks if the content is a valid WIF private key
 * WIF keys typically start with 5, K, or L and are 51-52 characters long
 */
export function isValidWIF(content: string): boolean {
  const wifRegex = /^[5KL][1-9A-HJ-NP-Za-km-z]{50,51}$/;
  return wifRegex.test(content.trim());
}

/**
 * Checks if the content is a valid raw private key (64 hex characters)
 */
export function isValidPrivateKey(content: string): boolean {
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
export function isValidMnemonic(content: string): boolean {
  const words = content.trim().split(/\s+/);
  return [12, 15, 18, 21, 24].includes(words.length);
}

/**
 * Checks if the content is a valid extended public or private key
 */
export function isValidExtendedKey(content: string): boolean {
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
export function isValidEthereumAddress(content: string): boolean {
  const ethAddressRegex = /^(0x)?[0-9a-fA-F]{40}$/;
  return ethAddressRegex.test(content.trim());
}

/**
 * Checks if the content is a valid JSON wallet
 */
export function isValidWalletJSON(content: string): boolean {
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
export function validateCryptoContent(content: string): boolean {
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
export function detectCryptoContentType(content: string): string {
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