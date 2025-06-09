
import React, { useEffect } from 'react';
import { Dashboard as DashboardComponent } from "@/components/dashboard/Dashboard";

export default function DashboardPage() {
  // Set page title
  useEffect(() => {
    document.title = 'Dashboard | IronMark | Data Dashboard';
  }, []);

  return (
    <div>
      <DashboardComponent />
    </div>
  );
}
