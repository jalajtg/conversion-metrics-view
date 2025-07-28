import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar, Mail, Phone, User, Clock } from 'lucide-react';
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { DashboardFilters } from '@/types/dashboard';
import { useBookings } from '@/hooks/useBookings';
import { startOfMonth, endOfMonth, parseISO, isWithinInterval } from 'date-fns';

interface BookingsSectionProps {
  filters: DashboardFilters;
  unifiedData?: any;
}

interface Booking {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  booking_time: string;
  created_at: string;
  clinic_id: string | null;
}

interface Appointment {
  id: string;
  lead_id: string;
  clinic_id: string | null;
  type: string;
  status: string;
  scheduled_at: string;
  created_at: string;
}

export function BookingsSection({
  filters,
  unifiedData
}: BookingsSectionProps) {
  const {
    data: bookings,
    isLoading: bookingsLoading,
    error: bookingsError
  } = useBookings(filters);

  // Fetch all appointments
  const {
    data: appointments,
    isLoading: appointmentsLoading,
    error: appointmentsError
  } = useQuery({
    queryKey: ['appointments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          leads (
            client_name,
            email,
            phone
          )
        `)
        .order('scheduled_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  console.log('Bookings data:', bookings);
  console.log('Appointments data:', appointments);
  console.log('Current filters:', filters);

  const allBookingsAndAppointments = useMemo(() => {
    const allBookings: Booking[] = bookings || [];
    const allAppointments: Booking[] = (appointments || []).map((apt: any) => ({
      id: apt.id,
      name: apt.leads?.client_name || 'Unknown Patient',
      email: apt.leads?.email || null,
      phone: apt.leads?.phone || null,
      booking_time: apt.scheduled_at,
      created_at: apt.created_at,
      clinic_id: apt.clinic_id
    }));
    
    return [...allBookings, ...allAppointments];
  }, [bookings, appointments]);

  const filteredBookings = useMemo(() => {
    if (!allBookingsAndAppointments) return [];
    let filtered = allBookingsAndAppointments;

    // Filter by clinic IDs if specified
    if (filters.clinicIds && filters.clinicIds.length > 0) {
      filtered = filtered.filter(booking => booking.clinic_id && filters.clinicIds.includes(booking.clinic_id));
    }

    // Filter by selected months and year if specified
    if (filters.selectedMonths && filters.selectedMonths.length > 0 && filters.year) {
      const monthRanges = filters.selectedMonths.map(month => {
        return {
          start: startOfMonth(new Date(filters.year!, month - 1)),
          end: endOfMonth(new Date(filters.year!, month - 1))
        };
      });
      filtered = filtered.filter(booking => {
        const bookingDate = parseISO(booking.booking_time);
        return monthRanges.some(range => isWithinInterval(bookingDate, {
          start: range.start,
          end: range.end
        }));
      });
    } else if (filters.year && (!filters.selectedMonths || filters.selectedMonths.length === 0)) {
      // If year is selected and no months, filter by year only
      filtered = filtered.filter(booking => {
        const bookingDate = parseISO(booking.booking_time);
        return bookingDate.getFullYear() === filters.year;
      });
    }

    console.log('Filtered bookings result:', filtered.length, 'items');
    return filtered;
  }, [allBookingsAndAppointments, filters]);

  const isLoading = bookingsLoading || appointmentsLoading;
  const error = bookingsError || appointmentsError;

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-700 rounded mb-4 w-48"></div>
        <Card className="bg-theme-dark-card border-gray-800">
          <CardHeader>
            <div className="h-6 bg-gray-700 rounded w-32"></div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-gray-700 rounded"></div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-full bg-gradient-to-r from-red-500/20 to-orange-500/20">
            <Calendar className="h-8 w-8 text-red-400" />
          </div>
          <div className="text-left">
            <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
              Error Loading Appointments
            </h2>
            <p className="text-gray-400 text-left">Failed to load appointment data from the database</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id="bookings-section" className="space-y-4 sm:space-y-6">
      <div className="flex items-start gap-2 sm:gap-3">
        <div className="p-2 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20">
          <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-blue-400" />
        </div>
        <div className="flex-1 text-left">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent text-left">
            Appointments & Bookings
          </h2>
          <p className="text-gray-400 text-xs sm:text-sm text-left">
            {filters.selectedMonths?.length ? 
              `Appointments for ${filters.selectedMonths.length === 1 ? 
                new Date(filters.year || new Date().getFullYear(), filters.selectedMonths[0] - 1).toLocaleString('default', { month: 'long' }) : 
                'selected months'} ${filters.year || new Date().getFullYear()}` : 
              'Complete list of appointments and bookings from your clinics'
            }
          </p>
        </div>
      </div>
      
      <Card className="bg-gradient-to-br from-theme-dark-card to-theme-dark-lighter border border-gray-700/50 shadow-2xl">
        <CardHeader className="border-b border-gray-700/50 p-4 sm:p-6">
          <CardTitle className="text-white flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-blue-400" />
              </div>
              <span className="text-sm sm:text-base">Appointment Schedule</span>
            </div>
            <span className="text-xs sm:text-sm font-normal text-gray-400 sm:ml-auto">
              {filteredBookings?.length || 0} total appointments
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {!filteredBookings || filteredBookings.length === 0 ? (
            <div className="text-center py-8 sm:py-12 px-4 sm:px-6">
              <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 mb-4">
                <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-blue-400" />
              </div>
              <h3 className="text-base sm:text-lg font-medium text-white mb-2">No appointments found</h3>
              <p className="text-gray-400 text-sm">
                {filters.clinicIds.length === 0 ? "Please select at least one clinic to view appointments" : `No appointments found for the selected criteria`}
              </p>
            </div>
          ) : (
            <div className="overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-700/50 hover:bg-transparent">
                    <TableHead className="text-gray-300 font-semibold px-2 sm:px-4 text-left">
                      <div className="flex items-center gap-1 sm:gap-2">
                        <User className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="text-xs sm:text-sm">Patient Details</span>
                      </div>
                    </TableHead>
                    <TableHead className="hidden sm:table-cell text-gray-300 font-semibold px-2 sm:px-4 text-left">
                      <div className="flex items-center gap-1 sm:gap-2">
                        <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="text-xs sm:text-sm">Appointment Time</span>
                      </div>
                    </TableHead>
                    <TableHead className="sm:hidden text-gray-300 font-semibold px-2 text-left">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span className="text-xs">Booking Details</span>
                      </div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBookings.map((booking: Booking, index: number) => (
                    <TableRow 
                      key={booking.id} 
                      className="border-gray-700/50 transition-colors duration-200 hover:bg-gray-800/30"
                      style={{
                        background: `linear-gradient(90deg, rgba(59, 130, 246, ${0.02 + index * 0.01}) 0%, rgba(147, 51, 234, ${0.02 + index * 0.01}) 100%)`
                      }}
                    >
                      <TableCell className="px-2 sm:px-4 py-2 sm:py-4">
                        <div className="flex items-start gap-2 sm:gap-3">
                          <div className="w-6 h-6 sm:w-10 sm:h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold text-xs sm:text-sm flex-shrink-0">
                            {booking.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="space-y-0.5 sm:space-y-1 min-w-0 flex-1 text-left">
                            <div className="font-medium text-white text-xs sm:text-sm truncate text-left">{booking.name}</div>
                            {booking.email && (
                              <div className="flex items-center gap-1 sm:gap-2 text-gray-300">
                                <Mail className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-blue-400 flex-shrink-0" />
                                <span className="text-xs truncate">{booking.email}</span>
                              </div>
                            )}
                            {booking.phone && (
                              <div className="flex items-center gap-1 sm:gap-2 text-gray-300">
                                <Phone className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-green-400 flex-shrink-0" />
                                <span className="text-xs">{booking.phone}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell px-2 sm:px-4 py-2 sm:py-4">
                        <div className="flex items-center gap-1 sm:gap-2">
                          <div className="p-0.5 sm:p-1 rounded bg-blue-500/10">
                            <Calendar className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-blue-400" />
                          </div>
                          <div className="text-left">
                            <div className="text-white font-medium text-xs sm:text-sm text-left">
                              {new Date(booking.booking_time).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </div>
                            <div className="text-xs text-gray-400 text-left">
                              {new Date(booking.booking_time).toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="sm:hidden px-2 py-2">
                        <div className="space-y-2 text-left">
                          <div className="flex items-center gap-1">
                            <div className="p-0.5 rounded bg-blue-500/10">
                              <Calendar className="h-2.5 w-2.5 text-blue-400" />
                            </div>
                            <div className="text-left">
                              <div className="text-white font-medium text-xs text-left">
                                {new Date(booking.booking_time).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </div>
                              <div className="text-xs text-gray-400 text-left">
                                {new Date(booking.booking_time).toLocaleTimeString('en-US', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </div>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
