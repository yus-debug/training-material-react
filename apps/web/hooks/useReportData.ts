// apps/web/hooks/useReportData.ts
import { useState, useEffect } from 'react';
import { API_ENDPOINTS } from '../config/api';

interface Slice { name: string; value: number; color: string }
interface TopProduct { name: string; sales: number; revenue: number }
interface StockRow { name: string; low: number; normal: number; high: number }
interface TrendRow { month: string; revenue: number; orders: number }

interface ReportData {
  inventoryByCategory: Slice[];
  topProducts: TopProduct[];
  stockStatus: StockRow[];
  salesTrend: TrendRow[];
  inventoryByProduct: Slice[];
}

export const useReportData = () => {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchReportData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchReportData = async () => {
    try {
      setLoading(true);

      const [inventoryRes, ordersRes] = await Promise.all([
        fetch(API_ENDPOINTS.fetchInventory),
        fetch(API_ENDPOINTS.fetchOrder),
      ]);

      const inventory = await inventoryRes.json();
      const orders = await ordersRes.json();

      const invItems = inventory.items || inventory || [];
      const ordItems = orders.items || orders || [];

      console.log('[reports] inventory items:', Array.isArray(invItems) ? invItems.length : 'N/A', API_ENDPOINTS.fetchInventory);

      const transformedData: ReportData = {
        inventoryByCategory: transformInventoryByCategory(invItems),
        inventoryByProduct: transformInventoryByProduct(invItems),
        topProducts: transformTopProducts(invItems),
        stockStatus: transformStockStatus(invItems),
        salesTrend: transformSalesTrend(ordItems),
      };

    
      console.log('[reports] data.inventoryByCategory:', transformedData.inventoryByCategory);
      console.log('[reports] data.topProducts:', transformedData.topProducts);
      console.log('[reports] data.stockStatus:', transformedData.stockStatus);
      console.log('[reports] data.salesTrend:', transformedData.salesTrend);

      setData(transformedData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch report data');
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, refetch: fetchReportData };
};



const getNum = (v: any) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const getQty = (item: any) =>
  getNum(item?.quantity ?? item?.stock ?? item?.stock_quantity ?? item?.qty);

const getPrice = (item: any) =>
  getNum(item?.price ?? item?.unit_price ?? item?.cost);

const getName = (item: any) => String(item?.name ?? '');

const getCategory = (item: any) =>
  String(item?.category ?? 'other').toLowerCase();

const getColorForCategory = (category: string) => {
  const key = category.toLowerCase();
  const map: Record<string, string> = {
    electronics: '#3b82f6',
    clothing: '#ef4444',
    books: '#10b981',
    home: '#f59e0b',
    other: '#8b5cf6',
  };
  return map[key] ?? '#8b5cf6';
};


const transformInventoryByProduct = (items: any[]): Slice[] => {
  return (items ?? [])
    .slice()
    .sort((a, b) => getQty(b) - getQty(a))
    .slice(0, 10)
    .map((item) => ({
      name: getName(item),
      value: getQty(item),
      color: getColorForCategory(getCategory(item)),
    }));
};

const transformInventoryByCategory = (items: any[]): Slice[] => {
  const totals = (items ?? []).reduce((acc: Record<string, number>, item: any) => {
    const cat = getCategory(item);
    acc[cat] = (acc[cat] ?? 0) + getQty(item);
    return acc;
  }, {});
  return Object.entries(totals).map(([cat, value]) => ({
    name: cat.charAt(0).toUpperCase() + cat.slice(1),
    value: getNum(value),
    color: getColorForCategory(cat),
  }));
};

const transformTopProducts = (items: any[]): TopProduct[] => {
  return (items ?? [])
    .slice()
    .sort((a, b) => getQty(b) - getQty(a))
    .slice(0, 5)
    .map((item) => {
      const qty = getQty(item);
      const price = getPrice(item);
      return {
        name: getName(item),
        sales: qty,
        revenue: qty * price,
      };
    });
};

const transformStockStatus = (items: any[]): StockRow[] => {
  const statusCounts = (items ?? []).reduce(
    (acc: { low: number; normal: number; high: number }, item: any) => {
      const q = getQty(item);
      const minLevel = getNum(item?.min_stock_level ?? 10);
      const maxLevel = getNum(item?.max_stock_level ?? 100);
      if (q <= minLevel) acc.low += 1;
      else if (q >= maxLevel) acc.high += 1;
      else acc.normal += 1;
      return acc;
    },
    { low: 0, normal: 0, high: 0 }
  );
  return [{ name: 'Stock Levels', ...statusCounts }];
};

const transformSalesTrend = (_orders: any[]): TrendRow[] => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  return months.map((month) => ({
    month,
    revenue: Math.floor(Math.random() * 10000) + 5000,
    orders: Math.floor(Math.random() * 50) + 20,
  }));
};
