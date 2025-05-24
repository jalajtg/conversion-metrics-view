
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
    const { products, leads, sales, costs, conversations, appointments } = unifiedData;
    
    if (!products || products.length === 0) {
      return null;
    }

    return (
      <div className="space-y-6">
        {products.map((product: any) => {
          const productLeads = leads?.filter((lead: any) => lead.product_id === product.id) || [];
          const productSales = sales?.filter((sale: any) => sale.product_id === product.id) || [];
          const productCosts = costs?.filter((cost: any) => cost.product_id === product.id) || [];
          const productConversations = conversations?.filter((conv: any) => 
            productLeads.some((lead: any) => lead.id === conv.lead_id)
          ) || [];
          const productAppointments = appointments?.filter((apt: any) => 
            productLeads.some((lead: any) => lead.id === apt.lead_id)
          ) || [];

          const totalSales = productSales.reduce((sum: number, sale: any) => sum + (sale.amount || 0), 0);
          const totalCosts = productCosts.reduce((sum: number, cost: any) => sum + (cost.amount || 0), 0);
          const verbalAppointments = productAppointments.filter((apt: any) => apt.type === 'verbal').length;
          const bookings = productAppointments.filter((apt: any) => apt.type === 'booking').length;

          const productMetrics: ProductMetrics = {
            product,
            leadCount: productLeads.length,
            conversationCount: productConversations.length,
            paidAmount: totalSales,
            verbalAppointments,
            bookings,
            costPerBooking: bookings > 0 ? totalCosts / bookings : 0,
            costPerLead: productLeads.length > 0 ? totalCosts / productLeads.length : 0,
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
      <CardHeader className="border-b border-gray-700/50">
        <CardTitle className="text-white flex items-center gap-3">
          <div className="p-2 rounded-lg bg-theme-blue/10">
            <Calculator className="h-5 w-5 text-theme-blue" />
          </div>
          {product.name}
          <span className="ml-auto text-sm font-normal text-gray-400">
            ${product.price}
          </span>
        </CardTitle>
        {product.description && (
          <p className="text-gray-400 text-sm">{product.description}</p>
        )}
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <MetricCard
            title="Total Leads"
            value={metrics.leadCount}
            icon={<Users className="h-4 w-4" />}
            color="blue"
          />
          <MetricCard
            title="Conversations"
            value={metrics.conversationCount}
            icon={<MessageSquare className="h-4 w-4" />}
            color="green"
          />
          <MetricCard
            title="Paid Amount"
            value={`$${metrics.paidAmount.toFixed(2)}`}
            icon={<DollarSign className="h-4 w-4" />}
            color="yellow"
          />
          <MetricCard
            title="Verbal Appointments"
            value={metrics.verbalAppointments}
            icon={<Calendar className="h-4 w-4" />}
            color="purple"
          />
          <MetricCard
            title="Bookings"
            value={metrics.bookings}
            icon={<CheckCircle className="h-4 w-4" />}
            color="orange"
          />
          <MetricCard
            title="Cost per Lead"
            value={`$${metrics.costPerLead.toFixed(2)}`}
            icon={<Calculator className="h-4 w-4" />}
            color="red"
          />
        </div>
      </CardContent>
    </Card>
  );
}
