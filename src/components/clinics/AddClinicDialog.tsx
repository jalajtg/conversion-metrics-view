
import React, { useState } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ClinicFormData {
  name: string;
  address: string;
  phone: string;
  owner_id: string;
}

interface User {
  id: string;
  name: string | null;
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

  const {
    data: users = [],
    isLoading: isLoadingUsers
  } = useQuery({
    queryKey: ['users-for-clinic'],
    queryFn: async () => {
      console.log('Fetching users from profiles table...');

      const { data, error } = await supabase
        .from('profiles')
        .select('id, name')
        .order('name');
      
      if (error) {
        console.error('Error fetching users:', error);
        return [];
      }
      
      console.log('Users fetched:', data);
      return data as User[];
    }
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

  const selectedUser = users.find(user => user.id === form.watch('owner_id'));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-theme-blue hover:bg-theme-blue/90 text-white">
          <Plus className="h-4 w-4 mr-2" />
          Add Clinic
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Clinic</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              rules={{ required: "Clinic name is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Clinic Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Enter clinic name"
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
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Enter clinic address"
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
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Enter phone number"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="owner_id"
              rules={{ required: "Clinic owner is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Clinic Owner</FormLabel>
                  <FormControl>
                    {isLoadingUsers ? (
                      <div className="text-gray-400">Loading users...</div>
                    ) : (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a user">
                            {selectedUser ? (
                              <span>{selectedUser.name || 'Unnamed User'}</span>
                            ) : (
                              <span className="text-gray-400">Select a user</span>
                            )}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent className="z-50">
                          {users.map(user => (
                            <SelectItem 
                              key={user.id} 
                              value={user.id}
                            >
                              {user.name || 'Unnamed User'}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createClinicMutation.isPending}
              >
                {createClinicMutation.isPending ? "Creating..." : "Create Clinic"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
