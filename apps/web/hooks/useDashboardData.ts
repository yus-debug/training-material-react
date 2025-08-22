// apps/web/hooks/useDashboardData.ts
import { useState, useEffect, useCallback } from 'react';
import { API_ENDPOINTS } from '../config/api';
export interface DashboardData {
  totalItems: number;
  totalCustomers: number;
  pendingOrders: number;
  lowStockItems: number;
}

// Very permissive count that won't trip TS
function countFrom(payload: any): number {
  if (!payload) return 0;
  if (Array.isArray(payload)) return payload.length;
  if (typeof payload === 'number' && Number.isFinite(payload)) return payload;
  if (typeof payload === 'object') {
    if (typeof payload.total === 'number') return payload.total;
    if (Array.isArray(payload.items)) return payload.items.length;
    if (Array.isArray(payload.data)) return payload.data.length;
    if (Array.isArray(payload.results)) return payload.results.length;
  }
  return 0;
}

// Safe JSON: never throws; returns [] on any error or non-OK
async function safeJSON(res: Response): Promise<any> {
  try {
    if (!res.ok) return [];
    // some backends return empty body with 200
    const text = await res.text();
    if (!text) return [];
    return JSON.parse(text);
  } catch {
    return [];
  }
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
    setLoading(true);
    setError(null);

    try {
      // Use the exact routes/params from your FastAPI docs
      const [inventoryRes, customersRes, ordersRes, lowStockRes] = await Promise.all([
        fetch(API_ENDPOINTS.fetchInventory),
        fetch(API_ENDPOINTS.fetchCustomers),
        fetch(API_ENDPOINTS.fetchOrder),
        fetch(API_ENDPOINTS.fetchLowStock),
      ]);

      const [inventoryData, customersData, ordersData, lowStockData] = await Promise.all([
        safeJSON(inventoryRes),
        safeJSON(customersRes),
        safeJSON(ordersRes),
        safeJSON(lowStockRes),
      ]);

      setData({
        totalItems: countFrom(inventoryData),
        totalCustomers: countFrom(customersData),
        pendingOrders: countFrom(ordersData),
        lowStockItems: countFrom(lowStockData),
      });

      setLastUpdated(new Date());
    } catch (e: any) {
      // Should rarely hit because safeJSON swallows errors
      setError(e?.message || 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const id = setInterval(fetchData, 30_000);
    return () => clearInterval(id);
  }, [fetchData]);

  return { data, loading, error, lastUpdated, refetch: fetchData };
};
