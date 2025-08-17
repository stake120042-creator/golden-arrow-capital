'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
  Award,
  RotateCcw
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface SidebarProps {
  onLogout: () => void;
  isOpen?: boolean;
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onLogout, isOpen = false, onClose }) => {
  const { logout } = useAuth();
  const pathname = usePathname();
  
  console.log('🔍 Sidebar rendered - isOpen:', isOpen);
  
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
      name: 'Withdraw Funds',
      path: '/dashboard/withdraw',
      icon: <ArrowDownToLine size={20} />
    },
    {
      name: 'Request Refund',
      path: '/dashboard/refund',
      icon: <RotateCcw size={20} />
    }
  ];

  const handleLinkClick = () => {
    console.log('🔍 Link clicked, closing sidebar');
    if (onClose) {
      onClose();
    }
  };

  const handleLogout = () => {
    console.log('🔍 Sidebar logout button clicked');
    if (onLogout) {
      onLogout();
    } else {
      logout();
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => {
            console.log('🔍 Backdrop clicked, closing sidebar');
            if (onClose) onClose();
          }}
        />
      )}
      
      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-full w-64 bg-gradient-to-b from-slate-900/95 to-slate-800/95 backdrop-blur-xl border-r border-slate-700/50 z-50 transition-transform duration-300 lg:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        
        {/* Logo Section */}
        <div className="flex items-center p-6 border-b border-slate-700/50 relative overflow-hidden">
          {/* Background effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/10 to-amber-500/5"></div>
          
          <div className="relative flex items-center space-x-3">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/40 to-amber-500/30 rounded-xl blur-lg opacity-75 animate-pulse-glow"></div>
              <div className="relative w-12 h-12 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-xl flex items-center justify-center text-slate-900 font-bold text-xl shadow-2xl">
                GA
              </div>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gradient">Golden Arrow</h1>
              <p className="text-xs text-slate-400 font-medium">Capital</p>
            </div>
          </div>
        </div>
        
        {/* Navigation Menu */}
        <nav className="flex-1 px-4 py-6">
          <div className="space-y-2">
            <div className="px-3 mb-4">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Main Menu</h3>
            </div>
            
            {navItems.map((item) => (
              <div key={item.path} className="relative">
                <Link 
                  href={item.path}
                  onClick={handleLinkClick}
                  className={`group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-300 relative overflow-hidden ${
                    pathname === item.path
                      ? 'bg-gradient-to-r from-yellow-400/20 to-amber-500/10 text-yellow-400 border border-yellow-400/30 shadow-lg shadow-yellow-400/10'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50 hover:border hover:border-slate-700/50'
                  }`}
                >
                  {/* Hover background effect */}
                  <div className={`absolute inset-0 bg-gradient-to-r from-yellow-400/5 to-amber-500/3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                    pathname === item.path ? 'opacity-100' : ''
                  }`}></div>
                  
                  <span className={`relative mr-3 transition-colors duration-200 ${
                    pathname === item.path ? 'text-yellow-400' : 'text-slate-500 group-hover:text-slate-300'
                  }`}>
                    {item.icon}
                  </span>
                  <span className="relative">{item.name}</span>
                  
                  {pathname === item.path && (
                    <div className="relative ml-auto w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                  )}
                </Link>
              </div>
            ))}
          </div>
        </nav>
        
        {/* Bottom Section */}
        <div className="p-4 border-t border-slate-700/50 relative">
          {/* Background effect */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-800/50 to-transparent"></div>
          
          <div className="relative space-y-3">
            {/* User Info */}
            <div className="flex items-center space-x-3 p-3 bg-slate-800/50 rounded-xl border border-slate-700/30">
              <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-lg flex items-center justify-center">
                <span className="text-slate-900 font-bold text-sm">U</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">Premium User</p>
                <p className="text-xs text-slate-400">Active Account</p>
              </div>
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            </div>
            
            {/* Logout Button */}
            <button 
              onClick={handleLogout} 
              className="w-full group flex items-center px-4 py-3 text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all duration-300 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-pink-500/3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <LogOut size={20} className="relative mr-3 group-hover:text-red-400 transition-colors duration-200" />
              <span className="relative">Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;