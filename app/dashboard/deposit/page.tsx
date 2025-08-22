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
      <div className="min-h-screen bg-sp-bg flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#7C4DFF] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#9C6CFF] font-semibold">Generating your unique deposit address...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sp-bg">
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
              className="inline-flex items-center text-[#9C6CFF] hover:text-[#B79CFF] transition-colors mb-6"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Dashboard
            </Link>
            
            <div className="flex items-center space-x-4 mb-4">
              <div className="p-2 rounded-lg bg-gradient-to-br from-[#7C4DFF]/30 to-[#6C63FF]/20 border border-[#7C4DFF]/30">
                <Wallet size={24} className="text-[#9C6CFF]" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-[#B79CFF] to-[#9C6CFF] bg-clip-text text-transparent">
                  Deposit Funds
                </h1>
                <p className="text-slate-300">Add funds to your investment portfolio</p>
              </div>
            </div>
          </div>

          <div className="max-w-2xl mx-auto">
            {/* QR Code Section */}
            <div className="bg-gradient-to-br from-[#141922]/80 to-[#11151C]/80 backdrop-blur-sm border border-[#232B3A] rounded-xl shadow-lg shadow-black/30 overflow-hidden hover:border-[#7C4DFF]/30 transition-all duration-300">
              <div className="p-1">
                <div className="bg-gradient-to-br from-[#7C4DFF]/10 to-[#6C63FF]/5 p-6 rounded-lg">
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-[#B79CFF] to-[#9C6CFF] bg-clip-text text-transparent mb-2">
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
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-[#7C4DFF] to-[#6C63FF] rounded-full flex items-center justify-center">
                        <Shield className="w-4 h-4 text-slate-900" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3 mb-6">
                    <div className="bg-[#171C26] rounded-lg p-3 border border-[#232B3A]">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-300 text-sm">Network</span>
                        <span className="text-white font-medium">{networkInfo.name}</span>
                      </div>
                    </div>
                    
                    <div className="bg-[#171C26] rounded-lg p-3 border border-[#232B3A]">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-300 text-sm">Symbol</span>
                        <span className="text-[#9C6CFF] font-medium">{networkInfo.symbol}</span>
                      </div>
                    </div>
                    
                    <div className="bg-[#171C26] rounded-lg p-3 border border-[#232B3A]">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-300 text-sm">Your Unique Address</span>
                        <div className="flex items-center space-x-2">
                          <code className="text-[#9C6CFF] font-mono text-xs max-w-100 truncate">
                            {userAddress}
                          </code>
                          <button 
                            onClick={handleCopyAddress}
                            className="p-1 text-slate-400 hover:text-[#9C6CFF] transition-colors"
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
                      className="flex-1 px-5 py-2.5 bg-gradient-to-r from-[#7C4DFF] to-[#6C63FF] text-slate-900 font-medium rounded-lg hover:from-[#6C63FF] hover:to-[#7C4DFF] transition-all text-sm shadow-md flex items-center justify-center space-x-2"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download QR</span>
                    </button>
                    
                    <button 
                      onClick={handleCopyAddress}
                      className="flex-1 px-5 py-2.5 bg-[#171C26] text-white font-medium rounded-lg hover:bg-[#1C2330] transition-all text-sm border border-[#232B3A] flex items-center justify-center space-x-2"
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
            <div className="bg-gradient-to-br from-[#141922]/80 to-[#11151C]/80 backdrop-blur-sm border border-[#232B3A] rounded-xl shadow-lg shadow-black/30 overflow-hidden hover:border-[#7C4DFF]/30 transition-all duration-300">
              <div className="p-1">
                <div className="bg-gradient-to-br from-[#7C4DFF]/10 to-[#6C63FF]/5 p-6 rounded-lg">
                  <div className="flex items-center mb-6">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-[#7C4DFF]/30 to-[#6C63FF]/20 border border-[#7C4DFF]/30 mr-3">
                      <Info size={20} className="text-[#9C6CFF]" />
                    </div>
                    <div>
                      <h3 className="text-slate-300 text-lg font-medium">Deposit Instructions</h3>
                      <p className="text-slate-400 text-sm">Follow these steps to deposit funds</p>
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700/50">
                      <div className="w-12 h-12 bg-gradient-to-r from-[#7C4DFF] to-[#6C63FF] rounded-lg flex items-center justify-center mb-4">
                        <span className="text-slate-900 font-bold text-xl">1</span>
                      </div>
                      <h4 className="text-lg font-semibold text-white mb-2">Scan QR Code</h4>
                      <p className="text-slate-400 text-sm">Use your BEP-20 compatible wallet to scan the QR code above</p>
                    </div>
                    
                    <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700/50">
                      <div className="w-12 h-12 bg-gradient-to-r from-[#7C4DFF] to-[#6C63FF] rounded-lg flex items-center justify-center mb-4">
                        <span className="text-slate-900 font-bold text-xl">2</span>
                      </div>
                      <h4 className="text-lg font-semibold text-white mb-2">Confirm Transaction</h4>
                      <p className="text-slate-400 text-sm">Review the transaction details and confirm the deposit</p>
                    </div>
                    
                    <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700/50">
                      <div className="w-12 h-12 bg-gradient-to-r from-[#7C4DFF] to-[#6C63FF] rounded-lg flex items-center justify-center mb-4">
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
            <div className="bg-gradient-to-br from-[#141922]/80 to-[#11151C]/80 backdrop-blur-sm border border-[#7C4DFF]/30 rounded-xl shadow-lg shadow-black/30 overflow-hidden">
              <div className="p-1">
                <div className="bg-gradient-to-br from-[#7C4DFF]/10 to-[#6C63FF]/5 p-6 rounded-lg">
                  <div className="flex items-start space-x-4">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-[#7C4DFF]/30 to-[#6C63FF]/20 border border-[#7C4DFF]/30 flex-shrink-0">
                      <AlertTriangle className="w-5 h-5 text-[#9C6CFF]" />
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
