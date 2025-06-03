
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createClinic } from '@/services/clinicService';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { UserSelector } from '@/components/clinics/UserSelector';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

export default function AddClinicPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    owner_id: ''
  });

  const createClinicMutation = useMutation({
    mutationFn: async (clinicData: typeof formData) => {
      const clinic = await createClinic(clinicData);
      if (!clinic) {
        throw new Error('Failed to create clinic');
      }
      
      // Send notification email
      const { error: emailError } = await supabase.functions.invoke('send-emails', {
        body: {
          user_id: clinicData.owner_id,
          email_type: 'clinic_added',
          clinic_name: clinicData.name
        }
      });
      
      if (emailError) {
        console.error('Error sending email notification:', emailError);
        // Don't throw error for email failure, just log it
      }
      
      return clinic;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-clinics"] });
      queryClient.invalidateQueries({ queryKey: ["user-clinics"] });
      toast({
        title: "Success",
        description: "Clinic created successfully and notification email sent!",
      });
      navigate('/super-admin/clinics');
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create clinic. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUserSelect = (userId: string) => {
    setFormData(prev => ({
      ...prev,
      owner_id: userId
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.owner_id) {
      toast({
        title: "Error",
        description: "Please fill in the clinic name and select an owner.",
        variant: "destructive",
      });
      return;
    }

    createClinicMutation.mutate(formData);
  };

  return (
    <div className="container mx-auto py-6 px-4 max-w-4xl">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/super-admin/clinics')}
          className="mb-4 text-gray-300 hover:text-white hover:bg-gray-700"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Clinics
        </Button>
        
        <h1 className="text-3xl font-bold text-white">
          Add New Clinic
        </h1>
        <p className="text-gray-300 mt-2">
          Create a new clinic and assign an owner
        </p>
      </div>

      <Card className="bg-theme-dark-card border-gray-700">
        <CardHeader className="border-b border-gray-700">
          <CardTitle className="text-white text-xl">
            Clinic Information
          </CardTitle>
        </CardHeader>
        
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-gray-300">
                  Clinic Name *
                </Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter clinic name"
                  required
                  className="bg-theme-dark-lighter border-gray-600 text-white placeholder-gray-400 focus:border-theme-blue focus:ring-theme-blue"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-300">
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter clinic email"
                  className="bg-theme-dark-lighter border-gray-600 text-white placeholder-gray-400 focus:border-theme-blue focus:ring-theme-blue"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-gray-300">
                  Phone
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Enter clinic phone"
                  className="bg-theme-dark-lighter border-gray-600 text-white placeholder-gray-400 focus:border-theme-blue focus:ring-theme-blue"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300">
                  Clinic Owner *
                </Label>
                <UserSelector
                  selectedUserId={formData.owner_id}
                  onUserSelect={handleUserSelect}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address" className="text-gray-300">
                Address
              </Label>
              <Textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Enter clinic address"
                rows={3}
                className="bg-theme-dark-lighter border-gray-600 text-white placeholder-gray-400 focus:border-theme-blue focus:ring-theme-blue resize-none"
              />
            </div>

            <div className="flex justify-end gap-4 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/super-admin/clinics')}
                disabled={createClinicMutation.isPending}
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createClinicMutation.isPending}
                className="bg-theme-blue hover:bg-theme-blue/90 text-white"
              >
                {createClinicMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Clinic'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
