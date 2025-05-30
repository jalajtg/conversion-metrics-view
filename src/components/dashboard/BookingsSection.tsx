import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar, Mail, Phone, User, Clock } from 'lucide-react';
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { DashboardFilters } from '@/types/dashboard';

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

export function BookingsSection({ filters, unifiedData }: BookingsSectionProps) {
  // Fetch all bookings from Supabase
  const { data: bookings, isLoading, error } = useQuery({
    queryKey: ["all-bookings", filters],
    queryFn: async (): Promise<Booking[]> => {
      console.log('Fetching bookings with filters:', filters);
      
      let query = supabase
        .from('bookings')
        .select('*')
        .order('booking_time', { ascending: false });

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching bookings:', error);
        throw error;
      }

      console.log('Fetched bookings:', data);
      return data || [];
    },
    enabled: true,
  });

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
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-gradient-to-r from-red-500/20 to-orange-500/20">
            <Calendar className="h-8 w-8 text-red-400" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
              Error Loading Bookings
            </h2>
            <p className="text-gray-400">Failed to load booking data from the database</p>
          </div>
        </div>
      </div>
    );
  }
  console.log("Bookings", bookings)
  return (
    <div id="bookings-section" className="space-y-4 sm:space-y-6">
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="p-2 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20">
          <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-blue-400" />
        </div>
        <div className="flex-1">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Bookings
          </h2>
          <p className="text-gray-400 text-xs sm:text-sm">Complete list of appointment bookings from your clinics</p>
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
              {bookings?.length || 0} total bookings
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {!bookings || bookings.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 mb-4">
                <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-blue-400" />
              </div>
              <h3 className="text-base sm:text-lg font-medium text-white mb-2">No bookings found</h3>
              <p className="text-gray-400 text-sm">
                {filters.clinicIds.length === 0 
                  ? "Please select at least one clinic to view bookings"
                  : "No appointment bookings found for the selected criteria"
                }
              </p>
            </div>
          ) : (
            <div className="overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-700/50 hover:bg-transparent">
                    <TableHead className="text-gray-300 font-semibold px-2 sm:px-4">
                      <div className="flex items-center gap-1 sm:gap-2">
                        <User className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="text-xs sm:text-sm">Patient Details</span>
                      </div>
                    </TableHead>
                    {/* Desktop: Two separate columns */}
                    <TableHead className="hidden sm:table-cell text-gray-300 font-semibold px-2 sm:px-4">
                      <div className="flex items-center gap-1 sm:gap-2">
                        <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="text-xs sm:text-sm">Appointment Time</span>
                      </div>
                    </TableHead>
                    <TableHead className="hidden sm:table-cell text-gray-300 font-semibold px-2 sm:px-4">
                      <div className="flex items-center gap-1 sm:gap-2">
                        <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="text-xs sm:text-sm">Created</span>
                      </div>
                    </TableHead>
                    {/* Mobile: Combined column */}
                    <TableHead className="sm:hidden text-gray-300 font-semibold px-2">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span className="text-xs">Booking Details</span>
                      </div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings.map((booking: Booking, index: number) => (
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
                          <div className="space-y-0.5 sm:space-y-1 min-w-0 flex-1">
                            <div className="font-medium text-white text-xs sm:text-sm truncate">{booking.name}</div>
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
                      {/* Desktop: Separate appointment time column */}
                      <TableCell className="hidden sm:table-cell px-2 sm:px-4 py-2 sm:py-4">
                        <div className="flex items-center gap-1 sm:gap-2">
                          <div className="p-0.5 sm:p-1 rounded bg-blue-500/10">
                            <Calendar className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-blue-400" />
                          </div>
                          <div>
                            <div className="text-white font-medium text-xs sm:text-sm">
                              {new Date(booking.booking_time).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </div>
                            <div className="text-xs text-gray-400">
                              {new Date(booking.booking_time).toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      {/* Desktop: Separate created column */}
                      <TableCell className="hidden sm:table-cell px-2 sm:px-4 py-2 sm:py-4">
                        <div className="flex items-center gap-1 sm:gap-2">
                          <div className="p-0.5 sm:p-1 rounded bg-green-500/10">
                            <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-green-400" />
                          </div>
                          <div>
                            <div className="text-white font-medium text-xs sm:text-sm">
                              {new Date(booking.created_at).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </div>
                            <div className="text-xs text-gray-400">
                              {new Date(booking.created_at).toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      {/* Mobile: Combined booking details column */}
                      <TableCell className="sm:hidden px-2 py-2">
                        <div className="space-y-2">
                          {/* Appointment Time */}
                          <div className="flex items-center gap-1">
                            <div className="p-0.5 rounded bg-blue-500/10">
                              <Calendar className="h-2.5 w-2.5 text-blue-400" />
                            </div>
                            <div>
                              <div className="text-white font-medium text-xs">
                                {new Date(booking.booking_time).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </div>
                              <div className="text-xs text-gray-400">
                                {new Date(booking.booking_time).toLocaleTimeString('en-US', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </div>
                            </div>
                          </div>
                          {/* Created */}
                          <div className="flex items-center gap-1">
                            <div className="p-0.5 rounded bg-green-500/10">
                              <Clock className="h-2.5 w-2.5 text-green-400" />
                            </div>
                            <div>
                              <div className="text-gray-300 text-xs">
                                Created {new Date(booking.created_at).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric'
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
