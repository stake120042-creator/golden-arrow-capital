'use client';

import React, { useState } from 'react';
import { RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';

interface SyncButtonProps {
  onSyncComplete?: () => void;
  className?: string;
}

const SyncButton: React.FC<SyncButtonProps> = ({ onSyncComplete, className = '' }) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');

  const handleSync = async () => {
    setIsSyncing(true);
    setMessage('Looking for new deposits...');
    setMessageType('');

    try {
      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        setMessage('Please log in to sync your wallet');
        setMessageType('error');
        return;
      }

      const response = await fetch('/api/wallet/sync-deposit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        }
      });

      const data = await response.json();
      
      if (response.ok) {
        setMessage(data.message);
        setMessageType('success');
        
        // Call the callback to refresh data
        if (onSyncComplete) {
          onSyncComplete();
        }
      } else {
        setMessage(data.message || 'Sync failed');
        setMessageType('error');
      }

    } catch (error) {
      console.error('Sync error:', error);
      setMessage('Network error. Try again later.');
      setMessageType('error');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className={`sync-section ${className}`}>
      <button 
        onClick={handleSync} 
        disabled={isSyncing}
        className={`
          inline-flex items-center px-4 py-2 text-white font-medium rounded-lg 
          transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105
          ${isSyncing 
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500'
          }
        `}
      >
        <RefreshCw 
          size={16} 
          className={`mr-2 ${isSyncing ? 'animate-spin' : ''}`} 
        />
        {isSyncing ? 'Syncing...' : 'Sync Now'}
      </button>
      
      {message && (
        <div className={`mt-3 flex items-center text-sm ${
          messageType === 'success' ? 'text-green-600' : 
          messageType === 'error' ? 'text-red-600' : 
          'text-gray-600'
        }`}>
          {messageType === 'success' && <CheckCircle size={16} className="mr-2" />}
          {messageType === 'error' && <AlertCircle size={16} className="mr-2" />}
          {message}
        </div>
      )}
    </div>
  );
};

export default SyncButton;



