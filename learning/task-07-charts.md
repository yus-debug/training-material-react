# Task 7: Add Charts and Data Visualization

**Difficulty: ⭐⭐⭐⭐ (Medium-Advanced)**  
**Time: 2-3 hours**  
**Prerequisites: Tasks 1-6 completed**

## �� Learning Goals

- Learn third-party library integration (Recharts)
- Practice data transformation for visualization
- Create custom hooks for data fetching
- Understand responsive chart design
- Learn chart interaction and tooltips

## 📋 Task Description

Create a reports page with interactive charts showing business metrics and insights.

## 🏗️ What You'll Build

```
┌─────────────────────────────────────────────────────────────┐
│                        Reports Dashboard                     │
├─────────────────────────────────────────────────────────────┤
│ 📊 Inventory by Category        📈 Sales Trend              │
│ ┌─────────────────────────┐     ┌─────────────────────────┐ │
│ │     📱 Electronics 40%  │     │ $10k ╭─╮               │ │
│ │     👕 Clothing   30%   │     │ $8k  ╱   ╲             │ │
│ │     📚 Books      20%   │     │ $6k ╱     ╲            │ │
│ │     🏠 Home       10%   │     │ $4k        ╲___        │ │
│ └─────────────────────────┘     └─────────────────────────┘ │
│                                                              │
│ 📦 Top Products                 ⚠️ Stock Status             │
│ ┌─────────────────────────┐     ┌─────────────────────────┐ │
│ │ Headphones    ████████  │     │ Low:    ███ 30%        │ │
│ │ T-Shirt       ██████    │     │ Normal: ████████ 60%   │ │
│ │ Coffee Mug    ████      │     │ High:   ██ 10%         │ │
│ └─────────────────────────┘     └─────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## 📁 Files to Create/Modify

- `apps/web/app/reports/page.tsx` (new file)
- `apps/web/components/charts/InventoryChart.tsx` (new file)
- `apps/web/components/charts/SalesChart.tsx` (new file)
- `apps/web/components/charts/TopProductsChart.tsx` (new file)
- `apps/web/hooks/useReportData.ts` (new file)

## ✅ Requirements

- [ ] Install and setup Recharts library
- [ ] Create pie chart showing inventory by category
- [ ] Create line chart showing sales trend over time
- [ ] Create bar chart showing top selling products
- [ ] Create stacked bar chart for stock status
- [ ] Add interactive tooltips and legends
- [ ] Make charts responsive
- [ ] Create custom hook for fetching report data

## 💡 Setup Instructions

First, install Recharts:
```bash
cd apps/web
npm install recharts
npm install --save-dev @types/recharts
```

### Step 1: Create Report Data Hook

```tsx
// apps/web/hooks/useReportData.ts
import { useState, useEffect } from 'react';

interface ReportData {
  inventoryByCategory: Array<{ name: string; value: number; color: string }>;
  topProducts: Array<{ name: string; sales: number; revenue: number }>;
  stockStatus: Array<{ name: string; low: number; normal: number; high: number }>;
  salesTrend: Array<{ month: string; revenue: number; orders: number }>;
}

export const useReportData = () => {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      
      // Fetch data from multiple endpoints
      const [inventoryRes, ordersRes] = await Promise.all([
        fetch('http://localhost:8000/api/inventory'),
        fetch('http://localhost:8000/api/orders')
      ]);

      const inventory = await inventoryRes.json();
      const orders = await ordersRes.json();

      // Transform data for charts
      const transformedData = {
        inventoryByCategory: transformInventoryByCategory(inventory.items || inventory),
        topProducts: transformTopProducts(inventory.items || inventory),
        stockStatus: transformStockStatus(inventory.items || inventory),
        salesTrend: transformSalesTrend(orders.items || orders)
      };

      setData(transformedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch report data');
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, refetch: fetchReportData };
};

// Data transformation functions
const transformInventoryByCategory = (items: any[]) => {
  const categoryColors = {
    electronics: '#3b82f6',
    clothing: '#ef4444',
    books: '#10b981',
    home: '#f59e0b',
    other: '#8b5cf6'
  };

  const categoryTotals = items.reduce((acc, item) => {
    const category = item.category || 'other';
    acc[category] = (acc[category] || 0) + item.quantity;
    return acc;
  }, {});

  return Object.entries(categoryTotals).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value: value as number,
    color: categoryColors[name as keyof typeof categoryColors] || '#8b5cf6'
  }));
};

const transformTopProducts = (items: any[]) => {
  return items
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5)
    .map(item => ({
      name: item.name,
      sales: item.quantity,
      revenue: item.quantity * item.price
    }));
};

const transformStockStatus = (items: any[]) => {
  const getStockStatus = (item: any) => {
    const minLevel = item.min_stock_level || 10;
    const maxLevel = item.max_stock_level || 100;
    
    if (item.quantity <= minLevel) return 'low';
    if (item.quantity >= maxLevel) return 'high';
    return 'normal';
  };

  const statusCounts = items.reduce((acc, item) => {
    const status = getStockStatus(item);
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, { low: 0, normal: 0, high: 0 });

  return [{
    name: 'Stock Levels',
    ...statusCounts
  }];
};

const transformSalesTrend = (orders: any[]) => {
  // Generate sample data for last 6 months
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  return months.map((month, index) => ({
    month,
    revenue: Math.floor(Math.random() * 10000) + 5000,
    orders: Math.floor(Math.random() * 50) + 20
  }));
};
```

### Step 2: Create Inventory Pie Chart

```tsx
// apps/web/components/charts/InventoryChart.tsx
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Paper, Typography, Box } from '@mui/material';

interface InventoryChartProps {
  data: Array<{ name: string; value: number; color: string }>;
}

export const InventoryChart: React.FC<InventoryChartProps> = ({ data }) => {
  const renderCustomLabel = (entry: any) => {
    const percent = ((entry.value / data.reduce((sum, item) => sum + item.value, 0)) * 100).toFixed(1);
    return `${percent}%`;
  };

  return (
    <Paper sx={{ p: 3, height: 400 }}>
      <Typography variant="h6" gutterBottom>
        Inventory by Category
      </Typography>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={120}
            label={renderCustomLabel}
            labelLine={false}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip formatter={(value: number) => [value, 'Items']} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </Paper>
  );
};
```

### Step 3: Create Sales Line Chart

```tsx
// apps/web/components/charts/SalesChart.tsx
import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { Paper, Typography } from '@mui/material';

interface SalesChartProps {
  data: Array<{ month: string; revenue: number; orders: number }>;
}

export const SalesChart: React.FC<SalesChartProps> = ({ data }) => {
  return (
    <Paper sx={{ p: 3, height: 400 }}>
      <Typography variant="h6" gutterBottom>
        Sales Trend
      </Typography>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip 
            formatter={(value: number, name: string) => [
              name === 'revenue' ? `$${value.toLocaleString()}` : value,
              name === 'revenue' ? 'Revenue' : 'Orders'
            ]}
          />
          <Line 
            type="monotone" 
            dataKey="revenue" 
            stroke="#3b82f6" 
            strokeWidth={3}
            dot={{ fill: '#3b82f6', strokeWidth: 2, r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Paper>
  );
};
```

### Step 4: Create Top Products Bar Chart

```tsx
// apps/web/components/charts/TopProductsChart.tsx
import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { Paper, Typography } from '@mui/material';

interface TopProductsChartProps {
  data: Array<{ name: string; sales: number; revenue: number }>;
}

export const TopProductsChart: React.FC<TopProductsChartProps> = ({ data }) => {
  return (
    <Paper sx={{ p: 3, height: 400 }}>
      <Typography variant="h6" gutterBottom>
        Top Products by Sales
      </Typography>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="horizontal">
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" />
          <YAxis dataKey="name" type="category" width={100} />
          <Tooltip 
            formatter={(value: number, name: string) => [
              name === 'revenue' ? `$${value.toLocaleString()}` : value,
              name === 'revenue' ? 'Revenue' : 'Units Sold'
            ]}
          />
          <Bar dataKey="sales" fill="#10b981" />
        </BarChart>
      </ResponsiveContainer>
    </Paper>
  );
};
```

### Step 5: Create Reports Page

```tsx
// apps/web/app/reports/page.tsx
'use client';
import React from 'react';
import { Container, Typography, Grid, CircularProgress, Alert } from '@mui/material';
import { InventoryChart } from '../../components/charts/InventoryChart';
import { SalesChart } from '../../components/charts/SalesChart';
import { TopProductsChart } from '../../components/charts/TopProductsChart';
import { useReportData } from '../../hooks/useReportData';

export default function ReportsPage() {
  const { data, loading, error } = useReportData();

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">Error loading reports: {error}</Alert>
      </Container>
    );
  }

  if (!data) return null;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Reports Dashboard
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <InventoryChart data={data.inventoryByCategory} />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <SalesChart data={data.salesTrend} />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <TopProductsChart data={data.topProducts} />
        </Grid>
        
        <Grid item xs={12} md={6}>
          {/* Stock Status Chart - Bonus */}
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6">Stock Status Distribution</Typography>
            {/* Implement stacked bar chart here */}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}
```

## 🔧 Key Concepts

### Data Transformation:
```tsx
// Transform API data for charts
const transformData = (apiData: any[]) => {
  return apiData.map(item => ({
    name: item.name,
    value: item.quantity,
    color: getColorForCategory(item.category)
  }));
};
```

### Responsive Charts:
```tsx
<ResponsiveContainer width="100%" height={300}>
  <PieChart>
    {/* Chart content */}
  </PieChart>
</ResponsiveContainer>
```

### Custom Tooltips:
```tsx
<Tooltip 
  formatter={(value, name) => [
    `$${value.toLocaleString()}`,
    'Revenue'
  ]}
/>
```

## ✨ Bonus Challenges

- [ ] Add date range picker for filtering data
- [ ] Implement chart export functionality (PNG/PDF)
- [ ] Add chart animations and transitions
- [ ] Create drill-down functionality
- [ ] Add real-time data updates
- [ ] Implement chart themes (light/dark mode)

## 🐛 Common Issues & Solutions

**Issue**: Charts not displaying
**Solution**: Ensure ResponsiveContainer has explicit height

**Issue**: Data not loading
**Solution**: Check API endpoints and data transformation functions

**Issue**: Charts not responsive
**Solution**: Use ResponsiveContainer and proper Grid layout

## ✅ How to Test

1. Navigate to reports page
2. Verify all charts load with data
3. Test chart interactions (hover, tooltips)
4. Check responsive behavior on different screen sizes
5. Verify data accuracy matches API responses

## 🎉 Completion Criteria

Your charts are complete when:
- ✅ All 4 charts display with real data
- ✅ Charts are interactive with tooltips
- ✅ Responsive design works on all devices
- ✅ Data transforms correctly from API
- ✅ Loading and error states work
- ✅ Professional appearance with good UX

---

**← Previous: [Task 6 - Order Form](./task-06-order-form.md)**  
**Next Step: [Task 8 - Customer Management](./task-08-customer-management.md) →**
