
import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { Loader2 } from 'lucide-react';

const Index = () => {
  const { user, isLoading: authLoading } = useAuth();
  const { isSuperAdmin, isLoading: roleLoading } = useUserRole();

  // Show loading while checking auth and role
  if (authLoading || (user && roleLoading)) {
    return (
      <div className="flex justify-center items-center h-screen bg-theme-dark">
        <Loader2 className="h-12 w-12 text-theme-blue animate-spin" />
      </div>
    );
  }

  // If not logged in, redirect to auth
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // If logged in and super admin, redirect to super admin dashboard
  if (isSuperAdmin) {
    return <Navigate to="/super-admin" replace />;
  }

  // If logged in and regular user, redirect to dashboard
  return <Navigate to="/dashboard" replace />;
};

export default Index;
