
import React from 'react';
import { ProductReplication } from '@/components/admin/ProductReplication';
import { Layout } from '@/components/layout/Layout';

export function ProductReplicationPage() {
  return (
    <Layout>
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Product Management</h1>
          <p className="text-gray-600">Manage and replicate products across your clinics</p>
        </div>
        <ProductReplication />
      </div>
    </Layout>
  );
}
