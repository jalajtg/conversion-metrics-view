
import React from 'react';
import { ProductsTable } from '@/components/products/ProductsTable';
import { AddProductDialog } from '@/components/products/AddProductDialog';

export default function ProductsPage() {
  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">All Products</h1>
          <p className="text-gray-300 mt-2">Manage all products across clinics</p>
        </div>
        <AddProductDialog />
      </div>
      <ProductsTable />
    </div>
  );
}
