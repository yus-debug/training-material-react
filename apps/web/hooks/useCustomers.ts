// apps/web/hooks/useCustomers.ts
import { useState } from 'react';

interface Customer {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  city?: string;
  full_name: string;
  created_at: string;
}

export type SortBy = 'name' | 'created_at';
export type SortDir = 'asc' | 'desc';

export const useCustomers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  const fetchCustomers = async (params: {
    page?: number;
    size?: number;
    search?: string;
    sort_by?: SortBy;
    sort_dir?: SortDir;
  } = {}) => {
    try {
      setLoading(true);
      setError(null);

      const searchParams = new URLSearchParams();

      if (params.page) searchParams.append('page', String(params.page));
      if (params.size) searchParams.append('size', String(params.size));
      if (params.search) searchParams.append('search', params.search);
      if (params.sort_by) searchParams.append('sort_by', params.sort_by);
      if (params.sort_dir) searchParams.append('sort_dir', params.sort_dir);

      const response = await fetch(
        `http://localhost:8000/api/customers?${searchParams.toString()}`
      );

      if (!response.ok) throw new Error('Failed to fetch customers');

      const data = await response.json();
      const arr: Customer[] = data.items || data;

      setCustomers(arr);
      setTotal(data.total ?? (Array.isArray(arr) ? arr.length : 0));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const createCustomer = async (customerData: Omit<Customer, 'id' | 'full_name' | 'created_at'>) => {
    const response = await fetch('http://localhost:8000/api/customers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(customerData),
    });
    if (!response.ok) throw new Error('Failed to create customer');
    const newCustomer = await response.json();
    setCustomers(prev => [newCustomer, ...prev]);
    return newCustomer;
  };

  const updateCustomer = async (id: number, customerData: Partial<Customer>) => {
    const response = await fetch(`http://localhost:8000/api/customers/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(customerData),
    });
    if (!response.ok) throw new Error('Failed to update customer');
    const updatedCustomer = await response.json();
    setCustomers(prev => prev.map(c => (c.id === id ? updatedCustomer : c)));
    return updatedCustomer;
  };

  const deleteCustomer = async (id: number) => {
    const response = await fetch(`http://localhost:8000/api/customers/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete customer');
    setCustomers(prev => prev.filter(c => c.id !== id));
  };

  return {
    customers,
    loading,
    error,
    total,
    fetchCustomers,
    createCustomer,
    updateCustomer,
    deleteCustomer,
  };
};
