import { automationToProductCategoryMap } from "@/constants/automationMapping";
import type { DashboardFilters } from "@/types/dashboard";

// Central service for standardized metrics calculations
export interface StandardizedMetrics {
  totalLeads: number;
  totalEngagedConversations: number;
  totalBookings: number;
  leadsByProduct: Array<{
    productId: string;
    productName: string;
    productMonth?: number;
    leadCount: number;
    engagedCount: number;
    bookingCount: number;
    automationCodes: string[];
  }>;
}

// Standardized lead definition: only records where lead = TRUE count as actual leads
export const isActualLead = (lead: any): boolean => {
  return lead.lead === true;
};

// Standardized engaged conversation definition: engaged = TRUE (regardless of lead status)
export const isEngagedConversation = (lead: any): boolean => {
  return lead.engaged === true;
};

// Standardized booking definition: booked = TRUE AND lead = TRUE
export const isActualBooking = (lead: any): boolean => {
  return lead.booked === true && lead.lead === true;
};

// Check if a lead matches a product based on multiple criteria
export const doesLeadMatchProduct = (lead: any, product: any): boolean => {
  // Ensure clinic match for all cases
  if (lead.clinic_id !== product.clinic_id) return false;
  
  // Check if lead date matches product month/year (if product has month specified)
  if (product.month) {
    const leadDate = new Date(lead.created_at);
    const leadMonth = leadDate.getMonth() + 1; // getMonth() returns 0-11
    const leadYear = leadDate.getFullYear();
    
    // For clinic_product_categories, we need to match the specific month
    if (leadMonth !== product.month) return false;
    
    // For now, assume current year context
    const currentYear = new Date().getFullYear();
    if (leadYear !== currentYear) return false;
  }
  
  // First try direct ID match (for any updated records)
  if (lead.product_id === product.id) return true;
  
  // Then try to match using old product IDs mapping
  if (product.oldProductIds && product.oldProductIds.includes(lead.product_id)) {
    return true;
  }
  
  // Finally, try to match by automation code
  if (lead.automation && product.automationCodes && 
      product.automationCodes.includes(lead.automation)) {
    return true;
  }
  
  return false;
};

// Apply date and clinic filters to leads
export const applyFiltersToLeads = (leads: any[], filters: DashboardFilters): any[] => {
  return leads.filter((lead: any) => {
    // Apply date filtering if we have filter criteria
    if (filters.selectedMonths?.length > 0 && filters.year) {
      const leadDate = new Date(lead.created_at);
      const leadMonth = leadDate.getMonth() + 1;
      const leadYear = leadDate.getFullYear();
      
      if (!filters.selectedMonths.includes(leadMonth) || leadYear !== filters.year) {
        return false;
      }
    }
    
    // Apply clinic filtering if we have clinic criteria
    if (filters.clinicIds?.length > 0) {
      if (!filters.clinicIds.includes(lead.clinic_id)) {
        return false;
      }
    }
    
    return true;
  });
};

// Calculate standardized metrics for the dashboard
export const calculateStandardizedMetrics = (
  unifiedData: any, 
  filters?: any
): StandardizedMetrics => {
  const {
    products = [],
    leads = []
  } = unifiedData;

  // Apply filters to leads
  const appliedFilters = filters?.appliedFilters || filters;
  const filteredLeads = appliedFilters ? applyFiltersToLeads(leads, appliedFilters) : leads;
  
  // Calculate total metrics using standardized definitions
  const actualLeads = filteredLeads.filter(isActualLead);
  const totalLeads = actualLeads.length;
  
  const totalEngagedConversations = filteredLeads.filter(isEngagedConversation).length;
  
  const totalBookings = filteredLeads.filter(isActualBooking).length;
  
  // Calculate metrics by product
  const leadsByProduct = products.map((product: any) => {
    // Filter leads that match this product
    const productLeads = filteredLeads.filter((lead: any) => 
      doesLeadMatchProduct(lead, product)
    );
    
    // Count actual leads, engaged conversations, and bookings for this product
    const actualProductLeads = productLeads.filter(isActualLead);
    const engagedProductLeads = productLeads.filter(isEngagedConversation);
    const bookedProductLeads = productLeads.filter(isActualBooking);
    
    return {
      productId: product.id,
      productName: product.name,
      productMonth: product.month,
      leadCount: actualProductLeads.length,
      engagedCount: engagedProductLeads.length,
      bookingCount: bookedProductLeads.length,
      automationCodes: product.automationCodes || []
    };
  });

  return {
    totalLeads,
    totalEngagedConversations,
    totalBookings,
    leadsByProduct
  };
};

// Debug function to analyze lead distribution
export const debugLeadDistribution = (unifiedData: any, filters?: any) => {
  const { leads = [] } = unifiedData;
  const appliedFilters = filters?.appliedFilters || filters;
  const filteredLeads = appliedFilters ? applyFiltersToLeads(leads, appliedFilters) : leads;
  
  console.log('=== LEAD DISTRIBUTION DEBUG ===');
  console.log('Total filtered leads:', filteredLeads.length);
  console.log('Actual leads (lead=true):', filteredLeads.filter(isActualLead).length);
  console.log('Engaged conversations (engaged=true):', filteredLeads.filter(isEngagedConversation).length);
  console.log('Actual bookings (lead=true AND booked=true):', filteredLeads.filter(isActualBooking).length);
  
  // Group by automation code
  const automationGroups = filteredLeads.reduce((acc: any, lead: any) => {
    const code = lead.automation || 'UNKNOWN';
    if (!acc[code]) acc[code] = { total: 0, actualLeads: 0, engaged: 0, booked: 0 };
    acc[code].total++;
    if (isActualLead(lead)) acc[code].actualLeads++;
    if (isEngagedConversation(lead)) acc[code].engaged++;
    if (isActualBooking(lead)) acc[code].booked++;
    return acc;
  }, {});
  
  console.log('By automation code:', automationGroups);
  
  return {
    totalFiltered: filteredLeads.length,
    actualLeads: filteredLeads.filter(isActualLead).length,
    engagedConversations: filteredLeads.filter(isEngagedConversation).length,
    actualBookings: filteredLeads.filter(isActualBooking).length,
    automationGroups
  };
};