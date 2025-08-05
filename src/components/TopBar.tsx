import React, { useState, useRef, useEffect } from 'react';
import { Bell, ChevronDown, Settings, User, LogOut } from 'lucide-react';

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
    <div className="dashboard-header">
      <button 
        className="md:hidden btn btn-outline"
        onClick={toggleSidebar}
      >
        <span>Menu</span>
      </button>
      
      <h1 className="header-title">Dashboard</h1>
      
      <div className="flex items-center space-x-4">
        {/* Notifications */}
        <div className="relative" ref={notificationRef}>
          <button 
            className="btn btn-outline p-2"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <Bell size={20} />
            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          
          {showNotifications && (
            <div className="dropdown-menu w-80">
              <div className="p-3 border-b border-gray-700">
                <h3 className="font-semibold">Notifications</h3>
              </div>
              <div className="p-3 text-center text-sm text-gray-400">
                No new notifications
              </div>
            </div>
          )}
        </div>
        
        {/* User Dropdown */}
        <div className="user-dropdown" ref={dropdownRef}>
          <button 
            className="user-button"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <div className="user-avatar">
              <span>JD</span>
            </div>
            <span className="user-name hidden md:block">John Doe</span>
            <ChevronDown size={16} />
          </button>
          
          {showDropdown && (
            <div className="dropdown-menu">
              <a href="#" className="dropdown-item">
                <User size={16} className="mr-2" />
                My Profile
              </a>
              <a href="#" className="dropdown-item">
                <Settings size={16} className="mr-2" />
                Account Settings
              </a>
              <div className="dropdown-divider"></div>
              <button onClick={onLogout} className="dropdown-item w-full text-left">
                <LogOut size={16} className="mr-2" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TopBar;