import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from './MetricCard';
import { Users, MessageSquare, DollarSign, CheckCircle, Calculator, BarChart3 } from 'lucide-react';
interface TotalMetricsSectionProps {
  unifiedData?: any;
}
export function TotalMetricsSection({
  unifiedData
}: TotalMetricsSectionProps) {
  if (!unifiedData || !unifiedData.products || unifiedData.products.length === 0) {
    return null;
  }
  const {
    products,
    leads,
    sales,
    costs
  } = unifiedData;

  // Calculate totals across all products
  const totalLeads = leads?.length || 0;

  // Count engaged conversations from leads where engaged: true
  const totalEngagedConversations = leads?.filter((lead: any) => lead.engaged === true).length || 0;

  // Count bookings from leads where booked: true
  const totalBookings = leads?.filter((lead: any) => lead.booked === true).length || 0;
  const totalPaidAmount = sales?.reduce((sum: number, sale: any) => sum + (sale.amount || 0), 0) || 0;
  const totalCosts = costs?.reduce((sum: number, cost: any) => sum + (cost.amount || 0), 0) || 0;
  const totalCostPerBooking = totalBookings > 0 ? totalCosts / totalBookings : 0;
  const totalCostPerLead = totalLeads > 0 ? totalCosts / totalLeads : 0;
  return <Card className="bg-theme-dark-card border border-theme-blue/20 shadow-xl relative overflow-hidden">
      {/* Subtle blue glow effect background */}
      <div className="absolute inset-0 bg-gradient-to-br from-theme-blue/5 via-transparent to-theme-blue/10 opacity-60"></div>
      
      <CardHeader className="border-b border-theme-blue/20 relative z-10 bg-slate-800">
        <CardTitle className="text-white flex items-center gap-3">
          <div className="p-2 rounded-lg bg-theme-blue/20 shadow-lg">
            <BarChart3 className="h-5 w-5 text-theme-blue" />
          </div>
          <span className="font-semibold">Total Metrics Overview</span>
          <span className="ml-auto text-sm font-normal text-gray-400">
            {products.length} Product{products.length !== 1 ? 's' : ''}
          </span>
        </CardTitle>
        <p className="text-sm text-gray-400 relative z-10">Combined metrics across all selected products</p>
      </CardHeader>
      
      <CardContent className="p-6 relative z-10 bg-slate-800">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <MetricCard title="Total Leads" value={totalLeads} icon={<Users className="h-4 w-4" />} isHovered={true} />
          <MetricCard title="Engaged Conversations" value={totalEngagedConversations} icon={<MessageSquare className="h-4 w-4" />} isHovered={true} />
          <MetricCard title="Paid Amount" value={`$${totalPaidAmount.toFixed(2)}`} icon={<DollarSign className="h-4 w-4" />} isHovered={true} />
          <MetricCard title="Bookings" value={totalBookings} icon={<CheckCircle className="h-4 w-4" />} isHovered={true} />
          <MetricCard title="Cost per Booking" value={`$${totalCostPerBooking.toFixed(2)}`} icon={<Calculator className="h-4 w-4" />} isHovered={true} />
          <MetricCard title="Cost per Lead" value={`$${totalCostPerLead.toFixed(2)}`} icon={<Calculator className="h-4 w-4" />} isHovered={true} />
        </div>
      </CardContent>
    </Card>;
}