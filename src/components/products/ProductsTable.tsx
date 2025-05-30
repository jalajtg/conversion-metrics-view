
import React, { useState } from 'react';
import { useAllProducts } from '@/hooks/useAllProducts';
import { useClinics } from '@/hooks/useClinics';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteProduct } from '@/services/productService';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Trash2, Edit, Search, Filter } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { EditProductDialog } from './EditProductDialog';

export function ProductsTable() {
  const { data: products, isLoading, error } = useAllProducts();
  const { data: clinics } = useClinics();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClinic, setSelectedClinic] = useState<string>('all');
  const [editingProduct, setEditingProduct] = useState<any>(null);

  const deleteProductMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-products"] });
      toast({
        title: "Success",
        description: "Product deleted successfully!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete product. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      deleteProductMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin text-theme-blue" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-400 p-4 bg-theme-dark-card rounded-lg border border-red-500/20">
        Error loading products. Please try again.
      </div>
    );
  }

  // Filter products based on search term and selected clinic
  const filteredProducts = products?.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClinic = selectedClinic === 'all' || product.clinic_id === selectedClinic;
    return matchesSearch && matchesClinic;
  }) || [];

  return (
    <>
      <Card className="w-full bg-theme-dark-card border-gray-700">
        <CardHeader className="border-b border-gray-700">
          <CardTitle className="text-white flex items-center justify-between">
            All Products
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-theme-dark-lighter border-gray-600 text-white placeholder:text-gray-400"
                />
              </div>
              <Select value={selectedClinic} onValueChange={setSelectedClinic}>
                <SelectTrigger className="w-48 bg-theme-dark-lighter border-gray-600 text-white">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by clinic" />
                </SelectTrigger>
                <SelectContent className="bg-theme-dark-card border-gray-600">
                  <SelectItem value="all" className="text-white hover:bg-theme-dark-lighter">All Clinics</SelectItem>
                  {clinics?.map((clinic) => (
                    <SelectItem key={clinic.id} value={clinic.id} className="text-white hover:bg-theme-dark-lighter">
                      {clinic.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {filteredProducts && filteredProducts.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow className="border-gray-700 hover:bg-theme-dark-lighter">
                  <TableHead className="text-gray-300 font-semibold">Name</TableHead>
                  <TableHead className="text-gray-300 font-semibold">Description</TableHead>
                  <TableHead className="text-gray-300 font-semibold">Price</TableHead>
                  <TableHead className="text-gray-300 font-semibold">Clinic</TableHead>
                  <TableHead className="text-gray-300 font-semibold">Created At</TableHead>
                  <TableHead className="text-gray-300 font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow key={product.id} className="border-gray-700 hover:bg-theme-dark-lighter transition-colors">
                    <TableCell className="font-medium text-white">{product.name}</TableCell>
                    <TableCell className="text-gray-300">{product.description || 'N/A'}</TableCell>
                    <TableCell className="text-gray-300">${product.price}</TableCell>
                    <TableCell className="text-gray-300">
                      {clinics?.find(c => c.id === product.clinic_id)?.name || 'Unknown Clinic'}
                    </TableCell>
                    <TableCell className="text-gray-300">
                      {new Date(product.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingProduct(product)}
                          className="border-gray-600 text-gray-300 hover:bg-gray-700"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(product.id)}
                          disabled={deleteProductMutation.isPending}
                          className="border-red-600 text-red-400 hover:bg-red-500/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center text-gray-400 p-8 bg-theme-dark-lighter/50">
              <p className="text-lg">No products found.</p>
              <p className="text-sm text-gray-500 mt-2">
                {searchTerm || selectedClinic !== 'all' 
                  ? 'Try adjusting your search or filter criteria.'
                  : 'Create your first product to get started.'
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {editingProduct && (
        <EditProductDialog
          product={editingProduct}
          open={!!editingProduct}
          onOpenChange={(open) => !open && setEditingProduct(null)}
        />
      )}
    </>
  );
}
