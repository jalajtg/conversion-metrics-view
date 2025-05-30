
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchUserClinics } from '@/services/clinicService';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from 'lucide-react';

export function ClinicsTable() {
  const { data: clinics, isLoading, error } = useQuery({
    queryKey: ["all-clinics"],
    queryFn: fetchUserClinics,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 p-4">
        Error loading clinics. Please try again.
      </div>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>All Clinics</CardTitle>
      </CardHeader>
      <CardContent>
        {clinics && clinics.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Created At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clinics.map((clinic) => (
                <TableRow key={clinic.id}>
                  <TableCell className="font-medium">{clinic.name}</TableCell>
                  <TableCell>{clinic.email || 'N/A'}</TableCell>
                  <TableCell>{clinic.phone || 'N/A'}</TableCell>
                  <TableCell>{clinic.address || 'N/A'}</TableCell>
                  <TableCell>
                    {new Date(clinic.created_at).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center text-gray-500 p-8">
            No clinics found in the database.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
