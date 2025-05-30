
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { PrivateRoute } from "./components/auth/PrivateRoute";
import { Layout } from "./components/layout/Layout";
import { SuperAdminLayout } from "./components/admin/SuperAdminLayout";
import SuperAdmin from "./pages/SuperAdmin";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import FAQPage from "./pages/FAQ";
import ClinicsPage from "./pages/Clinics";
import ProductsPage from "./pages/Products";
import { ProductReplicationPage } from "./pages/ProductReplication";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Routes>
            {/* Public routes */}
            <Route path="/auth" element={<Auth />} />
            
            {/* Redirect root to dashboard or auth */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            
            {/* Protected routes */}
            <Route element={<PrivateRoute />}>
              <Route element={<Layout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/faq" element={<FAQPage />} />
                <Route path="/product-replication" element={<ProductReplicationPage />} />
              </Route>
              
              {/* Super Admin routes with their own layout */}
              <Route path="/super-admin" element={<SuperAdmin />} />
              <Route element={<SuperAdminLayout><ClinicsPage /></SuperAdminLayout>}>
                <Route path="/super-admin/clinics" element={<div />} />
              </Route>
              <Route element={<SuperAdminLayout><ProductsPage /></SuperAdminLayout>}>
                <Route path="/super-admin/products" element={<div />} />
              </Route>
            </Route>
            
            {/* 404 page */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </TooltipProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
