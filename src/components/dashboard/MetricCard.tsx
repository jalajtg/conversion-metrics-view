
import React from 'react';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
  isHovered?: boolean;
}

export function MetricCard({ 
  title, 
  value, 
  icon, 
  trend, 
  className = '',
  isHovered = false
}: MetricCardProps) {
  return (
    <div 
      className={`
        transition-all duration-300 rounded-xl shadow-sm p-4 
        ${isHovered 
          ? 'bg-gradient-to-br from-purple-600/90 to-purple-800 text-white' 
          : 'bg-gradient-to-br from-purple-500/80 to-purple-700 text-white'
        }
        ${className}
      `}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className={`transition-colors duration-300 ${
          isHovered ? 'text-white/90' : 'text-white/80'
        } text-sm font-medium`}>{title}</h3>
        {icon && <div className={`transition-colors duration-300 ${
          isHovered ? 'text-white/90' : 'text-white/70'
        }`}>{icon}</div>}
      </div>
      
      <div className={`text-2xl font-bold mb-1 transition-all duration-300 ${
        isHovered ? 'scale-105 transform' : ''
      }`}>{value}</div>
      
      {trend && (
        <div className="flex items-center gap-1 text-xs">
          <span className={`transition-colors duration-300 ${
            trend.isPositive 
              ? (isHovered ? 'text-green-200' : 'text-green-300') 
              : (isHovered ? 'text-red-200' : 'text-red-300')
          }`}>
            {trend.isPositive ? '↑' : '↓'} {trend.value}%
          </span>
          <span className={`transition-colors duration-300 ${
            isHovered ? 'text-white/80' : 'text-white/60'
          }`}>vs last month</span>
        </div>
      )}
    </div>
  );
}
