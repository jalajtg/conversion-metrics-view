
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
        transition-all duration-300 rounded-xl shadow-sm p-4 card-glow
        ${isHovered 
          ? 'bg-gradient-to-br from-theme-blue/20 to-theme-dark-card text-white shadow-lg shadow-theme-blue/10' 
          : 'bg-theme-dark-card text-white'
        }
        ${className}
      `}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className={`transition-colors duration-300 ${
          isHovered ? 'text-white' : 'text-gray-300'
        } text-sm font-medium`}>{title}</h3>
        {icon && <div className={`transition-colors duration-300 ${
          isHovered ? 'text-theme-blue' : 'text-gray-400'
        }`}>{icon}</div>}
      </div>
      
      <div className={`text-2xl font-bold mb-1 transition-all duration-300 ${
        isHovered ? 'scale-105 transform text-theme-blue-light' : 'text-white'
      }`}>{value}</div>
      
      {trend && (
        <div className="flex items-center gap-1 text-xs">
          <span className={`transition-colors duration-300 ${
            trend.isPositive 
              ? (isHovered ? 'text-green-400' : 'text-green-500') 
              : (isHovered ? 'text-red-400' : 'text-red-500')
          }`}>
            {trend.isPositive ? '↑' : '↓'} {trend.value}%
          </span>
          <span className={`transition-colors duration-300 ${
            isHovered ? 'text-gray-300' : 'text-gray-400'
          }`}>vs last month</span>
        </div>
      )}
    </div>
  );
}
