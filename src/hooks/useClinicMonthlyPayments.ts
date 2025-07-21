import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ClinicMonthlyPayment {
  id: string;
  clinic_id: string;
  month: number;
  year: number;
  amount: number;
  created_at: string;
  updated_at: string;
}

export const useClinicMonthlyPayments = (clinicId: string, year: number = new Date().getFullYear()) => {
  return useQuery({
    queryKey: ["clinic-monthly-payments", clinicId, year],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clinic_monthly_payments")
        .select("*")
        .eq("clinic_id", clinicId)
        .eq("year", year)
        .order("month");

      if (error) throw error;
      return data as ClinicMonthlyPayment[];
    },
    enabled: !!clinicId,
  });
};

export const useCreateClinicMonthlyPayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payment: Omit<ClinicMonthlyPayment, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase
        .from("clinic_monthly_payments")
        .insert(payment)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["clinic-monthly-payments", data.clinic_id, data.year] });
      toast.success("Monthly payment added successfully");
    },
    onError: (error) => {
      console.error("Error creating monthly payment:", error);
      toast.error("Failed to add monthly payment");
    },
  });
};

export const useUpdateClinicMonthlyPayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...payment }: Partial<ClinicMonthlyPayment> & { id: string }) => {
      const { data, error } = await supabase
        .from("clinic_monthly_payments")
        .update(payment)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["clinic-monthly-payments", data.clinic_id, data.year] });
      toast.success("Monthly payment updated successfully");
    },
    onError: (error) => {
      console.error("Error updating monthly payment:", error);
      toast.error("Failed to update monthly payment");
    },
  });
};

export const useDeleteClinicMonthlyPayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("clinic_monthly_payments")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clinic-monthly-payments"] });
      toast.success("Monthly payment deleted successfully");
    },
    onError: (error) => {
      console.error("Error deleting monthly payment:", error);
      toast.error("Failed to delete monthly payment");
    },
  });
};