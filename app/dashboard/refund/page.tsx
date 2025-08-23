'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import { useAuth } from '@/contexts/AuthContext';
import { RefundService } from '@/services/refundService';
import OTPInput from '@/components/OTPInput';
import { ArrowLeft, AlertCircle, Wallet, TrendingDown, Mail, RefreshCw, ArrowUpRight } from 'lucide-react';

export default function RefundPage() {
  const { logout, user } = useAuth();
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  const [refundAmount, setRefundAmount] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [refundReason, setRefundReason] = useState('');

  const [loading, setLoading] = useState(false);
  const [isGeneratingOTP, setIsGeneratingOTP] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpMessage, setOtpMessage] = useState('');
  const [amountError, setAmountError] = useState('');
  const [availableBalance, setAvailableBalance] = useState<string>('512.12');
  const [earnedBalance, setEarnedBalance] = useState<string>('0.00');

  const handleToggleSidebar = () => setShowMobileSidebar(!showMobileSidebar);
  const handleCloseSidebar = () => setShowMobileSidebar(false);
  const handleLogout = () => logout();

  const validateRefundAmount = (amount: string): boolean => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setAmountError('Please enter a valid amount');
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
    setRefundAmount(value);
    if (value) {
      validateRefundAmount(value);
    } else {
      setAmountError('');
    }
  };

  const handleGenerateOTP = async () => {
    try {
      if (!user?.email) {
        setOtpMessage('User email not found. Please relogin.');
        return;
      }
      if (!refundAmount || !validateRefundAmount(refundAmount)) {
        setOtpMessage('Please fix the amount validation errors');
        return;
      }
      if (!walletAddress.trim()) {
        setOtpMessage('Please enter your wallet address');
        return;
      }
      setIsGeneratingOTP(true);
      setOtpMessage('');
      const res = await fetch('/api/auth/generate-refund-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          firstName: user.firstName,
          refundData: { amount: refundAmount, address: walletAddress }
        })
      });
      const data = await res.json();
      if (data.success) {
        setOtpSent(true);
        setOtpVerified(false);
        setOtp('');
        setOtpMessage(data.message);
      } else {
        setOtpMessage(data.message || 'Failed to send OTP');
      }
    } catch (err: any) {
      console.error('Error sending OTP:', err);
      setOtpMessage(err?.message || 'Failed to send OTP');
    } finally {
      setIsGeneratingOTP(false);
    }
  };

  const handleOTPComplete = async (code: string) => {
    try {
      if (!user?.email) {
        setOtpMessage('User email not found. Please relogin.');
        return;
      }
      setOtp(code);
      setOtpMessage('');
      setOtpVerifying(true);
      const res = await fetch('/api/auth/verify-refund-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, otp: code, type: 'refund' })
      });
      const data = await res.json();
      if (data.success) {
        setOtpVerified(true);
        setOtpMessage(data.message);
      } else {
        setOtpVerified(false);
        setOtpMessage(data.message || 'Failed to verify OTP');
      }
    } catch (err: any) {
      console.error('Error verifying OTP:', err);
      setOtpVerified(false);
      setOtpMessage(err?.message || 'Failed to verify OTP');
    } finally {
      setOtpVerifying(false);
    }
  };

  const handleSubmitRefund = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpVerified) {
      alert('Please verify the OTP before submitting your refund request.');
      return;
    }
    if (!refundAmount || parseFloat(refundAmount) <= 0) {
      alert('Please enter a valid refund amount.');
      return;
    }
    if (!walletAddress.trim()) {
      alert('Please enter your wallet address.');
      return;
    }
    if (!refundReason.trim()) {
      alert('Please provide a reason for refund.');
      return;
    }

    setLoading(true);
    try {
      const newTicket = await RefundService.createRefundTicket({
        amount: refundAmount,
        address: walletAddress,
        reason: refundReason,
        userId: user?.id || 'user123'
      });

      if (newTicket) {
        setRefundAmount('');
        setWalletAddress('');
        setRefundReason('');
        setOtp('');
        setOtpSent(false);
        setOtpVerified(false);
        alert('Refund request submitted successfully! You will receive updates via email.');
      } else {
        alert('Failed to submit refund request. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting refund request:', error);
      alert('Failed to submit refund request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Enhanced Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute w-[800px] h-[800px] rounded-full bg-gradient-to-br from-purple-50 to-indigo-50 blur-3xl -top-40 -left-40 animate-float"></div>
          <div className="absolute w-[600px] h-[600px] rounded-full bg-gradient-to-tl from-indigo-50 to-purple-50 blur-3xl -bottom-40 -right-40 animate-float" style={{animationDelay: '2s'}}></div>
          <div className="absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.02)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
        </div>
      </div>

      {/* Sidebar */}
      <Sidebar 
        onLogout={handleLogout} 
        isOpen={showMobileSidebar}
        onClose={handleCloseSidebar}
      />
      
      {/* Main Content */}
      <div className="ml-0 lg:ml-64 min-h-screen relative z-10">
        {/* Header */}
        <TopBar 
          onLogout={handleLogout} 
          toggleSidebar={handleToggleSidebar} 
        />
        
        {/* Page Content */}
        <div className="pt-24 px-4 md:px-6 pb-12 space-y-8 max-w-3xl mx-auto">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
            <div className="flex items-center space-x-4 mb-6 md:mb-0">
              <Link 
                href="/dashboard"
                className="p-2 rounded-lg bg-gray-100 border border-gray-200 hover:bg-gray-200 transition-colors"
              >
                <ArrowLeft size={20} className="text-gray-700" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Refund Management</h1>
                <p className="text-gray-600 mt-1">Submit a refund request with email verification</p>
              </div>
            </div>
            <div className="hidden md:block" />
          </div>

          {/* Refund Policy Info */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-start space-x-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-purple-100 to-indigo-100 border border-purple-200">
                <AlertCircle size={24} className="text-purple-700" />
              </div>
              <div className="flex-1">
                <h3 className="text-gray-900 text-lg font-semibold mb-2">Refund Policy</h3>
                <div className="text-gray-700 space-y-2 text-sm">
                  <p>• Admin approval is required for all refund requests</p>
                  <p>• Processing time: 3-5 business days after approval</p>
                  <p>• Please ensure your wallet address is correct</p>
                </div>
              </div>
            </div>
          </div>

          {/* Refund Balance Card */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="p-2 rounded-lg bg-gradient-to-br from-purple-100 to-indigo-100 border border-purple-200 mr-3">
                  <Wallet size={20} className="text-purple-700" />
                </div>
                <div>
                  <h3 className="text-gray-900 text-lg font-medium">Refund Balance</h3>
                  <p className="text-gray-600 text-sm">Available for Refund</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-gray-600 text-sm mb-1">Available</p>
                  <p className="text-2xl font-bold text-purple-700">${availableBalance}</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-gray-600 text-sm mb-1">Earned</p>
                  <p className="text-2xl font-bold text-yellow-600">${earnedBalance}</p>
                </div>
              </div>
            </div>
          </div>

          {/* New Refund Request Form */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300">
            <div className="p-6">
              <div className="flex items-center mb-6">
                <div className="p-2 rounded-lg bg-gradient-to-br from-purple-100 to-indigo-100 border border-purple-200 mr-3">
                  <TrendingDown size={20} className="text-purple-700" />
                </div>
                <div>
                  <h3 className="text-gray-900 text-lg font-medium">Request Refund</h3>
                  <p className="text-gray-600 text-sm">Receive USDT to your BEP-20 wallet</p>
                </div>
              </div>
              
              <form onSubmit={handleSubmitRefund} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">Refund Amount (USDT)</label>
                    <input
                      type="number"
                      inputMode="decimal"
                      step="0.01"
                      min={0}
                      value={refundAmount}
                      onChange={handleAmountChange}
                      className={`w-full p-4 bg-white border rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-purple-500/20 transition-all ${amountError ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-purple-500'}`}
                      placeholder="0.0"
                      required
                    />
                    {amountError ? (
                      <p className="text-red-600 text-xs mt-1">{amountError}</p>
                    ) : (
                      <p className="text-gray-500 text-xs mt-1">Available: ${availableBalance} USDT</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">Wallet Address</label>
                    <input
                      type="text"
                      value={walletAddress}
                      onChange={(e) => setWalletAddress(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-gray-900 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-colors"
                      placeholder="Enter your USDT wallet address"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">Reason for Refund</label>
                  <textarea
                    value={refundReason}
                    onChange={(e) => setRefundReason(e.target.value)}
                    rows={4}
                    className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-gray-900 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-colors resize-none"
                    placeholder="Please provide a detailed reason for your refund request..."
                    required
                  />
                </div>

                {/* OTP Flow */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium text-gray-700">Refund Code</label>
                    <button 
                      type="button"
                      onClick={handleGenerateOTP}
                      disabled={isGeneratingOTP || !refundAmount || !walletAddress || !!amountError}
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

                <div className="flex">
                  <button
                    type="submit"
                    disabled={loading || !refundAmount || !walletAddress || !otpVerified || !!amountError}
                    className="w-full px-5 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium rounded-lg hover:from-indigo-600 hover:to-purple-600 transition-all text-sm shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <ArrowUpRight className="w-4 h-4" />
                        <span>Request Refund</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* History and eligible transactions removed per new flow */}
        </div>
      </div>
    </div>
  );
}


