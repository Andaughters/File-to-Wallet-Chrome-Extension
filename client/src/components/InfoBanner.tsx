import React from 'react';

interface InfoBannerProps {
  className?: string;
}

export default function InfoBanner({ className = '' }: InfoBannerProps) {
  return (
    <div className={`mb-6 bg-accent text-dark border border-accent rounded-lg p-4 ${className}`}>
      <div className="flex">
        <span className="material-icons text-dark mr-3">info</span>
        <div className="flex-1">
          <h3 className="font-medium text-dark mb-1">Important Information</h3>
          <ul className="text-sm text-dark space-y-1 list-disc list-inside ml-1">
            <li>Maximum file size: <span className="font-medium">5MB</span></li>
            <li>Supports <span className="font-medium">batch processing</span> of multiple wallets in a single file</li>
            <li>Available in <span className="font-medium">6 different output formats</span> (Standard, Bitcoin Core, JSON, Electrum, MetaMask, Exodus)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}