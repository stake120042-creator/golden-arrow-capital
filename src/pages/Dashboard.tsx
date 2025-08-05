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
  Trophy
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
    navigator.clipboard.writeText('makememillionaire.io/ref/johndoe');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <Sidebar onLogout={onLogout} />
      
      {/* Main Content */}
      <div className="dashboard-main">
        {/* Header */}
        <TopBar 
          onLogout={onLogout} 
          toggleSidebar={() => setShowMobileSidebar(!showMobileSidebar)} 
        />
        
        {/* Dashboard Content */}
        <div className="space-y-6">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl font-bold">My Wallets</h2>
            <button className="btn btn-outline py-1 px-3 text-sm">
              View All
            </button>
          </div>

          {/* Wallets Section */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="flex justify-between">
                <div>
                  <h3 className="stat-title">Deposit Wallet</h3>
                  <p className="stat-value">0.25 ETH</p>
                  <div className="stat-change change-up">
                    <ArrowUp size={14} className="mr-1" />
                    <span>+0.05 ETH</span>
                  </div>
                </div>
                <div className="p-3 rounded-full bg-blue-500/10">
                  <Wallet size={24} className="text-blue-500" />
                </div>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="flex justify-between">
                <div>
                  <h3 className="stat-title">Income Wallet</h3>
                  <p className="stat-value">1.5 ETH</p>
                  <div className="stat-change change-up">
                    <ArrowUp size={14} className="mr-1" />
                    <span>+0.12 ETH</span>
                  </div>
                </div>
                <div className="p-3 rounded-full bg-green-500/10">
                  <DollarSign size={24} className="text-green-500" />
                </div>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="flex justify-between">
                <div>
                  <h3 className="stat-title">Referral Link</h3>
                  <p className="stat-value text-base truncate">makememillionaire.io/ref/johndoe</p>
                  <button 
                    className="mt-2 btn btn-primary py-1 px-3 text-sm flex items-center"
                    onClick={handleCopyReferralLink}
                  >
                    {copied ? (
                      <>
                        <Check size={14} className="mr-1" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy size={14} className="mr-1" />
                        Copy Link
                      </>
                    )}
                  </button>
                </div>
                <div className="p-3 rounded-full bg-yellow-500/10">
                  <Share size={24} className="text-yellow-500" />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center mt-8 mb-2">
            <h2 className="text-xl font-bold">Business Overview</h2>
            <button className="btn btn-outline py-1 px-3 text-sm">
              View Details
            </button>
          </div>
          
          {/* Business Stats */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="flex justify-between">
                <div>
                  <h3 className="stat-title">Direct Business</h3>
                  <p className="stat-value">5 Members</p>
                  <div className="stat-change change-up">
                    <ArrowUp size={14} className="mr-1" />
                    <span>+2 this week</span>
                  </div>
                </div>
                <div className="p-3 rounded-full bg-indigo-500/10">
                  <Users size={24} className="text-indigo-500" />
                </div>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="flex justify-between">
                <div>
                  <h3 className="stat-title">Team Business</h3>
                  <p className="stat-value">32 Members</p>
                  <div className="stat-change change-up">
                    <ArrowUp size={14} className="mr-1" />
                    <span>+8 this week</span>
                  </div>
                </div>
                <div className="p-3 rounded-full bg-purple-500/10">
                  <Users size={24} className="text-purple-500" />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center mt-8 mb-2">
            <h2 className="text-xl font-bold">Investments</h2>
            <button className="btn btn-outline py-1 px-3 text-sm">
              View All
            </button>
          </div>
          
          {/* Investments Stats */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="flex justify-between">
                <div>
                  <h3 className="stat-title">Total Investments</h3>
                  <p className="stat-value">4.75 ETH</p>
                  <div className="stat-change change-up">
                    <ArrowUp size={14} className="mr-1" />
                    <span>+0.25 ETH</span>
                  </div>
                </div>
                <div className="p-3 rounded-full bg-yellow-500/10">
                  <Coins size={24} className="text-yellow-500" />
                </div>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="flex justify-between">
                <div>
                  <h3 className="stat-title">Active Investments</h3>
                  <p className="stat-value">3 Plans</p>
                  <div className="stat-change">
                    <span>All performing</span>
                  </div>
                </div>
                <div className="p-3 rounded-full bg-teal-500/10">
                  <TrendingUp size={24} className="text-teal-500" />
                </div>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="flex justify-between">
                <div>
                  <h3 className="stat-title">Expired Investments</h3>
                  <p className="stat-value">1 Plan</p>
                  <div className="stat-change">
                    <span>Completed</span>
                  </div>
                </div>
                <div className="p-3 rounded-full bg-gray-500/10">
                  <Clock size={24} className="text-gray-500" />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center mt-8 mb-2">
            <h2 className="text-xl font-bold">Bonuses</h2>
            <button className="btn btn-outline py-1 px-3 text-sm">
              View Details
            </button>
          </div>
          
          {/* Bonuses Stats */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="flex justify-between">
                <div>
                  <h3 className="stat-title">Staking Bonus</h3>
                  <p className="stat-value">0.12 ETH</p>
                  <div className="stat-change change-up">
                    <ArrowUp size={14} className="mr-1" />
                    <span>+0.03 ETH</span>
                  </div>
                </div>
                <div className="p-3 rounded-full bg-orange-500/10">
                  <Award size={24} className="text-orange-500" />
                </div>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="flex justify-between">
                <div>
                  <h3 className="stat-title">Referral Bonus</h3>
                  <p className="stat-value">0.35 ETH</p>
                  <div className="stat-change change-up">
                    <ArrowUp size={14} className="mr-1" />
                    <span>+0.08 ETH</span>
                  </div>
                </div>
                <div className="p-3 rounded-full bg-blue-500/10">
                  <Share size={24} className="text-blue-500" />
                </div>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="flex justify-between">
                <div>
                  <h3 className="stat-title">Rank Bonus</h3>
                  <p className="stat-value">0.08 ETH</p>
                  <div className="stat-change change-up">
                    <ArrowUp size={14} className="mr-1" />
                    <span>+0.02 ETH</span>
                  </div>
                </div>
                <div className="p-3 rounded-full bg-purple-500/10">
                  <Trophy size={24} className="text-purple-500" />
                </div>
              </div>
            </div>
      </div>
          
          {/* Recent Transactions */}
          <div className="card mt-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="card-title">Recent Transactions</h2>
              <button className="btn btn-outline py-1 px-3 text-sm">
                View All
              </button>
      </div>
            
            <div className="table-container">
              <table className="data-table">
            <thead>
              <tr>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Date</th>
              </tr>
            </thead>
                <tbody>
                  <tr>
                    <td className="flex items-center">
                      <div className="p-2 rounded-full bg-green-500/10 mr-3">
                        <ArrowUp size={16} className="text-green-500" />
                      </div>
                      <span>Deposit</span>
                </td>
                    <td>0.5 ETH</td>
                    <td>
                      <span className="status-badge status-completed">Completed</span>
                </td>
                    <td>2024-01-15</td>
              </tr>
              <tr>
                    <td className="flex items-center">
                      <div className="p-2 rounded-full bg-blue-500/10 mr-3">
                        <Award size={16} className="text-blue-500" />
                      </div>
                      <span>Staking Reward</span>
                </td>
                    <td>0.05 ETH</td>
                    <td>
                      <span className="status-badge status-completed">Completed</span>
                </td>
                    <td>2024-01-14</td>
              </tr>
              <tr>
                    <td className="flex items-center">
                      <div className="p-2 rounded-full bg-red-500/10 mr-3">
                        <ArrowDown size={16} className="text-red-500" />
                      </div>
                      <span>Withdrawal</span>
                </td>
                    <td>0.2 ETH</td>
                    <td>
                      <span className="status-badge status-pending">Pending</span>
                </td>
                    <td>2024-01-13</td>
              </tr>
              <tr>
                    <td className="flex items-center">
                      <div className="p-2 rounded-full bg-purple-500/10 mr-3">
                        <Share size={16} className="text-purple-500" />
                      </div>
                      <span>Referral Bonus</span>
                </td>
                    <td>0.1 ETH</td>
                    <td>
                      <span className="status-badge status-completed">Completed</span>
                </td>
                    <td>2024-01-12</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
          
          {/* Quick Actions */}
          <div className="card">
            <h2 className="card-title">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button className="btn btn-primary py-3">
                <Wallet size={18} className="btn-icon" />
                Deposit Funds
              </button>
              <button className="btn btn-outline py-3">
                <ArrowDownToLine size={18} className="btn-icon" />
                Withdraw Funds
              </button>
              <button className="btn btn-outline py-3">
                <Share size={18} className="btn-icon" />
                Share Referral Link
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;