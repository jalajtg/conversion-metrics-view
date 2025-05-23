
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
}

export function MetricCard({ title, value, icon, trend, className = '' }: MetricCardProps) {
  return (
    <div className={`bg-gradient-to-br from-purple-500/80 to-purple-700 rounded-xl shadow-lg p-4 text-white ${className}`}>
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-white/80 text-sm font-medium">{title}</h3>
        {icon && <div className="text-white/70">{icon}</div>}
      </div>
      
      <div className="text-2xl font-bold mb-1">{value}</div>
      
      {trend && (
        <div className="flex items-center gap-1 text-xs">
          <span className={trend.isPositive ? 'text-green-300' : 'text-red-300'}>
            {trend.isPositive ? '↑' : '↓'} {trend.value}%
          </span>
          <span className="text-white/60">vs last month</span>
        </div>
      )}
    </div>
  );
}
