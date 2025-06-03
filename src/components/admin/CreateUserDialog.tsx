
import React from 'react';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { supabase } from '@/integrations/supabase/client';
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

interface CreateUserFormData {
  name: string;
  email: string;
}

interface CreateUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUserCreated: () => void;
}

export function CreateUserDialog({ open, onOpenChange, onUserCreated }: CreateUserDialogProps) {
  const { toast } = useToast();

  const form = useForm<CreateUserFormData>({
    defaultValues: {
      name: '',
      email: '',
    },
  });

  const createUserMutation = useMutation({
    mutationFn: async (data: CreateUserFormData) => {
      console.log('Creating user with data:', data);
      
      // Generate a random password
      const password = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-4).toUpperCase() + '1!';
      
      // Create user in auth using admin functions
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: data.email,
        password: password,
        email_confirm: true,
        user_metadata: {
          name: data.name,
        },
      });

      if (authError || !authData.user) {
        console.error('Auth error:', authError);
        throw authError || new Error('Failed to create user');
      }

      console.log('User created in auth:', authData.user.id);

      // Create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          name: data.name,
        });

      if (profileError) {
        console.error('Error creating profile:', profileError);
        throw profileError;
      }

      // Assign user role
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: authData.user.id,
          role: 'user',
        });

      if (roleError) {
        console.error('Error assigning user role:', roleError);
        throw roleError;
      }

      console.log('User creation successful:', authData.user.id);
      return authData.user;
    },
    onSuccess: (user) => {
      console.log('User creation successful:', user.id);
      toast({
        title: "Success",
        description: "User created successfully!",
      });
      onUserCreated();
      form.reset();
    },
    onError: (error: any) => {
      console.error('User creation failed:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create user. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CreateUserFormData) => {
    console.log('Submitting user creation form:', data);
    createUserMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-theme-dark-card border-gray-700 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white">Create New User</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              rules={{ required: "Full name is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-300">Full Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Enter user's full name"
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
              rules={{
                required: "Email is required",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Please enter a valid email address"
                }
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-300">Email Address</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="email"
                      placeholder="Enter user's email"
                      className="bg-theme-dark-lighter border-gray-600 text-white placeholder:text-gray-400"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
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
                disabled={createUserMutation.isPending}
                className="bg-theme-blue hover:bg-theme-blue/90 text-white"
              >
                {createUserMutation.isPending ? "Creating..." : "Create User"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
