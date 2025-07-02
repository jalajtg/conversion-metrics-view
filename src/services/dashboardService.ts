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
  if (!selectedMonths || selectedMonths.length === 0) return [];
  
  return selectedMonths.map(month => {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);
    return { startDate: startDate.toISOString(), endDate: endDate.toISOString() };
  });
};

export const fetchProducts = async (clinicIds: string[], filters: DashboardFilters): Promise<Product[]> => {
  if (clinicIds.length === 0) return [];
  
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

  // Filter by selected months if provided
  if (filters.selectedMonths && filters.selectedMonths.length > 0) {
    query = query.in("month", filters.selectedMonths);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error("Error fetching clinic product categories:", error);
    return [];
  }
  
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
  if (!filters.selectedMonths || filters.selectedMonths.length === 0) return [];
  
  const dateRanges = getDateRanges(filters.selectedMonths, filters.year);
  if (dateRanges.length === 0) return [];
  
  // Build query with multiple date ranges
  let query = supabase.from("leads").select("*").eq("product_id", productId);
  
  // Apply OR conditions for multiple date ranges
  const dateConditions = dateRanges.map(range => 
    `and(created_at.gte.${range.startDate},created_at.lte.${range.endDate})`
  ).join(',');
  
  if (dateConditions) {
    query = query.or(dateConditions);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error(`Error fetching leads for product ${productId}:`, error);
    return [];
  }
  
  return data || [];
};

export const fetchConversationsByLeads = async (leadIds: string[], filters: DashboardFilters): Promise<Conversation[]> => {
  if (leadIds.length === 0 || !filters.selectedMonths || filters.selectedMonths.length === 0) return [];
  
  const dateRanges = getDateRanges(filters.selectedMonths, filters.year);
  if (dateRanges.length === 0) return [];
  
  let query = supabase.from("conversations").select("*").in("lead_id", leadIds);
  
  const dateConditions = dateRanges.map(range => 
    `and(created_at.gte.${range.startDate},created_at.lte.${range.endDate})`
  ).join(',');
  
  if (dateConditions) {
    query = query.or(dateConditions);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error("Error fetching conversations:", error);
    return [];
  }
  
  return data || [];
};

export const fetchAppointmentsByLeads = async (leadIds: string[], filters: DashboardFilters): Promise<Appointment[]> => {
  if (leadIds.length === 0 || !filters.selectedMonths || filters.selectedMonths.length === 0) return [];
  
  const dateRanges = getDateRanges(filters.selectedMonths, filters.year);
  if (dateRanges.length === 0) return [];
  
  let query = supabase.from("appointments").select("*").in("lead_id", leadIds);
  
  const dateConditions = dateRanges.map(range => 
    `and(created_at.gte.${range.startDate},created_at.lte.${range.endDate})`
  ).join(',');
  
  if (dateConditions) {
    query = query.or(dateConditions);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error("Error fetching appointments:", error);
    return [];
  }
  
  return data || [];
};

export const fetchSalesByProduct = async (productId: string, filters: DashboardFilters): Promise<Sale[]> => {
  if (!filters.selectedMonths || filters.selectedMonths.length === 0) return [];
  
  const dateRanges = getDateRanges(filters.selectedMonths, filters.year);
  if (dateRanges.length === 0) return [];
  
  let query = supabase.from("sales").select("*").eq("product_id", productId);
  
  const dateConditions = dateRanges.map(range => 
    `and(created_at.gte.${range.startDate},created_at.lte.${range.endDate})`
  ).join(',');
  
  if (dateConditions) {
    query = query.or(dateConditions);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error(`Error fetching sales for product ${productId}:`, error);
    return [];
  }
  
  return data || [];
};

export const fetchCostsByProduct = async (productId: string, filters: DashboardFilters): Promise<Cost[]> => {
  if (!filters.selectedMonths || filters.selectedMonths.length === 0) return [];
  
  const dateRanges = getDateRanges(filters.selectedMonths, filters.year);
  if (dateRanges.length === 0) return [];
  
  let query = supabase.from("costs").select("*").eq("product_id", productId);
  
  const dateConditions = dateRanges.map(range => 
    `and(created_at.gte.${range.startDate},created_at.lte.${range.endDate})`
  ).join(',');
  
  if (dateConditions) {
    query = query.or(dateConditions);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error(`Error fetching costs for product ${productId}:`, error);
    return [];
  }
  
  return data || [];
};

export const calculateProductMetrics = async (product: Product, filters: DashboardFilters): Promise<ProductMetrics> => {
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
  const products = await fetchProducts(filters.clinicIds, filters);
  const metricsPromises = products.map(product => calculateProductMetrics(product, filters));
  return Promise.all(metricsPromises);
};
