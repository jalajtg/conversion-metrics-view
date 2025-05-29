
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from './MetricCard';
import { Calculator, Users, MessageSquare, DollarSign, Calendar, CheckCircle } from 'lucide-react';
import type { ProductMetrics } from '@/types/dashboard';

interface ProductSectionProps {
  metrics: ProductMetrics | null;
  unifiedData?: any;
}

export function ProductSection({ metrics, unifiedData }: ProductSectionProps) {
  // If we have unified data, process it to create metrics
  if (unifiedData && !metrics) {
    const { products, leads, sales, costs } = unifiedData;
    
    if (!products || products.length === 0) {
      return null;
    }

    return (
      <div className="space-y-4 sm:space-y-6">
        {products.map((product: any) => {
          const productLeads = leads?.filter((lead: any) => lead.product_id === product.id) || [];
          const productSales = sales?.filter((sale: any) => sale.product_id === product.id) || [];
          const productCosts = costs?.filter((cost: any) => cost.product_id === product.id) || [];
          
          // Count engaged conversations directly from leads where engaged: true
          const engagedConversationsCount = productLeads.filter((lead: any) => lead.engaged === true).length;
          
          // Count bookings from leads where booked: true
          const bookings = productLeads.filter((lead: any) => lead.booked === true).length;

          // Paid amount is simply the product price
          const paidAmount = product.price;
          
          const totalCosts = productCosts.reduce((sum: number, cost: any) => sum + (cost.amount || 0), 0);
          
          const verbalAppointments = 0;

          const productMetrics: ProductMetrics = {
            product,
            leadCount: productLeads.length,
            conversationCount: engagedConversationsCount,
            paidAmount,
            verbalAppointments,
            bookings,
            costPerBooking: bookings > 0 ? paidAmount / bookings : 0,
            costPerLead: productLeads.length > 0 ? paidAmount / productLeads.length : 0,
          };

          return <SingleProductSection key={product.id} metrics={productMetrics} />;
        })}
      </div>
    );
  }

  // Fallback to original behavior if metrics are provided
  if (metrics) {
    return <SingleProductSection metrics={metrics} />;
  }

  return null;
}

function SingleProductSection({ metrics }: { metrics: ProductMetrics }) {
  const { product } = metrics;

  return (
    <Card className="bg-gradient-to-br from-theme-dark-card to-theme-dark-lighter border border-gray-700/50 shadow-2xl">
      <CardHeader className="border-b border-gray-700/50 p-4 sm:p-6">
        <CardTitle className="text-white flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-2 rounded-lg bg-theme-blue/10">
              <Calculator className="h-4 w-4 sm:h-5 sm:w-5 text-theme-blue" />
            </div>
            <span className="text-sm sm:text-base font-medium truncate">{product.name}</span>
          </div>
          <span className="text-xs sm:text-sm font-normal text-gray-400 sm:ml-auto">
            ${product.price}
          </span>
        </CardTitle>
        {product.description && (
          <p className="text-gray-400 text-xs sm:text-sm mt-1 line-clamp-2">{product.description}</p>
        )}
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        <div className="space-y-3 sm:space-y-4">
          {/* First row: Total Leads, Engaged Conversations, Bookings */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4">
            <MetricCard
              title="Total Leads"
              value={metrics.leadCount}
              icon={<Users className="h-3 w-3 sm:h-4 sm:w-4" />}
            />
            <MetricCard
              title="Engaged Conversations"
              value={metrics.conversationCount}
              icon={<MessageSquare className="h-3 w-3 sm:h-4 sm:w-4" />}
            />
            <MetricCard
              title="Bookings"
              value={metrics.bookings}
              icon={<CheckCircle className="h-3 w-3 sm:h-4 sm:w-4" />}
            />
          </div>
          
          {/* Second row: Paid Amount, Cost per Booking, Cost per Lead */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4">
            <MetricCard
              title="Paid Amount"
              value={`$${metrics.paidAmount.toFixed(2)}`}
              icon={<DollarSign className="h-3 w-3 sm:h-4 sm:w-4" />}
            />
            <MetricCard
              title="Cost per Booking"
              value={`$${metrics.costPerBooking.toFixed(2)}`}
              icon={<Calculator className="h-3 w-3 sm:h-4 sm:w-4" />}
            />
            <MetricCard
              title="Cost per Lead"
              value={`$${metrics.costPerLead.toFixed(2)}`}
              icon={<Calculator className="h-3 w-3 sm:h-4 sm:w-4" />}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
