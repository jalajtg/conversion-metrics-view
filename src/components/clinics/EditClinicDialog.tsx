
import React, { useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { updateClinic } from '@/services/clinicService';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useUserRole } from '@/hooks/useUserRole';

interface ClinicFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  total_paid?: number;
}

interface EditClinicDialogProps {
  clinic: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditClinicDialog({ clinic, open, onOpenChange }: EditClinicDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isSuperAdmin } = useUserRole();
  
  const form = useForm<ClinicFormData>({
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      address: '',
      total_paid: 0,
    },
  });

  useEffect(() => {
    if (clinic) {
      form.reset({
        name: clinic.name || '',
        email: clinic.email || '',
        phone: clinic.phone || '',
        address: clinic.address || '',
        total_paid: clinic.total_paid || 0,
      });
    }
  }, [clinic, form]);

  const updateClinicMutation = useMutation({
    mutationFn: (data: ClinicFormData) => updateClinic(clinic.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-clinics"] });
      toast({
        title: "Success",
        description: "Clinic updated successfully!",
      });
      onOpenChange(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update clinic. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ClinicFormData) => {
    updateClinicMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-theme-dark-card border-gray-700 text-white max-w-md mx-auto fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <DialogHeader>
          <DialogTitle className="text-white">Edit Clinic</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              rules={{ required: "Clinic name is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-300">Clinic Name</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      placeholder="Enter clinic name"
                      className="bg-theme-dark-lighter border-gray-600 text-white placeholder:text-gray-400"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-300">Email</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      type="email"
                      placeholder="Enter email"
                      className="bg-theme-dark-lighter border-gray-600 text-white placeholder:text-gray-400"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="phone"
              rules={{ required: "Phone number is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-300">Phone Number</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      placeholder="Enter phone number"
                      className="bg-theme-dark-lighter border-gray-600 text-white placeholder:text-gray-400"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="address"
              rules={{ required: "Address is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-300">Address</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      placeholder="Enter clinic address"
                      className="bg-theme-dark-lighter border-gray-600 text-white placeholder:text-gray-400"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Total Paid - Only for Super Admin */}
            {isSuperAdmin && (
              <FormField
                control={form.control}
                name="total_paid"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">Total Paid Amount ($)</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        type="number"
                        step="0.01"
                        min="0"
                        value={field.value || ''}
                        onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : 0)}
                        placeholder="Enter total paid amount"
                        className="bg-theme-dark-lighter border-gray-600 text-white placeholder:text-gray-400"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={updateClinicMutation.isPending}
                className="bg-theme-blue hover:bg-theme-blue/90 text-white"
              >
                {updateClinicMutation.isPending ? "Updating..." : "Update Clinic"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
