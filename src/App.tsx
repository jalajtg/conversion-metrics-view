
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import React from "react";
import { AuthProvider } from "./contexts/AuthContext";
import { PrivateRoute } from "./components/auth/PrivateRoute";
import { Layout } from "./components/layout/Layout";

// Pages
import Dashboard from "./pages/Dashboard";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
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
                <Route path="/profile" element={<Profile />} />
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
