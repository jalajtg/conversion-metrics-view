
import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { UserSelector } from './UserSelector';

interface ClinicFormData {
  name: string;
  address: string;
  phone: string;
  owner_id: string;
}

export function AddClinicDialog() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<ClinicFormData>({
    defaultValues: {
      name: '',
      address: '',
      phone: '',
      owner_id: '',
    },
  });

  const createClinicMutation = useMutation({
    mutationFn: async (data: ClinicFormData) => {
      console.log('Creating clinic with data:', data);
      
      const { data: clinic, error } = await supabase
        .from('clinics')
        .insert({
          name: data.name,
          address: data.address,
          phone: data.phone,
          email: '',
          owner_id: data.owner_id,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating clinic:', error);
        throw error;
      }

      console.log('Clinic created:', clinic);

      const { error: emailError } = await supabase.rpc('send_user_notification_email', {
        p_user_id: data.owner_id,
        p_email_type: 'clinic_added',
        p_clinic_name: data.name,
        p_password: null,
      });

      if (emailError) {
        console.error('Error sending clinic notification email:', emailError);
      } else {
        console.log('Clinic notification email queued for user:', data.owner_id);
      }

      return clinic;
    },
    onSuccess: () => {
      console.log('Clinic creation successful');
      queryClient.invalidateQueries({ queryKey: ["all-clinics"] });
      queryClient.invalidateQueries({ queryKey: ["user-clinics"] });
      toast({
        title: "Success",
        description: "Clinic created successfully! The owner will be notified via email.",
      });
      form.reset();
      setOpen(false);
    },
    onError: (error: any) => {
      console.error('Clinic creation failed:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create clinic. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ClinicFormData) => {
    if (!data.owner_id) {
      toast({
        title: "Error",
        description: "Please select a clinic owner.",
        variant: "destructive",
      });
      return;
    }
    console.log('Submitting clinic creation form:', data);
    createClinicMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-theme-blue hover:bg-theme-blue/90 text-white">
          <Plus className="h-4 w-4 mr-2" />
          Add Clinic
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[95vw] max-w-md mx-auto p-0 gap-0 bg-gray-900 border border-gray-700 text-white">
        <div className="p-6">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-xl font-semibold text-white">
              Add New Clinic
            </DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="name"
                rules={{ required: "Clinic name is required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-200">
                      Clinic Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Enter clinic name"
                        className="w-full bg-gray-800 border-gray-600 text-white placeholder:text-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      />
                    </FormControl>
                    <FormMessage className="text-red-400 text-xs" />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="address"
                rules={{ required: "Address is required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-200">
                      Address
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Enter clinic address"
                        className="w-full bg-gray-800 border-gray-600 text-white placeholder:text-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      />
                    </FormControl>
                    <FormMessage className="text-red-400 text-xs" />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="phone"
                rules={{ required: "Phone number is required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-200">
                      Phone Number
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Enter phone number"
                        className="w-full bg-gray-800 border-gray-600 text-white placeholder:text-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      />
                    </FormControl>
                    <FormMessage className="text-red-400 text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="owner_id"
                rules={{ required: "Clinic owner is required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-200">
                      Clinic Owner
                    </FormLabel>
                    <FormControl>
                      <UserSelector
                        selectedUserId={field.value}
                        onUserSelect={field.onChange}
                      />
                    </FormControl>
                    <FormMessage className="text-red-400 text-xs" />
                  </FormItem>
                )}
              />
              
              <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  className="w-full sm:w-auto border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createClinicMutation.isPending}
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {createClinicMutation.isPending ? "Creating..." : "Create Clinic"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
