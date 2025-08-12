import React from 'react';

interface DashboardCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
  isClickable?: boolean;
  onClick?: () => void;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
}

const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  value,
  icon,
  color,
  isClickable = false,
  onClick,
  change,
  changeType = 'neutral'
}) => {
  return (
    <div 
      className={`glass-card p-6 card-hover ${isClickable ? 'cursor-pointer' : ''}`} 
      onClick={isClickable ? onClick : undefined}
    >
      <div className="flex justify-between items-start mb-4">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${color} flex items-center justify-center`}>
          {icon}
        </div>
      </div>
      <h3 className="text-white/60 text-sm font-medium mb-2">{title}</h3>
      <p className="text-2xl font-bold mb-2">{value}</p>
      {change && (
        <div className={`flex items-center text-sm ${
          changeType === 'positive' ? 'text-green-400' : 
          changeType === 'negative' ? 'text-red-400' : 'text-white/60'
        }`}>
          {change}
        </div>
      )}
    </div>
  );
};

export default DashboardCard;