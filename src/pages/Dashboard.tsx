import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import { useAuth } from '../contexts/AuthContext';
import { 
  ArrowUp,
  ArrowDown,
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
  Trophy
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const { logout } = useAuth();
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyReferralLink = () => {
    navigator.clipboard.writeText('goldenarrrow.capital/ref/johndoe');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Sidebar */}
              <Sidebar onLogout={logout} />
      
      {/* Main Content */}
      <div className="ml-0 lg:ml-64 min-h-screen">
        {/* Header */}
        <TopBar 
          onLogout={logout} 
          toggleSidebar={() => setShowMobileSidebar(!showMobileSidebar)} 
        />
        
        {/* Dashboard Content */}
        <div className="pt-24 px-4 md:px-6 pb-12 space-y-8 max-w-7xl mx-auto">
          {/* Welcome Section */}
          <div className="bg-gradient-to-r from-yellow-500/20 to-amber-600/20 border border-yellow-500/30 rounded-2xl p-6 shadow-lg shadow-amber-900/10">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
              <div className="mb-4 md:mb-0">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-300 to-amber-300 bg-clip-text text-transparent">
                  Welcome back, John
                </h1>
                <p className="text-slate-300 mt-1">Here's your portfolio overview for today</p>
              </div>
              <div className="flex items-center space-x-4 bg-slate-800/50 backdrop-blur-sm px-5 py-3 rounded-xl border border-yellow-500/20">
                <div className="text-right">
                  <p className="text-sm text-slate-300">Portfolio Value</p>
                  <p className="text-2xl font-bold text-yellow-400">$847,250</p>
                  <div className="flex items-center text-green-400 text-sm">
                    <ArrowUp size={14} className="mr-1" />
                    +2.4% today
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Wallet Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Deposit Wallet */}
            <div className="bg-gradient-to-br from-slate-800/70 to-slate-900/70 backdrop-blur-sm border border-slate-700/50 rounded-xl shadow-lg shadow-slate-900/20 overflow-hidden hover:border-yellow-500/30 transition-all duration-300">
              <div className="p-1">
                <div className="bg-gradient-to-br from-yellow-500/10 to-amber-600/5 p-5 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-yellow-400/30 to-amber-500/20 border border-yellow-400/30 mr-3">
                          <Wallet size={20} className="text-yellow-400" />
                        </div>
                        <h3 className="text-slate-300 text-lg font-medium">Deposit Wallet</h3>
                      </div>
                      <p className="text-3xl font-bold text-white mt-3 mb-2">$452.19</p>
                      <Link to="/dashboard/deposit" className="inline-block mt-3 px-5 py-2.5 bg-gradient-to-r from-yellow-400 to-amber-500 text-slate-900 font-medium rounded-lg hover:from-yellow-300 hover:to-amber-400 transition-all text-sm shadow-md">
                        Deposit now
                      </Link>
                    </div>
                    <div className="p-2 rounded-full bg-yellow-400/10">
                      <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Income Wallet */}
            <div className="bg-gradient-to-br from-slate-800/70 to-slate-900/70 backdrop-blur-sm border border-slate-700/50 rounded-xl shadow-lg shadow-slate-900/20 overflow-hidden hover:border-purple-500/30 transition-all duration-300">
              <div className="p-1">
                <div className="bg-gradient-to-br from-purple-500/10 to-indigo-600/5 p-5 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-purple-400/30 to-indigo-500/20 border border-purple-400/30 mr-3">
                          <Wallet size={20} className="text-purple-400" />
                        </div>
                        <h3 className="text-slate-300 text-lg font-medium">Income Wallet</h3>
                      </div>
                      <p className="text-3xl font-bold text-white mt-3 mb-2">$512.12</p>
                      <div className="mt-3 flex flex-wrap gap-3">
                        <button className="px-5 py-2.5 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-medium rounded-lg hover:from-purple-400 hover:to-indigo-500 transition-all text-sm shadow-md">
                          Withdraw
                        </button>
                        <button className="px-5 py-2.5 bg-purple-500/10 border border-purple-500/30 text-purple-400 font-medium rounded-lg hover:bg-purple-500/20 transition-all text-sm">
                          Transfer Internally
                        </button>
                      </div>
                    </div>
                    <div className="p-2 rounded-full bg-purple-400/10">
                      <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Investment Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Total Invested */}
            <div className="group bg-gradient-to-br from-slate-800/70 to-slate-900/70 backdrop-blur-sm border border-slate-700/50 rounded-xl shadow-lg shadow-slate-900/20 overflow-hidden hover:border-blue-500/30 transition-all duration-300">
              <div className="p-6">
                <div className="flex items-center mb-3">
                  <div className="p-2.5 rounded-lg bg-gradient-to-br from-blue-500/30 to-indigo-600/20 border border-blue-400/30 mr-3 group-hover:scale-110 transition-transform duration-300">
                    <DollarSign size={18} className="text-blue-400" />
                  </div>
                  <h3 className="text-slate-300 text-lg font-medium">Total Invested</h3>
                </div>
                <div className="flex items-end justify-between">
                  <p className="text-3xl font-bold text-white">$10,000.27</p>
                  <div className="flex items-center text-blue-400 text-sm">
                    <ArrowUp size={14} className="mr-1" />
                    <span>+4.2%</span>
                  </div>
                </div>
                <div className="w-full h-1 bg-slate-700/50 mt-4 rounded-full overflow-hidden">
                  <div className="h-1 w-3/5 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
                </div>
              </div>
            </div>

            {/* Active Investment */}
            <div className="group bg-gradient-to-br from-slate-800/70 to-slate-900/70 backdrop-blur-sm border border-slate-700/50 rounded-xl shadow-lg shadow-slate-900/20 overflow-hidden hover:border-green-500/30 transition-all duration-300">
              <div className="p-6">
                <div className="flex items-center mb-3">
                  <div className="p-2.5 rounded-lg bg-gradient-to-br from-green-500/30 to-emerald-600/20 border border-green-400/30 mr-3 group-hover:scale-110 transition-transform duration-300">
                    <TrendingUp size={18} className="text-green-400" />
                  </div>
                  <h3 className="text-slate-300 text-lg font-medium">Active Investment</h3>
                </div>
                <div className="flex items-end justify-between">
                  <p className="text-3xl font-bold text-white">$800.27</p>
                  <div className="flex items-center text-green-400 text-sm">
                    <ArrowUp size={14} className="mr-1" />
                    <span>+2.8%</span>
                  </div>
                </div>
                <div className="w-full h-1 bg-slate-700/50 mt-4 rounded-full overflow-hidden">
                  <div className="h-1 w-2/5 bg-gradient-to-r from-green-500 to-emerald-600"></div>
                </div>
              </div>
            </div>

            {/* Expired Investment */}
            <div className="group bg-gradient-to-br from-slate-800/70 to-slate-900/70 backdrop-blur-sm border border-slate-700/50 rounded-xl shadow-lg shadow-slate-900/20 overflow-hidden hover:border-amber-500/30 transition-all duration-300">
              <div className="p-6">
                <div className="flex items-center mb-3">
                  <div className="p-2.5 rounded-lg bg-gradient-to-br from-amber-500/30 to-orange-600/20 border border-amber-400/30 mr-3 group-hover:scale-110 transition-transform duration-300">
                    <Clock size={18} className="text-amber-400" />
                  </div>
                  <h3 className="text-slate-300 text-lg font-medium">Expired Investment</h3>
                </div>
                <div className="flex items-end justify-between">
                  <p className="text-3xl font-bold text-white">$13,727.00</p>
                  <div className="flex items-center text-amber-400 text-sm">
                    <Clock size={14} className="mr-1" />
                    <span>Matured</span>
                  </div>
                </div>
                <div className="w-full h-1 bg-slate-700/50 mt-4 rounded-full overflow-hidden">
                  <div className="h-1 w-full bg-gradient-to-r from-amber-500 to-orange-600"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Business Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Direct Business */}
            <div className="group bg-gradient-to-br from-slate-800/70 to-slate-900/70 backdrop-blur-sm border border-slate-700/50 rounded-xl shadow-lg shadow-slate-900/20 overflow-hidden hover:border-blue-500/30 transition-all duration-300">
              <div className="px-6 pt-6 pb-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="p-2.5 rounded-lg bg-gradient-to-br from-blue-500/30 to-indigo-600/20 border border-blue-400/30 mr-3 group-hover:scale-110 transition-transform duration-300">
                      <Users size={18} className="text-blue-400" />
                    </div>
                    <h3 className="text-slate-300 text-lg font-medium">Direct Business</h3>
                  </div>
                  <span className="bg-blue-500/10 text-blue-400 text-xs px-3 py-1 rounded-full border border-blue-500/20">Personal</span>
                </div>
                <div>
                  <p className="text-3xl font-bold text-white mb-3">$10,000.27</p>
                  <div className="flex flex-wrap gap-3 mb-3">
                    <span className="inline-flex items-center bg-slate-700/50 border border-slate-600/50 rounded-full px-3 py-1 text-sm text-slate-300">
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
                  <div className="w-full h-1.5 bg-slate-700/50 mt-4 rounded-full overflow-hidden">
                    <div className="h-1.5 w-4/5 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Team Business */}
            <div className="group bg-gradient-to-br from-slate-800/70 to-slate-900/70 backdrop-blur-sm border border-slate-700/50 rounded-xl shadow-lg shadow-slate-900/20 overflow-hidden hover:border-purple-500/30 transition-all duration-300">
              <div className="px-6 pt-6 pb-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="p-2.5 rounded-lg bg-gradient-to-br from-purple-500/30 to-indigo-600/20 border border-purple-400/30 mr-3 group-hover:scale-110 transition-transform duration-300">
                      <Users size={18} className="text-purple-400" />
                    </div>
                    <h3 className="text-slate-300 text-lg font-medium">Team Business</h3>
                  </div>
                  <span className="bg-purple-500/10 text-purple-400 text-xs px-3 py-1 rounded-full border border-purple-500/20">Network</span>
                </div>
                <div>
                  <p className="text-3xl font-bold text-white mb-3">$1,000,000.27</p>
                  <div className="flex flex-wrap gap-3 mb-3">
                    <span className="inline-flex items-center bg-slate-700/50 border border-slate-600/50 rounded-full px-3 py-1 text-sm text-slate-300">
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
                  <div className="w-full h-1.5 bg-slate-700/50 mt-4 rounded-full overflow-hidden">
                    <div className="h-1.5 w-11/12 bg-gradient-to-r from-purple-500 to-indigo-600"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Income Breakdowns */}
          <div className="relative">
            <div className="absolute -top-12 left-0 right-0 text-center">
              <h2 className="inline-block bg-gradient-to-r from-slate-800/90 to-slate-900/90 backdrop-blur-sm px-8 py-2 rounded-full border border-slate-700/50 text-white font-medium text-lg shadow-lg shadow-slate-900/20">Income Breakdown</h2>
            </div>
            <div className="bg-gradient-to-br from-slate-800/70 to-slate-900/70 backdrop-blur-sm border border-slate-700/50 rounded-xl shadow-lg shadow-slate-900/20 p-6 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Referral Income */}
                <div className="group p-5 bg-gradient-to-br from-yellow-500/5 to-amber-600/10 rounded-xl border border-yellow-500/20 hover:border-yellow-500/40 transition-all duration-300">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-slate-300 text-lg font-medium">Referral Income</h3>
                    <div className="p-2 rounded-full bg-yellow-400/10 group-hover:bg-yellow-400/20 transition-colors duration-300">
                      <Share size={18} className="text-yellow-400" />
                    </div>
                  </div>
                  <p className="text-2xl md:text-3xl font-bold text-white mb-2">$10,000.27</p>
                  <div className="flex items-center text-yellow-400 text-sm mt-2 bg-yellow-400/10 w-fit px-3 py-1 rounded-full">
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
                <div className="group p-5 bg-gradient-to-br from-blue-500/5 to-indigo-600/10 rounded-xl border border-blue-500/20 hover:border-blue-500/40 transition-all duration-300">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-slate-300 text-lg font-medium">Daily Staking</h3>
                    <div className="p-2 rounded-full bg-blue-400/10 group-hover:bg-blue-400/20 transition-colors duration-300">
                      <Coins size={18} className="text-blue-400" />
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
            <div className="bg-gradient-to-br from-slate-800/70 to-slate-900/70 backdrop-blur-sm border border-slate-700/50 rounded-xl shadow-lg shadow-slate-900/20 overflow-hidden hover:border-yellow-500/30 transition-all duration-300">
              <div className="p-1">
                <div className="p-6 bg-gradient-to-br from-yellow-500/10 to-amber-600/5 rounded-lg">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                      <div className="p-2.5 rounded-lg bg-gradient-to-br from-yellow-400/30 to-amber-500/20 border border-yellow-400/30 mr-3">
                        <Trophy size={18} className="text-yellow-400" />
                      </div>
                      <h3 className="text-white text-lg font-medium">Rank Information</h3>
                    </div>
                    <div className="bg-yellow-500/10 text-yellow-400 text-xs px-3 py-1 rounded-full border border-yellow-500/20">
                      Member Status
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-lg p-4 border border-yellow-500/10">
                      <h3 className="text-slate-400 text-sm mb-2">Current Rank</h3>
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-yellow-500/20 mr-3">
                          <span className="text-yellow-400 font-bold text-xl">**</span>
                        </div>
                        <p className="text-lg font-bold text-yellow-400">Gold</p>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-lg p-4 border border-amber-500/10">
                      <h3 className="text-slate-400 text-sm mb-2">Next Rank</h3>
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-amber-500/20 mr-3">
                          <span className="text-amber-400 font-bold text-xl">***</span>
                        </div>
                        <p className="text-lg font-bold text-amber-400">Platinum</p>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-lg p-4 border border-slate-600/10">
                      <h3 className="text-slate-400 text-sm mb-2">User ID</h3>
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-slate-700/70 mr-3">
                          <User size={18} className="text-slate-300" />
                        </div>
                        <p className="text-lg font-bold text-slate-300">userId</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Referral Link */}
          <div className="bg-gradient-to-br from-slate-800/70 to-slate-900/70 backdrop-blur-sm border border-slate-700/50 rounded-xl shadow-lg shadow-slate-900/20 overflow-hidden hover:border-yellow-500/30 transition-all duration-300">
            <div className="p-1">
              <div className="bg-gradient-to-br from-yellow-500/10 to-amber-600/5 p-6 rounded-lg">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                  <div className="mb-6 md:mb-0">
                    <div className="flex items-center">
                      <div className="p-2.5 rounded-lg bg-gradient-to-br from-yellow-400/30 to-amber-500/20 border border-yellow-400/30 mr-3">
                        <Award size={20} className="text-yellow-400" />
                      </div>
                      <h2 className="text-white text-lg font-bold">Elite Referral Program</h2>
                    </div>
                    <p className="text-slate-300 mt-3 ml-11">Earn exclusive rewards for introducing qualified investors</p>
                  </div>
                  
                  <div className="flex flex-wrap md:flex-nowrap gap-3 items-center w-full md:w-auto">
                    <div className="flex-grow bg-gradient-to-r from-slate-800/80 to-slate-900/80 rounded-lg px-4 py-3 border border-slate-700/50 overflow-hidden overflow-x-auto">
                      <span className="text-slate-300 font-mono">goldenarrrow.capital/ref/johndoe</span>
                    </div>
                    <button 
                      className="px-4 py-2.5 bg-gradient-to-r from-yellow-400 to-amber-500 text-slate-900 font-medium rounded-lg hover:from-yellow-300 hover:to-amber-400 transition-colors flex items-center whitespace-nowrap shadow-md"
                      onClick={handleCopyReferralLink}
                    >
                      {copied ? <Check size={16} className="mr-2" /> : <Copy size={16} className="mr-2" />}
                      {copied ? "Copied!" : "Copy Link"}
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                  <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-lg p-4 border border-yellow-500/10 text-center">
                    <h3 className="text-slate-400 text-sm mb-1">Total Referrals</h3>
                    <p className="text-2xl font-bold text-yellow-400">5</p>
                  </div>
                  <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-lg p-4 border border-green-500/10 text-center">
                    <h3 className="text-slate-400 text-sm mb-1">Total Earnings</h3>
                    <p className="text-2xl font-bold text-green-400">$12,500</p>
                  </div>
                  <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-lg p-4 border border-blue-500/10 text-center">
                    <h3 className="text-slate-400 text-sm mb-1">Pending Rewards</h3>
                    <p className="text-2xl font-bold text-blue-400">$450</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-gradient-to-br from-slate-800/70 to-slate-900/70 backdrop-blur-sm border border-slate-700/50 rounded-xl shadow-lg shadow-slate-900/20 overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center">
                  <div className="p-2.5 rounded-lg bg-gradient-to-br from-blue-500/30 to-indigo-600/20 border border-blue-400/30 mr-3">
                    <Clock size={18} className="text-blue-400" />
                  </div>
                  <h2 className="text-white text-lg font-bold">Recent Transactions</h2>
                </div>
                <button className="px-4 py-2 text-sm border border-blue-500/30 text-blue-400 rounded-lg hover:bg-blue-500/10 transition-colors">
                  View All
                </button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-700/70">
                      <th className="text-left py-3 text-slate-400 font-medium">Transaction</th>
                      <th className="text-left py-3 text-slate-400 font-medium">Fund</th>
                      <th className="text-left py-3 text-slate-400 font-medium">Amount</th>
                      <th className="text-left py-3 text-slate-400 font-medium">Status</th>
                      <th className="text-left py-3 text-slate-400 font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-slate-700/50 hover:bg-slate-800/30 transition-colors">
                      <td className="py-4 flex items-center">
                        <div className="p-2 rounded-lg bg-green-400/20 mr-3">
                          <ArrowUp size={16} className="text-green-400" />
                        </div>
                        <span className="text-white">Investment</span>
                      </td>
                      <td className="py-4 text-slate-300">Growth Equity Fund</td>
                      <td className="py-4 text-white font-semibold">$25,000</td>
                      <td className="py-4">
                        <span className="px-3 py-1 bg-green-400/20 text-green-400 rounded-full text-xs">Completed</span>
                      </td>
                      <td className="py-4 text-slate-400">Jan 15, 2025</td>
                    </tr>
                  
                    <tr className="border-b border-slate-700/50 hover:bg-slate-800/30 transition-colors">
                      <td className="py-4 flex items-center">
                        <div className="p-2 rounded-lg bg-blue-400/20 mr-3">
                          <DollarSign size={16} className="text-blue-400" />
                        </div>
                        <span className="text-white">Dividend</span>
                      </td>
                      <td className="py-4 text-slate-300">Tech Innovation Fund</td>
                      <td className="py-4 text-white font-semibold">$1,250</td>
                      <td className="py-4">
                        <span className="px-3 py-1 bg-green-400/20 text-green-400 rounded-full text-xs">Received</span>
                      </td>
                      <td className="py-4 text-slate-400">Jan 14, 2025</td>
                    </tr>
                    
                    <tr className="border-b border-slate-700/50 hover:bg-slate-800/30 transition-colors">
                      <td className="py-4 flex items-center">
                        <div className="p-2 rounded-lg bg-amber-400/20 mr-3">
                          <ArrowDown size={16} className="text-amber-400" />
                        </div>
                        <span className="text-white">Withdrawal</span>
                      </td>
                      <td className="py-4 text-slate-300">Money Market Fund</td>
                      <td className="py-4 text-white font-semibold">$10,000</td>
                      <td className="py-4">
                        <span className="px-3 py-1 bg-amber-400/20 text-amber-400 rounded-full text-xs">Processing</span>
                      </td>
                      <td className="py-4 text-slate-400">Jan 13, 2025</td>
                    </tr>
                    
                    <tr className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-4 flex items-center">
                        <div className="p-2 rounded-lg bg-yellow-400/20 mr-3">
                          <Award size={16} className="text-yellow-400" />
                        </div>
                        <span className="text-white">Referral Bonus</span>
                      </td>
                      <td className="py-4 text-slate-300">-</td>
                      <td className="py-4 text-white font-semibold">$2,500</td>
                      <td className="py-4">
                        <span className="px-3 py-1 bg-green-400/20 text-green-400 rounded-full text-xs">Completed</span>
                      </td>
                      <td className="py-4 text-slate-400">Jan 12, 2025</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;