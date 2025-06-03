
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from '@/components/ui/toaster';
import PrivateRoute from '@/components/auth/PrivateRoute';
import Layout from '@/components/layout/Layout';
import Auth from '@/pages/Auth';
import Dashboard from '@/pages/Dashboard';
import Products from '@/pages/Products';
import FAQ from '@/pages/FAQ';
import Profile from '@/pages/Profile';
import SuperAdmin from '@/pages/SuperAdmin';
import Users from '@/pages/Users';
import Clinics from '@/pages/Clinics';
import AddClinic from '@/pages/AddClinic';
import ProductReplication from '@/pages/ProductReplication';
import Index from '@/pages/Index';
import NotFound from '@/pages/NotFound';
import './App.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/products"
              element={
                <PrivateRoute>
                  <Layout>
                    <Products />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/faq"
              element={
                <PrivateRoute>
                  <Layout>
                    <FAQ />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <Layout>
                    <Profile />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/super-admin"
              element={
                <PrivateRoute>
                  <Layout>
                    <SuperAdmin />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/super-admin/users"
              element={
                <PrivateRoute>
                  <Layout>
                    <Users />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/super-admin/clinics"
              element={
                <PrivateRoute>
                  <Layout>
                    <Clinics />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/super-admin/add-clinic"
              element={
                <PrivateRoute>
                  <Layout>
                    <AddClinic />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/super-admin/product-replication"
              element={
                <PrivateRoute>
                  <Layout>
                    <ProductReplication />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route path="/404" element={<NotFound />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
          <Toaster />
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
