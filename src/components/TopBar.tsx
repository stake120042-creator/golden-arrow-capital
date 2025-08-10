import React, { useState, useRef, useEffect } from 'react';
import { Bell, ChevronDown, Settings, User, LogOut, Menu, Search, TrendingUp } from 'lucide-react';

interface TopBarProps {
  onLogout: () => void;
  toggleSidebar: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ onLogout, toggleSidebar }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="fixed top-0 right-0 left-0 lg:left-64 z-10 bg-slate-800/90 backdrop-blur-xl border-b border-slate-700/50 px-6 py-4">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Left Side */}
        <div className="flex items-center space-x-5">
          {/* Mobile Menu Button */}
          <button 
            className="lg:hidden p-2.5 rounded-lg bg-slate-700/70 text-slate-300 hover:text-white hover:bg-slate-700 transition-all duration-200"
            onClick={toggleSidebar}
          >
            <Menu size={20} />
          </button>
          
          {/* Page Title */}
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-white">Portfolio Dashboard</h1>
            <p className="text-sm text-slate-400 mt-0.5">Welcome back, John Doe</p>
          </div>
        </div>
        
        {/* Right Side */}
        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="hidden md:flex relative">
            <input 
              type="text" 
              placeholder="Search..." 
              className="w-56 pl-10 pr-4 py-2.5 bg-slate-700/70 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-yellow-400/50 focus:ring-1 focus:ring-yellow-400/20 transition-all duration-200"
            />
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
          </div>
          
          {/* User Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button 
              className="flex items-center space-x-3 p-2 rounded-lg bg-slate-700/70 hover:bg-slate-700 transition-all duration-200"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              <div className="w-9 h-9 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-lg flex items-center justify-center">
                <span className="text-slate-900 font-bold text-sm">JD</span>
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-white">John Doe</p>
                <p className="text-xs text-slate-400">Premium Client</p>
              </div>
              <ChevronDown size={16} className="text-slate-400" />
            </button>
            
            {showDropdown && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-slate-800/95 backdrop-blur-xl border border-slate-700/50 rounded-xl shadow-2xl z-50">
                <div className="p-3 border-b border-slate-700/50">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-lg flex items-center justify-center">
                      <span className="text-slate-900 font-bold">JD</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">John Doe</p>
                      <p className="text-xs text-slate-400">john.doe@email.com</p>
                      <span className="text-xs bg-yellow-400/20 text-yellow-400 px-2 py-0.5 rounded-full">Premium</span>
                    </div>
                  </div>
                </div>
                
                <div className="p-2">
                  <a href="#" className="flex items-center px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all duration-200">
                    <User size={16} className="mr-3" />
                    My Profile
                  </a>
                  <a href="#" className="flex items-center px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all duration-200">
                    <Settings size={16} className="mr-3" />
                    Account Settings
                  </a>
                </div>
                
                <div className="p-2 border-t border-slate-700/50">
                  <button 
                    onClick={onLogout} 
                    className="w-full flex items-center px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all duration-200"
                  >
                    <LogOut size={16} className="mr-3" />
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