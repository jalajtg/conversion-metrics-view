
import React, { useState } from 'react';
import { MetricCard } from './MetricCard';
import { ProductMetrics } from '@/types/dashboard';
import { Users, MessageSquare, DollarSign, Calendar, BookOpen, TrendingUp } from 'lucide-react';

interface ProductSectionProps {
  metrics: ProductMetrics;
}

export function ProductSection({ metrics }: ProductSectionProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  return (
    <div 
      className={`mb-8 rounded-xl p-6 transition-all duration-300 ${
        isHovered 
          ? 'bg-theme-dark-lighter border border-theme-blue/20 shadow-lg shadow-theme-blue/5' 
          : 'bg-theme-dark-card border border-gray-800'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4">
        <div>
          <h2 className={`text-2xl font-bold transition-colors ${
            isHovered ? 'text-theme-blue-light' : 'text-white'
          }`}>{metrics.product.name}</h2>
          <p className={`transition-colors duration-300 ${
            isHovered ? 'text-gray-300' : 'text-gray-400'
          }`}>
            {metrics.product.description}
          </p>
        </div>
        <div className={`mt-2 md:mt-0 px-3 py-1 rounded-full text-xs font-medium ${
          isHovered ? 'bg-theme-blue/20 text-theme-blue-light' : 'bg-theme-dark bg-opacity-50 text-gray-400'
        }`}>
          Product Performance
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard 
          title="Leads" 
          value={metrics.leadCount} 
          icon={<Users size={18} />}
          trend={{ value: 12, isPositive: true }}
          isHovered={isHovered}
        />
        
        <MetricCard 
          title="Conversations" 
          value={metrics.conversationCount} 
          icon={<MessageSquare size={18} />}
          trend={{ value: 5, isPositive: true }}
          isHovered={isHovered}
        />
        
        <MetricCard 
          title="Paid Amount" 
          value={formatCurrency(metrics.paidAmount)} 
          icon={<DollarSign size={18} />}
          trend={{ value: 8, isPositive: true }}
          isHovered={isHovered}
        />
        
        <MetricCard 
          title="Verbal Appointments" 
          value={metrics.verbalAppointments} 
          icon={<Calendar size={18} />}
          trend={{ value: 3, isPositive: false }}
          isHovered={isHovered}
        />
        
        <MetricCard 
          title="Bookings" 
          value={metrics.bookings} 
          icon={<BookOpen size={18} />}
          trend={{ value: 15, isPositive: true }}
          isHovered={isHovered}
        />
        
        <MetricCard 
          title="Cost per Booking" 
          value={formatCurrency(metrics.costPerBooking)} 
          icon={<TrendingUp size={18} />}
          trend={{ value: 2, isPositive: false }}
          isHovered={isHovered}
        />
        
        <MetricCard 
          title="Cost per Lead" 
          value={formatCurrency(metrics.costPerLead)} 
          icon={<TrendingUp size={18} />}
          trend={{ value: 4, isPositive: true }}
          isHovered={isHovered}
        />
      </div>
    </div>
  );
}
