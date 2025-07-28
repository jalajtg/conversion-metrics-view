
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from './MetricCard';
import { Users, MessageSquare, DollarSign, CheckCircle, Calculator, BarChart3, Calendar } from 'lucide-react';
import { useNewPatients } from '@/hooks/useNewPatients';

interface TotalMetricsSectionProps {
  unifiedData?: any;
}

export function TotalMetricsSection({
  unifiedData
}: TotalMetricsSectionProps) {
  // Get new patients data from the actual database
  const { totalNewPatients, isLoading: newPatientsLoading } = useNewPatients();
  
  // Show metrics if we have any data at all, not just products
  if (!unifiedData) {
    return null;
  }

  const {
    products = [],
    leads = [],
    sales = [],
    costs = [],
    bookings = [],
    conversations = [],
    clinics = [],
    totalPaidAmount = 0 // Use the calculated prorated amount from the service
  } = unifiedData;

  // Calculate totals across all available data (only count actual leads where lead = TRUE)
  const actualLeads = leads.filter((lead: any) => lead.lead === true) || [];
  const totalLeads = actualLeads.length || 0;
  
  // Count bookings ONLY from the dedicated bookings table (not from leads)
  const totalBookings = bookings.length || 0;
  
  // Use actual new patients data from the database instead of bookings
  const newPatientsConfirmed = newPatientsLoading ? totalBookings : totalNewPatients;
  
  // Count conversations ONLY from leads where engaged = true (not from conversations table since it's empty)
  const totalEngagedConversations = actualLeads.filter((lead: any) => lead.engaged === true).length || 0;

  // Use the prorated total paid amount from the service
  const totalCostPerBooking = totalBookings > 0 ? totalPaidAmount / totalBookings : null;
  const totalCostPerLead = totalLeads > 0 ? totalPaidAmount / totalLeads : null;

  // Show the section if we have any meaningful data
  const hasData = totalLeads > 0 || totalBookings > 0 || totalEngagedConversations > 0 || newPatientsConfirmed > 0 || totalPaidAmount > 0;
  
  if (!hasData) {
    return null;
  }

  return (
    <Card className="bg-theme-dark-card border border-theme-blue/20 shadow-xl">
      <CardHeader className="border-b border-theme-blue/20 bg-theme-dark-lighter">
        <CardTitle className="text-white flex items-center gap-3">
          <div className="p-2 rounded-lg bg-theme-blue/20">
            <BarChart3 className="h-5 w-5 text-theme-blue" />
          </div>
          <div className="flex-1">
            <span className="font-semibold text-lg">Total Metrics Overview</span>
            <p className="text-sm text-gray-400 font-normal mt-1">
              Combined metrics across all available data
            </p>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-6 bg-theme-dark-lighter">
        <div className="space-y-6">
          {/* First row: Total Leads, Engaged Conversations, New Patients Confirmed, Bookings */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <MetricCard 
              title="Total Leads" 
              value={totalLeads} 
              icon={<Users className="h-4 w-4" />} 
              isHovered={true}
              className="shadow-md hover:shadow-lg transition-shadow duration-300"
            />
            <MetricCard 
              title="Engaged Conversations" 
              value={totalEngagedConversations} 
              icon={<MessageSquare className="h-4 w-4" />} 
              isHovered={true}
              className="shadow-md hover:shadow-lg transition-shadow duration-300"
            />
            <MetricCard 
              title="Bookings" 
              value={totalBookings} 
              icon={<Calendar className="h-4 w-4" />} 
              isHovered={true}
              className="shadow-md hover:shadow-lg transition-shadow duration-300"
            />
            <MetricCard 
              title="New Patients Confirmed" 
              value={newPatientsConfirmed} 
              icon={<CheckCircle className="h-4 w-4" />} 
              isHovered={true}
              className="shadow-md hover:shadow-lg transition-shadow duration-300"
            />
          </div>
          
          {/* Second row: Paid Amount, Cost per Booking, Cost per Lead */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <MetricCard 
              title="Paid Amount" 
              value={`$${totalPaidAmount.toFixed(2)}`} 
              icon={<DollarSign className="h-4 w-4" />} 
              isHovered={true}
              className="shadow-md hover:shadow-lg transition-shadow duration-300"
            />
            <MetricCard 
              title="Cost per Booking" 
              value={totalCostPerBooking !== null ? `$${totalCostPerBooking.toFixed(2)}` : 'N/A'} 
              icon={<Calculator className="h-4 w-4" />} 
              isHovered={true}
              className="shadow-md hover:shadow-lg transition-shadow duration-300"
            />
            <MetricCard 
              title="Cost per Lead" 
              value={totalCostPerLead !== null ? `$${totalCostPerLead.toFixed(2)}` : 'N/A'} 
              icon={<Calculator className="h-4 w-4" />} 
              isHovered={true}
              className="shadow-md hover:shadow-lg transition-shadow duration-300"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
