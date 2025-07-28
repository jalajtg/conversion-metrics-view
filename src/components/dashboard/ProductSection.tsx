import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { MetricCard } from './MetricCard';
import { Calculator, Users, MessageSquare, DollarSign, Calendar, CheckCircle } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import type { ProductMetrics } from '@/types/dashboard';

// Helper function to get month name
const getMonthName = (monthNumber: number): string => {
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];
  return months[monthNumber - 1] || 'Unknown';
};

interface ProductSectionProps {
  metrics: ProductMetrics | null;
  unifiedData?: any;
}

export function ProductSection({ metrics, unifiedData }: ProductSectionProps) {
  const isMobile = useIsMobile();
  const [openItem, setOpenItem] = useState<string>("0"); // Default first item open

  // If we have unified data, process it to create metrics
  if (unifiedData && !metrics) {
    const { products, leads, sales, costs, bookings } = unifiedData;
    
    if (!products || products.length === 0) {
      return null;
    }
    console.log('Products:', products, leads, sales, costs, bookings);

    const productSections = products.map((product: any, index: number) => {
      // Filter leads by matching direct ID, old product IDs, and automation codes (only count leads where lead = TRUE)
      const productLeads = leads?.filter((lead: any) => {
        // Only count actual leads (where lead = TRUE)
        if (!lead.lead) return false;
        
        // Ensure clinic match for all cases
        if (lead.clinic_id !== product.clinic_id) return false;
        
        // Check if lead date matches product month/year (if product has month specified)
        if (product.month) {
          const leadDate = new Date(lead.created_at);
          const leadMonth = leadDate.getMonth() + 1; // getMonth() returns 0-11
          const leadYear = leadDate.getFullYear();
          
          // For clinic_product_categories, we need to match the specific month
          // Since the product is tied to a specific month, only count leads from that month
          if (leadMonth !== product.month) return false;
          
          // Also check year if we're dealing with historical data
          // For now, assume current year context, but this could be made more flexible
          const currentYear = new Date().getFullYear();
          if (leadYear !== currentYear) return false;
        }
        
        // First try direct ID match (for any updated records)
        if (lead.product_id === product.id) return true;
        
        // Then try to match using old product IDs mapping
        if (product.oldProductIds && product.oldProductIds.includes(lead.product_id)) {
          return true;
        }
        
        // Finally, try to match by automation code, clinic, and date
        if (lead.automation && product.automationCodes && 
            product.automationCodes.includes(lead.automation)) {
          return true;
        }
        
        return false;
      }) || [];
      
      const productSales = sales?.filter((sale: any) => sale.product_id === product.id) || [];
      const productCosts = costs?.filter((cost: any) => cost.product_id === product.id) || [];
      
      // Count engaged conversations directly from leads where engaged: true
      const engagedConversationsCount = productLeads.filter((lead: any) => lead.engaged === true).length;
      
      // Count bookings from both the bookings table and leads where booked: true
      const bookingsFromTable = bookings.filter((booking: any) => booking.product_id === product.id).length;
      const bookingsFromLeads = productLeads.filter((lead: any) => lead.booked === true).length;
      const productBookings = bookingsFromTable + bookingsFromLeads;

      // No longer calculating individual product prices - paid amount comes from clinic level
      const paidAmount = 0;
      
      const totalCosts = productCosts.reduce((sum: number, cost: any) => sum + (cost.amount || 0), 0);
      
      const verbalAppointments = 0;

      const productMetrics: ProductMetrics = {
        product,
        leadCount: productLeads.length,
        conversationCount: engagedConversationsCount,
        paidAmount,
        verbalAppointments,
        bookings: productBookings,
        costPerBooking: productBookings > 0 ? paidAmount / productBookings : 0,
        costPerLead: productLeads.length > 0 ? paidAmount / productLeads.length : 0,
      };

      return { metrics: productMetrics, index };
    });

    // Mobile accordion layout
    if (isMobile) {
      return (
        <div className="space-y-4 sm:space-y-6">
          <Accordion 
            type="single" 
            value={openItem} 
            onValueChange={setOpenItem}
            className="space-y-4"
          >
            {productSections.map(({ metrics, index }) => (
              <AccordionItem 
                key={metrics.product.id} 
                value={index.toString()}
                className="border border-gray-700/50 rounded-xl bg-gradient-to-br from-theme-dark-card to-theme-dark-lighter"
              >
                <AccordionTrigger className="px-4 py-3 hover:no-underline">
                  <div className="flex items-center gap-3 w-full">
                    <div className="p-2 rounded-lg bg-theme-blue/10">
                      <Calculator className="h-4 w-4 text-theme-blue" />
                    </div>
                    <div className="flex-1 text-left">
                      <span className="text-sm font-medium text-white">
                        {metrics.product.name}
                        {metrics.product.month && (
                          <span className="ml-2 text-xs text-gray-400 bg-gray-700/50 px-2 py-1 rounded">
                            {getMonthName(metrics.product.month)}
                          </span>
                        )}
                      </span>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <ProductContent metrics={metrics} />
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      );
    }

    // Desktop layout (unchanged)
    return (
      <div className="space-y-4 sm:space-y-6">
        {productSections.map(({ metrics }) => (
          <SingleProductSection key={metrics.product.id} metrics={metrics} />
        ))}
      </div>
    );
  }

  // Fallback to original behavior if metrics are provided
  if (metrics) {
    return <SingleProductSection metrics={metrics} />;
  }

  return null;
}

// Extract product content for reuse
function ProductContent({ metrics }: { metrics: ProductMetrics }) {
  return (
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
      
    </div>
  );
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
            <div className="flex-1">
              <span className="text-sm sm:text-base font-medium truncate">{product.name}</span>
              {product.month && (
                <div className="flex items-center gap-2 mt-1">
                  <Calendar className="h-3 w-3 text-gray-400" />
                  <span className="text-xs text-gray-400 bg-gray-700/50 px-2 py-1 rounded">
                    {getMonthName(product.month)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </CardTitle>
        {product.description && (
          <p className="text-gray-400 text-xs sm:text-sm mt-1 line-clamp-2">{product.description}</p>
        )}
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        <ProductContent metrics={metrics} />
      </CardContent>
    </Card>
  );
}
