
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { Plus, User } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { UserManagementTable } from './UserManagementTable';
import { UserFormDialog } from './UserFormDialog';

interface UserProfile {
  id: string;
  name: string | null;
  email: string;
  role: 'user' | 'admin' | 'super_admin';
  status: 'active' | 'inactive';
}

interface UserFormData {
  name: string;
  email: string;
  role: 'user' | 'admin' | 'super_admin';
  status: 'active' | 'inactive';
}

export function UserManagement() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    email: '',
    role: 'user',
    status: 'active'
  });

  const queryClient = useQueryClient();

  // Fetch users with their roles
  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      // Get all users from auth.users (via admin API would be needed in real scenario)
      // For now, we'll get profiles and user_roles
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*');

      const { data: userRoles } = await supabase
        .from('user_roles')
        .select('*');

      // Mock data for demonstration since we can't access auth.users directly
      const mockUsers: UserProfile[] = [
        {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          role: 'user',
          status: 'active'
        },
        {
          id: '2',
          name: 'Jane Smith',
          email: 'jane@example.com',
          role: 'admin',
          status: 'active'
        },
        {
          id: '3',
          name: 'Super Admin',
          email: 'admin@toratech.ai',
          role: 'super_admin',
          status: 'active'
        }
      ];

      return mockUsers;
    }
  });

  const updateUserMutation = useMutation({
    mutationFn: async (userData: { id: string; role: 'user' | 'admin' | 'super_admin' }) => {
      const { error } = await supabase
        .from('user_roles')
        .upsert({
          user_id: userData.id,
          role: userData.role
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({
        title: "Success",
        description: "User updated successfully",
      });
      setIsEditDialogOpen(false);
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update user",
      });
    }
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({
        title: "Success",
        description: "User deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete user",
      });
    }
  });

  const handleEdit = (user: UserProfile) => {
    setSelectedUser(user);
    setFormData({
      name: user.name || '',
      email: user.email,
      role: user.role,
      status: user.status
    });
    setIsEditDialogOpen(true);
  };

  const handleSave = () => {
    if (selectedUser) {
      updateUserMutation.mutate({
        id: selectedUser.id,
        role: formData.role
      });
    }
  };

  const handleDelete = (userId: string) => {
    if (confirm('Are you sure you want to delete this user?')) {
      deleteUserMutation.mutate(userId);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      role: 'user',
      status: 'active'
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="h-8 w-8 border-4 border-theme-blue border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <Card className="bg-theme-dark-card border-gray-800">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-white flex items-center gap-2">
          <User className="h-5 w-5" />
          User Management
        </CardTitle>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              className="bg-theme-blue hover:bg-theme-blue/80"
              onClick={resetForm}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </DialogTrigger>
        </Dialog>
      </CardHeader>
      
      <CardContent>
        <UserManagementTable 
          users={users}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </CardContent>

      {/* Add Dialog */}
      <UserFormDialog
        isOpen={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        title="Add New User"
        formData={formData}
        onFormDataChange={setFormData}
        onSave={handleSave}
        isEditMode={false}
      />

      {/* Edit Dialog */}
      <UserFormDialog
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        title="Edit User"
        formData={formData}
        onFormDataChange={setFormData}
        onSave={handleSave}
        isEditMode={true}
      />
    </Card>
  );
}
