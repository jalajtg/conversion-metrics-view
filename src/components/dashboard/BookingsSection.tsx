
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar, Mail, Phone, User } from 'lucide-react';
import { useBookings } from '@/hooks/useBookings';
import type { DashboardFilters } from '@/types/dashboard';

interface BookingsSectionProps {
  filters: DashboardFilters;
}

export function BookingsSection({ filters }: BookingsSectionProps) {
  const { data: bookings, isLoading } = useBookings(filters);

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-700 rounded mb-4 w-48"></div>
        <div className="h-64 bg-gray-700 rounded"></div>
      </div>
    );
  }

  return (
    <div id="bookings-section" className="space-y-6">
      <div className="flex items-center gap-3">
        <Calendar className="h-8 w-8 text-theme-blue" />
        <h2 className="text-2xl sm:text-3xl font-bold gradient-text">Bookings</h2>
      </div>
      
      <Card className="bg-theme-dark-card border-gray-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Calendar className="h-5 w-5 text-theme-blue" />
            Recent Bookings
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!bookings || bookings.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400">No bookings found for the selected period</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-700 hover:bg-transparent">
                    <TableHead className="text-gray-300">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Name
                      </div>
                    </TableHead>
                    <TableHead className="text-gray-300">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Email
                      </div>
                    </TableHead>
                    <TableHead className="text-gray-300">
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        Phone
                      </div>
                    </TableHead>
                    <TableHead className="text-gray-300">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Booking Time
                      </div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings.map((booking) => (
                    <TableRow key={booking.id} className="border-gray-700 hover:bg-theme-dark-lighter/50">
                      <TableCell className="text-white font-medium">{booking.name}</TableCell>
                      <TableCell className="text-gray-300">{booking.email || 'N/A'}</TableCell>
                      <TableCell className="text-gray-300">{booking.phone || 'N/A'}</TableCell>
                      <TableCell className="text-gray-300">
                        {new Date(booking.booking_time).toLocaleString()}
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
