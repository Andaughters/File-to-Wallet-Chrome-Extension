import { 
  isValidMnemonic, 
  isValidPrivateKey, 
  isValidWIF,
  isValidExtendedKey 
} from './cryptoValidator';

/**
 * Supported wallet output formats
 */
export type WalletFormat = 
  // Basic formats
  'wallet' | 'dat' | 'json' | 
  // Specific wallet applications
  'electrum' | 'metamask' | 'exodus' | 
  // Additional wallet formats
  'trezor' | 'ledger' | 'coinbase' | 'binance' | 'trustwallet' | 'mycelium';

/**
 * Types for wallet keystore objects
 */
export interface KeystoreBip39 {
  type: string;
  seed: string;
  password: string | null;
}

export interface KeystoreImported {
  type: string;
  keypairs: Record<string, string>;
}

export interface KeystoreBip32 {
  type: string;
  xpub: string;
  xprv?: string;
}

export type Keystore = KeystoreBip39 | KeystoreImported | KeystoreBip32;

/**
 * Calculates the estimated output size for a wallet file
 * based on the input content.
 * 
 * @param fileContent The original file content
 * @param format The desired output format
 * @returns Size in bytes
 */
export function estimateOutputSize(fileContent: string, format: WalletFormat): number {
  try {
    // Try to parse as JSON
    const parsedContent = JSON.parse(fileContent);
    
    // Already a JSON file - estimate based on content size plus overhead
    let estimatedSize = JSON.stringify(parsedContent, null, 2).length;
    
    // Add overhead for additional wallet fields we might add
    if (!parsedContent.wallet_type) {
      estimatedSize += 200; // Extra fields for wallet structure
    }
    
    // For wallet.dat format, add a 15% overhead for binary encoding
    if (format === 'dat') {
      estimatedSize = Math.ceil(estimatedSize * 1.15);
    }
    
    return estimatedSize;
  } catch (e) {
    // Not JSON - estimate based on raw content
    const baseSize = fileContent.length;
    
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
 * Builds a wallet file from the provided content in the requested format
 * 
 * @param fileContent The original file content
 * @param format The desired output format
 * @returns A string containing the wallet data in the requested format
 */
export function buildWallet(fileContent: string, format: WalletFormat = 'wallet'): string {
  try {
    // Try to parse as JSON first in case it's already a wallet format
    JSON.parse(fileContent);
    
    // If it parses as JSON, create the appropriate wallet format
    switch (format) {
      // Desktop wallets
      case 'electrum':
        return buildElectrumWallet(fileContent);
      case 'exodus':
        return buildExodusWallet(fileContent);
        
      // Web/Exchange wallets
      case 'metamask':
        return buildMetamaskWallet(fileContent);
      case 'coinbase':
        return buildCoinbaseWallet(fileContent);
      case 'binance':
        return buildBinanceWallet(fileContent);
        
      // Hardware wallets  
      case 'trezor':
        return buildTrezorWallet(fileContent);
      case 'ledger':
        return buildLedgerWallet(fileContent);
        
      // Mobile wallets
      case 'trustwallet':
        return buildTrustWallet(fileContent);
      case 'mycelium':
        return buildMyceliumWallet(fileContent);
        
      // Generic formats
      case 'json':
        return buildGenericJsonWallet(fileContent);
      case 'wallet':
      default:
        return transformExistingWallet(fileContent);
    }
  } catch (e) {
    // If it's not JSON, assume it's a plaintext private key or mnemonic
    switch (format) {
      // Desktop wallets
      case 'electrum':
        return buildElectrumWallet(fileContent);
      case 'exodus':
        return buildExodusWallet(fileContent);
        
      // Web/Exchange wallets  
      case 'metamask':
        return buildMetamaskWallet(fileContent);
      case 'coinbase':
        return buildCoinbaseWallet(fileContent);
      case 'binance':
        return buildBinanceWallet(fileContent);
        
      // Hardware wallets  
      case 'trezor':
        return buildTrezorWallet(fileContent);
      case 'ledger':
        return buildLedgerWallet(fileContent);
        
      // Mobile wallets
      case 'trustwallet':
        return buildTrustWallet(fileContent);
      case 'mycelium':
        return buildMyceliumWallet(fileContent);
        
      // Generic formats
      case 'json':
        return buildGenericJsonWallet(fileContent);
      case 'wallet':
      default:
        return createNewWallet(fileContent);
    }
  }
}

/**
 * Transforms an existing wallet format
 */
function transformExistingWallet(walletContent: string): string {
  const wallet = JSON.parse(walletContent);
  
  // If it already has a wallet_type, assume it's an Electrum wallet
  if (wallet.wallet_type) {
    // Just return as-is, with maybe some validation/fixes
    return JSON.stringify(wallet, null, 2);
  }
  
  // Otherwise, convert it to our wallet format
  return createNewWallet(JSON.stringify(wallet));
}

/**
 * Creates a new wallet from raw text (private key, mnemonic, etc.)
 * Uses proper format detection to create the appropriate wallet structure
 */
function createNewWallet(rawContent: string): string {
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
      "labels": {},
      "transactions": {}
    };
  }
  
  return JSON.stringify(wallet, null, 2);
}

/**
 * Build an Electrum wallet format
 */
function buildElectrumWallet(fileContent: string): string {
  try {
    // Try to parse as JSON
    const content = JSON.parse(fileContent);
    
    // If it already has the electrum format
    if (content.wallet_type && content.seed_version) {
      return JSON.stringify(content, null, 2);
    }
    
    // Convert content to an appropriate format
    return createElectrumWalletFromData(content);
  } catch (e) {
    // It's not JSON, assume it's a key or mnemonic
    return createElectrumWalletFromSeed(fileContent);
  }
}

/**
 * Create an Electrum wallet from existing data
 */
function createElectrumWalletFromData(data: any): string {
  // Look for common fields in other wallet formats and map them
  let wallet = {
    "seed_version": 17,
    "wallet_type": "standard",
    "keystore": {
      "type": "bip39"
    },
    "use_encryption": false,
    "labels": {}
  };
  
  // Extract seed/private key data
  if (data.mnemonic || data.seed || data.seedPhrase) {
    wallet.keystore = {
      type: "bip39",
      seed: data.mnemonic || data.seed || data.seedPhrase,
      password: null
    } as KeystoreBip39;
  } else if (data.privateKey || data.private_key) {
    wallet.wallet_type = "imported";
    wallet.keystore = {
      type: "imported",
      keypairs: {
        imported_address: data.privateKey || data.private_key
      }
    } as KeystoreImported;
  } else if (data.xprv || data.xpub) {
    wallet.keystore = {
      type: "bip32",
      xpub: data.xpub || "",
      xprv: data.xprv || ""
    } as KeystoreBip32;
  }
  
  return JSON.stringify(wallet, null, 2);
}

/**
 * Create an Electrum wallet from seed or private key
 */
function createElectrumWalletFromSeed(seed: string): string {
  // Same as the createNewWallet function with Electrum specifics
  const cleanContent = seed.trim().replace(/[\r\n]+/g, ' ');
  
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
 * Build a MetaMask/Ethereum wallet format
 */
function buildMetamaskWallet(fileContent: string): string {
  try {
    // Try to parse as JSON
    const content = JSON.parse(fileContent);
    
    // If it already has the MetaMask format (crypto field is a sign of Ethereum keystores)
    if (content.crypto || content.Crypto) {
      return JSON.stringify(content, null, 2);
    }
    
    // Convert content to a MetaMask format
    return createMetamaskWalletFromData(content);
  } catch (e) {
    // It's not JSON, assume it's a private key or mnemonic
    return createMetamaskWalletFromSeed(fileContent);
  }
}

/**
 * Create a MetaMask wallet from existing data
 */
function createMetamaskWalletFromData(data: any): string {
  // Create a V3 keystore format wallet (Ethereum/MetaMask standard)
  // This is a simplified version for demonstration
  const wallet = {
    "version": 3,
    "id": generateRandomId(),
    "address": extractAddressFromData(data),
    "crypto": {
      "ciphertext": "placeholder-encrypted-data",
      "cipherparams": {
        "iv": "placeholder-iv"
      },
      "cipher": "aes-128-ctr",
      "kdf": "scrypt",
      "kdfparams": {
        "dklen": 32,
        "salt": "placeholder-salt",
        "n": 8192,
        "r": 8,
        "p": 1
      },
      "mac": "placeholder-mac"
    }
  };
  
  return JSON.stringify(wallet, null, 2);
}

/**
 * Create a MetaMask wallet from private key or mnemonic
 */
function createMetamaskWalletFromSeed(seed: string): string {
  // This would normally derive the Ethereum address and encrypt the private key
  // For demonstration, we'll create a placeholder
  const wallet = {
    "version": 3,
    "id": generateRandomId(),
    "address": "placeholder-ethereum-address",
    "crypto": {
      "ciphertext": "placeholder-encrypted-data",
      "cipherparams": {
        "iv": "placeholder-iv"
      },
      "cipher": "aes-128-ctr",
      "kdf": "scrypt",
      "kdfparams": {
        "dklen": 32,
        "salt": "placeholder-salt",
        "n": 8192,
        "r": 8,
        "p": 1
      },
      "mac": "placeholder-mac"
    }
  };
  
  return JSON.stringify(wallet, null, 2);
}

/**
 * Build an Exodus wallet format
 */
function buildExodusWallet(fileContent: string): string {
  try {
    // Try to parse as JSON
    const content = JSON.parse(fileContent);
    
    // If it already has Exodus format (usually has "exodus" field)
    if (content.exodus) {
      return JSON.stringify(content, null, 2);
    }
    
    // Convert to Exodus format
    return createExodusWalletFromData(content);
  } catch (e) {
    // It's not JSON, assume it's a key or mnemonic
    return createExodusWalletFromSeed(fileContent);
  }
}

/**
 * Create an Exodus wallet from existing data
 */
function createExodusWalletFromData(data: any): string {
  // Exodus wallets are multi-coin wallets with a different structure
  const wallet = {
    "exodus": {
      "version": "2.0.0",
      "seed": extractSeedFromData(data),
      "wallets": {
        "bitcoin": {
          "type": "bitcoin",
          "status": "active"
        },
        "ethereum": {
          "type": "ethereum",
          "status": "active"
        },
        "litecoin": {
          "type": "litecoin",
          "status": "active"
        }
      }
    }
  };
  
  return JSON.stringify(wallet, null, 2);
}

/**
 * Create an Exodus wallet from seed or private key
 */
function createExodusWalletFromSeed(seed: string): string {
  // Simplified Exodus wallet format
  const wallet = {
    "exodus": {
      "version": "2.0.0",
      "seed": {
        "encrypted": false,
        "value": seed.trim()
      },
      "wallets": {
        "bitcoin": {
          "type": "bitcoin",
          "status": "active"
        },
        "ethereum": {
          "type": "ethereum",
          "status": "active"
        },
        "litecoin": {
          "type": "litecoin",
          "status": "active"
        }
      }
    }
  };
  
  return JSON.stringify(wallet, null, 2);
}

/**
 * Build a generic JSON wallet format
 */
function buildGenericJsonWallet(fileContent: string): string {
  try {
    // Try to parse as JSON
    const content = JSON.parse(fileContent);
    
    // If it already has wallet fields, maintain them
    // Just clean up and pretty-print the JSON
    return JSON.stringify(content, null, 2);
  } catch (e) {
    // It's not JSON, create a simple format
    return createGenericWalletFromSeed(fileContent);
  }
}

/**
 * Create a generic wallet from seed or private key
 */
function createGenericWalletFromSeed(seed: string): string {
  const cleanContent = seed.trim().replace(/[\r\n]+/g, ' ');
  
  // Create a simple wallet format that is broadly compatible
  const wallet = {
    "walletInfo": {
      "version": "1.0.0",
      "created": new Date().toISOString(),
      "type": detectCryptoType(cleanContent)
    },
    "crypto": {
      // Store the key/seed in a basic format
      "seedPhrase": isValidMnemonic(cleanContent) ? cleanContent : null,
      "privateKey": isValidPrivateKey(cleanContent) || isValidWIF(cleanContent) ? cleanContent : null,
      "extendedKey": isValidExtendedKey(cleanContent) ? cleanContent : null,
      "format": detectCryptoType(cleanContent)
    }
  };
  
  return JSON.stringify(wallet, null, 2);
}

/**
 * For wallet.dat format (Bitcoin Core)
 * Note: In a real implementation, this would require more complex binary encoding
 */
export function buildWalletDat(fileContent: string): ArrayBuffer {
  // This is a placeholder - actual wallet.dat files are binary Berkeley DB files
  // Converting to wallet.dat would require much more complex processing
  
  // For demonstration, we're just creating a text representation
  const walletData = buildWallet(fileContent, 'wallet');
  
  // Convert to bytes (this is NOT a real wallet.dat, just a demonstration)
  const encoder = new TextEncoder();
  return encoder.encode(walletData).buffer;
}

// Helper Functions
// -------------------------------------------------------------------------

/**
 * Generate a random ID (UUID v4-like)
 */
function generateRandomId(): string {
  // Not a true UUID, just for demonstration
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Try to extract an Ethereum address from wallet data
 */
function extractAddressFromData(data: any): string {
  if (data.address) return data.address;
  
  // In a real implementation, would derive address from key material
  return "placeholder-ethereum-address";
}

/**
 * Extract seed material from wallet data
 */
function extractSeedFromData(data: any): any {
  // Look for seed in different formats and locations
  if (data.mnemonic || data.seed || data.seedPhrase) {
    return {
      "encrypted": false,
      "value": data.mnemonic || data.seed || data.seedPhrase
    };
  }
  
  if (data.keystore?.seed) {
    return {
      "encrypted": false,
      "value": data.keystore.seed
    };
  }
  
  // Placeholder for when no seed is found
  return {
    "encrypted": false,
    "value": "placeholder"
  };
}

/**
 * Detect the type of crypto content
 */
function detectCryptoType(content: string): string {
  if (isValidMnemonic(content)) return "mnemonic";
  if (isValidPrivateKey(content)) return "privateKey";
  if (isValidWIF(content)) return "wif";
  if (isValidExtendedKey(content)) return "extendedKey";
  return "unknown";
}

/**
 * Build a Coinbase wallet format
 */
function buildCoinbaseWallet(fileContent: string): string {
  try {
    // Try to parse as JSON
    const content = JSON.parse(fileContent);
    
    // Convert to Coinbase format
    return createCoinbaseWalletFromData(content);
  } catch (e) {
    // It's not JSON, assume it's a key or mnemonic
    return createCoinbaseWalletFromSeed(fileContent);
  }
}

/**
 * Create a Coinbase wallet from existing data
 */
function createCoinbaseWalletFromData(data: any): string {
  // Coinbase wallet format
  const wallet = {
    "version": 1,
    "id": generateRandomId(),
    "name": "Imported Wallet",
    "walletType": "coinbase",
    "encrypted": false,
    "accounts": [
      {
        "name": "Main Account",
        "coinType": "eth",
        "index": 0,
        "address": extractAddressFromData(data),
        "key": extractSeedFromData(data)
      }
    ],
    "features": {
      "testnet": false
    }
  };
  
  return JSON.stringify(wallet, null, 2);
}

/**
 * Create a Coinbase wallet from seed or private key
 */
function createCoinbaseWalletFromSeed(seed: string): string {
  const cleanContent = seed.trim().replace(/[\r\n]+/g, ' ');
  
  // Coinbase wallet format
  const wallet = {
    "version": 1,
    "id": generateRandomId(),
    "name": "Imported Wallet",
    "walletType": "coinbase",
    "encrypted": false,
    "accounts": [
      {
        "name": "Main Account",
        "coinType": "eth",
        "index": 0,
        "address": "placeholder-address",
        "key": {
          "type": isValidMnemonic(cleanContent) ? "mnemonic" : "private",
          "value": cleanContent
        }
      }
    ],
    "features": {
      "testnet": false
    }
  };
  
  return JSON.stringify(wallet, null, 2);
}

/**
 * Build a Binance wallet format
 */
function buildBinanceWallet(fileContent: string): string {
  try {
    // Try to parse as JSON
    const content = JSON.parse(fileContent);
    
    // Convert to Binance format
    return createBinanceWalletFromData(content);
  } catch (e) {
    // It's not JSON, assume it's a key or mnemonic
    return createBinanceWalletFromSeed(fileContent);
  }
}

/**
 * Create a Binance wallet from existing data
 */
function createBinanceWalletFromData(data: any): string {
  // Binance wallet format
  const wallet = {
    "version": "1.0",
    "walletType": "binance",
    "timestamp": new Date().toISOString(),
    "accounts": [
      {
        "accountType": "imported",
        "address": extractAddressFromData(data),
        "derivationPath": "m/44'/60'/0'/0/0",
        "encryptedKey": "placeholder-encrypted-key",
        "publicKey": "placeholder-public-key"
      }
    ],
    "settings": {
      "currency": "USD",
      "language": "en"
    }
  };
  
  return JSON.stringify(wallet, null, 2);
}

/**
 * Create a Binance wallet from seed or private key
 */
function createBinanceWalletFromSeed(seed: string): string {
  const cleanContent = seed.trim().replace(/[\r\n]+/g, ' ');
  
  // Binance wallet format
  const wallet = {
    "version": "1.0",
    "walletType": "binance",
    "timestamp": new Date().toISOString(),
    "accounts": [
      {
        "accountType": isValidMnemonic(cleanContent) ? "mnemonic" : "privateKey",
        "keyData": cleanContent,
        "derivationPath": "m/44'/60'/0'/0/0",
        "address": "placeholder-address",
        "publicKey": "placeholder-public-key"
      }
    ],
    "settings": {
      "currency": "USD",
      "language": "en"
    }
  };
  
  return JSON.stringify(wallet, null, 2);
}

/**
 * Build a Trezor wallet format
 */
function buildTrezorWallet(fileContent: string): string {
  try {
    // Try to parse as JSON
    const content = JSON.parse(fileContent);
    
    // Convert to Trezor format
    return createTrezorWalletFromData(content);
  } catch (e) {
    // It's not JSON, assume it's a key or mnemonic
    return createTrezorWalletFromSeed(fileContent);
  }
}

/**
 * Create a Trezor wallet from existing data
 */
function createTrezorWalletFromData(data: any): string {
  // Trezor wallet format
  const wallet = {
    "version": 1,
    "device": {
      "vendor": "trezor.io",
      "model": "Trezor Model T",
      "deviceId": generateRandomId()
    },
    "mnemonicSeed": extractSeedFromData(data),
    "passphrase": "",
    "accounts": [
      {
        "path": "m/44'/0'/0'",
        "coin": "btc",
        "accountIndex": 0,
        "xpub": "placeholder-xpub"
      },
      {
        "path": "m/44'/60'/0'",
        "coin": "eth",
        "accountIndex": 0,
        "xpub": "placeholder-xpub"
      }
    ]
  };
  
  return JSON.stringify(wallet, null, 2);
}

/**
 * Create a Trezor wallet from seed or private key
 */
function createTrezorWalletFromSeed(seed: string): string {
  const cleanContent = seed.trim().replace(/[\r\n]+/g, ' ');
  
  // Check if it's a mnemonic (Trezor primarily uses mnemonics)
  if (isValidMnemonic(cleanContent)) {
    const wallet = {
      "version": 1,
      "device": {
        "vendor": "trezor.io",
        "model": "Trezor Model T",
        "deviceId": generateRandomId()
      },
      "mnemonicSeed": cleanContent,
      "passphrase": "",
      "accounts": [
        {
          "path": "m/44'/0'/0'",
          "coin": "btc",
          "accountIndex": 0,
          "xpub": "placeholder-xpub"
        },
        {
          "path": "m/44'/60'/0'",
          "coin": "eth",
          "accountIndex": 0,
          "xpub": "placeholder-xpub"
        }
      ]
    };
    return JSON.stringify(wallet, null, 2);
  } else {
    // If it's not a mnemonic, create a generic format
    return createNewWallet(cleanContent);
  }
}

/**
 * Build a Ledger wallet format
 */
function buildLedgerWallet(fileContent: string): string {
  try {
    // Try to parse as JSON
    const content = JSON.parse(fileContent);
    
    // Convert to Ledger format
    return createLedgerWalletFromData(content);
  } catch (e) {
    // It's not JSON, assume it's a key or mnemonic
    return createLedgerWalletFromSeed(fileContent);
  }
}

/**
 * Create a Ledger wallet from existing data
 */
function createLedgerWalletFromData(data: any): string {
  // Ledger wallet format
  const wallet = {
    "version": "1.0.0",
    "device": {
      "vendor": "ledger.com",
      "model": "Nano S",
      "deviceId": generateRandomId()
    },
    "accounts": [
      {
        "derivationPath": "m/44'/0'/0'",
        "coin": "bitcoin",
        "xpub": "placeholder-xpub",
        "addresses": [
          {
            "index": 0,
            "path": "m/44'/0'/0'/0/0",
            "address": "placeholder-btc-address"
          }
        ]
      },
      {
        "derivationPath": "m/44'/60'/0'",
        "coin": "ethereum",
        "xpub": "placeholder-xpub",
        "addresses": [
          {
            "index": 0,
            "path": "m/44'/60'/0'/0/0",
            "address": "placeholder-eth-address"
          }
        ]
      }
    ]
  };
  
  return JSON.stringify(wallet, null, 2);
}

/**
 * Create a Ledger wallet from seed or private key
 */
function createLedgerWalletFromSeed(seed: string): string {
  // Ledger devices don't typically allow import of seed phrases directly
  // This is more of a "what a Ledger export might look like" format
  const wallet = {
    "version": "1.0.0",
    "device": {
      "vendor": "ledger.com",
      "model": "Nano S",
      "deviceId": generateRandomId()
    },
    "accounts": [
      {
        "derivationPath": "m/44'/0'/0'",
        "coin": "bitcoin",
        "xpub": "placeholder-xpub",
        "addresses": [
          {
            "index": 0,
            "path": "m/44'/0'/0'/0/0",
            "address": "placeholder-btc-address"
          }
        ]
      },
      {
        "derivationPath": "m/44'/60'/0'",
        "coin": "ethereum",
        "xpub": "placeholder-xpub",
        "addresses": [
          {
            "index": 0,
            "path": "m/44'/60'/0'/0/0",
            "address": "placeholder-eth-address"
          }
        ]
      }
    ]
  };
  
  return JSON.stringify(wallet, null, 2);
}

/**
 * Build a Trust Wallet format
 */
function buildTrustWallet(fileContent: string): string {
  try {
    // Try to parse as JSON
    const content = JSON.parse(fileContent);
    
    // Convert to Trust Wallet format
    return createTrustWalletFromData(content);
  } catch (e) {
    // It's not JSON, assume it's a key or mnemonic
    return createTrustWalletFromSeed(fileContent);
  }
}

/**
 * Create a Trust Wallet from existing data
 */
function createTrustWalletFromData(data: any): string {
  // Trust Wallet format (similar to MetaMask but with multi-coin support)
  const wallet = {
    "version": 3,
    "id": generateRandomId(),
    "crypto": {
      "ciphertext": "placeholder-ciphertext",
      "cipherparams": {
        "iv": "placeholder-iv"
      },
      "cipher": "aes-128-ctr",
      "kdf": "scrypt",
      "kdfparams": {
        "dklen": 32,
        "salt": "placeholder-salt",
        "n": 8192,
        "r": 8,
        "p": 1
      },
      "mac": "placeholder-mac"
    },
    "activeAccounts": [
      {
        "coin": "ethereum",
        "address": extractAddressFromData(data)
      },
      {
        "coin": "bitcoin",
        "address": "placeholder-btc-address"
      }
    ],
    "metadata": {
      "name": "Imported Wallet",
      "backupType": "mnemonic",
      "timestamp": new Date().toISOString()
    }
  };
  
  return JSON.stringify(wallet, null, 2);
}

/**
 * Create a Trust Wallet from seed or private key
 */
function createTrustWalletFromSeed(seed: string): string {
  const cleanContent = seed.trim().replace(/[\r\n]+/g, ' ');
  
  // Trust Wallet format
  const wallet = {
    "version": 3,
    "id": generateRandomId(),
    "crypto": {
      "ciphertext": "placeholder-ciphertext",
      "cipherparams": {
        "iv": "placeholder-iv"
      },
      "cipher": "aes-128-ctr",
      "kdf": "scrypt",
      "kdfparams": {
        "dklen": 32,
        "salt": "placeholder-salt",
        "n": 8192,
        "r": 8,
        "p": 1
      },
      "mac": "placeholder-mac"
    },
    "activeAccounts": [
      {
        "coin": "ethereum",
        "address": "placeholder-eth-address"
      },
      {
        "coin": "bitcoin",
        "address": "placeholder-btc-address"
      }
    ],
    "metadata": {
      "name": "Imported Wallet",
      "backupType": isValidMnemonic(cleanContent) ? "mnemonic" : "privateKey",
      "timestamp": new Date().toISOString()
    }
  };
  
  return JSON.stringify(wallet, null, 2);
}

/**
 * Build a Mycelium wallet format
 */
function buildMyceliumWallet(fileContent: string): string {
  try {
    // Try to parse as JSON
    const content = JSON.parse(fileContent);
    
    // Convert to Mycelium format
    return createMyceliumWalletFromData(content);
  } catch (e) {
    // It's not JSON, assume it's a key or mnemonic
    return createMyceliumWalletFromSeed(fileContent);
  }
}

/**
 * Create a Mycelium wallet from existing data
 */
function createMyceliumWalletFromData(data: any): string {
  // Mycelium wallet format (focused on Bitcoin)
  const wallet = {
    "formatVersion": 1,
    "walletType": "mycelium",
    "accounts": [
      {
        "archived": false,
        "label": "Imported Account",
        "accountType": "imported",  
        "addressType": "P2PKH",
        "privateData": {
          "privateKey": extractSeedFromData(data)
        }
      }
    ],
    "settings": {
      "lastBackup": new Date().getTime(),
      "localCurrency": "USD"
    }
  };
  
  return JSON.stringify(wallet, null, 2);
}

/**
 * Create a Mycelium wallet from seed or private key
 */
function createMyceliumWalletFromSeed(seed: string): string {
  const cleanContent = seed.trim().replace(/[\r\n]+/g, ' ');
  
  // Mycelium wallet format
  const wallet = {
    "formatVersion": 1,
    "walletType": "mycelium",
    "accounts": [
      {
        "archived": false,
        "label": "Imported Account",
        "accountType": isValidMnemonic(cleanContent) ? "bip44" : "imported",  
        "addressType": "P2PKH",
        "privateData": isValidMnemonic(cleanContent) ? 
          { "mnemonic": cleanContent } : 
          { "privateKey": cleanContent }
      }
    ],
    "settings": {
      "lastBackup": new Date().getTime(),
      "localCurrency": "USD"
    }
  };
  
  return JSON.stringify(wallet, null, 2);
}
