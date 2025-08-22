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
    navigator.clipboard.writeText('goldenarrrow.capital/ref/johndoe');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-sp-bg relative overflow-hidden">
      {/* Enhanced Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full">
          {/* Subtle gradient orbs */}
          <div className="absolute w-[800px] h-[800px] rounded-full bg-gradient-to-br from-[#7C4DFF]/12 to-[#6C63FF]/8 blur-3xl -top-40 -left-40 animate-float"></div>
          <div className="absolute w-[600px] h-[600px] rounded-full bg-gradient-to-tl from-[#6C63FF]/10 to-[#7C4DFF]/6 blur-3xl -bottom-40 -right-40 animate-float" style={{animationDelay: '2s'}}></div>
          
          {/* Grid pattern overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
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
          {/* Welcome Section */}
          <div className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-[#7C4DFF]/10 to-[#6C63FF]/10 rounded-2xl"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-2xl"></div>
            <div className="relative bg-gradient-to-r from-[#7C4DFF]/15 to-[#6C63FF]/10 border border-[#7C4DFF]/30 rounded-2xl p-8 shadow-2xl shadow-black/40 backdrop-blur-sm">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
                <div className="mb-6 md:mb-0">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#7C4DFF]/30 to-[#6C63FF]/20 rounded-xl flex items-center justify-center border border-[#7C4DFF]/30">
                      <span className="text-[#9C6CFF] font-bold text-lg">{user?.firstName?.[0] || 'U'}</span>
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold text-gradient">
                        Welcome back, {user?.firstName || 'User'}
                      </h1>
                      <p className="text-slate-300 mt-1">Here&apos;s your portfolio overview for today</p>
                    </div>
                  </div>
                </div>
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#141922]/85 to-[#11151C]/85 backdrop-blur-xl rounded-xl border border-[#7C4DFF]/20"></div>
                  <div className="relative px-6 py-4">
                    <div className="text-right">
                      <p className="text-sm text-slate-300 font-medium">Portfolio Value</p>
                      <p className="text-3xl font-bold text-[#9C6CFF] mb-1">$847,250</p>
                      <div className="flex items-center justify-end text-green-400 text-sm font-medium">
                        <ArrowUp size={16} className="mr-1" />
                        +2.4% today
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Wallet Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Deposit Wallet */}
            <div className="group card card-hover">
              <div className="p-1">
                <div className="bg-gradient-to-br from-[#7C4DFF]/10 to-[#6C63FF]/5 p-6 rounded-lg relative overflow-hidden">
                  {/* Animated background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[#7C4DFF]/5 to-[#6C63FF]/3 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  <div className="relative flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center mb-4">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-[#7C4DFF]/30 to-[#6C63FF]/20 border border-[#7C4DFF]/30 mr-4 group-hover:scale-110 transition-transform duration-300">
                          <Wallet size={24} className="text-[#9C6CFF]" />
                        </div>
                        <div>
                          <h3 className="text-white text-xl font-semibold">Deposit Wallet</h3>
                          <p className="text-slate-400 text-sm">Available for investments</p>
                        </div>
                      </div>
                      <p className="text-4xl font-bold text-white mb-4">$452.19</p>
                      <Link href="/dashboard/deposit" className="inline-flex items-center px-6 py-3 text-slate-900 font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105" style={{background: 'linear-gradient(90deg,#7C4DFF,#6C63FF)'}}>
                        <ArrowUp size={18} className="mr-2" />
                        Deposit now
                      </Link>
                    </div>
                    <div className="p-3 rounded-full bg-[#7C4DFF]/10 group-hover:bg-[#7C4DFF]/20 transition-colors duration-300">
                      <div className="w-3 h-3 rounded-full bg-[#7C4DFF] animate-pulse"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Income Wallet */}
            <div className="group card card-hover">
              <div className="p-1">
                <div className="bg-gradient-to-br from-[#7C4DFF]/8 to-[#6C63FF]/8 p-6 rounded-lg relative overflow-hidden">
                  {/* Animated background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[#7C4DFF]/5 to-[#6C63FF]/3 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  <div className="relative flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center mb-4">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-[#7C4DFF]/30 to-[#6C63FF]/20 border border-[#7C4DFF]/30 mr-4 group-hover:scale-110 transition-transform duration-300">
                          <Wallet size={24} className="text-[#9C6CFF]" />
                        </div>
                        <div>
                          <h3 className="text-white text-xl font-semibold">Income Wallet</h3>
                          <p className="text-slate-400 text-sm">Earnings & rewards</p>
                        </div>
                      </div>
                      <p className="text-4xl font-bold text-white mb-4">$512.12</p>
                      <div className="flex flex-wrap gap-3">
                        <Link href="/dashboard/withdraw" className="inline-flex items-center px-6 py-3 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105" style={{background:'linear-gradient(90deg,#6C63FF,#9C6CFF)'}}>
                          <ArrowDownToLine size={18} className="mr-2" />
                          Withdraw
                        </Link>
                        <Link href="/dashboard/refund" className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-semibold rounded-xl hover:from-purple-400 hover:to-indigo-500 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105">
                          <RotateCcw size={18} className="mr-2" />
                          Request Refund
                        </Link>
                      </div>
                    </div>
                    <div className="p-3 rounded-full bg-[#6C63FF]/10 group-hover:bg-[#6C63FF]/20 transition-colors duration-300">
                      <div className="w-3 h-3 rounded-full bg-[#6C63FF] animate-pulse"></div>
                    </div>
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
                <div className="absolute inset-0 bg-gradient-to-br from-[#7C4DFF]/8 to-[#6C63FF]/6 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <div className="relative">
                  <div className="flex items-center mb-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-[#7C4DFF]/30 to-[#6C63FF]/20 border border-[#7C4DFF]/30 mr-4 group-hover:scale-110 transition-transform duration-300">
                      <DollarSign size={20} className="text-[#9C6CFF]" />
                    </div>
                    <h3 className="text-white text-lg font-semibold">Total Invested</h3>
                  </div>
                  <div className="flex items-end justify-between mb-4">
                    <p className="text-4xl font-bold text-white">$10,000.27</p>
                    <div className="flex items-center text-[#9C6CFF] text-sm font-medium bg-[#7C4DFF]/10 px-3 py-1 rounded-full">
                      <ArrowUp size={16} className="mr-1" />
                      <span>+4.2%</span>
                    </div>
                  </div>
                  <div className="w-full h-2 bg-[#1C2330] rounded-full overflow-hidden">
                    <div className="h-2 w-3/5 bg-gradient-to-r from-[#7C4DFF] to-[#6C63FF] rounded-full transition-all duration-500 group-hover:w-4/5"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Active Investment */}
            <div className="group card card-hover">
              <div className="p-6 relative overflow-hidden">
                {/* Animated background */}
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-600/3 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <div className="relative">
                  <div className="flex items-center mb-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-green-500/30 to-emerald-600/20 border border-green-400/30 mr-4 group-hover:scale-110 transition-transform duration-300">
                      <TrendingUp size={20} className="text-green-400" />
                    </div>
                    <h3 className="text-white text-lg font-semibold">Active Investment</h3>
                  </div>
                  <div className="flex items-end justify-between mb-4">
                    <p className="text-4xl font-bold text-white">$800.27</p>
                    <div className="flex items-center text-green-400 text-sm font-medium bg-green-400/10 px-3 py-1 rounded-full">
                      <ArrowUp size={16} className="mr-1" />
                      <span>+2.8%</span>
                    </div>
                  </div>
                  <div className="w-full h-2 bg-[#1C2330] rounded-full overflow-hidden">
                    <div className="h-2 w-2/5 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full transition-all duration-500 group-hover:w-3/5"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Expired Investment */}
            <div className="group card card-hover">
              <div className="p-6 relative overflow-hidden">
                {/* Animated background */}
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-600/3 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <div className="relative">
                  <div className="flex items-center mb-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500/30 to-orange-600/20 border border-amber-400/30 mr-4 group-hover:scale-110 transition-transform duration-300">
                      <Clock size={20} className="text-amber-400" />
                    </div>
                    <h3 className="text-white text-lg font-semibold">Expired Investment</h3>
                  </div>
                  <div className="flex items-end justify-between mb-4">
                    <p className="text-4xl font-bold text-white">$13,727.00</p>
                    <div className="flex items-center text-amber-400 text-sm font-medium bg-amber-400/10 px-3 py-1 rounded-full">
                      <Clock size={16} className="mr-1" />
                      <span>Matured</span>
                    </div>
                  </div>
                  <div className="w-full h-2 bg-[#1C2330] rounded-full overflow-hidden">
                    <div className="h-2 w-full bg-gradient-to-r from-amber-500 to-orange-600 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Business Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Direct Business */}
            <div className="group bg-gradient-to-br from-[#141922]/80 to-[#11151C]/80 backdrop-blur-sm border border-[#232B3A] rounded-xl shadow-lg shadow-black/30 overflow-hidden hover:border-[#2E6BFF]/40 transition-all duration-300">
              <div className="px-6 pt-6 pb-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="p-2.5 rounded-lg bg-gradient-to-br from-[#0EC7FF]/30 to-[#2E6BFF]/20 border border-[#0EC7FF]/30 mr-3 group-hover:scale-110 transition-transform duration-300">
                      <Users size={18} className="text-[#0EC7FF]" />
                    </div>
                    <h3 className="text-slate-300 text-lg font-medium">Direct Business</h3>
                  </div>
                  <span className="bg-[#0EC7FF]/10 text-[#37D7FF] text-xs px-3 py-1 rounded-full border border-[#0EC7FF]/20">Personal</span>
                </div>
                <div>
                  <p className="text-3xl font-bold text-white mb-3">$10,000.27</p>
                  <div className="flex flex-wrap gap-3 mb-3">
                    <span className="inline-flex items-center bg-[#171C26] border border-[#232B3A] rounded-full px-3 py-1 text-sm text-slate-300">
                      <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                      34 Members
                    </span>
                    <span className="inline-flex items-center bg-green-500/10 border border-green-500/20 rounded-full px-3 py-1 text-sm text-green-400">
                      <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                      28 Active
                    </span>
                    <span className="inline-flex items-center bg-red-500/10 border border-red-500/20 rounded-full px-3 py-1 text-sm text-red-400">
                      <span className="w-2 h-2 bg-red-400 rounded-full mr-2"></span>
                      6 De-active
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-[#1C2330] mt-4 rounded-full overflow-hidden">
                    <div className="h-1.5 w-4/5 bg-gradient-to-r from-[#0EC7FF] to-[#2E6BFF]"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Team Business */}
            <div className="group bg-gradient-to-br from-[#141922]/80 to-[#11151C]/80 backdrop-blur-sm border border-[#232B3A] rounded-xl shadow-lg shadow-black/30 overflow-hidden hover:border-[#2E6BFF]/30 transition-all duration-300">
              <div className="px-6 pt-6 pb-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="p-2.5 rounded-lg bg-gradient-to-br from-[#0EC7FF]/30 to-[#2E6BFF]/20 border border-[#0EC7FF]/30 mr-3 group-hover:scale-110 transition-transform duration-300">
                      <Users size={18} className="text-[#37D7FF]" />
                    </div>
                    <h3 className="text-slate-300 text-lg font-medium">Team Business</h3>
                  </div>
                  <span className="bg-[#2E6BFF]/10 text-[#4C82FF] text-xs px-3 py-1 rounded-full border border-[#2E6BFF]/20">Network</span>
                </div>
                <div>
                  <p className="text-3xl font-bold text-white mb-3">$1,000,000.27</p>
                  <div className="flex flex-wrap gap-3 mb-3">
                    <span className="inline-flex items-center bg-[#171C26] border border-[#232B3A] rounded-full px-3 py-1 text-sm text-slate-300">
                      <span className="w-2 h-2 bg-purple-400 rounded-full mr-2"></span>
                      201 Members
                    </span>
                    <span className="inline-flex items-center bg-green-500/10 border border-green-500/20 rounded-full px-3 py-1 text-sm text-green-400">
                      <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                      28 Active
                    </span>
                    <span className="inline-flex items-center bg-red-500/10 border border-red-500/20 rounded-full px-3 py-1 text-sm text-red-400">
                      <span className="w-2 h-2 bg-red-400 rounded-full mr-2"></span>
                      6 De-active
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-[#1C2330] mt-4 rounded-full overflow-hidden">
                    <div className="h-1.5 w-11/12 bg-gradient-to-r from-[#2E6BFF] to-[#4C82FF]"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Income Breakdowns */}
          <div className="relative">
            <div className="bg-gradient-to-br from-[#141922]/80 to-[#11151C]/80 backdrop-blur-sm border border-[#232B3A] rounded-xl shadow-lg shadow-black/30 p-6 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Referral Income */}
                <div className="group p-5 bg-gradient-to-br from-[#0EC7FF]/5 to-[#2E6BFF]/10 rounded-xl border border-[#0EC7FF]/20 hover:border-[#0EC7FF]/40 transition-all duration-300">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-slate-300 text-lg font-medium">Referral Income</h3>
                    <div className="p-2 rounded-full bg-[#0EC7FF]/10 group-hover:bg-[#0EC7FF]/20 transition-colors duration-300">
                      <Share size={18} className="text-[#0EC7FF]" />
                    </div>
                  </div>
                  <p className="text-2xl md:text-3xl font-bold text-white mb-2">$10,000.27</p>
                  <div className="flex items-center text-[#37D7FF] text-sm mt-2 bg-[#0EC7FF]/10 w-fit px-3 py-1 rounded-full">
                    <ArrowUp size={14} className="mr-1" />
                    <span>+12% this month</span>
                  </div>
                </div>

                {/* Rank Income */}
                <div className="group p-5 bg-gradient-to-br from-green-500/5 to-emerald-600/10 rounded-xl border border-green-500/20 hover:border-green-500/40 transition-all duration-300">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-slate-300 text-lg font-medium">Rank Income</h3>
                    <div className="p-2 rounded-full bg-green-400/10 group-hover:bg-green-400/20 transition-colors duration-300">
                      <Trophy size={18} className="text-green-400" />
                    </div>
                  </div>
                  <p className="text-2xl md:text-3xl font-bold text-white mb-2">$10,000.27</p>
                  <div className="flex items-center text-green-400 text-sm mt-2 bg-green-400/10 w-fit px-3 py-1 rounded-full">
                    <ArrowUp size={14} className="mr-1" />
                    <span>+8% this month</span>
                  </div>
                </div>

                {/* Daily Staking Income */}
                <div className="group p-5 bg-gradient-to-br from-[#0EC7FF]/5 to-[#2E6BFF]/10 rounded-xl border border-[#0EC7FF]/20 hover:border-[#0EC7FF]/40 transition-all duration-300">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-slate-300 text-lg font-medium">Daily Staking</h3>
                    <div className="p-2 rounded-full bg-[#0EC7FF]/10 group-hover:bg-[#0EC7FF]/20 transition-colors duration-300">
                      <Coins size={18} className="text-[#0EC7FF]" />
                    </div>
                  </div>
                  <p className="text-2xl md:text-3xl font-bold text-white mb-2">$820.27</p>
                  <div className="flex items-center text-blue-400 text-sm mt-2 bg-blue-400/10 w-fit px-3 py-1 rounded-full">
                    <ArrowUp size={14} className="mr-1" />
                    <span>Daily reward</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Rank Information */}
          <div className="grid grid-cols-1 gap-6">
            <div className="bg-gradient-to-br from-[#141922]/80 to-[#11151C]/80 backdrop-blur-sm border border-[#232B3A] rounded-xl shadow-lg shadow-black/30 overflow-hidden hover:border-[#2E6BFF]/30 transition-all duration-300">
              <div className="p-1">
                <div className="p-6 bg-gradient-to-br from-[#0EC7FF]/10 to-[#2E6BFF]/5 rounded-lg">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                      <div className="p-2.5 rounded-lg bg-gradient-to-br from-[#0EC7FF]/30 to-[#2E6BFF]/20 border border-[#0EC7FF]/30 mr-3">
                        <Trophy size={18} className="text-[#0EC7FF]" />
                      </div>
                      <h3 className="text-white text-lg font-medium">Rank Information</h3>
                    </div>
                    <div className="bg-[#0EC7FF]/10 text-[#37D7FF] text-xs px-3 py-1 rounded-full border border-[#0EC7FF]/20">
                      Member Status
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gradient-to-br from-[#141922]/60 to-[#11151C]/60 rounded-lg p-4 border border-[#0EC7FF]/10">
                      <h3 className="text-slate-400 text-sm mb-2">Current Rank</h3>
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-[#0EC7FF]/20 mr-3">
                          <span className="text-[#0EC7FF] font-bold text-xl">**</span>
                        </div>
                        <p className="text-lg font-bold text-[#37D7FF]">Gold</p>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-[#141922]/60 to-[#11151C]/60 rounded-lg p-4 border border-[#2E6BFF]/10">
                      <h3 className="text-slate-400 text-sm mb-2">Next Rank</h3>
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-[#2E6BFF]/20 mr-3">
                          <span className="text-[#4C82FF] font-bold text-xl">***</span>
                        </div>
                        <p className="text-lg font-bold text-[#4C82FF]">Platinum</p>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-[#141922]/60 to-[#11151C]/60 rounded-lg p-4 border border-[#232B3A]/80">
                      <h3 className="text-slate-400 text-sm mb-2">User ID</h3>
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-[#171C26] mr-3">
                          <User size={18} className="text-slate-300" />
                        </div>
                        <p className="text-lg font-bold text-slate-300">{user?.username || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Referral Link */}
          <div className="bg-gradient-to-br from-[#141922]/80 to-[#11151C]/80 backdrop-blur-sm border border-[#232B3A] rounded-xl shadow-lg shadow-black/30 overflow-hidden hover:border-[#2E6BFF]/30 transition-all duration-300">
            <div className="p-1">
              <div className="bg-gradient-to-br from-[#0EC7FF]/10 to-[#2E6BFF]/5 p-6 rounded-lg">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                  <div className="mb-6 md:mb-0">
                    <div className="flex items-center">
                        <div className="p-2.5 rounded-lg bg-gradient-to-br from-[#0EC7FF]/30 to-[#2E6BFF]/20 border border-[#0EC7FF]/30 mr-3">
                        <Award size={20} className="text-[#0EC7FF]" />
                      </div>
                      <h2 className="text-white text-lg font-bold">Elite Referral Program</h2>
                    </div>
                    <p className="text-slate-300 mt-3 ml-11">Earn exclusive rewards for introducing qualified investors</p>
                  </div>
                  
                  <div className="flex flex-wrap md:flex-nowrap gap-3 items-center w-full md:w-auto">
                    <div className="flex-grow bg-gradient-to-r from-[#171C26] to-[#11151C] rounded-lg px-4 py-3 border border-[#232B3A] overflow-hidden overflow-x-auto">
                      <span className="text-slate-300 font-mono">goldenarrrow.capital/ref/johndoe</span>
                    </div>
                    <button 
                      className="px-4 py-2.5 text-slate-900 font-medium rounded-lg transition-colors flex items-center whitespace-nowrap shadow-md"
                      style={{background:'linear-gradient(90deg,#0EC7FF,#2E6BFF)'}}
                      onClick={handleCopyReferralLink}
                    >
                      {copied ? <Check size={16} className="mr-2" /> : <Copy size={16} className="mr-2" />}
                      {copied ? "Copied!" : "Copy Link"}
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                  <div className="bg-gradient-to-br from-[#141922]/60 to-[#11151C]/60 rounded-lg p-4 border border-[#0EC7FF]/10 text-center">
                    <h3 className="text-slate-400 text-sm mb-1">Total Referrals</h3>
                    <p className="text-2xl font-bold text-[#37D7FF]">5</p>
                  </div>
                  <div className="bg-gradient-to-br from-[#141922]/60 to-[#11151C]/60 rounded-lg p-4 border border-green-500/10 text-center">
                    <h3 className="text-slate-400 text-sm mb-1">Total Earnings</h3>
                    <p className="text-2xl font-bold text-green-400">$12,500</p>
                  </div>
                  <div className="bg-gradient-to-br from-[#141922]/60 to-[#11151C]/60 rounded-lg p-4 border border-[#0EC7FF]/10 text-center">
                    <h3 className="text-slate-400 text-sm mb-1">Pending Rewards</h3>
                    <p className="text-2xl font-bold text-[#0EC7FF]">$450</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Referral Commission Structure */}
          <div className="bg-gradient-to-br from-[#141922]/85 to-[#11151C]/85 backdrop-blur-xl border border-[#232B3A] rounded-2xl shadow-2xl shadow-black/50 overflow-hidden">
            <div className="p-8">
              {/* Header Section */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
                <div className="flex items-center mb-4 md:mb-0">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-[#0EC7FF] to-[#2E6BFF] rounded-xl blur-sm opacity-75"></div>
                    <div className="relative p-3 rounded-xl bg-gradient-to-br from-[#0EC7FF]/30 to-[#2E6BFF]/20 border border-[#0EC7FF]/40">
                      <Users size={20} className="text-[#0EC7FF]" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h2 className="text-white text-xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                      Referral Commission Structure
                    </h2>
                    <p className="text-slate-400 text-sm mt-1">Multi-tier earning opportunities</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="px-4 py-2 bg-gradient-to-r from-[#0EC7FF]/20 to-[#2E6BFF]/20 text-[#37D7FF] rounded-full text-sm font-medium border border-[#0EC7FF]/30 shadow-lg">
                    <span className="inline-block w-2 h-2 bg-[#0EC7FF] rounded-full mr-2 animate-pulse"></span>
                    Active Program
                  </span>
                </div>
              </div>
              
              {/* Responsive Table (md+) and Cards (mobile) */}
              <div className="relative rounded-xl border border-[#232B3A] bg-gradient-to-br from-[#0E1116]/60 to-[#11151C]/60 backdrop-blur-sm">
                <div className="p-2">
                  <table className="hidden md:table w-full table-fixed">
                    <thead>
                      <tr className="bg-[#11151C] border-b border-[#232B3A]">
                        <th className="text-left py-3 px-4 text-slate-300 font-semibold text-xs uppercase tracking-wider w-2/5">
                          <div className="flex items-center space-x-2">
                            <Trophy size={14} className="text-[#0EC7FF]" />
                            <span>Level</span>
                          </div>
                        </th>
                        <th className="text-center py-3 px-4 text-slate-300 font-semibold text-xs uppercase tracking-wider w-1/5">Status</th>
                        <th className="text-center py-3 px-4 text-slate-300 font-semibold text-xs uppercase tracking-wider w-1/5">Members</th>
                        <th className="text-center py-3 px-4 text-slate-300 font-semibold text-xs uppercase tracking-wider w-1/5">Commission</th>
                        <th className="text-center py-3 px-4 text-slate-300 font-semibold text-xs uppercase tracking-wider w-1/5">VIP</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#232B3A] text-sm">
                      {commissionData.map(row => (
                        <tr key={row.key} className="hover:bg-slate-800/40">
                          <td className="py-3 px-4 text-slate-200">
                            {row.title}
                        </td>
                          <td className="py-3 px-4 text-center">
                            {row.status === 'active' && (
                              <Check size={16} className="inline text-green-400" />
                            )}
                            {row.status === 'inactive' && (
                              <X size={16} className="inline text-red-400" />
                            )}
                            {row.status === 'locked' && (
                              <span className="inline-block w-3 h-3 rounded bg-slate-500/70 align-middle"></span>
                            )}
                        </td>
                          <td className="py-3 px-4 text-center text-slate-200">{row.members}</td>
                          <td className="py-3 px-4 text-center font-semibold text-slate-200">{row.commission}</td>
                          <td className="py-3 px-4 text-center">
                            {row.vip === 'active' && (
                              <Check size={16} className="inline text-green-400" />
                            )}
                            {row.vip === 'inactive' && (
                              <X size={16} className="inline text-red-400" />
                            )}
                            {row.vip === 'locked' && (
                              <span className="inline-block w-3 h-3 rounded bg-slate-500/70 align-middle"></span>
                            )}
                        </td>
                      </tr>
                      ))}
                    </tbody>
                  </table>

                  <div className="md:hidden space-y-3">
                    {commissionData.map(row => (
                      <div key={row.key} className="rounded-lg border border-[#232B3A] bg-[#141922]/60 p-3">
                        <div className="flex items-center justify-between">
                          <div className="text-slate-200 font-semibold text-sm">{row.title}</div>
                          <div>
                            {row.status === 'active' && <Check size={16} className="text-green-400" />}
                            {row.status === 'inactive' && <X size={16} className="text-red-400" />}
                            {row.status === 'locked' && <span className="inline-block w-3 h-3 rounded bg-slate-500/70"></span>}
                          </div>
                              </div>
                        <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                          <div className="bg-[#0E1116]/60 border border-[#232B3A] rounded px-2 py-1">
                            <div className="text-slate-400">Members</div>
                            <div className="text-slate-200 font-medium">{row.members}</div>
                          </div>
                          <div className="bg-[#0E1116]/60 border border-[#232B3A] rounded px-2 py-1">
                            <div className="text-slate-400">Commission</div>
                            <div className="text-slate-200 font-semibold">{row.commission}</div>
                          </div>
                          <div className="bg-[#0E1116]/60 border border-[#232B3A] rounded px-2 py-1 col-span-2">
                            <div className="text-slate-400">VIP</div>
                            <div className="mt-1">
                              {row.vip === 'active' && <Check size={16} className="text-green-400" />}
                              {row.vip === 'inactive' && <X size={16} className="text-red-400" />}
                              {row.vip === 'locked' && <span className="inline-block w-3 h-3 rounded bg-slate-500/70"></span>}
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
