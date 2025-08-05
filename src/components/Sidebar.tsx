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
  LogOut
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
      name: 'Deposit',
      path: '/dashboard/deposit',
      icon: <Wallet size={20} />
    },
    {
      name: 'Withdraw',
      path: '/dashboard/withdraw',
      icon: <ArrowDownToLine size={20} />
    },
    {
      name: 'Transactions',
      path: '/dashboard/transactions',
      icon: <ArrowLeftRight size={20} />
    },
    {
      name: 'My Team',
      path: '/dashboard/team',
      icon: <Users size={20} />
    },
    {
      name: 'Settings',
      path: '/dashboard/settings',
      icon: <Settings size={20} />
    },
    {
      name: 'Support',
      path: '/dashboard/support',
      icon: <HelpCircle size={20} />
    }
  ];

  return (
    <div className="dashboard-sidebar">
      <div className="sidebar-logo">
        <img src={logoImage} alt="Logo" className="logo-image" />
        <span className="logo-text">MMM</span>
      </div>
      
      <ul className="sidebar-menu">
        {navItems.map((item) => (
          <li key={item.path}>
            <Link 
              to={item.path} 
              className={`sidebar-link ${location.pathname === item.path ? 'active' : ''}`}
            >
              <span className="sidebar-icon">{item.icon}</span>
              {item.name}
            </Link>
          </li>
        ))}
        
        <li>
          <button 
            onClick={onLogout} 
            className="sidebar-link w-full text-left"
          >
            <span className="sidebar-icon"><LogOut size={20} /></span>
            Logout
          </button>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;