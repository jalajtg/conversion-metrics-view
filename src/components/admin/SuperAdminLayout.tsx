
import React from 'react';
import { SuperAdminHeader } from './SuperAdminHeader';
import { SuperAdminSidebar } from './SuperAdminSidebar';
import { SidebarProvider } from '@/components/ui/sidebar';

interface SuperAdminLayoutProps {
  children: React.ReactNode;
}

export function SuperAdminLayout({ children }: SuperAdminLayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex flex-col w-full bg-theme-dark">
        <SuperAdminHeader />
        <div className="flex flex-1">
          <SuperAdminSidebar />
          <main className="flex-1 p-4 md:p-6 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
