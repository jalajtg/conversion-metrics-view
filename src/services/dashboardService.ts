
import { supabase } from "@/integrations/supabase/client";
import { 
  Product, 
  Lead, 
  Conversation, 
  Appointment, 
  Sale, 
  Cost,
  ProductMetrics,
  DashboardFilters
} from "@/types/dashboard";

const getDateRanges = (selectedMonths: number[], year: number) => {
  if (!selectedMonths || selectedMonths.length === 0) {
    // If no months selected, use whole year
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31, 23, 59, 59);
    return [{ startDate: startDate.toISOString(), endDate: endDate.toISOString() }];
  }
  
  return selectedMonths.map(month => {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);
    return { startDate: startDate.toISOString(), endDate: endDate.toISOString() };
  });
};

export const fetchProducts = async (clinicIds: string[], filters: DashboardFilters): Promise<Product[]> => {
  if (clinicIds.length === 0) return [];
  
  console.log('Fetching products with filters:', filters);
  
  let query = supabase
    .from("clinic_product_categories")
    .select(`
      id,
      price,
      clinic_id,
      created_at,
      month,
      product_category:product_category_id (
        id,
        name,
        description
      )
    `)
    .in("clinic_id", clinicIds);

  // Filter by selected months if provided and not all months
  if (filters.selectedMonths && filters.selectedMonths.length > 0 && filters.selectedMonths.length < 12) {
    query = query.in("month", filters.selectedMonths);
    console.log('Filtering by months:', filters.selectedMonths);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error("Error fetching clinic product categories:", error);
    return [];
  }
  
  console.log('Products fetched:', data?.length || 0);
  
  // Transform the data to match the Product interface
  return (data || []).map(item => ({
    id: item.id,
    name: item.product_category?.name || 'Unknown Product',
    description: item.product_category?.description || '',
    price: Number(item.price),
    clinic_id: item.clinic_id,
    created_at: item.created_at,
    month: item.month
  }));
};

export const fetchLeadsByProduct = async (productId: string, filters: DashboardFilters): Promise<Lead[]> => {
  const dateRanges = getDateRanges(filters.selectedMonths, filters.year);
  if (dateRanges.length === 0) return [];
  
  // Build query with multiple date ranges
  let query = supabase.from("leads").select("*").eq("product_id", productId);
  
  if (dateRanges.length === 1) {
    // Single date range
    const { startDate, endDate } = dateRanges[0];
    query = query.gte('created_at', startDate).lte('created_at', endDate);
  } else {
    // Multiple date ranges - use OR conditions
    const dateConditions = dateRanges.map(range => 
      `and(created_at.gte.${range.startDate},created_at.lte.${range.endDate})`
    ).join(',');
    
    if (dateConditions) {
      query = query.or(dateConditions);
    }
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error(`Error fetching leads for product ${productId}:`, error);
    return [];
  }
  
  return data || [];
};

export const fetchConversationsByLeads = async (leadIds: string[], filters: DashboardFilters): Promise<Conversation[]> => {
  if (leadIds.length === 0) return [];
  
  const dateRanges = getDateRanges(filters.selectedMonths, filters.year);
  if (dateRanges.length === 0) return [];
  
  let query = supabase.from("conversations").select("*").in("lead_id", leadIds);
  
  if (dateRanges.length === 1) {
    const { startDate, endDate } = dateRanges[0];
    query = query.gte('created_at', startDate).lte('created_at', endDate);
  } else {
    const dateConditions = dateRanges.map(range => 
      `and(created_at.gte.${range.startDate},created_at.lte.${range.endDate})`
    ).join(',');
    
    if (dateConditions) {
      query = query.or(dateConditions);
    }
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error("Error fetching conversations:", error);
    return [];
  }
  
  return data || [];
};

export const fetchAppointmentsByLeads = async (leadIds: string[], filters: DashboardFilters): Promise<Appointment[]> => {
  if (leadIds.length === 0) return [];
  
  const dateRanges = getDateRanges(filters.selectedMonths, filters.year);
  if (dateRanges.length === 0) return [];
  
  let query = supabase.from("appointments").select("*").in("lead_id", leadIds);
  
  if (dateRanges.length === 1) {
    const { startDate, endDate } = dateRanges[0];
    query = query.gte('created_at', startDate).lte('created_at', endDate);
  } else {
    const dateConditions = dateRanges.map(range => 
      `and(created_at.gte.${range.startDate},created_at.lte.${range.endDate})`
    ).join(',');
    
    if (dateConditions) {
      query = query.or(dateConditions);
    }
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error("Error fetching appointments:", error);
    return [];
  }
  
  return data || [];
};

export const fetchSalesByProduct = async (productId: string, filters: DashboardFilters): Promise<Sale[]> => {
  const dateRanges = getDateRanges(filters.selectedMonths, filters.year);
  if (dateRanges.length === 0) return [];
  
  let query = supabase.from("sales").select("*").eq("product_id", productId);
  
  if (dateRanges.length === 1) {
    const { startDate, endDate } = dateRanges[0];
    query = query.gte('created_at', startDate).lte('created_at', endDate);
  } else {
    const dateConditions = dateRanges.map(range => 
      `and(created_at.gte.${range.startDate},created_at.lte.${range.endDate})`
    ).join(',');
    
    if (dateConditions) {
      query = query.or(dateConditions);
    }
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error(`Error fetching sales for product ${productId}:`, error);
    return [];
  }
  
  return data || [];
};

export const fetchCostsByProduct = async (productId: string, filters: DashboardFilters): Promise<Cost[]> => {
  const dateRanges = getDateRanges(filters.selectedMonths, filters.year);
  if (dateRanges.length === 0) return [];
  
  let query = supabase.from("costs").select("*").eq("product_id", productId);
  
  if (dateRanges.length === 1) {
    const { startDate, endDate } = dateRanges[0];
    query = query.gte('created_at', startDate).lte('created_at', endDate);
  } else {
    const dateConditions = dateRanges.map(range => 
      `and(created_at.gte.${range.startDate},created_at.lte.${range.endDate})`
    ).join(',');
    
    if (dateConditions) {
      query = query.or(dateConditions);
    }
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error(`Error fetching costs for product ${productId}:`, error);
    return [];
  }
  
  return data || [];
};

export const calculateProductMetrics = async (product: Product, filters: DashboardFilters): Promise<ProductMetrics> => {
  console.log('Calculating metrics for product:', product.name, 'month:', product.month);
  
  // Get all leads for this product
  const leads = await fetchLeadsByProduct(product.id, filters);
  const leadIds = leads.map(lead => lead.id);
  
  // Get related data
  const conversations = await fetchConversationsByLeads(leadIds, filters);
  const appointments = await fetchAppointmentsByLeads(leadIds, filters);
  const sales = await fetchSalesByProduct(product.id, filters);
  const costs = await fetchCostsByProduct(product.id, filters);
  
  // Calculate metrics
  const leadCount = leads.length;
  const conversationCount = conversations.length;
  const paidAmount = sales.reduce((sum, sale) => sum + sale.amount, 0);
  
  const verbalAppointments = appointments.filter(apt => apt.type === 'verbal').length;
  const bookings = appointments.filter(apt => apt.type === 'booking').length;
  
  const totalCost = costs.reduce((sum, cost) => sum + cost.amount, 0);
  const costPerBooking = bookings > 0 ? totalCost / bookings : 0;
  const costPerLead = leadCount > 0 ? totalCost / leadCount : 0;
  
  console.log('Product metrics calculated:', {
    product: product.name,
    leadCount,
    conversationCount,
    paidAmount,
    verbalAppointments,
    bookings,
    costPerBooking,
    costPerLead
  });
  
  return {
    product,
    leadCount,
    conversationCount,
    paidAmount,
    verbalAppointments,
    bookings,
    costPerBooking,
    costPerLead
  };
};

export const fetchAllProductMetrics = async (filters: DashboardFilters): Promise<ProductMetrics[]> => {
  console.log('Fetching all product metrics with filters:', filters);
  
  const products = await fetchProducts(filters.clinicIds, filters);
  console.log('Products found:', products.length);
  
  if (products.length === 0) {
    console.log('No products found for the given filters');
    return [];
  }
  
  const metricsPromises = products.map(product => calculateProductMetrics(product, filters));
  const metrics = await Promise.all(metricsPromises);
  
  console.log('Total metrics calculated:', metrics.length);
  return metrics;
};
