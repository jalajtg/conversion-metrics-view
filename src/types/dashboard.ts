
export interface Clinic {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  owner_id?: string;
  created_at: string;
  updated_at?: string;
}

export interface ProductCategory {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface ClinicProductCategory {
  id: string;
  clinic_id: string;
  product_category_id: string;
  price: number;
  created_at: string;
  updated_at: string;
  product_category?: ProductCategory;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  description?: string;
  clinic_id: string;
  created_at: string;
}

export interface Lead {
  id: string;
  client_name: string;
  email?: string;
  phone?: string;
  product_id: string;
  clinic_id?: string;
  engaged?: boolean;
  lead?: boolean;
  booked?: boolean;
  created_at: string;
}

export interface Conversation {
  id: string;
  lead_id: string;
  clinic_id?: string;
  notes?: string;
  created_at: string;
}

export interface Appointment {
  id: string;
  lead_id: string;
  clinic_id?: string;
  type: string;
  status: string;
  scheduled_at: string;
  created_at: string;
}

export interface Sale {
  id: string;
  product_id: string;
  lead_id: string;
  clinic_id?: string;
  amount: number;
  created_at: string;
}

export interface Cost {
  id: string;
  product_id: string;
  clinic_id?: string;
  amount: number;
  description?: string;
  created_at: string;
}

export interface ProductMetrics {
  product: any;
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
  months?: string[];
  month?: string; // Keep for backward compatibility
  year?: string; // Add year property
}
