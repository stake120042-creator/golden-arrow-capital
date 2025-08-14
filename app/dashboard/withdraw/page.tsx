'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import { useAuth } from '@/contexts/AuthContext';
import OTPInput from '@/components/OTPInput';
import { 
  ArrowLeft,
  Copy,
  Check,
  ExternalLink,
  Shield,
  AlertTriangle,
  Info,
  Wallet,
  Coins,
  ArrowUpRight,
  Eye,
  EyeOff,
  Clock,
  DollarSign,
  TrendingDown,
  Mail,
  RefreshCw
} from 'lucide-react';

// Withdrawal limits from environment variables
const MIN_WITHDRAWAL = process.env.NEXT_PUBLIC_MINIMUM_WITHDRAWAL ? parseFloat(process.env.NEXT_PUBLIC_MINIMUM_WITHDRAWAL) : 50;
const MAX_WITHDRAWAL = process.env.NEXT_PUBLIC_MAXIMUM_WITHDRAWAL ? parseFloat(process.env.NEXT_PUBLIC_MAXIMUM_WITHDRAWAL) : 1000;

export default function WithdrawPage() {
  const { logout, user } = useAuth();
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingOTP, setIsGeneratingOTP] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [withdrawalOTP, setWithdrawalOTP] = useState('');
  const [otpMessage, setOtpMessage] = useState('');
  const [amountError, setAmountError] = useState('');
  
  // Form states
  const [withdrawAmount, setWithdrawAmount] = useState<string>('');
  const [withdrawAddress, setWithdrawAddress] = useState<string>('');
  const [withdrawMemo, setWithdrawMemo] = useState<string>('');
  
  // Balance states
  const [availableBalance, setAvailableBalance] = useState<string>('512.12');
  const [pendingWithdrawals, setPendingWithdrawals] = useState<string>('0.00');
  const [totalWithdrawn, setTotalWithdrawn] = useState<string>('1,250.00');
  
  // Withdrawal history
  const [withdrawalHistory, setWithdrawalHistory] = useState([
    {
      id: '1',
      amount: '100.00',
      address: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
      status: 'completed',
      date: '2024-01-15',
      txHash: '0x1234567890abcdef...',
      memo: 'Withdrawal to main wallet'
    },
    {
      id: '2',
      amount: '50.00',
      address: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
      status: 'pending',
      date: '2024-01-14',
      txHash: '',
      memo: 'Weekly withdrawal'
    },
    {
      id: '3',
      amount: '200.00',
      address: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
      status: 'completed',
      date: '2024-01-10',
      txHash: '0xabcdef1234567890...',
      memo: 'Large withdrawal'
    }
  ]);

  const handleToggleSidebar = () => {
    setShowMobileSidebar(!showMobileSidebar);
  };

  const handleCloseSidebar = () => {
    setShowMobileSidebar(false);
  };

  const handleLogout = () => {
    logout();
  };

  const handleCopyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const validateWithdrawalAmount = (amount: string): boolean => {
    const numAmount = parseFloat(amount);
    
    if (isNaN(numAmount) || numAmount <= 0) {
      setAmountError('Please enter a valid amount');
      return false;
    }
    
    if (numAmount < MIN_WITHDRAWAL) {
      setAmountError(`Minimum withdrawal amount is $${MIN_WITHDRAWAL} USDT`);
      return false;
    }
    
    if (numAmount > MAX_WITHDRAWAL) {
      setAmountError(`Maximum withdrawal amount is $${MAX_WITHDRAWAL} USDT`);
      return false;
    }
    
    const availableBalanceNum = parseFloat(availableBalance);
    if (numAmount > availableBalanceNum) {
      setAmountError(`Insufficient balance. Available: $${availableBalance} USDT`);
      return false;
    }
    
    setAmountError('');
    return true;
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setWithdrawAmount(value);
    
    if (value) {
      validateWithdrawalAmount(value);
    } else {
      setAmountError('');
    }
  };

  const handleGenerateOTP = async () => {
    if (!withdrawAmount || !withdrawAddress || !user?.email) {
      setOtpMessage('Please fill in all required fields');
      return;
    }

    if (!validateWithdrawalAmount(withdrawAmount)) {
      setOtpMessage('Please fix the amount validation errors');
      return;
    }

    setIsGeneratingOTP(true);
    setOtpMessage('');
    
    try {
      const response = await fetch('/api/auth/generate-withdrawal-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: user.email,
          firstName: user.firstName,
          withdrawalData: {
            amount: withdrawAmount,
            address: withdrawAddress,
            memo: withdrawMemo
          }
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        setOtpSent(true);
        setOtpVerified(false);
        setWithdrawalOTP('');
        setOtpMessage(result.message);
      } else {
        setOtpMessage(result.message);
      }
    } catch (error) {
      console.error('Failed to send OTP:', error);
      setOtpMessage('An error occurred while sending OTP. Please try again.');
    } finally {
      setIsGeneratingOTP(false);
    }
  };

  const handleOTPComplete = async (otp: string) => {
    if (!user?.email) {
      setOtpMessage('User email not found');
      return;
    }

    setWithdrawalOTP(otp);
    setOtpMessage('');
    
    try {
      const response = await fetch('/api/auth/verify-withdrawal-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: user.email,
          otp: otp,
          type: 'withdrawal'
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        setOtpVerified(true);
        setOtpMessage(result.message);
      } else {
        setOtpVerified(false);
        setOtpMessage(result.message);
      }
    } catch (error) {
      console.error('Failed to verify OTP:', error);
      setOtpVerified(false);
      setOtpMessage('An error occurred while verifying OTP. Please try again.');
    }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!withdrawAmount || !withdrawAddress || !otpVerified) {
      return;
    }

    if (!validateWithdrawalAmount(withdrawAmount)) {
      return;
    }

    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      // Add new withdrawal to history
      const newWithdrawal = {
        id: Date.now().toString(),
        amount: withdrawAmount,
        address: withdrawAddress,
        status: 'pending',
        date: new Date().toISOString().split('T')[0],
        txHash: '',
        memo: withdrawMemo || 'Manual withdrawal'
      };
      
      setWithdrawalHistory([newWithdrawal, ...withdrawalHistory]);
      
      // Update balances
      const currentBalance = parseFloat(availableBalance);
      const withdrawValue = parseFloat(withdrawAmount);
      setAvailableBalance((currentBalance - withdrawValue).toFixed(2));
      setPendingWithdrawals((parseFloat(pendingWithdrawals) + withdrawValue).toFixed(2));
      
      // Reset form
      setWithdrawAmount('');
      setWithdrawAddress('');
      setWithdrawMemo('');
      setWithdrawalOTP('');
      setOtpSent(false);
      setOtpVerified(false);
      setOtpMessage('');
      setAmountError('');
      
      setIsLoading(false);
    }, 2000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-400';
      case 'pending':
        return 'text-yellow-400';
      case 'failed':
        return 'text-red-400';
      default:
        return 'text-slate-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <Check className="w-4 h-4 text-green-400" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-400" />;
      case 'failed':
        return <AlertTriangle className="w-4 h-4 text-red-400" />;
      default:
        return <Clock className="w-4 h-4 text-slate-400" />;
    }
  };

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
        
        {/* Withdraw Content */}
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
              <div className="p-2 rounded-lg bg-gradient-to-br from-purple-400/30 to-indigo-500/20 border border-purple-400/30">
                <ArrowUpRight size={24} className="text-purple-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-300 to-indigo-300 bg-clip-text text-transparent">
                  Withdraw Funds
                </h1>
                <p className="text-slate-300">Withdraw your earnings to your wallet</p>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Withdraw Form */}
            <div className="space-y-6">
              {/* Balance Overview */}
              <div className="bg-gradient-to-br from-slate-800/70 to-slate-900/70 backdrop-blur-sm border border-slate-700/50 rounded-xl shadow-lg shadow-slate-900/20 overflow-hidden hover:border-purple-500/30 transition-all duration-300">
                <div className="p-1">
                  <div className="bg-gradient-to-br from-purple-500/10 to-indigo-600/5 p-6 rounded-lg">
                    <div className="flex items-center mb-4">
                      <div className="p-2 rounded-lg bg-gradient-to-br from-purple-400/30 to-indigo-500/20 border border-purple-400/30 mr-3">
                        <Wallet size={20} className="text-purple-400" />
                      </div>
                      <div>
                        <h3 className="text-slate-300 text-lg font-medium">Income Wallet Balance</h3>
                        <p className="text-slate-400 text-sm">Available for withdrawal</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
                        <p className="text-slate-400 text-sm mb-1">Available</p>
                        <p className="text-2xl font-bold text-purple-400">${availableBalance}</p>
                      </div>
                      <div className="text-center p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
                        <p className="text-slate-400 text-sm mb-1">Pending</p>
                        <p className="text-2xl font-bold text-yellow-400">${pendingWithdrawals}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Withdraw Form */}
              <div className="bg-gradient-to-br from-slate-800/70 to-slate-900/70 backdrop-blur-sm border border-slate-700/50 rounded-xl shadow-lg shadow-slate-900/20 overflow-hidden hover:border-yellow-500/30 transition-all duration-300">
                <div className="p-1">
                  <div className="bg-gradient-to-br from-yellow-500/10 to-amber-600/5 p-6 rounded-lg">
                    <div className="flex items-center mb-6">
                      <div className="p-2 rounded-lg bg-gradient-to-br from-yellow-400/30 to-amber-500/20 border border-yellow-400/30 mr-3">
                        <TrendingDown size={20} className="text-yellow-400" />
                      </div>
                      <div>
                        <h3 className="text-slate-300 text-lg font-medium">Withdraw Funds</h3>
                        <p className="text-slate-400 text-sm">Send USDT to your BEP-20 wallet</p>
                      </div>
                    </div>
                    
                    <form onSubmit={handleWithdraw} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Amount (USDT)</label>
                        <input 
                          type="number"
                          value={withdrawAmount}
                          onChange={handleAmountChange}
                          placeholder="0.0"
                          step="0.001"
                          min={MIN_WITHDRAWAL}
                          max={Math.min(MAX_WITHDRAWAL, parseFloat(availableBalance))}
                          required
                          className={`w-full p-4 bg-slate-800/50 border rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-yellow-400/20 transition-all ${
                            amountError ? 'border-red-500 focus:border-red-500' : 'border-slate-700/50 focus:border-yellow-400'
                          }`}
                        />
                        {amountError ? (
                          <p className="text-red-400 text-xs mt-1">{amountError}</p>
                        ) : (
                          <p className="text-slate-400 text-xs mt-1">
                            Available: ${availableBalance} USDT | Min: ${MIN_WITHDRAWAL} | Max: ${MAX_WITHDRAWAL}
                          </p>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Wallet Address (BEP-20)</label>
                        <input 
                          type="text"
                          value={withdrawAddress}
                          onChange={(e) => setWithdrawAddress(e.target.value)}
                          placeholder="0x..."
                          required
                          className="w-full p-4 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-400 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 transition-all"
                        />
                        <p className="text-xs text-slate-400 mt-1">Only BEP-20 addresses are supported</p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Memo (Optional)</label>
                        <input 
                          type="text"
                          value={withdrawMemo}
                          onChange={(e) => setWithdrawMemo(e.target.value)}
                          placeholder="Withdrawal memo"
                          className="w-full p-4 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-400 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 transition-all"
                        />
                      </div>
                      
                      {/* Withdrawal Code Section */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="block text-sm font-medium text-slate-300">Withdrawal Code</label>
                          <button 
                            type="button"
                            onClick={handleGenerateOTP}
                            disabled={isGeneratingOTP || !withdrawAmount || !withdrawAddress || !!amountError}
                            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm font-medium rounded-lg hover:from-blue-400 hover:to-indigo-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                          >
                            {isGeneratingOTP ? (
                              <>
                                <RefreshCw className="w-4 h-4 animate-spin" />
                                <span>Sending...</span>
                              </>
                            ) : (
                              <>
                                <Mail className="w-4 h-4" />
                                <span>Generate OTP</span>
                              </>
                            )}
                          </button>
                        </div>
                        
                        {otpMessage && (
                          <div className={`p-3 rounded-lg border ${
                            otpMessage.includes('successfully') || otpMessage.includes('verified') 
                              ? 'bg-green-500/10 border-green-500/30 text-green-400' 
                              : 'bg-red-500/10 border-red-500/30 text-red-400'
                          }`}>
                            <span className="text-sm">{otpMessage}</span>
                          </div>
                        )}
                        
                        {otpSent && (
                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-slate-300">Enter 6-digit code</label>
                            <OTPInput 
                              length={6}
                              onComplete={handleOTPComplete}
                              className="justify-start"
                            />
                          </div>
                        )}
                      </div>
                      
                      <button 
                        type="submit" 
                        disabled={isLoading || !withdrawAmount || !withdrawAddress || !otpVerified || !!amountError}
                        className="w-full px-5 py-3 bg-gradient-to-r from-yellow-400 to-amber-500 text-slate-900 font-medium rounded-lg hover:from-yellow-300 hover:to-amber-400 transition-all text-sm shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                      >
                        {isLoading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                            <span>Processing...</span>
                          </>
                        ) : (
                          <>
                            <ArrowUpRight className="w-4 h-4" />
                            <span>Withdraw Funds</span>
                          </>
                        )}
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </div>

            {/* Withdrawal History */}
            <div className="space-y-6">
              {/* Quick Stats */}
              <div className="bg-gradient-to-br from-slate-800/70 to-slate-900/70 backdrop-blur-sm border border-slate-700/50 rounded-xl shadow-lg shadow-slate-900/20 overflow-hidden hover:border-blue-500/30 transition-all duration-300">
                <div className="p-1">
                  <div className="bg-gradient-to-br from-blue-500/10 to-indigo-600/5 p-6 rounded-lg">
                    <div className="flex items-center mb-4">
                      <div className="p-2 rounded-lg bg-gradient-to-br from-blue-400/30 to-indigo-500/20 border border-blue-400/30 mr-3">
                        <DollarSign size={20} className="text-blue-400" />
                      </div>
                      <div>
                        <h3 className="text-slate-300 text-lg font-medium">Withdrawal Stats</h3>
                        <p className="text-slate-400 text-sm">Your withdrawal activity</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
                        <p className="text-slate-400 text-sm mb-1">This Month</p>
                        <p className="text-xl font-bold text-blue-400">$350.00</p>
                      </div>
                      <div className="text-center p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
                        <p className="text-slate-400 text-sm mb-1">Total Withdrawals</p>
                        <p className="text-xl font-bold text-green-400">$1,250.00</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Withdrawal History */}
              <div className="bg-gradient-to-br from-slate-800/70 to-slate-900/70 backdrop-blur-sm border border-slate-700/50 rounded-xl shadow-lg shadow-slate-900/20 overflow-hidden hover:border-green-500/30 transition-all duration-300">
                <div className="p-1">
                  <div className="bg-gradient-to-br from-green-500/10 to-emerald-600/5 p-6 rounded-lg">
                    <div className="flex items-center mb-6">
                      <div className="p-2 rounded-lg bg-gradient-to-br from-green-400/30 to-emerald-500/20 border border-green-400/30 mr-3">
                        <Clock size={20} className="text-green-400" />
                      </div>
                      <div>
                        <h3 className="text-slate-300 text-lg font-medium">Withdrawal History</h3>
                        <p className="text-slate-400 text-sm">Recent withdrawal transactions</p>
                      </div>
                    </div>
                    
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {withdrawalHistory.map((withdrawal) => (
                        <div key={withdrawal.id} className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              {getStatusIcon(withdrawal.status)}
                              <div>
                                <p className="text-white font-medium">{withdrawal.amount} USDT</p>
                                <p className="text-slate-400 text-sm">{withdrawal.date}</p>
                              </div>
                            </div>
                            <span className={`text-sm font-medium ${getStatusColor(withdrawal.status)}`}>
                              {withdrawal.status.charAt(0).toUpperCase() + withdrawal.status.slice(1)}
                            </span>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-slate-400">Address:</span>
                              <div className="flex items-center space-x-2">
                                <code className="text-yellow-400 font-mono text-xs">
                                  {withdrawal.address.substring(0, 8)}...{withdrawal.address.substring(withdrawal.address.length - 6)}
                                </code>
                                <button 
                                  onClick={() => handleCopyAddress(withdrawal.address)}
                                  className="text-slate-400 hover:text-yellow-400 transition-colors"
                                >
                                  {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                </button>
                              </div>
                            </div>
                            
                            {withdrawal.memo && (
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-400">Memo:</span>
                                <span className="text-slate-300">{withdrawal.memo}</span>
                              </div>
                            )}
                            
                            {withdrawal.txHash && (
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-400">Transaction:</span>
                                <a 
                                  href={`https://bscscan.com/tx/${withdrawal.txHash}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-400 hover:text-blue-300 transition-colors flex items-center space-x-1"
                                >
                                  <span className="text-xs">View</span>
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
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
                      <h4 className="text-lg font-semibold text-white mb-2">Withdrawal Security</h4>
                      <ul className="text-slate-300 text-sm space-y-1">
                        <li>• Minimum withdrawal: ${MIN_WITHDRAWAL} USDT</li>
                        <li>• Maximum withdrawal: ${MAX_WITHDRAWAL} USDT per day</li>
                        <li>• Withdrawals are processed within 24 hours</li>
                        <li>• Double-check your wallet address before confirming</li>
                        <li>• Only BEP-20 addresses are supported</li>
                        <li>• Withdrawal code is required for security verification</li>
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
