// apps/web/hooks/useDashboardData.ts
import { useState, useEffect, useCallback } from 'react';

export interface DashboardData {
  totalItems: number;
  totalCustomers: number;
  pendingOrders: number;
  lowStockItems: number;
}

export const useDashboardData = () => {
  const [data, setData] = useState<DashboardData>({
    totalItems: 0,
    totalCustomers: 0,
    pendingOrders: 0,
    lowStockItems: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [inventoryRes, customersRes, ordersRes, lowStockRes] = await Promise.all([
        fetch('http://localhost:8000/inventory'),
        fetch('http://localhost:8000/customers'),
        fetch('http://localhost:8000/orders?status=pending'),
        fetch('http://localhost:8000/lowStock'),
      ]);

      if (!inventoryRes.ok || !customersRes.ok || !ordersRes.ok || !lowStockRes.ok) {
        throw new Error('One or more API calls failed');
      }

      const [inventoryData, customersData, ordersData, lowStockData] = await Promise.all([
        inventoryRes.json(),
        customersRes.json(),
        ordersRes.json(),
        lowStockRes.json(),
      ]);

      setData({
        totalItems: Array.isArray(inventoryData) ? inventoryData.length : (inventoryData?.total ?? 0),
        totalCustomers: Array.isArray(customersData) ? customersData.length : (customersData?.total ?? 0),
        pendingOrders: Array.isArray(ordersData) ? ordersData.length : (ordersData?.total ?? 0),
        lowStockItems: Array.isArray(lowStockData) ? lowStockData.length : (lowStockData?.total ?? 0),
      });

      setLastUpdated(new Date());
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  // manual and auto-refresh every 30s
  useEffect(() => {
    fetchData();
    const id = setInterval(fetchData, 30_000);
    return () => clearInterval(id);
  }, [fetchData]);

  return { data, loading, error, lastUpdated, refetch: fetchData };
};
