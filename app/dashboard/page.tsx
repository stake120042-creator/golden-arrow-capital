'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import { useAuth } from '@/contexts/AuthContext';
import { 
  ArrowUp,
  ArrowDownToLine,
  DollarSign,
  Wallet,
  Users,
  User,
  Award,
  Share,
  TrendingUp,
  Clock,
  Copy,
  Check,
  Coins,
  Trophy,
  X,
  RotateCcw
} from 'lucide-react';

export default function Dashboard() {
  const { logout, user } = useAuth();
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [copied, setCopied] = useState(false);
  const commissionData = [
    {
      key: 'L1',
      title: 'Level 1',
      members: '20',
      commission: '20%',
      status: 'active',
      vip: 'active'
    },
    {
      key: 'L2',
      title: 'Level 2',
      members: '34',
      commission: '10%',
      status: 'inactive',
      vip: 'inactive'
    },
    {
      key: 'L3',
      title: 'Level 3',
      members: '45',
      commission: '5%',
      status: 'locked',
      vip: 'active'
    },
    {
      key: '4-8',
      title: 'Levels 4-8',
      members: '-',
      commission: '4%',
      status: 'locked',
      vip: 'locked'
    },
    {
      key: '9-13',
      title: 'Levels 9-13',
      members: '-',
      commission: '3%',
      status: 'locked',
      vip: 'locked'
    },
    {
      key: '14-20',
      title: 'Levels 14-20',
      members: '-',
      commission: '2%',
      status: 'locked',
      vip: 'locked'
    },
    {
      key: '21-25',
      title: 'Levels 21-25',
      members: '-',
      commission: '1%',
      status: 'locked',
      vip: 'locked'
    }
  ] as const;

  const handleToggleSidebar = () => {
    console.log('🔍 Toggle sidebar clicked, current state:', showMobileSidebar);
    setShowMobileSidebar(!showMobileSidebar);
    console.log('🔍 New sidebar state:', !showMobileSidebar);
  };

  const handleCloseSidebar = () => {
    console.log('🔍 Close sidebar called');
    setShowMobileSidebar(false);
  };

  const handleLogout = () => {
    console.log('🔍 Logout button clicked');
    logout();
  };

  const handleCopyReferralLink = () => {
    const referralLink = `goldenarrowcapital.com/ref/${user?.username || 'user'}`;
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
        />
        
        {/* Dashboard Content */}
        <div className="pt-24 px-4 md:px-6 pb-12 space-y-8 max-w-7xl mx-auto">
          {/* Referral Link */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
            <div className="p-6">
              <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-6 rounded-lg">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                  <div className="mb-6 md:mb-0">
                    <div className="flex items-center">
                        <div className="p-2.5 rounded-lg bg-gradient-to-br from-purple-100 to-indigo-100 border border-purple-200 mr-3">
                        <Award size={20} className="text-purple-700" />
                      </div>
                      <h2 className="text-gray-900 text-lg font-bold">Referral Link</h2>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap md:flex-nowrap gap-3 items-center w-full md:w-auto">
                    <div className="flex-grow bg-white rounded-lg px-4 py-3 border border-gray-200 overflow-hidden overflow-x-auto">
                      <span className="text-gray-700 font-mono">goldenarrowcapital.com/ref/{user?.username || 'user'}</span>
                    </div>
                    <button 
                      className="px-4 py-2.5 text-white font-medium rounded-lg transition-colors flex items-center whitespace-nowrap shadow-md"
                      style={{background:'linear-gradient(90deg,#8b5cf6,#7c3aed)'}}
                      onClick={handleCopyReferralLink}
                    >
                      {copied ? <Check size={16} className="mr-2" /> : <Copy size={16} className="mr-2" />}
                      {copied ? "Copied!" : "Copy Link"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Wallet Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Deposit Wallet */}
            <div className="group card card-hover">
              <div className="p-6 relative overflow-hidden">
                {/* Animated background */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-indigo-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <div className="relative flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center mb-4">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-purple-100 to-indigo-100 border border-purple-200 mr-4 group-hover:scale-110 transition-transform duration-300">
                        <Wallet size={24} className="text-purple-700" />
                      </div>
                      <div>
                        <h3 className="text-gray-900 text-xl font-semibold">Deposit Wallet</h3>
                        <p className="text-gray-600 text-sm">Available for investments</p>
                      </div>
                    </div>
                    <p className="text-4xl font-bold text-gray-900 mb-4">$452.19</p>
                    <Link href="/dashboard/deposit" className="inline-flex items-center px-6 py-3 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105" style={{background: 'linear-gradient(90deg,#8b5cf6,#7c3aed)'}}>
                      <ArrowUp size={18} className="mr-2" />
                      Deposit now
                    </Link>
                  </div>
                  <div className="p-3 rounded-full bg-purple-100 group-hover:bg-purple-200 transition-colors duration-300">
                    <div className="w-3 h-3 rounded-full bg-purple-600 animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Income Wallet */}
            <div className="group card card-hover">
              <div className="p-6 relative overflow-hidden">
                {/* Animated background */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-purple-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <div className="relative flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center mb-4">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 border border-indigo-200 mr-4 group-hover:scale-110 transition-transform duration-300">
                        <Wallet size={24} className="text-indigo-700" />
                      </div>
                      <div>
                        <h3 className="text-gray-900 text-xl font-semibold">Income Wallet</h3>
                        <p className="text-gray-600 text-sm">Earnings & rewards</p>
                      </div>
                    </div>
                    <p className="text-4xl font-bold text-gray-900 mb-4">$512.12</p>
                    <div className="flex flex-wrap gap-3">
                      <Link href="/dashboard/withdraw" className="inline-flex items-center px-6 py-3 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105" style={{background:'linear-gradient(90deg,#7c3aed,#8b5cf6)'}}>
                        <ArrowDownToLine size={18} className="mr-2" />
                        Withdraw
                      </Link>
                      <Link href="/dashboard/refund" className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-semibold rounded-xl hover:from-purple-400 hover:to-indigo-500 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105">
                        <RotateCcw size={18} className="mr-2" />
                        Request Refund
                      </Link>
                    </div>
                  </div>
                  <div className="p-3 rounded-full bg-indigo-100 group-hover:bg-indigo-200 transition-colors duration-300">
                    <div className="w-3 h-3 rounded-full bg-indigo-600 animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Investment Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Total Invested */}
            <div className="group card card-hover">
              <div className="p-6 relative overflow-hidden">
                {/* Animated background */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-indigo-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <div className="relative">
                  <div className="flex items-center mb-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-purple-100 to-indigo-100 border border-purple-200 mr-4 group-hover:scale-110 transition-transform duration-300">
                      <DollarSign size={20} className="text-purple-700" />
                    </div>
                    <h3 className="text-gray-900 text-lg font-semibold">Total Invested</h3>
                  </div>
                  <div className="flex items-end justify-between mb-4">
                    <p className="text-4xl font-bold text-gray-900">$10,000.27</p>
                    <div className="flex items-center text-green-600 text-sm font-medium bg-green-100 px-3 py-1 rounded-full">
                      <ArrowUp size={16} className="mr-1" />
                      <span>+4.2%</span>
                    </div>
                  </div>

                </div>
              </div>
            </div>

            {/* Active Investment */}
            <div className="group card card-hover">
              <div className="p-6 relative overflow-hidden">
                {/* Animated background */}
                <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-emerald-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <div className="relative">
                  <div className="flex items-center mb-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-green-100 to-emerald-100 border border-green-200 mr-4 group-hover:scale-110 transition-transform duration-300">
                      <TrendingUp size={20} className="text-green-600" />
                    </div>
                    <h3 className="text-gray-900 text-lg font-semibold">Active Investment</h3>
                  </div>
                  <div className="flex items-end justify-between mb-4">
                    <p className="text-4xl font-bold text-gray-900">$800.27</p>
                    <div className="flex items-center text-green-600 text-sm font-medium bg-green-100 px-3 py-1 rounded-full">
                      <ArrowUp size={16} className="mr-1" />
                      <span>+2.8%</span>
                    </div>
                  </div>

                </div>
              </div>
            </div>

            {/* Expired Investment */}
            <div className="group card card-hover">
              <div className="p-6 relative overflow-hidden">
                {/* Animated background */}
                <div className="absolute inset-0 bg-gradient-to-br from-amber-50 to-orange-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <div className="relative">
                  <div className="flex items-center mb-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 border border-amber-200 mr-4 group-hover:scale-110 transition-transform duration-300">
                      <Clock size={20} className="text-amber-600" />
                    </div>
                    <h3 className="text-gray-900 text-lg font-semibold">Expired Investment</h3>
                  </div>
                  <div className="flex items-end justify-between mb-4">
                    <p className="text-4xl font-bold text-gray-900">$13,727.00</p>
                    <div className="flex items-center text-amber-600 text-sm font-medium bg-amber-100 px-3 py-1 rounded-full">
                      <Clock size={16} className="mr-1" />
                      <span>Matured</span>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>

          {/* Business Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Direct Business */}
            <div className="group bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300">
              <div className="px-6 pt-6 pb-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="p-2.5 rounded-lg bg-gradient-to-br from-purple-100 to-indigo-100 border border-purple-200 mr-3 group-hover:scale-110 transition-transform duration-300">
                      <Users size={18} className="text-purple-700" />
                    </div>
                    <h3 className="text-gray-900 text-lg font-medium">Direct Business</h3>
                  </div>
                  <span className="bg-purple-100 text-purple-700 text-xs px-3 py-1 rounded-full border border-purple-200">Personal</span>
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900 mb-3">$10,000.27</p>
                  <div className="flex flex-wrap gap-3 mb-3">
                    <span className="inline-flex items-center bg-gray-50 border border-gray-200 rounded-full px-3 py-1 text-sm text-gray-700">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                      34 Members
                    </span>
                    <span className="inline-flex items-center bg-green-100 border border-green-200 rounded-full px-3 py-1 text-sm text-green-700">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                      28 Active
                    </span>
                    <span className="inline-flex items-center bg-red-100 border border-red-200 rounded-full px-3 py-1 text-sm text-red-700">
                      <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                      6 De-active
                    </span>
                  </div>

                </div>
              </div>
            </div>

            {/* Team Business */}
            <div className="group bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300">
              <div className="px-6 pt-6 pb-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="p-2.5 rounded-lg bg-gradient-to-br from-indigo-100 to-purple-100 border border-indigo-200 mr-3 group-hover:scale-110 transition-transform duration-300">
                      <Users size={18} className="text-indigo-700" />
                    </div>
                    <h3 className="text-gray-900 text-lg font-medium">Team Business</h3>
                  </div>
                  <span className="bg-indigo-100 text-indigo-700 text-xs px-3 py-1 rounded-full border border-indigo-200">Network</span>
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900 mb-3">$1,000,000.27</p>
                  <div className="flex flex-wrap gap-3 mb-3">
                    <span className="inline-flex items-center bg-gray-50 border border-gray-200 rounded-full px-3 py-1 text-sm text-gray-700">
                      <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                      201 Members
                    </span>
                    <span className="inline-flex items-center bg-green-100 border border-green-200 rounded-full px-3 py-1 text-sm text-green-700">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                      28 Active
                    </span>
                    <span className="inline-flex items-center bg-red-100 border border-red-200 rounded-full px-3 py-1 text-sm text-red-700">
                      <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                      6 De-active
                    </span>
                  </div>

                </div>
              </div>
            </div>
          </div>

          {/* Income Breakdowns */}
          <div className="relative">
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Referral Income */}
                <div className="group p-5 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl border border-purple-200 hover:border-purple-300 transition-all duration-300">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-gray-900 text-lg font-medium">Referral Income</h3>
                    <div className="p-2 rounded-full bg-purple-100 group-hover:bg-purple-200 transition-colors duration-300">
                      <Share size={18} className="text-purple-700" />
                    </div>
                  </div>
                  <p className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">$10,000.27</p>
                  <div className="flex items-center text-green-600 text-sm mt-2 bg-green-100 w-fit px-3 py-1 rounded-full">
                    <ArrowUp size={14} className="mr-1" />
                    <span>+12% this month</span>
                  </div>
                </div>

                {/* Rank Income */}
                <div className="group p-5 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200 hover:border-green-300 transition-all duration-300">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-gray-900 text-lg font-medium">Rank Income</h3>
                    <div className="p-2 rounded-full bg-green-100 group-hover:bg-green-200 transition-colors duration-300">
                      <Trophy size={18} className="text-green-600" />
                    </div>
                  </div>
                  <p className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">$10,000.27</p>
                  <div className="flex items-center text-green-600 text-sm mt-2 bg-green-100 w-fit px-3 py-1 rounded-full">
                    <ArrowUp size={14} className="mr-1" />
                    <span>+8% this month</span>
                  </div>
                </div>

                {/* Daily Staking Income */}
                <div className="group p-5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 hover:border-blue-300 transition-all duration-300">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-gray-900 text-lg font-medium">Daily Staking</h3>
                    <div className="p-2 rounded-full bg-blue-100 group-hover:bg-blue-200 transition-colors duration-300">
                      <Coins size={18} className="text-blue-600" />
                    </div>
                  </div>
                  <p className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">$820.27</p>
                  <div className="flex items-center text-blue-600 text-sm mt-2 bg-blue-100 w-fit px-3 py-1 rounded-full">
                    <ArrowUp size={14} className="mr-1" />
                    <span>Daily reward</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Rank Information */}
          <div className="grid grid-cols-1 gap-6">
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300">
              <div className="p-6">
                <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-6 rounded-lg">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                      <div className="p-2.5 rounded-lg bg-gradient-to-br from-purple-100 to-indigo-100 border border-purple-200 mr-3">
                        <Trophy size={18} className="text-purple-700" />
                      </div>
                      <h3 className="text-gray-900 text-lg font-medium">Rank Information</h3>
                    </div>
                    <div className="bg-purple-100 text-purple-700 text-xs px-3 py-1 rounded-full border border-purple-200">
                      Member Status
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-lg p-4 border border-purple-200">
                      <h3 className="text-gray-600 text-sm mb-2">Current Rank</h3>
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-purple-100 mr-3">
                          <span className="text-purple-700 font-bold text-xl">**</span>
                        </div>
                        <p className="text-lg font-bold text-purple-700">Gold</p>
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-lg p-4 border border-indigo-200">
                      <h3 className="text-gray-600 text-sm mb-2">Next Rank</h3>
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-indigo-100 mr-3">
                          <span className="text-indigo-700 font-bold text-xl">***</span>
                        </div>
                        <p className="text-lg font-bold text-indigo-700">Platinum</p>
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <h3 className="text-gray-600 text-sm mb-2">User ID</h3>
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-gray-100 mr-3">
                          <User size={18} className="text-gray-600" />
                        </div>
                        <p className="text-lg font-bold text-gray-900">{user?.username || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Referral Commission Structure */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-8">
              {/* Header Section */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
                <div className="flex items-center mb-4 md:mb-0">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl blur-sm opacity-75"></div>
                    <div className="relative p-3 rounded-xl bg-gradient-to-br from-purple-100 to-indigo-100 border border-purple-200">
                      <Users size={20} className="text-purple-700" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h2 className="text-gray-900 text-xl font-bold">
                      Referral Commission Structure
                    </h2>
                    <p className="text-gray-600 text-sm mt-1">Multi-tier earning opportunities</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-medium border border-purple-200 shadow-sm">
                    <span className="inline-block w-2 h-2 bg-purple-600 rounded-full mr-2 animate-pulse"></span>
                    Active Program
                  </span>
                </div>
              </div>
              
              {/* Responsive Table (md+) and Cards (mobile) */}
              <div className="relative rounded-xl border border-gray-200 bg-gray-50">
                <div className="p-2">
                  <table className="hidden md:table w-full table-fixed">
                    <thead>
                      <tr className="bg-white border-b border-gray-200">
                        <th className="text-left py-3 px-4 text-gray-700 font-semibold text-xs uppercase tracking-wider w-2/5">
                          <div className="flex items-center space-x-2">
                            <Trophy size={14} className="text-purple-600" />
                            <span>Level</span>
                          </div>
                        </th>
                        <th className="text-center py-3 px-4 text-gray-700 font-semibold text-xs uppercase tracking-wider w-1/5">Status</th>
                        <th className="text-center py-3 px-4 text-gray-700 font-semibold text-xs uppercase tracking-wider w-1/5">Members</th>
                        <th className="text-center py-3 px-4 text-gray-700 font-semibold text-xs uppercase tracking-wider w-1/5">Commission</th>
                        <th className="text-center py-3 px-4 text-gray-700 font-semibold text-xs uppercase tracking-wider w-1/5">VIP</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 text-sm">
                      {commissionData.map(row => (
                        <tr key={row.key} className="hover:bg-gray-50">
                          <td className="py-3 px-4 text-gray-900">
                            {row.title}
                        </td>
                          <td className="py-3 px-4 text-center">
                            {row.status === 'active' && (
                              <Check size={16} className="inline text-green-600" />
                            )}
                            {row.status === 'inactive' && (
                              <X size={16} className="inline text-red-600" />
                            )}
                            {row.status === 'locked' && (
                              <span className="inline-block w-3 h-3 rounded bg-gray-400 align-middle"></span>
                            )}
                        </td>
                          <td className="py-3 px-4 text-center text-gray-900">{row.members}</td>
                          <td className="py-3 px-4 text-center font-semibold text-gray-900">{row.commission}</td>
                          <td className="py-3 px-4 text-center">
                            {row.vip === 'active' && (
                              <Check size={16} className="inline text-green-600" />
                            )}
                            {row.vip === 'inactive' && (
                              <X size={16} className="inline text-red-600" />
                            )}
                            {row.vip === 'locked' && (
                              <span className="inline-block w-3 h-3 rounded bg-gray-400 align-middle"></span>
                            )}
                        </td>
                      </tr>
                      ))}
                    </tbody>
                  </table>

                  <div className="md:hidden space-y-3">
                    {commissionData.map(row => (
                      <div key={row.key} className="rounded-lg border border-gray-200 bg-white p-3">
                        <div className="flex items-center justify-between">
                          <div className="text-gray-900 font-semibold text-sm">{row.title}</div>
                          <div>
                            {row.status === 'active' && <Check size={16} className="text-green-600" />}
                            {row.status === 'inactive' && <X size={16} className="text-red-600" />}
                            {row.status === 'locked' && <span className="inline-block w-3 h-3 rounded bg-gray-400"></span>}
                          </div>
                              </div>
                        <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                          <div className="bg-gray-50 border border-gray-200 rounded px-2 py-1">
                            <div className="text-gray-600">Members</div>
                            <div className="text-gray-900 font-medium">{row.members}</div>
                          </div>
                          <div className="bg-gray-50 border border-gray-200 rounded px-2 py-1">
                            <div className="text-gray-600">Commission</div>
                            <div className="text-gray-900 font-semibold">{row.commission}</div>
                          </div>
                          <div className="bg-gray-50 border border-gray-200 rounded px-2 py-1 col-span-2">
                            <div className="text-gray-600">VIP</div>
                            <div className="mt-1">
                              {row.vip === 'active' && <Check size={16} className="text-green-600" />}
                              {row.vip === 'inactive' && <X size={16} className="text-red-600" />}
                              {row.vip === 'locked' && <span className="inline-block w-3 h-3 rounded bg-gray-400"></span>}
                            </div>
                        </div>
              </div>
                      </div>
                    ))}
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
