import { useState, useEffect } from 'react';

export interface Product {
  id: number;
  name: string;
  sku: string;
  category?: string;
  price: number;
  quantity: number;
  min_stock_level?: number;
  max_stock_level?: number;
  description?: string;
  created_at?: string;
}

const API = {
  products: 'http://localhost:8000/api/inventory',
  product: (id: number) => `http://localhost:8000/api/inventory/${id}`,
};

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch(API.products);
      if (!res.ok) throw new Error('Failed to fetch products');
      const data = await res.json();
      setProducts(data.items || data);
      setError(null);
    } catch (e: any) {
      setError(e.message || 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const createProduct = async (body: Omit<Product, 'id' | 'created_at'>) => {
    
    const res = await fetch(API.products, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error('Failed to create product');
    const created = await res.json();
    setProducts((prev) => [created, ...prev]);
    return created;
  };

  const updateProduct = async (id: number, body: Partial<Product>) => {
    const res = await fetch(API.product(id), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error('Failed to update product');
    const updated = await res.json();
    setProducts((prev) => prev.map((p) => (p.id === id ? updated : p)));
    return updated;
  };

  const deleteProduct = async (id: number) => {
    const res = await fetch(API.product(id), { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete product');
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return { products, loading, error, fetchProducts, createProduct, updateProduct, deleteProduct };
};
