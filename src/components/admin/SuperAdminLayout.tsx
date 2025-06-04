
import React from 'react';
import { Outlet } from 'react-router-dom';
import { SuperAdminHeader } from './SuperAdminHeader';
import { SuperAdminSidebar } from './SuperAdminSidebar';
import { SidebarProvider } from '@/components/ui/sidebar';

export function SuperAdminLayout() {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-theme-dark">
        <SuperAdminSidebar />
        <div className="flex flex-col flex-1 min-h-screen">
          <SuperAdminHeader />
          <main className="flex-1 p-6 overflow-auto bg-theme-dark">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
