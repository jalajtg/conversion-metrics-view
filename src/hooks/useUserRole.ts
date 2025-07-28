
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
        console.log('Fetching role for user:', user.email);
        
        // Get user role from database - no hardcoded emails
        const { data, error } = await supabase.rpc('get_user_role', {
          _user_id: user.id
        });

        if (error) {
          console.error('Error fetching user role:', error);
          // Check if user has any role at all
          const { data: userRole } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', user.id)
            .single();
          
          if (!userRole) {
            // Create default user role
            await supabase
              .from('user_roles')
              .insert({ user_id: user.id, role: 'user' });
          }
          setRole('user');
        } else {
          console.log('User role from RPC:', data);
          setRole(data as UserRole);
        }
      } catch (error) {
        console.error('Error fetching user role:', error);
        setRole('user');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserRole();
  }, [user]);

  console.log('useUserRole - current role:', role, 'isSuperAdmin:', role === 'super_admin');
  
  return { role, isLoading, isSuperAdmin: role === 'super_admin' };
}
