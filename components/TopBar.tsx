'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, User, LogOut, Menu, Search, TrendingUp, Wallet, ArrowDownToLine, RotateCcw, Users, Settings } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface TopBarProps {
  onLogout: () => void;
  toggleSidebar: () => void;
  currentPage?: string;
}

const TopBar: React.FC<TopBarProps> = ({ onLogout, toggleSidebar, currentPage = 'dashboard' }) => {
  const { user } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  
  // Function to get page-specific content
  const getPageContent = (page: string) => {
    switch (page) {
      case 'invest':
        return {
          title: 'Invest Now',
          subtitle: 'Grow your wealth with our investment plans',
          icon: <TrendingUp size={20} className="text-purple-600" />
        };
      case 'investments':
        return {
          title: 'My Investments',
          subtitle: 'Track your investment portfolio and earnings',
          icon: <TrendingUp size={20} className="text-purple-600" />
        };
      case 'deposit':
        return {
          title: 'Deposit Funds',
          subtitle: 'Add funds to your investment account',
          icon: <Wallet size={20} className="text-purple-600" />
        };
      case 'withdraw':
        return {
          title: 'Withdraw Funds',
          subtitle: 'Withdraw your earnings and profits',
          icon: <ArrowDownToLine size={20} className="text-purple-600" />
        };
      case 'refund':
        return {
          title: 'Request Refund',
          subtitle: 'Submit refund requests and track status',
          icon: <RotateCcw size={20} className="text-purple-600" />
        };
      case 'my-team':
        return {
          title: 'My Team',
          subtitle: 'Manage your team and track performance',
          icon: <Users size={20} className="text-purple-600" />
        };
      case 'profile':
        return {
          title: 'My Profile',
          subtitle: 'Manage your account settings',
          icon: <Settings size={20} className="text-purple-600" />
        };
      default:
        return {
          title: 'Portfolio Dashboard',
          subtitle: `Welcome back, ${user?.firstName} ${user?.lastName}`,
          icon: <TrendingUp size={20} className="text-purple-600" />
        };
    }
  };

  const pageContent = getPageContent(currentPage);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="fixed top-0 right-0 left-0 lg:left-64 z-20 bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Left Side */}
        <div className="flex items-center space-x-6">
          {/* Mobile Menu Button */}
          <button 
            className="lg:hidden p-3 rounded-xl bg-gray-100 text-gray-600 hover:text-gray-900 hover:bg-gray-200 transition-all duration-300 shadow-sm hover:shadow-md"
            onClick={() => {
              console.log('🔍 Mobile menu button clicked');
              toggleSidebar();
            }}
          >
            <Menu size={20} />
          </button>
          
          {/* Page Title */}
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-xl flex items-center justify-center border border-purple-200">
                {pageContent.icon}
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-gray-900">{pageContent.title}</h1>
                <p className="text-sm text-gray-600 mt-0.5">{pageContent.subtitle}</p>
              </div>
            </div>
            
            {/* Mobile Title */}
            <div className="md:hidden">
              <h1 className="text-lg font-bold text-gray-900">{pageContent.title}</h1>
              <p className="text-xs text-gray-600">{pageContent.subtitle}</p>
            </div>
          </div>
        </div>
        
        {/* Right Side */}
        <div className="flex items-center space-x-4">
          

          
          {/* User Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button 
              className="flex items-center space-x-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-all duration-300 shadow-sm hover:shadow-md group"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-sm">
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </span>
                </div>
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-semibold text-gray-900">{user?.firstName} {user?.lastName}</p>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-600">Active Client</span>
                  <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
                </div>
              </div>
              <ChevronDown size={16} className="text-gray-400 group-hover:text-gray-600 transition-colors duration-300" />
            </button>
            
            {showDropdown && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-white border border-gray-200 rounded-xl shadow-lg z-50">
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                      <span className="text-white font-bold">
                        {user?.firstName?.[0]}{user?.lastName?.[0]}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900">{user?.firstName} {user?.lastName}</p>
                      <p className="text-xs text-gray-600">{user?.email}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Verified</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="p-2">
                  <a href="/dashboard/profile" className="flex items-center px-3 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all duration-300 group">
                    <User size={16} className="mr-3 group-hover:text-purple-600 transition-colors duration-300" />
                    My Profile
                  </a>
                </div>
                
                <div className="p-2 border-t border-gray-200">
                  <button 
                    onClick={() => {
                      console.log('🔍 TopBar logout button clicked');
                      onLogout();
                    }} 
                    className="w-full flex items-center px-3 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-300 group"
                  >
                    <LogOut size={16} className="mr-3 group-hover:text-red-700 transition-colors duration-300" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopBar;