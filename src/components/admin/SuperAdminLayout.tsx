
import React from 'react';
import { Outlet } from 'react-router-dom';
import { SuperAdminHeader } from './SuperAdminHeader';
import { SuperAdminSidebar } from './SuperAdminSidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';

export function SuperAdminLayout() {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-theme-dark">
        <SuperAdminSidebar />
        <SidebarInset>
          <SuperAdminHeader />
          <main className="flex-1 p-4 md:p-6 overflow-auto bg-theme-dark">
            <Outlet />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
