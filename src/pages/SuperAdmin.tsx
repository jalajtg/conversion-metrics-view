
import React from 'react';
import { SuperAdminDashboard } from '@/components/admin/SuperAdminDashboard';
import { useUserRole } from '@/hooks/useUserRole';
import { Navigate } from 'react-router-dom';
import { Loader2, Shield, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';

export default function SuperAdmin() {
  const { user } = useAuth();
  const { isSuperAdmin, isLoading, role } = useUserRole();

  console.log('SuperAdmin page - user email:', user?.email);
  console.log('SuperAdmin page - isSuperAdmin:', isSuperAdmin, 'isLoading:', isLoading, 'role:', role);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-theme-dark">
        <Loader2 className="h-8 w-8 animate-spin text-theme-blue" />
      </div>
    );
  }

  // Debug: Show access denied page for non-super admins instead of immediate redirect
  if (!isSuperAdmin) {
    console.log('User is not super admin, showing access denied page');
    return (
      <div className="min-h-screen bg-theme-dark flex items-center justify-center p-4">
        <Card className="bg-theme-dark-card border-gray-800 max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 bg-red-500/10 rounded-full w-fit">
              <AlertTriangle className="h-8 w-8 text-red-400" />
            </div>
            <CardTitle className="text-white text-xl">Access Denied</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-400">
              You don't have permission to access the Super Admin panel.
            </p>
            <div className="text-sm text-gray-500 space-y-1">
              <p>Your email: {user?.email}</p>
              <p>Your role: {role || 'No role assigned'}</p>
              <p>Required role: super_admin</p>
            </div>
            <button 
              onClick={() => window.history.back()}
              className="w-full bg-theme-blue hover:bg-theme-blue/80 text-white py-2 px-4 rounded"
            >
              Go Back
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  console.log('Rendering SuperAdminDashboard');
  return <SuperAdminDashboard />;
}
