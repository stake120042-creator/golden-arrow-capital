import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard,
  Wallet,
  ArrowDownToLine,
  ArrowLeftRight,
  Users,
  Settings,
  HelpCircle,
  LogOut,
  PieChart,
  BarChart3,
  FileText,
  Award
} from 'lucide-react';
import logoImage from '../assets/logo.svg';

interface SidebarProps {
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onLogout }) => {
  const location = useLocation();
  
  const navItems = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: <LayoutDashboard size={20} />
    },
    {
      name: 'Deposit Funds',
      path: '/dashboard/deposit',
      icon: <Wallet size={20} />
    },
    {
      name: 'Internal Transfers',
      path: '/dashboard/internaltransfers',
      icon: <PieChart size={20} />
    },
    {
      name: 'Withdraw Funds',
      path: '/dashboard/withdraw',
      icon: <ArrowDownToLine size={20} />
    },
    {
      name: 'Transaction History',
      path: '/dashboard/transactions',
      icon: <ArrowLeftRight size={20} />
    },
    {
      name: 'My Teams',
      path: '/dashboard/referrals',
      icon: <Award size={20} />
    },
  ];

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-slate-900/95 backdrop-blur-xl border-r border-slate-700/50 z-50 transition-transform duration-300 lg:translate-x-0 -translate-x-full">
      {/* Logo Section */}
      <div className="flex items-center p-6 border-b border-slate-700/50">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/30 to-amber-500/20 rounded-full blur-lg opacity-75"></div>
          <img 
            src={logoImage} 
            alt="Golden Arrow Capital" 
            className="w-10 h-10 mr-4 relative z-10 filter brightness-110 contrast-110" 
            style={{
              filter: 'brightness(1.2) contrast(1.1) saturate(1.3)'
            }}
          />
        </div>
        <div>
          <h1 className="text-lg font-bold bg-gradient-to-r from-yellow-400 to-amber-400 bg-clip-text text-transparent">
            Golden Arrow
          </h1>
          <p className="text-xs text-slate-400 font-medium">Capital</p>
        </div>
      </div>
      
      {/* Navigation Menu */}
      <nav className="flex-1 px-3 py-6">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.path}>
              <Link 
                to={item.path} 
                className={`group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                  location.pathname === item.path
                    ? 'bg-gradient-to-r from-yellow-400/20 to-amber-500/10 text-yellow-400 border border-yellow-400/30 shadow-lg shadow-yellow-400/10'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50 hover:border hover:border-slate-700/50'
                }`}
              >
                <span className={`mr-3 transition-colors duration-200 ${
                  location.pathname === item.path ? 'text-yellow-400' : 'text-slate-500 group-hover:text-slate-300'
                }`}>
                  {item.icon}
                </span>
                {item.name}
                {location.pathname === item.path && (
                  <div className="ml-auto w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      
      {/* Bottom Section */}
      <div className="p-3 border-t border-slate-700/50">
        {/* Logout Button */}
        <button 
          onClick={onLogout} 
          className="w-full flex items-center px-4 py-3 text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all duration-200 group"
        >
          <LogOut size={20} className="mr-3 group-hover:text-red-400" />
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default Sidebar;