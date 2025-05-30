
import React from 'react';
import { useClinics } from '@/hooks/useClinics';
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
  const { data: clinics, isLoading, error } = useClinics();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin text-theme-blue" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-400 p-4 bg-theme-dark-card rounded-lg border border-red-500/20">
        Error loading clinics. Please try again.
      </div>
    );
  }

  return (
    <Card className="w-full bg-theme-dark-card border-gray-700">
      <CardHeader className="border-b border-gray-700">
        <CardTitle className="text-white">My Clinics</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {clinics && clinics.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow className="border-gray-700 hover:bg-theme-dark-lighter">
                <TableHead className="text-gray-300 font-semibold">Name</TableHead>
                <TableHead className="text-gray-300 font-semibold">Email</TableHead>
                <TableHead className="text-gray-300 font-semibold">Phone</TableHead>
                <TableHead className="text-gray-300 font-semibold">Address</TableHead>
                <TableHead className="text-gray-300 font-semibold">Created At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clinics.map((clinic) => (
                <TableRow key={clinic.id} className="border-gray-700 hover:bg-theme-dark-lighter transition-colors">
                  <TableCell className="font-medium text-white">{clinic.name}</TableCell>
                  <TableCell className="text-gray-300">{clinic.email || 'N/A'}</TableCell>
                  <TableCell className="text-gray-300">{clinic.phone || 'N/A'}</TableCell>
                  <TableCell className="text-gray-300">{clinic.address || 'N/A'}</TableCell>
                  <TableCell className="text-gray-300">
                    {new Date(clinic.created_at).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center text-gray-400 p-8 bg-theme-dark-lighter/50">
            <p className="text-lg">You haven't created any clinics yet.</p>
            <p className="text-sm text-gray-500 mt-2">Create your first clinic to get started.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
