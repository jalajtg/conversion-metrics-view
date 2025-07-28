import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface NewPatientData {
  id: string;
  clinic_id: string;
  month: number;
  year: number;
  count: number;
  created_at: string;
  updated_at: string;
}

export interface UseNewPatientsOptions {
  clinicIds?: string[];
  selectedMonths?: number[];
  year?: number;
}

export function useNewPatients(options: UseNewPatientsOptions = {}) {
  const [newPatientsData, setNewPatientsData] = useState<NewPatientData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNewPatients = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
          .from('new_patients')
          .select('*')
          .order('year', { ascending: false })
          .order('month', { ascending: false });

        if (fetchError) {
          console.error('Error fetching new patients data:', fetchError);
          setError(fetchError.message);
          return;
        }

        setNewPatientsData(data || []);
      } catch (err) {
        console.error('Unexpected error fetching new patients:', err);
        setError('Failed to load new patients data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchNewPatients();
  }, [options.clinicIds, options.selectedMonths, options.year]);

  // Calculate filtered new patients based on provided options
  const filteredNewPatients = newPatientsData.filter(record => {
    // Filter by clinic if specified
    if (options.clinicIds && options.clinicIds.length > 0) {
      if (!options.clinicIds.includes(record.clinic_id)) return false;
    }

    // Filter by year if specified
    if (options.year && record.year !== options.year) return false;

    // Filter by months if specified
    if (options.selectedMonths && options.selectedMonths.length > 0) {
      if (!options.selectedMonths.includes(record.month)) return false;
    }

    return true;
  });

  const totalNewPatients = filteredNewPatients.reduce((sum, record) => sum + record.count, 0);

  // Calculate new patients for current month/year
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1; // JS months are 0-indexed
  const currentYear = currentDate.getFullYear();

  const currentMonthNewPatients = newPatientsData
    .filter(record => record.month === currentMonth && record.year === currentYear)
    .reduce((sum, record) => sum + record.count, 0);

  // Calculate new patients for selected time period (if filters are applied)
  const getNewPatientsForPeriod = (startDate?: Date, endDate?: Date, clinicIds?: string[]) => {
    let filteredData = newPatientsData;

    // Filter by clinic if specified
    if (clinicIds && clinicIds.length > 0) {
      filteredData = filteredData.filter(record => clinicIds.includes(record.clinic_id));
    }

    // Filter by date range if specified
    if (startDate || endDate) {
      filteredData = filteredData.filter(record => {
        const recordDate = new Date(record.year, record.month - 1); // JS months are 0-indexed
        
        if (startDate && recordDate < startDate) return false;
        if (endDate && recordDate > endDate) return false;
        
        return true;
      });
    }

    return filteredData.reduce((sum, record) => sum + record.count, 0);
  };

  return {
    newPatientsData,
    totalNewPatients,
    currentMonthNewPatients,
    getNewPatientsForPeriod,
    isLoading,
    error
  };
}