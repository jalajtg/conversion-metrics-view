
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { CreateUserDialog } from './CreateUserDialog';

interface User {
  id: string;
  name: string | null;
  email: string;
}

interface UserSelectorProps {
  selectedUserId: string;
  onUserSelect: (userId: string) => void;
}

export function UserSelector({ selectedUserId, onUserSelect }: UserSelectorProps) {
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users-for-clinic'],
    queryFn: async () => {
      // Get all users from profiles table (which syncs with auth.users)
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, email')
        .order('name');

      if (error) {
        console.error('Error fetching users:', error);
        return [];
      }

      // Also get email from auth metadata if name is missing
      const usersWithEmail = await Promise.all(
        data.map(async (user) => {
          if (!user.email) {
            // Try to get email from auth.users if not in profiles
            const { data: authUser } = await supabase.auth.admin.getUserById(user.id);
            return {
              ...user,
              email: authUser.user?.email || 'No email',
            };
          }
          return user;
        })
      );

      return usersWithEmail as User[];
    },
  });

  const handleUserCreated = (newUserId: string) => {
    onUserSelect(newUserId);
    setShowCreateDialog(false);
  };

  if (isLoading) {
    return <div className="text-gray-400">Loading users...</div>;
  }

  return (
    <div className="space-y-2">
      <Select value={selectedUserId} onValueChange={onUserSelect}>
        <SelectTrigger className="bg-theme-dark-lighter border-gray-600 text-white">
          <SelectValue placeholder="Select a user" />
        </SelectTrigger>
        <SelectContent className="bg-theme-dark-card border-gray-700">
          {users.map((user) => (
            <SelectItem
              key={user.id}
              value={user.id}
              className="text-white hover:bg-theme-dark-lighter focus:bg-theme-dark-lighter"
            >
              <div className="flex flex-col">
                <span>{user.name || 'Unnamed User'}</span>
                <span className="text-sm text-gray-400">{user.email}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <Button
        type="button"
        variant="outline"
        onClick={() => setShowCreateDialog(true)}
        className="w-full border-gray-600 text-gray-300 hover:bg-gray-700"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add New User
      </Button>

      <CreateUserDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onUserCreated={handleUserCreated}
      />
    </div>
  );
}
