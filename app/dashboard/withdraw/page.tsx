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
  const [walletBalance, setWalletBalance] = useState<{
    deposit_balance: number;
    income_balance: number;
    total_deposited: number;
    total_withdrawn: number;
  } | null>(null);
  
  // Withdrawal history
  const [withdrawalHistory, setWithdrawalHistory] = useState<any[]>([]);
  const [isLoadingWallet, setIsLoadingWallet] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

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

  // Fetch withdrawal data
  useEffect(() => {
    const fetchWithdrawalData = async () => {
      const authToken = localStorage.getItem('authToken');
      if (!authToken) return;

      try {
        // Fetch wallet balance (for available balance)
        setIsLoadingWallet(true);
        const walletRes = await fetch('/api/wallet/balance', {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
          cache: 'no-store',
        });
        if (walletRes.ok) {
          const walletJson = await walletRes.json();
          setWalletBalance(walletJson?.data || null);
        }



        // Fetch withdrawal history
        setIsLoadingHistory(true);
        const historyRes = await fetch('/api/withdrawal/history', {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
          cache: 'no-store',
        });
        if (historyRes.ok) {
          const historyJson = await historyRes.json();
          setWithdrawalHistory(historyJson?.data || []);
        }
      } catch (error) {
        console.error('Error fetching withdrawal data:', error);
      } finally {
        setIsLoadingWallet(false);
        setIsLoadingHistory(false);
      }
    };

    fetchWithdrawalData();
  }, []);

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
    
    const availableBalanceNum = walletBalance?.income_balance || 0;
    if (numAmount > availableBalanceNum) {
      setAmountError(`Insufficient balance. Available: $${availableBalanceNum.toFixed(2)} USDT`);
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
    
    try {
      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        setOtpMessage('Authentication required');
        setIsLoading(false);
        return;
      }

      const response = await fetch('/api/withdrawal/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          amount: withdrawAmount,
          walletAddress: withdrawAddress,
          description: withdrawMemo || 'Manual withdrawal'
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        // Refresh wallet balance
        const walletRes = await fetch('/api/wallet/balance', {
          headers: { Authorization: `Bearer ${authToken}` },
          cache: 'no-store',
        });
        if (walletRes.ok) {
          const walletJson = await walletRes.json();
          setWalletBalance(walletJson?.data || null);
        }



        // Refresh withdrawal history
        const historyRes = await fetch('/api/withdrawal/history', {
          headers: { Authorization: `Bearer ${authToken}` },
          cache: 'no-store',
        });
        if (historyRes.ok) {
          const historyJson = await historyRes.json();
          setWithdrawalHistory(historyJson?.data || []);
        }
        
        // Reset form
        setWithdrawAmount('');
        setWithdrawAddress('');
        setWithdrawMemo('');
        setWithdrawalOTP('');
        setOtpSent(false);
        setOtpVerified(false);
        setOtpMessage('Withdrawal request created successfully!');
        setAmountError('');
      } else {
        setOtpMessage(result.message || 'Failed to create withdrawal request');
      }
    } catch (error) {
      console.error('Failed to create withdrawal:', error);
      setOtpMessage('An error occurred while creating withdrawal request');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600';
      case 'pending':
        return 'text-yellow-600';
      case 'failed':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <Check className="w-4 h-4 text-green-600" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'failed':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-white">
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
          currentPage="withdraw"
        />
        
        {/* Withdraw Content */}
        <div className="pt-24 px-4 md:px-6 pb-12 max-w-6xl mx-auto">
          {/* Back Button */}
          <div className="mb-6 md:mb-8">
            <Link 
              href="/dashboard"
              className="inline-flex items-center text-purple-600 hover:text-purple-700 transition-colors mb-4 md:mb-6 text-sm md:text-base"
            >
              <ArrowLeft className="w-4 h-4 md:w-5 md:h-5 mr-2" />
              Back to Dashboard
            </Link>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Withdraw Form */}
            <div className="space-y-6">
              {/* Balance Overview */}
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300">
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-purple-100 to-indigo-100 border border-purple-200 mr-3">
                      <Wallet size={20} className="text-purple-700" />
                    </div>
                    <div>
                      <h3 className="text-gray-900 text-lg font-medium">Income Wallet Balance</h3>
                      <p className="text-gray-600 text-sm">Available for withdrawal</p>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-gray-600 text-sm mb-1">Available</p>
                      {isLoadingWallet ? (
                        <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                      ) : (
                        <p className="text-2xl font-bold text-purple-700">
                          ${walletBalance?.income_balance?.toFixed(2) || '0.00'}
                        </p>
                      )}
                    </div>

                  </div>
                </div>
              </div>

              {/* Withdraw Form */}
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300">
                <div className="p-6">
                  <div className="flex items-center mb-6">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-purple-100 to-indigo-100 border border-purple-200 mr-3">
                      <TrendingDown size={20} className="text-purple-700" />
                    </div>
                    <div>
                      <h3 className="text-gray-900 text-lg font-medium">Withdraw Funds</h3>
                      <p className="text-gray-600 text-sm">Send USDT to your BEP-20 wallet</p>
                    </div>
                  </div>
                  
                  <form onSubmit={handleWithdraw} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Amount (USDT)</label>
                        <input 
                          type="number"
                          value={withdrawAmount}
                          onChange={handleAmountChange}
                          placeholder="0.0"
                          step="0.001"
                          min={MIN_WITHDRAWAL}
                          max={Math.min(MAX_WITHDRAWAL, walletBalance?.income_balance || 0)}
                          required
                          className={`w-full p-4 bg-white border rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-purple-500/20 transition-all ${
                            amountError ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-purple-500'
                          }`}
                        />
                        {amountError ? (
                          <p className="text-red-600 text-xs mt-1">{amountError}</p>
                        ) : (
                          <p className="text-gray-500 text-xs mt-1">
                            Available: ${walletBalance?.income_balance?.toFixed(2) || '0.00'} USDT | Min: ${MIN_WITHDRAWAL} | Max: ${MAX_WITHDRAWAL}
                          </p>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Wallet Address (BEP-20)</label>
                        <input 
                          type="text"
                          value={withdrawAddress}
                          onChange={(e) => setWithdrawAddress(e.target.value)}
                          placeholder="0x..."
                          required
                          className="w-full p-4 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                        />
                        <p className="text-xs text-gray-500 mt-1">Only BEP-20 addresses are supported</p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Memo (Optional)</label>
                        <input 
                          type="text"
                          value={withdrawMemo}
                          onChange={(e) => setWithdrawMemo(e.target.value)}
                          placeholder="Withdrawal memo"
                          className="w-full p-4 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                        />
                      </div>
                      
                      {/* Withdrawal Code Section */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="block text-sm font-medium text-gray-700">Withdrawal Code</label>
                          <button 
                            type="button"
                            onClick={handleGenerateOTP}
                            disabled={isGeneratingOTP || !withdrawAmount || !withdrawAddress || !!amountError}
                            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm font-medium rounded-lg hover:from-indigo-600 hover:to-purple-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
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
                              ? 'bg-green-50 border-green-200 text-green-700' 
                              : 'bg-red-50 border-red-200 text-red-700'
                          }`}>
                            <span className="text-sm">{otpMessage}</span>
                          </div>
                        )}
                        
                        {otpSent && (
                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">Enter 6-digit code</label>
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
                        className="w-full px-5 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium rounded-lg hover:from-indigo-600 hover:to-purple-600 transition-all text-sm shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                      >
                        {isLoading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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

            {/* Withdrawal History */}
            <div className="space-y-6">


              {/* Withdrawal History */}
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300">
                <div className="p-6">
                  <div className="flex items-center mb-6">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-purple-100 to-indigo-100 border border-purple-200 mr-3">
                      <Clock size={20} className="text-purple-700" />
                    </div>
                    <div>
                      <h3 className="text-gray-900 text-lg font-medium">Withdrawal History</h3>
                      <p className="text-gray-600 text-sm">Recent withdrawal transactions</p>
                    </div>
                  </div>
                    
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {isLoadingHistory ? (
                        <div className="flex items-center justify-center py-8">
                          <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                          <span className="ml-2 text-gray-600">Loading history...</span>
                        </div>
                      ) : withdrawalHistory.length === 0 ? (
                        <div className="text-center py-8">
                          <div className="text-gray-400 mb-2">
                            <Clock className="w-12 h-12 mx-auto" />
                          </div>
                          <p className="text-gray-600">No withdrawal history yet</p>
                          <p className="text-gray-500 text-sm">Your withdrawal transactions will appear here</p>
                        </div>
                      ) : (
                        withdrawalHistory.map((withdrawal) => (
                          <div key={withdrawal.id} className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center space-x-3">
                                {getStatusIcon(withdrawal.status)}
                                <div>
                                  <p className="text-gray-900 font-medium">{withdrawal.amount} USDT</p>
                                  <p className="text-gray-600 text-sm">
                                    {new Date(withdrawal.created_at).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                              <span className={`text-sm font-medium ${getStatusColor(withdrawal.status)}`}>
                                {withdrawal.status.charAt(0).toUpperCase() + withdrawal.status.slice(1)}
                              </span>
                            </div>
                            
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">Address:</span>
                                <div className="flex items-center space-x-2">
                                  <code className="text-purple-700 font-mono text-xs">
                                    {withdrawal.wallet_address.substring(0, 8)}...{withdrawal.wallet_address.substring(withdrawal.wallet_address.length - 6)}
                                  </code>
                                  <button 
                                    onClick={() => handleCopyAddress(withdrawal.wallet_address)}
                                    className="text-gray-400 hover:text-purple-600 transition-colors"
                                  >
                                    {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                  </button>
                                </div>
                              </div>
                              
                              {withdrawal.description && (
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-gray-600">Memo:</span>
                                  <span className="text-gray-700">{withdrawal.description}</span>
                                </div>
                              )}
                              
                              {withdrawal.transaction_hash && (
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-gray-600">Transaction:</span>
                                  <a 
                                    href={`https://bscscan.com/tx/${withdrawal.transaction_hash}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-purple-700 hover:text-purple-800 transition-colors flex items-center space-x-1"
                                  >
                                    <span className="text-xs">View</span>
                                    <ExternalLink className="w-3 h-3" />
                                  </a>
                                </div>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                </div>
              </div>
            </div>
          </div>

          {/* Security Notice */}
          <div className="mt-8">
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
              <div className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-purple-100 to-indigo-100 border border-purple-200 flex-shrink-0">
                    <AlertTriangle className="w-5 h-5 text-purple-700" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Withdrawal Security</h4>
                    <ul className="text-gray-700 text-sm space-y-1">
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
  );
}
