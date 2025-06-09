
import React from 'react';
import { Outlet } from 'react-router-dom';
import { SuperAdminHeader } from './SuperAdminHeader';
import { SuperAdminSidebar } from './SuperAdminSidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { ChatbotWidget } from '@/components/ChatbotWidget';

export function SuperAdminLayout() {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-theme-dark">
        <SuperAdminSidebar />
        <SuperAdminHeader />
        <main className="flex-1 ml-64 pt-16 bg-theme-dark overflow-auto">
          <div className="p-4 md:p-6">
            <Outlet />
          </div>
        </main>
        <ChatbotWidget />
      </div>
    </SidebarProvider>
  );
}
