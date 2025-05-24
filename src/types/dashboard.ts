
export interface Clinic {
  id: string;
  owner_id: string;
  name: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  clinic_id: string;
}

export interface Lead {
  id: string;
  product_id: string;
  client_name: string;
  email: string | null;
  phone: string | null;
  status: string;
  clinic_id: string;
}

export interface Conversation {
  id: string;
  lead_id: string;
  notes: string | null;
  clinic_id: string;
}

export interface Appointment {
  id: string;
  lead_id: string;
  type: string;
  status: string;
  scheduled_at: string;
  clinic_id: string;
}

export interface Sale {
  id: string;
  lead_id: string;
  product_id: string;
  amount: number;
  clinic_id: string;
}

export interface Cost {
  id: string;
  product_id: string;
  amount: number;
  description: string | null;
  clinic_id: string;
}

export interface ProductMetrics {
  product: Product;
  leadCount: number;
  conversationCount: number;
  paidAmount: number;
  verbalAppointments: number;
  bookings: number;
  costPerBooking: number;
  costPerLead: number;
}

export interface DashboardFilters {
  clinicIds: string[];
  month: string;
  year: string;
}
