'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import { useAuth } from '@/contexts/AuthContext';
import apiClient from '@/services/apiClient';
import { 
  ArrowLeft,
  DollarSign,
  TrendingUp,
  Clock,
  Shield,
  AlertTriangle,
  Info,
  Wallet,
  Coins,
  Sparkles,
  Check,
  X,
  Calendar,
  Percent,
  Target,
  Zap,
  ChevronDown,
  BarChart3
} from 'lucide-react';

interface InvestmentPlan {
  id: string;
  name: string;
  minAmount: number;
  maxAmount: number;
  dailyReturn: number;
  description: string;
  features: string[];
  popular?: boolean;
  packageId: number;
}

const investmentPlans: InvestmentPlan[] = [
  {
    id: 'basic',
    name: 'Basic Package',
    minAmount: 50,
    maxAmount: 1000,
    dailyReturn: 0.4,
    description: 'Entry-level investment with steady daily returns',
    features: [
      'Daily returns of 0.4%',
      'Investment range: $50 - $1,000',
      'Daily USDT credits'
    ],
    packageId: 1
  },
  {
    id: 'silver',
    name: 'Silver Package',
    minAmount: 1001,
    maxAmount: 5000,
    dailyReturn: 0.45,
    description: 'Enhanced returns for moderate investors',
    features: [
      'Daily returns of 0.45%',
      'Investment range: $1,001 - $5,000',
      'Daily USDT credits'
    ],
    packageId: 2
  },
  {
    id: 'gold',
    name: 'Gold Package',
    minAmount: 5001,
    maxAmount: 10000,
    dailyReturn: 0.5,
    description: 'Premium returns for serious investors',
    features: [
      'Daily returns of 0.5%',
      'Investment range: $5,001 - $10,000',
      'Daily USDT credits'
    ],
    popular: true,
    packageId: 3
  },
  {
    id: 'platinum',
    name: 'Platinum Package',
    minAmount: 10001,
    maxAmount: 100000,
    dailyReturn: 0.6,
    description: 'Maximum returns for high-value investors',
    features: [
      'Daily returns of 0.6%',
      'Investment range: $10,001+',
      'Daily USDT credits'
    ],
    packageId: 4
  }
];

export default function InvestPage() {
  const { logout, user } = useAuth();
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<InvestmentPlan | null>(null);
  const [investmentAmount, setInvestmentAmount] = useState<string>('');
  const [availableBalance, setAvailableBalance] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isInvesting, setIsInvesting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');
  const [showPlanDropdown, setShowPlanDropdown] = useState(false);

  useEffect(() => {
    fetchUserBalance();
  }, [user]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.plan-dropdown')) {
        setShowPlanDropdown(false);
      }
    };

    if (showPlanDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showPlanDropdown]);

  const fetchUserBalance = async () => {
    if (!user) return;
    
    setIsLoading(true);
    setErrorMsg('');
    try {
      // Fetch user's deposit balance
      const resp = await apiClient.wallet.getBalance();
      const depositBalance = resp?.data?.deposit_balance || 0;
      setAvailableBalance(depositBalance);
    } catch (error) {
      console.error('Error fetching deposit balance:', error);
      setErrorMsg('Failed to load your deposit balance.');
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

  const handlePlanSelect = (plan: InvestmentPlan) => {
    setSelectedPlan(plan);
    setInvestmentAmount(plan.minAmount.toString());
    setErrorMsg('');
    setSuccessMsg('');
    setShowPlanDropdown(false);
  };

  const getPlanColor = (planId: string) => {
    switch (planId) {
      case 'basic': return 'from-blue-500 to-blue-600';
      case 'silver': return 'from-gray-400 to-gray-500';
      case 'gold': return 'from-yellow-500 to-yellow-600';
      case 'platinum': return 'from-purple-500 to-purple-600';
      default: return 'from-purple-500 to-purple-600';
    }
  };

  const handleAmountChange = (amount: string) => {
    setInvestmentAmount(amount);
    setErrorMsg('');
    setSuccessMsg('');
    
    // Real-time validation feedback
    if (selectedPlan && amount) {
      const numAmount = parseFloat(amount);
      if (!isNaN(numAmount)) {
        if (numAmount < selectedPlan.minAmount) {
          setErrorMsg(`Minimum investment for ${selectedPlan.name} is $${selectedPlan.minAmount.toLocaleString()}.`);
        } else if (numAmount > selectedPlan.maxAmount) {
          setErrorMsg(`Maximum investment for ${selectedPlan.name} is $${selectedPlan.maxAmount.toLocaleString()}.`);
        } else if (numAmount > availableBalance) {
          setErrorMsg('Insufficient balance. Please deposit more funds first.');
        } else {
          setErrorMsg(''); // Clear error if amount is valid
        }
      }
    }
  };

  const validateInvestment = (): boolean => {
    if (!selectedPlan) {
      setErrorMsg('Please select an investment plan.');
      return false;
    }

    const amount = parseFloat(investmentAmount);
    if (isNaN(amount) || amount <= 0) {
      setErrorMsg('Please enter a valid investment amount.');
      return false;
    }

    if (amount < selectedPlan.minAmount) {
      setErrorMsg(`Minimum investment for ${selectedPlan.name} is $${selectedPlan.minAmount}.`);
      return false;
    }

    if (amount > selectedPlan.maxAmount) {
      setErrorMsg(`Maximum investment for ${selectedPlan.name} is $${selectedPlan.maxAmount}.`);
      return false;
    }

    if (amount > availableBalance) {
      setErrorMsg('Insufficient balance. Please deposit more funds first.');
      return false;
    }

    return true;
  };

  const handleInvest = async () => {
    if (!validateInvestment()) return;

    setIsInvesting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const amount = parseFloat(investmentAmount);
      
      // First, deduct the amount from wallet balance
      const walletResponse = await apiClient.wallet.updateBalance(amount, 'deduct');
      if (!walletResponse.success) {
        throw new Error(walletResponse.message || 'Failed to update wallet balance');
      }

      // Create investment record with package_id mapping
      const investmentResponse = await apiClient.investment.create(selectedPlan!.packageId, amount);
      if (!investmentResponse.success) {
        // If investment creation fails, revert the wallet balance
        await apiClient.wallet.updateBalance(amount, 'add');
        throw new Error(investmentResponse.message || 'Failed to process investment');
      }

      // Update investment details summary
      try {
        await apiClient.investment.updateSummary();
      } catch (summaryError) {
        console.warn('Failed to update investment summary, but investment was created:', summaryError);
      }

      setSuccessMsg(`Successfully invested $${amount.toFixed(2)} in ${selectedPlan?.name}!`);
      setSelectedPlan(null);
      setInvestmentAmount('');
      
      // Refresh balance
      await fetchUserBalance();
      
    } catch (error) {
      console.error('Investment error:', error);
      setErrorMsg(error instanceof Error ? error.message : 'Failed to process investment. Please try again.');
    } finally {
      setIsInvesting(false);
    }
  };

  const calculateDailyEarnings = (amount: number, dailyReturn: number): number => {
    return (amount * dailyReturn) / 100;
  };



  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-purple-700 font-semibold">Loading your investment options...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Enhanced Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full">
          {/* Subtle gradient orbs */}
          <div className="absolute w-[800px] h-[800px] rounded-full bg-gradient-to-br from-purple-500/5 to-indigo-600/3 blur-3xl -top-40 -left-40 animate-float"></div>
          <div className="absolute w-[600px] h-[600px] rounded-full bg-gradient-to-tl from-indigo-500/4 to-purple-600/2 blur-3xl -bottom-40 -right-40 animate-float" style={{animationDelay: '2s'}}></div>
          
          {/* Grid pattern overlay */}
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
          currentPage="invest"
        />
        
        {/* Invest Content */}
        <div className="pt-24 md:pt-28 px-3 sm:px-4 md:px-6 pb-8 md:pb-12 max-w-7xl mx-auto">
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

          {/* Available Balance */}
          <div className="mb-6 md:mb-8">
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300">
              <div className="p-4 md:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                  <div className="flex items-center">
                    <div className="p-2 md:p-3 rounded-xl bg-gradient-to-br from-green-100 to-emerald-100 border border-green-200 mr-3 md:mr-4">
                      <Wallet size={20} className="md:w-6 md:h-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-gray-900 text-base md:text-lg font-semibold">Available Balance</h3>
                      <p className="text-gray-600 text-xs md:text-sm">Funds ready for investment</p>
                    </div>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-2xl md:text-3xl font-bold text-gray-900">${availableBalance.toFixed(2)}</p>
                    <p className="text-green-600 text-xs md:text-sm font-medium">Ready to invest</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Investment Plans */}
          <div className="mb-6 md:mb-8">

            {/* Plan Selection Dropdown */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300">
              <div className="p-4 md:p-6">
                <div className="mb-4 md:mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Investment Package
                  </label>
                  <div className="relative plan-dropdown">
                    <button
                      onClick={() => setShowPlanDropdown(!showPlanDropdown)}
                      className="w-full flex items-center justify-between px-3 md:px-4 py-3 md:py-3 border border-gray-300 rounded-lg bg-white hover:border-purple-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300"
                    >
                      <div className="flex items-center min-w-0 flex-1">
                        {selectedPlan ? (
                          <>
                            <div className={`w-3 h-3 md:w-4 md:h-4 rounded-full bg-gradient-to-r ${getPlanColor(selectedPlan.id)} mr-2 md:mr-3 flex-shrink-0`}></div>
                            <span className="text-gray-900 font-medium text-sm md:text-base truncate">{selectedPlan.name}</span>
                          </>
                        ) : (
                          <span className="text-gray-500 text-sm md:text-base">Choose an investment package</span>
                        )}
                      </div>
                      <ChevronDown className={`w-4 h-4 md:w-5 md:h-5 text-gray-400 transition-transform duration-200 flex-shrink-0 ${showPlanDropdown ? 'rotate-180' : ''}`} />
                    </button>

                    {showPlanDropdown && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 md:max-h-96 overflow-y-auto">
                        {investmentPlans.map((plan) => (
                          <div
                            key={plan.id}
                            onClick={() => handlePlanSelect(plan)}
                            className="flex items-center justify-between px-3 md:px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                          >
                            <div className="flex items-center min-w-0 flex-1">
                              <div className={`w-3 h-3 md:w-4 md:h-4 rounded-full bg-gradient-to-r ${getPlanColor(plan.id)} mr-2 md:mr-3 flex-shrink-0`}></div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center">
                                  <span className="font-medium text-gray-900 text-sm md:text-base truncate">{plan.name}</span>
                                  {plan.popular && (
                                    <span className="ml-1 md:ml-2 px-1.5 md:px-2 py-0.5 md:py-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold rounded-full flex-shrink-0">
                                      POPULAR
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs md:text-sm text-gray-600 truncate">{plan.description}</p>
                              </div>
                            </div>
                            <div className="text-right flex-shrink-0 ml-2">
                              <div className="text-xs md:text-sm font-semibold text-green-600">{plan.dailyReturn}% daily</div>
                              <div className="text-xs text-gray-500">${plan.minAmount.toLocaleString()} - ${plan.maxAmount === 100000 ? '∞' : plan.maxAmount.toLocaleString()}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Selected Plan Details */}
                {selectedPlan && (
                  <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg p-4 md:p-6 border border-purple-200">
                    <div className="flex items-center justify-between mb-3 md:mb-4">
                      <div className="flex items-center min-w-0 flex-1">
                        <div className={`w-4 h-4 md:w-6 md:h-6 rounded-full bg-gradient-to-r ${getPlanColor(selectedPlan.id)} mr-2 md:mr-3 flex-shrink-0`}></div>
                        <h3 className="text-base md:text-lg font-bold text-gray-900 truncate">{selectedPlan.name}</h3>
                        {selectedPlan.popular && (
                          <span className="ml-1 md:ml-2 px-2 md:px-3 py-0.5 md:py-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold rounded-full flex-shrink-0">
                            MOST POPULAR
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 mb-3 md:mb-4">
                      <div className="bg-white rounded-lg p-3 border border-purple-200">
                        <div className="text-xs md:text-sm text-gray-600">Daily Return</div>
                        <div className="text-base md:text-lg font-bold text-green-600">{selectedPlan.dailyReturn}%</div>
                      </div>
                      <div className="bg-white rounded-lg p-3 border border-purple-200">
                        <div className="text-xs md:text-sm text-gray-600">Investment Range</div>
                        <div className="text-xs md:text-sm font-bold text-gray-900">${selectedPlan.minAmount.toLocaleString()} - ${selectedPlan.maxAmount === 100000 ? '∞' : selectedPlan.maxAmount.toLocaleString()}</div>
                      </div>
                    </div>

                    <div className="space-y-1.5 md:space-y-2">
                      {selectedPlan.features.map((feature, index) => (
                        <div key={index} className="flex items-center text-xs md:text-sm text-gray-700">
                          <Check className="w-3 h-3 md:w-4 md:h-4 text-green-500 mr-2 flex-shrink-0" />
                          <span className="truncate">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Investment Form */}
          {selectedPlan && (
            <div className="mb-6 md:mb-8">
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300">
                <div className="p-4 md:p-6">
                  <div className="flex items-center mb-4 md:mb-6">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-purple-100 to-indigo-100 border border-purple-200 mr-3">
                      <Zap size={18} className="md:w-5 md:h-5 text-purple-700" />
                    </div>
                    <div>
                      <h3 className="text-lg md:text-xl font-bold text-gray-900">Investment Details</h3>
                      <p className="text-gray-600 text-xs md:text-sm">Configure your investment</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:gap-6 mb-4 md:mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Investment Amount (USD)
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <DollarSign className="h-4 w-4 md:h-5 md:w-5 text-gray-400" />
                        </div>
                        <input
                          type="number"
                          value={investmentAmount}
                          onChange={(e) => handleAmountChange(e.target.value)}
                          className="block w-full pl-10 pr-3 py-3 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-base md:text-base"
                          placeholder="Enter amount"
                          min={selectedPlan.minAmount}
                          max={Math.min(selectedPlan.maxAmount, availableBalance)}
                          step="0.01"
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Min: ${selectedPlan.minAmount.toLocaleString()} | Max: ${Math.min(selectedPlan.maxAmount, availableBalance).toLocaleString()}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Investment Plan
                      </label>
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 md:p-4">
                        <h4 className="font-semibold text-gray-900 text-sm md:text-base">{selectedPlan.name}</h4>
                        <p className="text-xs md:text-sm text-gray-600">{selectedPlan.description}</p>
                      </div>
                    </div>
                  </div>

                  {/* Investment Summary */}
                  {investmentAmount && parseFloat(investmentAmount) > 0 && (
                    <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg p-4 md:p-6 mb-4 md:mb-6">
                      <h4 className="text-base md:text-lg font-semibold text-gray-900 mb-3 md:mb-4">Investment Summary</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                        <div className="bg-white rounded-lg p-3 md:p-4 border border-purple-200">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600 text-xs md:text-sm">Daily Earnings</span>
                            <span className="text-green-600 font-semibold text-sm md:text-base">
                              ${calculateDailyEarnings(parseFloat(investmentAmount), selectedPlan.dailyReturn).toFixed(2)}
                            </span>
                          </div>
                        </div>
                        <div className="bg-white rounded-lg p-3 md:p-4 border border-purple-200">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600 text-xs md:text-sm">Daily Return Rate</span>
                            <span className="text-purple-600 font-semibold text-sm md:text-base">
                              {selectedPlan.dailyReturn}%
                            </span>
                          </div>
                        </div>
                        <div className="bg-white rounded-lg p-3 md:p-4 border border-purple-200 sm:col-span-2 lg:col-span-1">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600 text-xs md:text-sm">Investment Range</span>
                            <span className="text-gray-900 font-semibold text-xs md:text-sm">${selectedPlan.minAmount.toLocaleString()} - ${selectedPlan.maxAmount === 100000 ? '∞' : selectedPlan.maxAmount.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Error/Success Messages */}
                  {errorMsg && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center">
                        <X className="w-5 h-5 text-red-500 mr-2" />
                        <span className="text-red-700 text-sm">{errorMsg}</span>
                      </div>
                    </div>
                  )}

                  {successMsg && (
                    <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center">
                        <Check className="w-5 h-5 text-green-500 mr-2" />
                        <span className="text-green-700 text-sm">{successMsg}</span>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={handleInvest}
                    disabled={
                      isInvesting || 
                      !investmentAmount || 
                      parseFloat(investmentAmount) <= 0 ||
                      (selectedPlan && parseFloat(investmentAmount) < selectedPlan.minAmount) ||
                      (selectedPlan && parseFloat(investmentAmount) > selectedPlan.maxAmount) ||
                      parseFloat(investmentAmount) > availableBalance
                    }
                    className="w-full py-3 md:py-3 px-4 md:px-6 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center text-sm md:text-base"
                  >
                    {isInvesting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Processing Investment...
                      </>
                    ) : (
                      <>
                        <TrendingUp className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                        Invest Now
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Investment Plans Summary Table */}
          <div className="mb-6 md:mb-8">
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300">
              <div className="p-4 md:p-6">
                <div className="flex items-center mb-4 md:mb-6">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-purple-100 to-indigo-100 border border-purple-200 mr-3">
                    <BarChart3 size={18} className="md:w-5 md:h-5 text-purple-700" />
                  </div>
                  <div>
                    <h3 className="text-base md:text-lg font-semibold text-gray-900">Investment Plans Comparison</h3>
                    <p className="text-gray-600 text-xs md:text-sm">Compare all available investment packages</p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-2 md:py-3 px-2 md:px-4 text-gray-700 font-semibold text-xs md:text-sm">Package</th>
                        <th className="text-center py-2 md:py-3 px-2 md:px-4 text-gray-700 font-semibold text-xs md:text-sm">Investment Range</th>
                        <th className="text-center py-2 md:py-3 px-2 md:px-4 text-gray-700 font-semibold text-xs md:text-sm">Daily Interest</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {investmentPlans.map((plan) => (
                        <tr key={plan.id} className="hover:bg-gray-50">
                          <td className="py-2 md:py-3 px-2 md:px-4">
                            <div className="flex items-center">
                              <div className={`w-2 h-2 md:w-3 md:h-3 rounded-full bg-gradient-to-r ${getPlanColor(plan.id)} mr-2 md:mr-3`}></div>
                              <div>
                                <div className="font-medium text-gray-900 text-xs md:text-sm">{plan.name}</div>
                                {plan.popular && (
                                  <span className="text-xs text-purple-600 font-medium">Most Popular</span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="py-2 md:py-3 px-2 md:px-4 text-center text-gray-900 text-xs md:text-sm">
                            ${plan.minAmount.toLocaleString()} - ${plan.maxAmount === 100000 ? '∞' : plan.maxAmount.toLocaleString()}
                          </td>
                          <td className="py-2 md:py-3 px-2 md:px-4 text-center">
                            <span className="text-green-600 font-semibold text-xs md:text-sm">{plan.dailyReturn}%</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-6 p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200">
                  <div className="flex items-center">
                    <Check className="w-5 h-5 text-green-600 mr-2" />
                    <span className="text-green-800 font-medium">Returns credited daily in USDT</span>
                  </div>
                  <div className="flex items-center mt-2">
                    <Check className="w-5 h-5 text-green-600 mr-2" />
                    <span className="text-green-800 font-medium">250% lifetime earning cap including referral bonuses</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Investment Information */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* How It Works */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300">
              <div className="p-6">
                <div className="flex items-center mb-6">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-purple-100 to-indigo-100 border border-purple-200 mr-3">
                    <Info size={20} className="text-purple-700" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">How It Works</h3>
                    <p className="text-gray-600 text-sm">Understanding the investment process</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-sm">1</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Choose Your Plan</h4>
                      <p className="text-sm text-gray-600">Select from our range of investment plans based on your goals and risk tolerance.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-sm">2</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Invest Your Funds</h4>
                      <p className="text-sm text-gray-600">Transfer funds from your deposit wallet to start earning daily returns.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-sm">3</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Earn Daily Returns</h4>
                      <p className="text-sm text-gray-600">Receive daily earnings based on your chosen plan's return rate.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-sm">4</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Withdraw or Reinvest</h4>
                      <p className="text-sm text-gray-600">Choose to withdraw your earnings or reinvest for compound growth.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Security & Benefits */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300">
              <div className="p-6">
                <div className="flex items-center mb-6">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-green-100 to-emerald-100 border border-green-200 mr-3">
                    <Shield size={20} className="text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Security & Benefits</h3>
                    <p className="text-gray-600 text-sm">Why invest with us</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="p-1 rounded-full bg-green-100">
                      <Check className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Secure Platform</h4>
                      <p className="text-sm text-gray-600">Advanced security measures protect your investments and personal data.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="p-1 rounded-full bg-green-100">
                      <Check className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Daily Returns</h4>
                      <p className="text-sm text-gray-600">Earn consistent daily returns based on your investment plan.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="p-1 rounded-full bg-green-100">
                      <Check className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Flexible Plans</h4>
                      <p className="text-sm text-gray-600">Choose from multiple investment plans with different risk levels.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="p-1 rounded-full bg-green-100">
                      <Check className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">24/7 Support</h4>
                      <p className="text-sm text-gray-600">Our support team is available around the clock to assist you.</p>
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
