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
  RotateCcw,
  ChevronLeft,
  TrendingUp
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
      name: 'My Team',
      path: '/dashboard/my-team',
      icon: <Users size={20} />
    },
    {
      name: 'Deposit Funds',
      path: '/dashboard/deposit',
      icon: <Wallet size={20} />
    },
    {
      name: 'Invest Now',
      path: '/dashboard/invest',
      icon: <TrendingUp size={20} />
    },
    {
      name: 'My Investments',
      path: '/dashboard/investments',
      icon: <BarChart3 size={20} />
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
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => {
            console.log('🔍 Backdrop clicked, closing sidebar');
            if (onClose) onClose();
          }}
        />
      )}
      
      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 z-50 transition-transform duration-300 lg:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        
        {/* Logo Section */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-purple-600 rounded flex items-center justify-center text-white font-bold text-sm">
              GA
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Golden Arrow</h1>
              <p className="text-xs text-gray-600">Capital</p>
            </div>
          </div>
          <button className="lg:hidden p-1 rounded hover:bg-gray-100">
            <ChevronLeft size={20} className="text-gray-600" />
          </button>
        </div>
        
        {/* Navigation Menu */}
        <nav className="flex-1 px-4 py-6">
          <div className="space-y-1">
            {navItems.map((item) => (
              <div key={item.path} className="relative">
                <Link 
                  href={item.path}
                  onClick={handleLinkClick}
                  className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                    pathname === item.path
                      ? 'bg-purple-50 text-purple-700 border border-purple-200'
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <span className={`mr-3 transition-colors duration-200 ${
                    pathname === item.path ? 'text-purple-600' : 'text-gray-500 group-hover:text-gray-700'
                  }`}>
                    {item.icon}
                  </span>
                  <span>{item.name}</span>
                </Link>
              </div>
            ))}
          </div>
        </nav>
        
        {/* Bottom Section */}
        <div className="p-4 border-t border-gray-200">
          <div className="space-y-3">
            {/* Help Button */}
            <Link 
              href="/dashboard/raise-ticket"
              onClick={handleLinkClick}
              className="w-full flex items-center justify-center px-4 py-2.5 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors duration-200"
            >
              <HelpCircle size={16} className="mr-2" />
              Raise Ticket
            </Link>
            
            {/* Logout Button */}
            <button 
              onClick={handleLogout} 
              className="w-full flex items-center px-3 py-2.5 text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
            >
              <LogOut size={20} className="mr-3" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;