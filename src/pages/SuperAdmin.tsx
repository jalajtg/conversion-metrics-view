
import React from 'react';
import { SuperAdminDashboard } from '@/components/admin/SuperAdminDashboard';
import { useUserRole } from '@/hooks/useUserRole';
import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

export default function SuperAdmin() {
  const { isSuperAdmin, isLoading } = useUserRole();

  console.log('SuperAdmin page - isSuperAdmin:', isSuperAdmin, 'isLoading:', isLoading);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-theme-dark">
        <Loader2 className="h-8 w-8 animate-spin text-theme-blue" />
      </div>
    );
  }

  if (!isSuperAdmin) {
    console.log('User is not super admin, redirecting to dashboard');
    return <Navigate to="/dashboard" replace />;
  }

  console.log('Rendering SuperAdminDashboard');
  return <SuperAdminDashboard />;
}
