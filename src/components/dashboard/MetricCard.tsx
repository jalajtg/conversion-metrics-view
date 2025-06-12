
import React, { useState, useEffect } from 'react';

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
  const [animatedValue, setAnimatedValue] = useState(0);

  useEffect(() => {
    // Animation for numeric values
    if (typeof value === 'number') {
      let startTime: number;
      const duration = 1000; // 1 second animation
      
      const animate = (currentTime: number) => {
        if (!startTime) startTime = currentTime;
        const progress = Math.min((currentTime - startTime) / duration, 1);
        
        // Easing function for smooth animation
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        setAnimatedValue(Math.floor(value * easeOutQuart));
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      
      requestAnimationFrame(animate);
    } else if (typeof value === 'string' && value.startsWith('$')) {
      // Handle currency values
      const numericValue = parseFloat(value.replace('$', ''));
      if (!isNaN(numericValue)) {
        let startTime: number;
        const duration = 1000;
        
        const animate = (currentTime: number) => {
          if (!startTime) startTime = currentTime;
          const progress = Math.min((currentTime - startTime) / duration, 1);
          
          const easeOutQuart = 1 - Math.pow(1 - progress, 4);
          const currentValue = numericValue * easeOutQuart;
          setAnimatedValue(currentValue);
          
          if (progress < 1) {
            requestAnimationFrame(animate);
          }
        };
        
        requestAnimationFrame(animate);
      }
    }
  }, [value]);

  const displayValue = () => {
    if (typeof value === 'number') {
      return animatedValue;
    } else if (typeof value === 'string' && value.startsWith('$')) {
      return `$${animatedValue.toFixed(2)}`;
    }
    return value;
  };

  return (
    <div 
      className={`
        transition-all duration-300 rounded-xl shadow-sm p-6 card-glow relative overflow-hidden
        ${isHovered 
          ? 'bg-gradient-to-br from-theme-blue/30 to-theme-blue/10 text-white shadow-lg shadow-theme-blue/20 border border-theme-blue/40' 
          : 'bg-gradient-to-br from-theme-dark-lighter to-theme-dark-card text-white'
        }
        ${className}
      `}
    >
      {/* Animated background glow for highlighted cards */}
      {isHovered && (
        <div className="absolute inset-0 bg-gradient-to-br from-theme-blue/20 via-transparent to-theme-blue/5 animate-pulse-glow"></div>
      )}
      
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-2">
          <h3 className={`transition-colors duration-300 ${
            isHovered ? 'text-white' : 'text-gray-300'
          } text-sm font-medium`}>{title}</h3>
          {icon && <div className={`transition-colors duration-300 ${
            isHovered ? 'text-theme-blue-light' : 'text-gray-400'
          }`}>{icon}</div>}
        </div>
        
        <div className={`text-2xl font-bold mb-1 transition-all duration-300 ${
          isHovered ? 'transform text-theme-blue-light' : 'text-white'
        }`}>
          {displayValue()}
        </div>
        
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
    </div>
  );
}
