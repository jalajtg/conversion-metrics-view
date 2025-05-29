export interface Clinic {
  id: string;
  name: string;
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
}
