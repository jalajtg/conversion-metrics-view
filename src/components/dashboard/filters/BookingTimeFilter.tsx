
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock } from 'lucide-react';

interface BookingTimeFilterProps {
  startDate?: string;
  endDate?: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
}

export function BookingTimeFilter({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange
}: BookingTimeFilterProps) {
  return (
    <Card className="bg-theme-dark-card border-gray-700">
      <CardHeader className="pb-3">
        <CardTitle className="text-white text-sm flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Booking Time Range
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label className="text-gray-300 text-xs">Start Date</Label>
          <Input
            type="date"
            value={startDate || ''}
            onChange={(e) => onStartDateChange(e.target.value)}
            className="bg-theme-dark-lighter border-gray-600 text-white"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-gray-300 text-xs">End Date</Label>
          <Input
            type="date"
            value={endDate || ''}
            onChange={(e) => onEndDateChange(e.target.value)}
            className="bg-theme-dark-lighter border-gray-600 text-white"
          />
        </div>
      </CardContent>
    </Card>
  );
}
