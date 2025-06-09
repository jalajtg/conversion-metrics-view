
import React, { useEffect } from 'react';
import { Dashboard as DashboardComponent } from "@/components/dashboard/Dashboard";

export default function DashboardPage() {
  // Set page title
  useEffect(() => {
    document.title = 'Dashboard | Dashboard Platform';
  }, []);

  return (
    <div>
      <DashboardComponent />
    </div>
  );
}
