'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import { useAuth } from '@/contexts/AuthContext';
import QRCodeService from '@/services/qrCodeService';
import apiClient from '@/services/apiClient';
import { 
  ArrowLeft,
  Copy,
  Check,
  Download,
  ExternalLink,
  Shield,
  AlertTriangle,
  Info,
  Wallet,
  Coins,
  Sparkles,
  RefreshCw,
  Eye,
  EyeOff
} from 'lucide-react';

export default function DepositPage() {
  const { logout, user } = useAuth();
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [copied, setCopied] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [userAddress, setUserAddress] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [amount, setAmount] = useState<string>('');
  const [memo, setMemo] = useState<string>('');
  const [showAmountQR, setShowAmountQR] = useState(false);
  const [amountQRDataUrl, setAmountQRDataUrl] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  useEffect(() => {
    initializeDeposit();
  }, [user]);

  const initializeDeposit = async () => {
    if (!user) return;
    
    setIsLoading(true);
    setErrorMsg('');
    try {
      // Fetch or create on-chain deposit address for the user
      const resp = await apiClient.wallet.getOrCreate(user.id);
      const address = resp?.wallet?.deposit_address || '';
      setUserAddress(address);
      console.log('User Address:', address);
      // Generate QR code for the address
      if (address) {  
        const qrCode = await QRCodeService.generateQRCode({ address });
        console.log('QR Code:', qrCode);
        setQrCodeDataUrl(qrCode);
      } else {
        setErrorMsg('No deposit address is available for your account.');
      }
    } catch (error) {
      console.error('Error initializing deposit:', error);
      setErrorMsg((error as any)?.message || 'Failed to load your deposit wallet.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleSidebar = () => {
    setShowMobileSidebar(!showMobileSidebar);
  };

  const handleCloseSidebar = () => {
    setShowMobileSidebar(false);
  };

  const handleLogout = () => {
    logout();
  };

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(userAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGenerateAmountQR = async () => {
    if (!amount || !userAddress) return;
    
    try {
      const qrCode = await QRCodeService.generateAmountQRCode(userAddress, amount, memo);
      setAmountQRDataUrl(qrCode);
      setShowAmountQR(true);
    } catch (error) {
      console.error('Error generating amount QR code:', error);
    }
  };

  const handleDownloadQR = (dataUrl: string, filename: string) => {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const networkInfo = QRCodeService.getNetworkInfo();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-yellow-400 font-semibold">Generating your unique deposit address...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Sidebar */}
      <Sidebar 
        onLogout={handleLogout} 
        isOpen={showMobileSidebar}
        onClose={handleCloseSidebar}
      />
      
      {/* Main Content */}
      <div className="ml-0 lg:ml-64 min-h-screen">
        {/* Header */}
        <TopBar 
          onLogout={handleLogout} 
          toggleSidebar={handleToggleSidebar} 
        />
        
        {/* Deposit Content */}
        <div className="pt-24 px-4 md:px-6 pb-12 max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link 
              href="/dashboard"
              className="inline-flex items-center text-yellow-400 hover:text-yellow-300 transition-colors mb-6"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Dashboard
            </Link>
            
            <div className="flex items-center space-x-4 mb-4">
              <div className="p-2 rounded-lg bg-gradient-to-br from-yellow-400/30 to-amber-500/20 border border-yellow-400/30">
                <Wallet size={24} className="text-yellow-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-300 to-amber-300 bg-clip-text text-transparent">
                  Deposit Funds
                </h1>
                <p className="text-slate-300">Add funds to your investment portfolio</p>
              </div>
            </div>
          </div>

          <div className="max-w-2xl mx-auto">
            {/* QR Code Section */}
            <div className="bg-gradient-to-br from-slate-800/70 to-slate-900/70 backdrop-blur-sm border border-slate-700/50 rounded-xl shadow-lg shadow-slate-900/20 overflow-hidden hover:border-yellow-500/30 transition-all duration-300">
              <div className="p-1">
                <div className="bg-gradient-to-br from-yellow-500/10 to-amber-600/5 p-6 rounded-lg">
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-yellow-300 to-amber-300 bg-clip-text text-transparent mb-2">
                      Your Unique QR Code
                    </h2>
                    <p className="text-slate-300">Scan to deposit USDT (BEP-20)</p>
                  </div>
                  
                   <div className="flex justify-center mb-6">
                    <div className="relative">
                      <div className="w-64 h-64 bg-white rounded-2xl p-4 shadow-2xl">
                        {qrCodeDataUrl ? (
                          <img 
                            src={qrCodeDataUrl} 
                            alt="Deposit QR Code" 
                            className="w-full h-full"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-500 text-sm">
                            {errorMsg || 'No address yet'}
                          </div>
                        )}
                      </div>
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full flex items-center justify-center">
                        <Shield className="w-4 h-4 text-slate-900" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3 mb-6">
                    <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-300 text-sm">Network</span>
                        <span className="text-white font-medium">{networkInfo.name}</span>
                      </div>
                    </div>
                    
                    <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-300 text-sm">Symbol</span>
                        <span className="text-yellow-400 font-medium">{networkInfo.symbol}</span>
                      </div>
                    </div>
                    
                    <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-300 text-sm">Your Unique Address</span>
                        <div className="flex items-center space-x-2">
                          <code className="text-yellow-400 font-mono text-xs max-w-100 truncate">
                            {userAddress}
                          </code>
                          <button 
                            onClick={handleCopyAddress}
                            className="p-1 text-slate-400 hover:text-yellow-400 transition-colors"
                          >
                            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                      </div>
                    </div>
                    
                  </div>
                  
                  <div className="flex space-x-4">
                    <button 
                      onClick={() => handleDownloadQR(qrCodeDataUrl, 'deposit-qr-code.png')}
                      className="flex-1 px-5 py-2.5 bg-gradient-to-r from-yellow-400 to-amber-500 text-slate-900 font-medium rounded-lg hover:from-yellow-300 hover:to-amber-400 transition-all text-sm shadow-md flex items-center justify-center space-x-2"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download QR</span>
                    </button>
                    
                    <button 
                      onClick={handleCopyAddress}
                      className="flex-1 px-5 py-2.5 bg-slate-800/50 text-white font-medium rounded-lg hover:bg-slate-700/50 transition-all text-sm border border-slate-700/50 flex items-center justify-center space-x-2"
                    >
                      {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                      <span>{copied ? "Copied!" : "Copy Address"}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>


            </div>

          {/* Instructions */}
          <div className="mt-12">
            <div className="bg-gradient-to-br from-slate-800/70 to-slate-900/70 backdrop-blur-sm border border-slate-700/50 rounded-xl shadow-lg shadow-slate-900/20 overflow-hidden hover:border-yellow-500/30 transition-all duration-300">
              <div className="p-1">
                <div className="bg-gradient-to-br from-blue-500/10 to-indigo-600/5 p-6 rounded-lg">
                  <div className="flex items-center mb-6">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-blue-400/30 to-indigo-500/20 border border-blue-400/30 mr-3">
                      <Info size={20} className="text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-slate-300 text-lg font-medium">Deposit Instructions</h3>
                      <p className="text-slate-400 text-sm">Follow these steps to deposit funds</p>
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700/50">
                      <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-lg flex items-center justify-center mb-4">
                        <span className="text-slate-900 font-bold text-xl">1</span>
                      </div>
                      <h4 className="text-lg font-semibold text-white mb-2">Scan QR Code</h4>
                      <p className="text-slate-400 text-sm">Use your BEP-20 compatible wallet to scan the QR code above</p>
                    </div>
                    
                    <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700/50">
                      <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-lg flex items-center justify-center mb-4">
                        <span className="text-slate-900 font-bold text-xl">2</span>
                      </div>
                      <h4 className="text-lg font-semibold text-white mb-2">Confirm Transaction</h4>
                      <p className="text-slate-400 text-sm">Review the transaction details and confirm the deposit</p>
                    </div>
                    
                    <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700/50">
                      <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-lg flex items-center justify-center mb-4">
                        <span className="text-slate-900 font-bold text-xl">3</span>
                      </div>
                      <h4 className="text-lg font-semibold text-white mb-2">Wait for Confirmation</h4>
                      <p className="text-slate-400 text-sm">Funds will appear in your deposit wallet after network confirmation</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Security Notice */}
          <div className="mt-8">
            <div className="bg-gradient-to-br from-slate-800/70 to-slate-900/70 backdrop-blur-sm border border-amber-500/30 rounded-xl shadow-lg shadow-slate-900/20 overflow-hidden">
              <div className="p-1">
                <div className="bg-gradient-to-br from-amber-500/10 to-orange-600/5 p-6 rounded-lg">
                  <div className="flex items-start space-x-4">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-amber-400/30 to-orange-500/20 border border-amber-400/30 flex-shrink-0">
                      <AlertTriangle className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-2">Security Notice</h4>
                      <ul className="text-slate-300 text-sm space-y-1">
                        <li>• Only send USDT (BEP-20) to this address</li>
                        <li>• Minimum deposit: 50 USDT</li>
                        <li>• Deposits are credited after 12 network confirmations</li>
                        <li>• Keep your wallet secure and never share private keys</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>


        </div>
      </div>
    </div>
  );
}
