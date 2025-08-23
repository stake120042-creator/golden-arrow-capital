'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import { useAuth } from '@/contexts/AuthContext';
import apiClient from '@/services/apiClient';
import { 
  ArrowLeft,
  TrendingUp,
  Clock,
  DollarSign,
  CheckCircle,
  XCircle,
  Calendar,
  Percent,
  Package,
  Activity,
  BarChart3,
  RefreshCw
} from 'lucide-react';

interface Investment {
  id: number;
  userid: string;
  package_id: number;
  amount: number;
  isactive: boolean;
  created_at: string;
  package: {
    id: number;
    interest: number;
    created_at: string;
  };
}

const packageNames = {
  1: 'Basic Package',
  2: 'Silver Package',
  3: 'Gold Package',
  4: 'Platinum Package'
};

const packageColors = {
  1: 'from-blue-500 to-blue-600',
  2: 'from-gray-400 to-gray-500',
  3: 'from-yellow-500 to-yellow-600',
  4: 'from-purple-500 to-purple-600'
};

export default function InvestmentsPage() {
  const { logout, user } = useAuth();
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchInvestments();
  }, [user]);

  const fetchInvestments = async () => {
    if (!user) return;
    
    setIsLoading(true);
    setErrorMsg('');
    try {
      const response = await apiClient.investment.getUserInvestments();
      if (response.success) {
        setInvestments(response.data);
      } else {
        setErrorMsg(response.message || 'Failed to fetch investments');
      }
    } catch (error) {
      console.error('Error fetching investments:', error);
      setErrorMsg('Failed to load your investments.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchInvestments();
    setIsRefreshing(false);
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateDailyEarnings = (amount: number, interestRate: number): number => {
    return (amount * interestRate) / 100;
  };

  const getTotalActiveInvestment = (): number => {
    return investments
      .filter(inv => inv.isactive)
      .reduce((sum, inv) => sum + Number(inv.amount), 0);
  };

  const getTotalInvestment = (): number => {
    return investments.reduce((sum, inv) => sum + Number(inv.amount), 0);
  };

  const getActiveInvestmentsCount = (): number => {
    return investments.filter(inv => inv.isactive).length;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-purple-700 font-semibold">Loading your investments...</p>
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
          currentPage="investments"
        />
        
        {/* Investments Content */}
        <div className="pt-24 px-4 md:px-6 pb-12 max-w-7xl mx-auto">
          {/* Back Button and Refresh */}
          <div className="mb-6 md:mb-8">
            <div className="flex items-center justify-between mb-4">
              <Link 
                href="/dashboard"
                className="inline-flex items-center text-purple-600 hover:text-purple-700 transition-colors text-sm md:text-base"
              >
                <ArrowLeft className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                Back to Dashboard
              </Link>
              
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="p-2 rounded-lg bg-white border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all duration-300"
              >
                <RefreshCw className={`w-4 h-4 md:w-5 md:h-5 text-gray-600 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Investment Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Total Invested</p>
                    <p className="text-2xl font-bold text-gray-900">${getTotalInvestment().toFixed(2)}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 border border-blue-200">
                    <DollarSign size={24} className="text-blue-600" />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Active Investment</p>
                    <p className="text-2xl font-bold text-gray-900">${getTotalActiveInvestment().toFixed(2)}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-gradient-to-br from-green-100 to-emerald-100 border border-green-200">
                    <Activity size={24} className="text-green-600" />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Active Plans</p>
                    <p className="text-2xl font-bold text-gray-900">{getActiveInvestmentsCount()}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-gradient-to-br from-purple-100 to-indigo-100 border border-purple-200">
                    <Package size={24} className="text-purple-600" />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Total Plans</p>
                    <p className="text-2xl font-bold text-gray-900">{investments.length}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-gradient-to-br from-orange-100 to-red-100 border border-orange-200">
                    <BarChart3 size={24} className="text-orange-600" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <XCircle className="w-5 h-5 text-red-500 mr-2" />
                <span className="text-red-700 text-sm">{errorMsg}</span>
              </div>
            </div>
          )}

          {/* Investments List */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-purple-100 to-indigo-100 border border-purple-200 mr-3">
                    <Package size={20} className="text-purple-700" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Investment History</h3>
                    <p className="text-gray-600 text-sm">All your investment records</p>
                  </div>
                </div>
              </div>

              {investments.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Package className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No investments yet</h3>
                  <p className="text-gray-600 mb-6">Start your investment journey by choosing a package</p>
                  <Link
                    href="/dashboard/invest"
                    className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-300"
                  >
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Start Investing
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {investments.map((investment) => (
                    <div
                      key={investment.id}
                      className="border border-gray-200 rounded-lg p-6 hover:border-purple-300 hover:bg-purple-50/30 transition-all duration-300"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                          <div className={`w-4 h-4 rounded-full bg-gradient-to-r ${packageColors[investment.package_id as keyof typeof packageColors]} mr-3`}></div>
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              {packageNames[investment.package_id as keyof typeof packageNames]}
                            </h4>
                            <p className="text-sm text-gray-600">Package ID: {investment.package_id}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {investment.isactive ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              <XCircle className="w-3 h-3 mr-1" />
                              Inactive
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="bg-white rounded-lg p-3 border border-gray-200">
                          <div className="text-sm text-gray-600">Investment Amount</div>
                          <div className="text-lg font-bold text-gray-900">${Number(investment.amount).toFixed(2)}</div>
                        </div>
                        <div className="bg-white rounded-lg p-3 border border-gray-200">
                          <div className="text-sm text-gray-600">Daily Interest Rate</div>
                          <div className="text-lg font-bold text-green-600">{investment.package.interest}%</div>
                        </div>
                        <div className="bg-white rounded-lg p-3 border border-gray-200">
                          <div className="text-sm text-gray-600">Daily Earnings</div>
                          <div className="text-lg font-bold text-purple-600">
                            ${calculateDailyEarnings(Number(investment.amount), investment.package.interest).toFixed(2)}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          <span>Invested on {formatDate(investment.created_at)}</span>
                        </div>
                        <div className="flex items-center">
                          <Percent className="w-4 h-4 mr-1" />
                          <span>Interest: {investment.package.interest}% daily</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-8">
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="flex flex-wrap gap-4">
                  <Link
                    href="/dashboard/invest"
                    className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-300"
                  >
                    <TrendingUp className="w-4 h-4 mr-2" />
                    New Investment
                  </Link>
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-all duration-300"
                  >
                    <BarChart3 className="w-4 h-4 mr-2" />
                    View Dashboard
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
