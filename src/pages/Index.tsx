
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

const Index = () => {
  const { user, isLoading } = useAuth();

  // Show loading while checking auth
  if (isLoading) {
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

  // If logged in, redirect to dashboard (this should not happen due to App.tsx routing)
  return <Navigate to="/dashboard" replace />;
};

export default Index;
