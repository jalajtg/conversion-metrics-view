
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { SuperAdminFilters, SuperAdminMetrics } from '@/types/admin';

export function useSuperAdminMetrics(filters: SuperAdminFilters) {
  return useQuery({
    queryKey: ['super-admin-metrics', filters],
    queryFn: async (): Promise<SuperAdminMetrics> => {
      console.log('Fetching super admin metrics with filters:', filters);
      
      // Get all clinics first
      const { data: clinicsData, error: clinicsError } = await supabase
        .from('clinics')
        .select('id, name');

      if (clinicsError) throw clinicsError;

      // Get total products
      let productsQuery = supabase.from('products').select('id, clinic_id');
      if (filters.clinicIds.length > 0) {
        productsQuery = productsQuery.in('clinic_id', filters.clinicIds);
      }
      const { data: productsData, error: productsError } = await productsQuery;
      if (productsError) throw productsError;

      // Get bookings with date and clinic filters - FIXED FOR SUPER ADMIN
      let bookingsQuery = supabase.from('bookings').select('id, clinic_id, created_at');
      
      // Only apply clinic filter if specific clinics are selected
      if (filters.clinicIds.length > 0) {
        bookingsQuery = bookingsQuery.in('clinic_id', filters.clinicIds);
      }
      
      if (filters.startDate) {
        bookingsQuery = bookingsQuery.gte('created_at', filters.startDate);
      }
      if (filters.endDate) {
        bookingsQuery = bookingsQuery.lte('created_at', filters.endDate);
      }
      
      const { data: bookingsData, error: bookingsError } = await bookingsQuery;
      if (bookingsError) {
        console.error('Error fetching bookings:', bookingsError);
        throw bookingsError;
      }

      console.log('Super admin bookings data:', bookingsData?.length || 0, 'bookings found');

      // Get leads with date and clinic filters - FIXED FOR SUPER ADMIN
      let leadsQuery = supabase.from('leads').select('id, clinic_id, created_at');
      if (filters.clinicIds.length > 0) {
        leadsQuery = leadsQuery.in('clinic_id', filters.clinicIds);
      }
      if (filters.startDate) {
        leadsQuery = leadsQuery.gte('created_at', filters.startDate);
      }
      if (filters.endDate) {
        leadsQuery = leadsQuery.lte('created_at', filters.endDate);
      }
      const { data: leadsData, error: leadsError } = await leadsQuery;
      if (leadsError) throw leadsError;

      console.log('Super admin leads data:', leadsData?.length || 0, 'leads found');

      // Get conversations with date and clinic filters
      let conversationsQuery = supabase.from('conversations').select('id, clinic_id, created_at');
      if (filters.clinicIds.length > 0) {
        conversationsQuery = conversationsQuery.in('clinic_id', filters.clinicIds);
      }
      if (filters.startDate) {
        conversationsQuery = conversationsQuery.gte('created_at', filters.startDate);
      }
      if (filters.endDate) {
        conversationsQuery = conversationsQuery.lte('created_at', filters.endDate);
      }
      const { data: conversationsData, error: conversationsError } = await conversationsQuery;
      if (conversationsError) throw conversationsError;

      // Get sales data for revenue
      let salesQuery = supabase.from('sales').select('amount, clinic_id, created_at');
      if (filters.clinicIds.length > 0) {
        salesQuery = salesQuery.in('clinic_id', filters.clinicIds);
      }
      if (filters.startDate) {
        salesQuery = salesQuery.gte('created_at', filters.startDate);
      }
      if (filters.endDate) {
        salesQuery = salesQuery.lte('created_at', filters.endDate);
      }
      const { data: salesData, error: salesError } = await salesQuery;
      if (salesError) throw salesError;

      // Get costs data
      let costsQuery = supabase.from('costs').select('amount, clinic_id, created_at');
      if (filters.clinicIds.length > 0) {
        costsQuery = costsQuery.in('clinic_id', filters.clinicIds);
      }
      if (filters.startDate) {
        costsQuery = costsQuery.gte('created_at', filters.startDate);
      }
      if (filters.endDate) {
        costsQuery = costsQuery.lte('created_at', filters.endDate);
      }
      const { data: costsData, error: costsError } = await costsQuery;
      if (costsError) throw costsError;

      // Calculate metrics
      const totalClinics = clinicsData?.length || 0;
      const totalProducts = productsData?.length || 0;
      const totalBookings = bookingsData?.length || 0;
      const totalLeads = leadsData?.length || 0;
      const totalConversations = conversationsData?.length || 0;
      const totalRevenue = salesData?.reduce((sum, sale) => sum + Number(sale.amount), 0) || 0;
      const totalCosts = costsData?.reduce((sum, cost) => sum + Number(cost.amount), 0) || 0;
      
      const costPerBooking = totalBookings > 0 ? totalCosts / totalBookings : 0;
      const costPerLead = totalLeads > 0 ? totalCosts / totalLeads : 0;

      console.log('Super admin metrics calculated:', {
        totalClinics,
        totalProducts,
        totalBookings,
        totalLeads,
        totalConversations,
        totalRevenue,
        costPerBooking,
        costPerLead
      });

      // Calculate clinic details
      const clinicDetails = clinicsData?.map(clinic => {
        const clinicProducts = productsData?.filter(p => p.clinic_id === clinic.id).length || 0;
        const clinicBookings = bookingsData?.filter(b => b.clinic_id === clinic.id).length || 0;
        const clinicLeads = leadsData?.filter(l => l.clinic_id === clinic.id).length || 0;
        const clinicRevenue = salesData?.filter(s => s.clinic_id === clinic.id)
          .reduce((sum, sale) => sum + Number(sale.amount), 0) || 0;

        return {
          id: clinic.id,
          name: clinic.name,
          productCount: clinicProducts,
          bookingCount: clinicBookings,
          leadCount: clinicLeads,
          revenue: clinicRevenue
        };
      }) || [];

      return {
        totalClinics,
        totalProducts,
        totalBookings,
        totalLeads,
        totalConversations,
        totalRevenue,
        costPerBooking,
        costPerLead,
        clinicDetails
      };
    },
    enabled: true
  });
}
