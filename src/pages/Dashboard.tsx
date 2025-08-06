import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import { 
  ArrowUp,
  ArrowDown,
  ArrowDownToLine,
  DollarSign,
  Wallet,
  Users,
  Award,
  Share,
  TrendingUp,
  Clock,
  Copy,
  Check,
  Coins,
  Trophy,
  PieChart,
  BarChart3,
  Target,
  Shield
} from 'lucide-react';
import logoImage from '../assets/logo.svg';

interface DashboardProps {
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onLogout }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
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
      <Sidebar onLogout={onLogout} />
      
      {/* Main Content */}
      <div className="ml-0 lg:ml-64 min-h-screen">
        {/* Header */}
        <TopBar 
          onLogout={onLogout} 
          toggleSidebar={() => setShowMobileSidebar(!showMobileSidebar)} 
        />
        
        {/* Dashboard Content */}
        <div className="p-6 space-y-8">
          {/* Welcome Section */}
          <div className="bg-gradient-to-r from-yellow-400/10 to-amber-500/10 border border-yellow-400/20 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-amber-400 bg-clip-text text-transparent">
                  Welcome back, John
                </h1>
                <p className="text-slate-400 mt-1">Here's your portfolio overview for today</p>
              </div>
              <div className="hidden md:flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm text-slate-400">Portfolio Value</p>
                  <p className="text-2xl font-bold text-yellow-400">$847,250</p>
                  <div className="flex items-center text-green-400 text-sm">
                    <ArrowUp size={14} className="mr-1" />
                    +2.4% today
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Portfolio Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 hover:border-yellow-400/30 transition-all duration-300">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-slate-400 text-sm font-medium">Total Assets</h3>
                  <p className="text-2xl font-bold text-white mt-1">$847,250</p>
                  <div className="flex items-center text-green-400 text-sm mt-2">
                    <ArrowUp size={14} className="mr-1" />
                    <span>+$20,430 (2.4%)</span>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-gradient-to-br from-yellow-400/20 to-amber-500/10 border border-yellow-400/20">
                  <Wallet size={24} className="text-yellow-400" />
                </div>
              </div>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 hover:border-yellow-400/30 transition-all duration-300">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-slate-400 text-sm font-medium">Monthly Returns</h3>
                  <p className="text-2xl font-bold text-white mt-1">+18.7%</p>
                  <div className="flex items-center text-green-400 text-sm mt-2">
                    <TrendingUp size={14} className="mr-1" />
                    <span>Above target</span>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-gradient-to-br from-green-400/20 to-emerald-500/10 border border-green-400/20">
                  <TrendingUp size={24} className="text-green-400" />
                </div>
              </div>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 hover:border-yellow-400/30 transition-all duration-300">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-slate-400 text-sm font-medium">Active Investments</h3>
                  <p className="text-2xl font-bold text-white mt-1">12 Funds</p>
                  <div className="flex items-center text-blue-400 text-sm mt-2">
                    <PieChart size={14} className="mr-1" />
                    <span>Diversified</span>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-gradient-to-br from-blue-400/20 to-indigo-500/10 border border-blue-400/20">
                  <PieChart size={24} className="text-blue-400" />
                </div>
              </div>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 hover:border-yellow-400/30 transition-all duration-300">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-slate-400 text-sm font-medium">Risk Score</h3>
                  <p className="text-2xl font-bold text-white mt-1">7.2/10</p>
                  <div className="flex items-center text-amber-400 text-sm mt-2">
                    <Shield size={14} className="mr-1" />
                    <span>Moderate</span>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-gradient-to-br from-amber-400/20 to-orange-500/10 border border-amber-400/20">
                  <Shield size={24} className="text-amber-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Asset Allocation & Performance */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white">Asset Allocation</h2>
                <button className="px-4 py-2 text-sm border border-yellow-400/30 text-yellow-400 rounded-lg hover:bg-yellow-400/10 transition-colors">
                  Rebalance
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-yellow-400 mr-3"></div>
                    <span className="text-slate-300">Equity Funds</span>
                  </div>
                  <div className="text-right">
                    <span className="text-white font-semibold">$423,625</span>
                    <span className="text-slate-400 text-sm ml-2">50%</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-blue-400 mr-3"></div>
                    <span className="text-slate-300">Fixed Income</span>
                  </div>
                  <div className="text-right">
                    <span className="text-white font-semibold">$254,175</span>
                    <span className="text-slate-400 text-sm ml-2">30%</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-green-400 mr-3"></div>
                    <span className="text-slate-300">Alternative Investments</span>
                  </div>
                  <div className="text-right">
                    <span className="text-white font-semibold">$169,450</span>
                    <span className="text-slate-400 text-sm ml-2">20%</span>
                  </div>
                </div>
                
                <div className="w-full bg-slate-700 rounded-full h-2 mt-4">
                  <div className="bg-gradient-to-r from-yellow-400 via-blue-400 to-green-400 h-2 rounded-full"></div>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white">Performance Metrics</h2>
                <button className="px-4 py-2 text-sm border border-yellow-400/30 text-yellow-400 rounded-lg hover:bg-yellow-400/10 transition-colors">
                  View Report
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-slate-700/30 rounded-lg">
                  <div>
                    <p className="text-slate-400 text-sm">YTD Return</p>
                    <p className="text-white font-semibold">+24.7%</p>
                  </div>
                  <div className="text-green-400">
                    <ArrowUp size={20} />
                  </div>
                </div>
                
                <div className="flex justify-between items-center p-4 bg-slate-700/30 rounded-lg">
                  <div>
                    <p className="text-slate-400 text-sm">Sharpe Ratio</p>
                    <p className="text-white font-semibold">1.82</p>
                  </div>
                  <div className="text-yellow-400">
                    <Target size={20} />
                  </div>
                </div>
                
                <div className="flex justify-between items-center p-4 bg-slate-700/30 rounded-lg">
                  <div>
                    <p className="text-slate-400 text-sm">Max Drawdown</p>
                    <p className="text-white font-semibold">-3.2%</p>
                  </div>
                  <div className="text-blue-400">
                    <BarChart3 size={20} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Referral Program */}
          <div className="bg-gradient-to-r from-yellow-400/10 to-amber-500/10 border border-yellow-400/20 rounded-xl p-6">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center">
                  <Award className="text-yellow-400 mr-2" size={24} />
                  Elite Referral Program
                </h2>
                <p className="text-slate-400 mt-1">Earn exclusive rewards for introducing qualified investors</p>
                <div className="flex items-center mt-3 space-x-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-yellow-400">5</p>
                    <p className="text-xs text-slate-400">Referrals</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-400">$12,500</p>
                    <p className="text-xs text-slate-400">Earned</p>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col space-y-3">
                <div className="flex items-center bg-slate-700/30 rounded-lg p-3">
                  <span className="text-slate-300 text-sm font-mono">goldenarrrow.capital/ref/johndoe</span>
                  <button 
                    className="ml-3 p-2 rounded-lg bg-yellow-400 text-slate-900 hover:bg-yellow-300 transition-colors"
                    onClick={handleCopyReferralLink}
                  >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </div>
                <button className="px-6 py-2 bg-gradient-to-r from-yellow-400 to-amber-500 text-slate-900 font-semibold rounded-lg hover:from-yellow-300 hover:to-amber-400 transition-all">
                  Share Link
                </button>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Recent Activity</h2>
              <button className="px-4 py-2 text-sm border border-yellow-400/30 text-yellow-400 rounded-lg hover:bg-yellow-400/10 transition-colors">
                View All
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left py-3 text-slate-400 font-medium">Transaction</th>
                    <th className="text-left py-3 text-slate-400 font-medium">Fund</th>
                    <th className="text-left py-3 text-slate-400 font-medium">Amount</th>
                    <th className="text-left py-3 text-slate-400 font-medium">Status</th>
                    <th className="text-left py-3 text-slate-400 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-700/50">
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
                  
                  <tr className="border-b border-slate-700/50">
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
                  
                  <tr className="border-b border-slate-700/50">
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
                  
                  <tr>
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
          
          {/* Quick Actions */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-6">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button className="flex items-center justify-center p-4 bg-gradient-to-r from-yellow-400 to-amber-500 text-slate-900 font-semibold rounded-xl hover:from-yellow-300 hover:to-amber-400 transition-all transform hover:scale-105">
                <Wallet size={20} className="mr-2" />
                Invest More
              </button>
              <button className="flex items-center justify-center p-4 border border-yellow-400/30 text-yellow-400 rounded-xl hover:bg-yellow-400/10 transition-all transform hover:scale-105">
                <ArrowDownToLine size={20} className="mr-2" />
                Request Withdrawal
              </button>
              <button className="flex items-center justify-center p-4 border border-yellow-400/30 text-yellow-400 rounded-xl hover:bg-yellow-400/10 transition-all transform hover:scale-105">
                <BarChart3 size={20} className="mr-2" />
                Portfolio Report
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;