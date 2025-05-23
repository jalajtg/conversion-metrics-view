
import React from 'react';
import { MetricCard } from './MetricCard';
import { ProductMetrics } from '@/types/dashboard';
import { Users, MessageSquare, DollarSign, Calendar, BookOpen, TrendingUp } from 'lucide-react';

interface ProductSectionProps {
  metrics: ProductMetrics;
}

export function ProductSection({ metrics }: ProductSectionProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold mb-4">{metrics.product.name}</h2>
      <p className="text-gray-500 mb-6">{metrics.product.description}</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard 
          title="Leads" 
          value={metrics.leadCount} 
          icon={<Users size={18} />}
          trend={{ value: 12, isPositive: true }}
        />
        
        <MetricCard 
          title="Conversations" 
          value={metrics.conversationCount} 
          icon={<MessageSquare size={18} />}
          trend={{ value: 5, isPositive: true }}
        />
        
        <MetricCard 
          title="Paid Amount" 
          value={formatCurrency(metrics.paidAmount)} 
          icon={<DollarSign size={18} />}
          trend={{ value: 8, isPositive: true }}
        />
        
        <MetricCard 
          title="Verbal Appointments" 
          value={metrics.verbalAppointments} 
          icon={<Calendar size={18} />}
          trend={{ value: 3, isPositive: false }}
        />
        
        <MetricCard 
          title="Bookings" 
          value={metrics.bookings} 
          icon={<BookOpen size={18} />}
          trend={{ value: 15, isPositive: true }}
        />
        
        <MetricCard 
          title="Cost per Booking" 
          value={formatCurrency(metrics.costPerBooking)} 
          icon={<TrendingUp size={18} />}
          trend={{ value: 2, isPositive: false }}
        />
        
        <MetricCard 
          title="Cost per Lead" 
          value={formatCurrency(metrics.costPerLead)} 
          icon={<TrendingUp size={18} />}
          trend={{ value: 4, isPositive: true }}
        />
      </div>
    </div>
  );
}
