
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth, AuthProvider } from '@/contexts/AuthContext';
import { Layout } from '@/components/layout/Layout';
import { SuperAdminLayout } from '@/components/admin/SuperAdminLayout';
import { PrivateRoute } from '@/components/auth/PrivateRoute';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';

// Pages
import Index from '@/pages/Index';
import Auth from '@/pages/Auth';
import Dashboard from '@/pages/Dashboard';
import Profile from '@/pages/Profile';
import ClinicsPage from '@/pages/Clinics';
import ProductsPage from '@/pages/Products';
import SuperAdmin from '@/pages/SuperAdmin';
import Users from '@/pages/Users';
import ProductReplicationPage from '@/pages/ProductReplication';
import AddClinicPage from '@/pages/AddClinic';
import EditClinicPage from '@/pages/EditClinic';
import ImportLeads from '@/pages/ImportLeads';
import FAQ from '@/pages/FAQ';
import NotFound from '@/pages/NotFound';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
            <AppRoutes />
            <Toaster />
            <Sonner />
          </ThemeProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

function AppRoutes() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <Index />} />
      <Route path="/auth" element={!user ? <Auth /> : <Navigate to="/dashboard" replace />} />
      
      <Route element={<PrivateRoute />}>
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/faq" element={<FAQ />} />
        </Route>
      </Route>

      <Route path="/super-admin" element={<PrivateRoute />}>
        <Route element={<SuperAdminLayout />}>
          <Route index element={<SuperAdmin />} />
          <Route path="users" element={<Users />} />
          <Route path="clinics" element={<ClinicsPage />} />
          <Route path="add-clinic" element={<AddClinicPage />} />
          <Route path="edit-clinic/:id" element={<EditClinicPage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="product-replication" element={<ProductReplicationPage />} />
          <Route path="import-leads" element={<ImportLeads />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
