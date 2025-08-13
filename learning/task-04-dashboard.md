# Task 4: Create a Dashboard with Cards

**Difficulty: ⭐⭐ (Simple)**  
**Time: 60-90 minutes**  
**Prerequisites: Tasks 1-3 completed**

## 🎯 Learning Goals

- Learn component props and composition
- Master array mapping and rendering lists
- Practice API data fetching with fetch
- Understand loading states and error handling
- Learn MUI Grid system for responsive layouts

## 📋 Task Description

Create a dashboard page with metric cards that fetch and display real data from your API endpoints.

## 🏗️ What You'll Build

```
┌─────────────────────────────────────────────────────────────┐
│                        Dashboard                             │
├─────────────┬─────────────┬─────────────┬─────────────┐
│ 📦 Total    │ 👥 Total    │ 📋 Pending  │ ⚠️ Low      │
│ Items       │ Customers   │ Orders      │ Stock       │
│ 8           │ 5           │ 2           │ 3           │
└─────────────┴─────────────┴─────────────┴─────────────┘
```

## 📁 Files to Create/Modify

- `apps/web/app/dashboard/page.tsx` (new file)
- `apps/web/components/DashboardCard.tsx` (new file)
- `apps/web/hooks/useDashboardData.ts` (new file - bonus)

## ✅ Requirements

- [ ] Create reusable `DashboardCard` component
- [ ] Display 4 metric cards: Total Items, Total Customers, Pending Orders, Low Stock Items
- [ ] Fetch real data from API endpoints
- [ ] Show loading states while fetching data
- [ ] Handle errors gracefully
- [ ] Use MUI Grid for responsive layout
- [ ] Add appropriate icons and colors for each metric

## 💡 Hints & Guidance

### Step 1: Create DashboardCard Component

```tsx
// apps/web/components/DashboardCard.tsx
import React from 'react';
import { Card, CardContent, Typography, Box, CircularProgress } from '@mui/material';

interface DashboardCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color?: string;
  loading?: boolean;
}

export const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  value,
  icon,
  color = '#1976d2',
  loading = false
}) => {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 48,
              height: 48,
              borderRadius: 1,
              backgroundColor: color,
              color: 'white',
              mr: 2
            }}
          >
            {icon}
          </Box>
          <Box>
            <Typography variant="h6" component="div">
              {title}
            </Typography>
            {loading ? (
              <CircularProgress size={24} />
            ) : (
              <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                {value}
              </Typography>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};
```

### Step 2: Create Dashboard Page

```tsx
// apps/web/app/dashboard/page.tsx
'use client';
import React, { useState, useEffect } from 'react';
import { Container, Grid, Typography, Box } from '@mui/material';
import { Inventory, People, ShoppingCart, Warning } from '@mui/icons-material';
import { DashboardCard } from '../../components/DashboardCard';

interface DashboardData {
  totalItems: number;
  totalCustomers: number;
  pendingOrders: number;
  lowStockItems: number;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData>({
    totalItems: 0,
    totalCustomers: 0,
    pendingOrders: 0,
    lowStockItems: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch data from multiple endpoints
      const [inventoryRes, customersRes, ordersRes, lowStockRes] = await Promise.all([
        fetch('http://localhost:8000/api/inventory'),
        fetch('http://localhost:8000/api/customers'),
        fetch('http://localhost:8000/api/orders?status=pending'),
        fetch('http://localhost:8000/api/inventory/low-stock?threshold=20')
      ]);

      const inventoryData = await inventoryRes.json();
      const customersData = await customersRes.json();
      const ordersData = await ordersRes.json();
      const lowStockData = await lowStockRes.json();

      setData({
        totalItems: inventoryData.total || inventoryData.length || 0,
        totalCustomers: customersData.total || customersData.length || 0,
        pendingOrders: ordersData.total || ordersData.length || 0,
        lowStockItems: lowStockData.length || 0
      });
    } catch (err) {
      setError('Failed to fetch dashboard data');
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <Container>
        <Typography color="error">Error: {error}</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Dashboard
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <DashboardCard
            title="Total Items"
            value={data.totalItems}
            icon={<Inventory />}
            color="#1976d2"
            loading={loading}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <DashboardCard
            title="Total Customers"
            value={data.totalCustomers}
            icon={<People />}
            color="#388e3c"
            loading={loading}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <DashboardCard
            title="Pending Orders"
            value={data.pendingOrders}
            icon={<ShoppingCart />}
            color="#f57c00"
            loading={loading}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <DashboardCard
            title="Low Stock Items"
            value={data.lowStockItems}
            icon={<Warning />}
            color="#d32f2f"
            loading={loading}
          />
        </Grid>
      </Grid>
    </Container>
  );
}
```

## 🔄 Data Fetching Patterns

### Basic fetch with error handling:
```tsx
const fetchData = async () => {
  try {
    setLoading(true);
    const response = await fetch('/api/endpoint');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    setData(data);
  } catch (error) {
    setError(error.message);
  } finally {
    setLoading(false);
  }
};
```

### Parallel API calls:
```tsx
const [res1, res2, res3] = await Promise.all([
  fetch('/api/endpoint1'),
  fetch('/api/endpoint2'),
  fetch('/api/endpoint3')
]);
```

## 📱 Responsive Grid Layout

```tsx
<Grid container spacing={3}>
  <Grid item xs={12} sm={6} md={3}>
    {/* Card takes full width on mobile, half on tablet, quarter on desktop */}
  </Grid>
</Grid>
```

## 🎨 Color Coding for Cards

```tsx
const cardConfigs = [
  { color: '#1976d2', icon: <Inventory /> },     // Blue for inventory
  { color: '#388e3c', icon: <People /> },        // Green for customers
  { color: '#f57c00', icon: <ShoppingCart /> },  // Orange for orders
  { color: '#d32f2f', icon: <Warning /> },       // Red for warnings
];
```

## 🔧 Custom Hook (Bonus)

```tsx
// apps/web/hooks/useDashboardData.ts
import { useState, useEffect } from 'react';

export const useDashboardData = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    // Your fetch logic here
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { data, loading, error, refetch: fetchData };
};

// Usage in component:
const { data, loading, error } = useDashboardData();
```

## 🐛 Common Issues & Solutions

**Issue**: API calls fail
**Solution**: Check that your backend is running on port 8000

**Issue**: Cards don't align properly
**Solution**: Use `height: '100%'` on Card component

**Issue**: Loading states don't show
**Solution**: Ensure loading state is true initially and set to false in finally block

## ✨ Bonus Challenges

- [ ] Add refresh button to refetch data
- [ ] Implement auto-refresh every 30 seconds
- [ ] Add percentage change indicators (up/down arrows)
- [ ] Create charts below the cards
- [ ] Add click handlers to navigate to detailed views
- [ ] Implement skeleton loading placeholders

## 🔗 API Endpoints to Use

- `GET /api/inventory` - Total items count
- `GET /api/customers` - Total customers count
- `GET /api/orders?status=pending` - Pending orders count
- `GET /api/inventory/low-stock?threshold=20` - Low stock items

## ✅ How to Test

1. Navigate to `/dashboard` route
2. Verify all 4 cards are displayed
3. Check that real data loads from API
4. Test loading states appear briefly
5. Verify error handling if backend is down
6. Test responsive layout on different screen sizes

## 🎉 Completion Criteria

Your dashboard is complete when:
- ✅ 4 metric cards display correctly
- ✅ Real data loads from API endpoints
- ✅ Loading states work properly
- ✅ Error handling prevents crashes
- ✅ Responsive layout works on mobile/desktop
- ✅ Icons and colors are appropriate for each metric

---

**← Previous: [Task 3 - Sidebar Navigation](./task-03-sidebar.md)**  
**Next Step: [Task 5 - Inventory List with Search](./task-05-inventory-search.md) →**
