
import { supabase } from "@/integrations/supabase/client";
import { 
  Product, 
  Lead, 
  Conversation, 
  Appointment, 
  Sale, 
  Cost,
  ProductMetrics
} from "@/types/dashboard";

export const fetchProducts = async (): Promise<Product[]> => {
  const { data, error } = await supabase.from("products").select("*");
  
  if (error) {
    console.error("Error fetching products:", error);
    return [];
  }
  
  return data || [];
};

export const fetchLeadsByProduct = async (productId: string): Promise<Lead[]> => {
  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .eq("product_id", productId);
  
  if (error) {
    console.error(`Error fetching leads for product ${productId}:`, error);
    return [];
  }
  
  return data || [];
};

export const fetchConversationsByLeads = async (leadIds: string[]): Promise<Conversation[]> => {
  if (leadIds.length === 0) return [];
  
  const { data, error } = await supabase
    .from("conversations")
    .select("*")
    .in("lead_id", leadIds);
  
  if (error) {
    console.error("Error fetching conversations:", error);
    return [];
  }
  
  return data || [];
};

export const fetchAppointmentsByLeads = async (leadIds: string[]): Promise<Appointment[]> => {
  if (leadIds.length === 0) return [];
  
  const { data, error } = await supabase
    .from("appointments")
    .select("*")
    .in("lead_id", leadIds);
  
  if (error) {
    console.error("Error fetching appointments:", error);
    return [];
  }
  
  return data || [];
};

export const fetchSalesByProduct = async (productId: string): Promise<Sale[]> => {
  const { data, error } = await supabase
    .from("sales")
    .select("*")
    .eq("product_id", productId);
  
  if (error) {
    console.error(`Error fetching sales for product ${productId}:`, error);
    return [];
  }
  
  return data || [];
};

export const fetchCostsByProduct = async (productId: string): Promise<Cost[]> => {
  const { data, error } = await supabase
    .from("costs")
    .select("*")
    .eq("product_id", productId);
  
  if (error) {
    console.error(`Error fetching costs for product ${productId}:`, error);
    return [];
  }
  
  return data || [];
};

export const calculateProductMetrics = async (product: Product): Promise<ProductMetrics> => {
  // Get all leads for this product
  const leads = await fetchLeadsByProduct(product.id);
  const leadIds = leads.map(lead => lead.id);
  
  // Get related data
  const conversations = await fetchConversationsByLeads(leadIds);
  const appointments = await fetchAppointmentsByLeads(leadIds);
  const sales = await fetchSalesByProduct(product.id);
  const costs = await fetchCostsByProduct(product.id);
  
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

export const fetchAllProductMetrics = async (): Promise<ProductMetrics[]> => {
  const products = await fetchProducts();
  const metricsPromises = products.map(product => calculateProductMetrics(product));
  return Promise.all(metricsPromises);
};
