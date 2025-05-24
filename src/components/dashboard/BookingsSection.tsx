
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar, Mail, Phone, User, Clock } from 'lucide-react';
import type { DashboardFilters } from '@/types/dashboard';

interface BookingsSectionProps {
  filters: DashboardFilters;
  unifiedData?: any;
}

export function BookingsSection({ filters, unifiedData }: BookingsSectionProps) {
  const bookings = unifiedData?.bookings || [];
  const isLoading = !unifiedData;

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

  return (
    <div id="bookings-section" className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20">
          <Calendar className="h-8 w-8 text-blue-400" />
        </div>
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Recent Bookings
          </h2>
          <p className="text-gray-400">Latest appointment bookings from your clinics</p>
        </div>
      </div>
      
      <Card className="bg-gradient-to-br from-theme-dark-card to-theme-dark-lighter border border-gray-700/50 shadow-2xl">
        <CardHeader className="border-b border-gray-700/50">
          <CardTitle className="text-white flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <Calendar className="h-5 w-5 text-blue-400" />
            </div>
            Appointment Schedule
            <span className="ml-auto text-sm font-normal text-gray-400">
              {bookings?.length || 0} total bookings
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {!bookings || bookings.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 mb-4">
                <Calendar className="h-8 w-8 text-blue-400" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">No bookings found</h3>
              <p className="text-gray-400">No appointment bookings for the selected period</p>
            </div>
          ) : (
            <div className="overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-700/50 hover:bg-transparent">
                    <TableHead className="text-gray-300 font-semibold">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Patient
                      </div>
                    </TableHead>
                    <TableHead className="text-gray-300 font-semibold">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Contact
                      </div>
                    </TableHead>
                    <TableHead className="text-gray-300 font-semibold">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Appointment Time
                      </div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings.map((booking: any, index: number) => (
                    <TableRow 
                      key={booking.id} 
                      className="border-gray-700/50 transition-colors duration-200"
                      style={{
                        background: `linear-gradient(90deg, rgba(59, 130, 246, ${0.02 + index * 0.01}) 0%, rgba(147, 51, 234, ${0.02 + index * 0.01}) 100%)`
                      }}
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
                            {booking.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-medium text-white">{booking.name}</div>
                            <div className="text-sm text-gray-400">Patient</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {booking.email && (
                            <div className="flex items-center gap-2 text-gray-300">
                              <Mail className="h-3 w-3 text-blue-400" />
                              <span className="text-sm">{booking.email}</span>
                            </div>
                          )}
                          {booking.phone && (
                            <div className="flex items-center gap-2 text-gray-300">
                              <Phone className="h-3 w-3 text-green-400" />
                              <span className="text-sm">{booking.phone}</span>
                            </div>
                          )}
                          {!booking.email && !booking.phone && (
                            <span className="text-gray-500 text-sm">No contact info</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="p-1 rounded bg-blue-500/10">
                            <Calendar className="h-3 w-3 text-blue-400" />
                          </div>
                          <div>
                            <div className="text-white font-medium">
                              {new Date(booking.booking_time).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </div>
                            <div className="text-sm text-gray-400">
                              {new Date(booking.booking_time).toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
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
