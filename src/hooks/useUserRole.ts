
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type UserRole = 'admin' | 'super_admin' | 'user';

export function useUserRole() {
  const { user } = useAuth();
  const [role, setRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user) {
        setRole(null);
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase.rpc('get_user_role', {
          _user_id: user.id
        });

        if (error) {
          console.error('Error fetching user role:', error);
          setRole('user'); // Default to user role
        } else {
          setRole(data as UserRole);
        }
      } catch (error) {
        console.error('Error fetching user role:', error);
        setRole('user'); // Default to user role
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserRole();
  }, [user]);

  return { role, isLoading, isSuperAdmin: role === 'super_admin' };
}
