
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

const getDateRange = (month: string) => {
  const currentYear = new Date().getFullYear();
  const startDate = new Date(currentYear, parseInt(month) - 1, 1);
  const endDate = new Date(currentYear, parseInt(month), 0, 23, 59, 59);
  return { startDate: startDate.toISOString(), endDate: endDate.toISOString() };
};

export const fetchProducts = async (clinicIds: string[]): Promise<Product[]> => {
  if (clinicIds.length === 0) return [];
  
  const { data, error } = await supabase
    .from("clinic_product_categories")
    .select(`
      id,
      price,
      clinic_id,
      created_at,
      product_category:product_category_id (
        id,
        name,
        description
      )
    `)
    .in("clinic_id", clinicIds);
  
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
    created_at: item.created_at
  }));
};

export const fetchLeadsByProduct = async (productId: string, filters: DashboardFilters): Promise<Lead[]> => {
  if (!filters.month) return [];
  
  const { startDate, endDate } = getDateRange(filters.month);
  
  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .eq("product_id", productId)
    .gte("created_at", startDate)
    .lte("created_at", endDate);
  
  if (error) {
    console.error(`Error fetching leads for product ${productId}:`, error);
    return [];
  }
  
  return data || [];
};

export const fetchConversationsByLeads = async (leadIds: string[], filters: DashboardFilters): Promise<Conversation[]> => {
  if (leadIds.length === 0 || !filters.month) return [];
  
  const { startDate, endDate } = getDateRange(filters.month);
  
  const { data, error } = await supabase
    .from("conversations")
    .select("*")
    .in("lead_id", leadIds)
    .gte("created_at", startDate)
    .lte("created_at", endDate);
  
  if (error) {
    console.error("Error fetching conversations:", error);
    return [];
  }
  
  return data || [];
};

export const fetchAppointmentsByLeads = async (leadIds: string[], filters: DashboardFilters): Promise<Appointment[]> => {
  if (leadIds.length === 0 || !filters.month) return [];
  
  const { startDate, endDate } = getDateRange(filters.month);
  
  const { data, error } = await supabase
    .from("appointments")
    .select("*")
    .in("lead_id", leadIds)
    .gte("created_at", startDate)
    .lte("created_at", endDate);
  
  if (error) {
    console.error("Error fetching appointments:", error);
    return [];
  }
  
  return data || [];
};

export const fetchSalesByProduct = async (productId: string, filters: DashboardFilters): Promise<Sale[]> => {
  if (!filters.month) return [];
  
  const { startDate, endDate } = getDateRange(filters.month);
  
  const { data, error } = await supabase
    .from("sales")
    .select("*")
    .eq("product_id", productId)
    .gte("created_at", startDate)
    .lte("created_at", endDate);
  
  if (error) {
    console.error(`Error fetching sales for product ${productId}:`, error);
    return [];
  }
  
  return data || [];
};

export const fetchCostsByProduct = async (productId: string, filters: DashboardFilters): Promise<Cost[]> => {
  if (!filters.month) return [];
  
  const { startDate, endDate } = getDateRange(filters.month);
  
  const { data, error } = await supabase
    .from("costs")
    .select("*")
    .eq("product_id", productId)
    .gte("created_at", startDate)
    .lte("created_at", endDate);
  
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
  const products = await fetchProducts(filters.clinicIds);
  const metricsPromises = products.map(product => calculateProductMetrics(product, filters));
  return Promise.all(metricsPromises);
};
