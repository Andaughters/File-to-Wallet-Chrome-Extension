import React, { useState } from 'react';
import { WalletFormat } from '../lib/walletBuilder';

// Format information with categories - synchronized with App.tsx
const FORMAT_INFO: Record<WalletFormat, { 
  extension: string, 
  description: string, 
  name: string, 
  mimeType: string,
  category: string 
}> = {
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

interface FileInfoProps {
  file: File;
  fileType: string;
  fileSize: string;
  onRemoveFile: () => void;
  outputFormat: WalletFormat;
  onFormatChange: (format: WalletFormat) => void;
  estimatedOutputSize?: string;
  outputFilename?: string;
  onFilenameChange?: (filename: string) => void;
  generateAllFormats?: boolean;
  onGenerateAllChange?: (generateAll: boolean) => void;
}

export default function FileInfo({ 
  file, 
  fileType, 
  fileSize, 
  onRemoveFile,
  outputFormat,
  onFormatChange,
  estimatedOutputSize = "Unknown",
  outputFilename = "",
  onFilenameChange = () => {},
  generateAllFormats = false,
  onGenerateAllChange = () => {}
}: FileInfoProps) {
  // State to track which categories are expanded
  const [activeCategory, setActiveCategory] = useState<string>('basic');
  
  // Group wallet formats by category for easier display
  const formatsByCategory = Object.entries(FORMAT_INFO).reduce((acc, [formatKey, formatData]) => {
    const category = formatData.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push({key: formatKey as WalletFormat, ...formatData});
    return acc;
  }, {} as Record<string, Array<{key: WalletFormat} & typeof FORMAT_INFO[WalletFormat]>>);
  
  // Category labels for display
  const categoryLabels: Record<string, {name: string, icon: string}> = {
    'basic': {name: 'Basic Formats', icon: 'wallet'},
    'desktop': {name: 'Desktop Wallets', icon: 'desktop_windows'},
    'mobile': {name: 'Mobile Wallets', icon: 'smartphone'},
    'hardware': {name: 'Hardware Wallets', icon: 'memory'},
    'web': {name: 'Web Wallets', icon: 'language'},
    'exchange': {name: 'Exchange Wallets', icon: 'currency_exchange'}
  };
  
  return (
    <div className="mb-6 fade-in">
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-neutral-700 flex items-center">
            <span className="material-icons text-primary mr-2 text-sm">settings</span>
            Output Options
          </h3>
          <button 
            className="text-neutral-400 hover:text-error transition-colors"
            onClick={onRemoveFile}
            title="Remove file"
          >
            <span className="material-icons">close</span>
          </button>
        </div>
        
        {/* Output Format Selector */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">Select Wallet Output Format</label>
          
          {/* Category tabs */}
          <div className="flex overflow-x-auto pb-2 mb-3 border-b border-gray-100">
            {Object.entries(categoryLabels).map(([category, {name, icon}]) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`flex items-center px-3 py-1.5 mr-2 rounded-md text-sm whitespace-nowrap ${
                  activeCategory === category 
                    ? 'bg-primary text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span className="material-icons text-sm mr-1">{icon}</span>
                {name}
              </button>
            ))}
          </div>
          
          {/* Format options grid for the selected category */}
          <div className="mb-3">
            <div className="grid grid-cols-2 gap-3">
              {formatsByCategory[activeCategory]?.map(format => (
                <label 
                  key={format.key}
                  className={`flex flex-col items-center justify-center p-3 border rounded-md cursor-pointer transition-all ${
                    outputFormat === format.key 
                      ? 'bg-primary-light border-primary text-primary font-medium' 
                      : 'hover:bg-neutral-50 border-gray-200'
                  }`}
                >
                  <input 
                    type="radio" 
                    name="format" 
                    value={format.key} 
                    checked={outputFormat === format.key} 
                    onChange={() => onFormatChange(format.key)}
                    className="sr-only" 
                  />
                  <span className="material-icons mb-1">
                    {format.key === 'wallet' ? 'wallet' : 
                     format.key === 'dat' ? 'dns' :
                     format.key === 'json' ? 'data_object' :
                     format.key === 'electrum' ? 'account_balance_wallet' :
                     format.key === 'metamask' ? 'currency_bitcoin' :
                     format.key === 'exodus' ? 'grid_3x3' :
                     format.key === 'trezor' || format.key === 'ledger' ? 'memory' :
                     format.key === 'coinbase' || format.key === 'binance' ? 'currency_exchange' :
                     'smartphone'}
                  </span>
                  <span className="text-sm">{format.name}</span>
                  <span className="text-xs text-gray-500">{format.extension}</span>
                </label>
              ))}
            </div>
          </div>
          
          {/* Generate All Formats Checkbox */}
          <div className="mt-4 pt-2 pb-2 border-t border-b border-gray-100">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={generateAllFormats}
                onChange={(e) => onGenerateAllChange(e.target.checked)}
                className="rounded text-secondary focus:ring-secondary"
              />
              <span className="text-sm font-medium text-neutral-700 flex items-center">
                <span className="material-icons mr-1 text-sm text-secondary">layers</span>
                Generate All Formats
              </span>
            </label>
            <p className="text-xs text-gray-500 mt-1 ml-5">
              Convert this file to all available wallet formats in one operation.
            </p>
          </div>

          {/* Format Info */}
          <div className="text-xs text-gray-500 mt-3 flex items-start">
            <span className="material-icons text-gray-400 mr-1 text-sm">info</span>
            <span>Choose the format that matches your wallet software requirements.</span>
          </div>
          
          {/* Output Filename Input */}
          <div className="mt-4 pt-3 border-t border-gray-100">
            <label className="block text-sm font-medium text-neutral-700 mb-2 flex items-center">
              <span className="material-icons mr-1 text-sm text-primary">drive_file_rename_outline</span>
              Output Filename
            </label>
            <div className="flex">
              <input 
                type="text"
                value={outputFilename}
                onChange={(e) => onFilenameChange(e.target.value)}
                placeholder={`my-wallet${outputFormat === 'wallet' ? '' : ''}`}
                className="flex-1 border border-gray-300 rounded-l-md px-3 py-2 text-sm focus-primary"
              />
              <span className="bg-gray-100 text-gray-600 px-3 py-2 rounded-r-md border border-l-0 border-gray-300 text-sm font-medium">
                {FORMAT_INFO[outputFormat].extension}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Customize the filename of your wallet file for easy identification.
            </p>
          </div>
          
          {/* Format Description */}
          <div className="mt-3">
            <p className="text-xs text-gray-700 italic">
              {FORMAT_INFO[outputFormat].description}
            </p>
          </div>
          
          {/* Estimated Output Size */}
          <div className="mt-4 pt-3 border-t border-gray-100">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-700 font-medium flex items-center">
                <span className="material-icons mr-1 text-sm text-[#B7410E]">trending_up</span>
                Estimated Output Size
              </span>
              <span className="text-sm text-gray-700 font-medium">
                {estimatedOutputSize}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              This is an approximate size of the generated wallet file.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}