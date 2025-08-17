'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Settings, User, LogOut, Menu, Search, TrendingUp } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface TopBarProps {
  onLogout: () => void;
  toggleSidebar: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ onLogout, toggleSidebar }) => {
  const { user } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  
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
    <div className="fixed top-0 right-0 left-0 lg:left-64 z-20 bg-gradient-to-r from-slate-800/95 to-slate-900/95 backdrop-blur-xl border-b border-slate-700/50 px-6 py-4">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Left Side */}
        <div className="flex items-center space-x-6">
          {/* Mobile Menu Button */}
          <button 
            className="lg:hidden p-3 rounded-xl bg-slate-700/70 text-slate-300 hover:text-white hover:bg-slate-700 transition-all duration-300 shadow-lg hover:shadow-xl"
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
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-400/20 to-amber-500/20 rounded-xl flex items-center justify-center border border-yellow-400/30">
                <TrendingUp size={20} className="text-yellow-400" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-white">Portfolio Dashboard</h1>
                <p className="text-sm text-slate-400 mt-0.5">Welcome back, {user?.firstName} {user?.lastName}</p>
              </div>
            </div>
            
            {/* Mobile Title */}
            <div className="md:hidden">
              <h1 className="text-lg font-bold text-white">Dashboard</h1>
              <p className="text-xs text-slate-400">Welcome, {user?.firstName}</p>
            </div>
          </div>
        </div>
        
        {/* Right Side */}
        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="hidden md:flex relative">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search investments, reports..." 
                className="w-64 pl-12 pr-4 py-3 bg-slate-700/70 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-yellow-400/50 focus:ring-2 focus:ring-yellow-400/20 transition-all duration-300 backdrop-blur-sm"
              />
              <Search size={18} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" />
            </div>
          </div>
          

          
          {/* User Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button 
              className="flex items-center space-x-3 p-3 rounded-xl bg-slate-700/70 hover:bg-slate-700 transition-all duration-300 shadow-lg hover:shadow-xl group"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-slate-900 font-bold text-sm">
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </span>
                </div>
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-slate-800"></div>
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-semibold text-white">{user?.firstName} {user?.lastName}</p>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-slate-400">Premium Client</span>
                  <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                </div>
              </div>
              <ChevronDown size={16} className="text-slate-400 group-hover:text-white transition-colors duration-300" />
            </button>
            
            {showDropdown && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-slate-800/95 backdrop-blur-xl border border-slate-700/50 rounded-xl shadow-2xl z-50">
                <div className="p-4 border-b border-slate-700/50">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-xl flex items-center justify-center shadow-lg">
                      <span className="text-slate-900 font-bold">
                        {user?.firstName?.[0]}{user?.lastName?.[0]}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-white">{user?.firstName} {user?.lastName}</p>
                      <p className="text-xs text-slate-400">{user?.email}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-xs bg-yellow-400/20 text-yellow-400 px-2 py-0.5 rounded-full">Premium</span>
                        <span className="text-xs bg-green-400/20 text-green-400 px-2 py-0.5 rounded-full">Verified</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="p-2">
                  <a href="#" className="flex items-center px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all duration-300 group">
                    <User size={16} className="mr-3 group-hover:text-yellow-400 transition-colors duration-300" />
                    My Profile
                  </a>
                  <a href="#" className="flex items-center px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all duration-300 group">
                    <Settings size={16} className="mr-3 group-hover:text-blue-400 transition-colors duration-300" />
                    Account Settings
                  </a>
                </div>
                
                <div className="p-2 border-t border-slate-700/50">
                  <button 
                    onClick={() => {
                      console.log('🔍 TopBar logout button clicked');
                      onLogout();
                    }} 
                    className="w-full flex items-center px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all duration-300 group"
                  >
                    <LogOut size={16} className="mr-3 group-hover:text-red-300 transition-colors duration-300" />
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