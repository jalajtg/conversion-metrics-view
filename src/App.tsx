
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from '@/components/ui/toaster';
import { PrivateRoute } from '@/components/auth/PrivateRoute';
import { Layout } from '@/components/layout/Layout';
import Auth from '@/pages/Auth';
import Dashboard from '@/pages/Dashboard';
import Products from '@/pages/Products';
import FAQ from '@/pages/FAQ';
import Profile from '@/pages/Profile';
import SuperAdmin from '@/pages/SuperAdmin';
import Users from '@/pages/Users';
import Clinics from '@/pages/Clinics';
import AddClinic from '@/pages/AddClinic';
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
              path="/*"
              element={
                <PrivateRoute>
                  <Layout />
                </PrivateRoute>
              }
            >
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="products" element={<Products />} />
              <Route path="faq" element={<FAQ />} />
              <Route path="profile" element={<Profile />} />
              <Route path="super-admin" element={<SuperAdmin />} />
              <Route path="super-admin/users" element={<Users />} />
              <Route path="super-admin/clinics" element={<Clinics />} />
              <Route path="super-admin/add-clinic" element={<AddClinic />} />
            </Route>
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
