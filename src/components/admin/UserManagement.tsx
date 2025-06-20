import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { Plus, User } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { UserManagementTable } from './UserManagementTable';
import { CreateUserDialog } from './CreateUserDialog';

interface UserProfile {
  id: string;
  name: string | null;
  email: string;
  role: 'user' | 'admin' | 'super_admin';
  status: 'active' | 'inactive';
}

export function UserManagement() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  // Fetch all users with email data from auth and profile/role data from database
  const { data: users = [], isLoading } = useQuery({
    queryKey: ['all-users'],
    queryFn: async () => {
      console.log('Fetching all users with auth data...');
      
      // Get all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, name, created_at');

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        throw profilesError;
      }

      // Get user roles
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) {
        console.error('Error fetching user roles:', rolesError);
        throw rolesError;
      }

      // Use the user-management edge function to get auth users with email data
      const { data: authResponse, error: authError } = await supabase.functions.invoke('user-management', {
        method: 'GET'
      });

      if (authError) {
        console.error('Error fetching auth users:', authError);
        throw authError;
      }

      const authUsers = authResponse?.users || [];

      const usersWithDetails = profiles.map(profile => {
        const userRole = userRoles.find(role => role.user_id === profile.id);
        const authUser = authUsers.find((user: any) => user.id === profile.id);
        
        return {
          id: profile.id,
          name: profile.name,
          email: authUser?.email || 'No email found',
          role: userRole?.role || 'user',
          status: 'active'
        };
      });

      console.log('Users fetched with auth data:', usersWithDetails);
      return usersWithDetails as UserProfile[];
    }
  });

  const updateUserMutation = useMutation({
    mutationFn: async (userData: { id: string; role: 'user' | 'admin' | 'super_admin' }) => {
      console.log('Updating user role:', userData);
      
      const { error } = await supabase.functions.invoke('user-management', {
        method: 'PUT',
        body: { id: userData.id, role: userData.role }
      });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-users'] });
      toast({
        title: "Success",
        description: "User updated successfully",
      });
    },
    onError: (error) => {
      console.error('Error updating user:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update user",
      });
    }
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      console.log('Deleting user:', userId);
      
      const { error } = await supabase.functions.invoke('delete_user', {
        body: { user_id: userId }
      });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-users'] });
      toast({
        title: "Success",
        description: "User deleted successfully",
      });
    },
    onError: (error) => {
      console.error('Error deleting user:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete user",
      });
    }
  });

  const handleEdit = (user: UserProfile) => {
    const newRole = prompt(`Change role for ${user.name || user.email}?\nCurrent: ${user.role}\nEnter new role (user/admin/super_admin):`);
    if (newRole && ['user', 'admin', 'super_admin'].includes(newRole)) {
      updateUserMutation.mutate({
        id: user.id,
        role: newRole as 'user' | 'admin' | 'super_admin'
      });
    }
  };

  const handleDelete = (userId: string) => {
    deleteUserMutation.mutate(userId);
  };

  const handleUserCreated = () => {
    queryClient.invalidateQueries({ queryKey: ['all-users'] });
    setIsAddDialogOpen(false);
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
          User Management ({users.length} users)
        </CardTitle>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-theme-blue hover:bg-theme-blue/80">
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

      <CreateUserDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onUserCreated={handleUserCreated}
      />
    </Card>
  );
}
