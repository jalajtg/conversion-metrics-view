
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
        // First check if user has super_admin email
        if (user.email === 'admin@toratech.ai') {
          // Check if role exists in database
          const { data: existingRole, error: roleError } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', user.id)
            .single();

          if (roleError && roleError.code === 'PGRST116') {
            // No role found, create super_admin role
            console.log('Creating super_admin role for admin@toratech.ai');
            const { error: insertError } = await supabase
              .from('user_roles')
              .insert({ user_id: user.id, role: 'super_admin' });
            
            if (!insertError) {
              setRole('super_admin');
            } else {
              console.error('Error creating super_admin role:', insertError);
              setRole('user');
            }
          } else if (existingRole) {
            // Role exists, use it (but ensure it's super_admin for this email)
            if (existingRole.role !== 'super_admin') {
              // Update to super_admin
              const { error: updateError } = await supabase
                .from('user_roles')
                .update({ role: 'super_admin' })
                .eq('user_id', user.id);
              
              if (!updateError) {
                setRole('super_admin');
              } else {
                console.error('Error updating to super_admin role:', updateError);
                setRole(existingRole.role as UserRole);
              }
            } else {
              setRole('super_admin');
            }
          }
        } else {
          // For other users, get their role from database
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
            setRole(data as UserRole);
          }
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

  return { role, isLoading, isSuperAdmin: role === 'super_admin' };
}
