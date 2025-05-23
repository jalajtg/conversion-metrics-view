
export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
}

export interface Lead {
  id: string;
  product_id: string;
  client_name: string;
  email: string | null;
  phone: string | null;
  status: string;
}

export interface Conversation {
  id: string;
  lead_id: string;
  notes: string | null;
}

export interface Appointment {
  id: string;
  lead_id: string;
  type: string;
  status: string;
  scheduled_at: string;
}

export interface Sale {
  id: string;
  lead_id: string;
  product_id: string;
  amount: number;
}

export interface Cost {
  id: string;
  product_id: string;
  amount: number;
  description: string | null;
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
