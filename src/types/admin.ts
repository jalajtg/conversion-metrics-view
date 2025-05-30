
export interface SuperAdminFilters {
  clinicIds: string[];
  startDate: string;
  endDate: string;
}

export interface SuperAdminMetrics {
  totalClinics: number;
  totalProducts: number;
  totalBookings: number;
  totalLeads: number;
  totalConversations: number;
  totalRevenue: number;
  costPerBooking: number;
  costPerLead: number;
  clinicDetails: ClinicDetail[];
}

export interface ClinicDetail {
  id: string;
  name: string;
  productCount: number;
  bookingCount: number;
  leadCount: number;
  revenue: number;
}
