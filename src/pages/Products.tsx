
import React, { useEffect } from 'react';
import { ProductsTable } from '@/components/products/ProductsTable';

export default function ProductsPage() {
  // Set page title
  useEffect(() => {
    document.title = 'Products | IronMark | Data Dashboard';
  }, []);

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white">Products Management</h1>
        <p className="text-gray-300 mt-2">Manage all products across clinics</p>
      </div>
      <ProductsTable />
    </div>
  );
}
