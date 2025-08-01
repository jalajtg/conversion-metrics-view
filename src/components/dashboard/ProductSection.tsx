import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { MetricCard } from './MetricCard';
import { Calculator, Users, MessageSquare, DollarSign, Calendar, CheckCircle } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import type { ProductMetrics } from '@/types/dashboard';
import { calculateStandardizedMetrics } from '@/services/metricsCalculationService';

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
    const { products } = unifiedData;
    
    if (!products || products.length === 0) {
      return null;
    }

    // Use standardized metrics calculation
    const standardizedMetrics = calculateStandardizedMetrics(unifiedData);

    const productSections = standardizedMetrics.leadsByProduct.map((productMetrics, index) => {
      // Find the corresponding product object
      const product = products.find((p: any) => p.id === productMetrics.productId);
      if (!product) return null;

      const metrics: ProductMetrics = {
        product,
        leadCount: productMetrics.leadCount,
        conversationCount: productMetrics.engagedCount,
        paidAmount: 0, // No longer calculating individual product prices
        verbalAppointments: 0,
        bookings: productMetrics.bookingCount,
        costPerBooking: 0,
        costPerLead: 0,
      };

      return { metrics, index };
    }).filter(Boolean);

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
