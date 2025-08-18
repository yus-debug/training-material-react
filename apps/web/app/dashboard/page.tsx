// apps/web/app/dashboard/page.tsx
'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {Container, Grid, Typography, Box, Button, Alert, Stack, Card, CardContent, Skeleton} from '@mui/material';
import { Inventory, People, ShoppingCart, Warning } from '@mui/icons-material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useRouter } from 'next/navigation';
import { DashboardCard } from '../../components/DashboardCard';
import { useDashboardData, type DashboardData } from '../../hooks/useDashboardData';
import {LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,BarChart, Bar} from 'recharts';

// % delta
type DeltaMap = {
  totalItems: number | null;
  totalCustomers: number | null;
  pendingOrders: number | null;
  lowStockItems: number | null;
};

type HistoryPoint = { t: string; orders: number };

const initialDeltas: DeltaMap = {
  totalItems: null,
  totalCustomers: null,
  pendingOrders: null,
  lowStockItems: null,
};

export default function DashboardPage() {
  const router = useRouter();
  const { data, loading, error, lastUpdated, refetch } = useDashboardData();

  // % change and update value
  const prevRef = useRef<DashboardData | null>(null);
  const [deltas, setDeltas] = useState<DeltaMap>(initialDeltas);

  useEffect(() => {
    if (loading) return;
    const prev = prevRef.current;

    const pct = (prevVal: number | null, currVal: number): number | null => {
      if (prevVal === null) return null;
      if (prevVal === 0) return null;
      return (currVal - prevVal) / prevVal;
    };

    setDeltas({
      totalItems: pct(prev?.totalItems ?? null, data.totalItems),
      totalCustomers: pct(prev?.totalCustomers ?? null, data.totalCustomers),
      pendingOrders: pct(prev?.pendingOrders ?? null, data.pendingOrders),
      lowStockItems: pct(prev?.lowStockItems ?? null, data.lowStockItems),
    });

    prevRef.current = { ...data };
  }, [data, loading]);

  // time,history for charts
  const [history, setHistory] = useState<HistoryPoint[]>([]);
  const lastStampRef = useRef<number>(0);
  useEffect(() => {
    if (loading) return;
    const now = Date.now();
    if (now - lastStampRef.current < 1000) return; // avoid duplicate points in dev
    lastStampRef.current = now;
    setHistory(prev => {
      const next = [...prev, { t: new Date().toLocaleTimeString(), orders: data.pendingOrders }];
      if (next.length > 20) next.shift();
      return next;
    });
  }, [data, loading]);

  // bar chart
  const kpiBarData = useMemo(
    () => ([
      {name:'Items',value:data.totalItems},
      {name:'Customers',value:data.totalCustomers},
      {name:'Orders',value:data.pendingOrders},
      {name:'Low Stock',value:data.lowStockItems},
    ]),
    [data]
  );

  //given code 
  const cardConfigs = [
    {key: 'totalItems' as const,     title: 'Total Items',     color: '#1976d2', icon: <Inventory />,    href: '/inventory' },
    {key: 'totalCustomers' as const, title: 'Total Customers', color: '#388e3c', icon: <People />,       href: '/customers' },
    {key: 'pendingOrders' as const,  title: 'Pending Orders',  color: '#f57c00', icon: <ShoppingCart />, href: '/orders?status=pending' },
    {key: 'lowStockItems' as const,  title: 'Low Stock Items', color: '#d32f2f', icon: <Warning />,      href: '/inventory/low-stock' },
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
      {/* Header given code*/}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>Dashboard</Typography>
          <Typography variant="body2" color="text.secondary">
            {lastUpdated ? `Last updated: ${lastUpdated.toLocaleString()}` : (loading ? 'Loading…' : 'Ready')}
          </Typography>
        </Box>
        <Button onClick={refetch} startIcon={<RefreshIcon />} disabled={loading} variant="outlined">
          Refresh
        </Button>
      </Box>

      {/* Error */}
      {error && (
        <Stack spacing={2} sx={{ mb: 3 }}>
          <Alert severity="error" variant="outlined" action={<Button color="error" size="small" onClick={refetch}>Retry</Button>}>
            {error}
          </Alert>
        </Stack>
      )}

      {/* Cards given code*/}
      <Grid container spacing={3}>
        {cardConfigs.map(({ key, title, color, icon, href }) => (
          <Grid item xs={12} sm={6} md={3} key={key}>
            <DashboardCard
              title={title}
              value={data[key]}
              icon={icon}
              color={color}
              loading={loading}
              delta={deltas[key]}
              onClick={() => (router.push as any)(href)}/>
          </Grid>
        ))}
      </Grid>

      {/* Charts */}
      <Box sx={{ mt: 5 }}>
        <Grid container spacing={3}>
          {/* Orders Trend */}
          <Grid item xs={12} md={7}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>Orders Trend</Typography>
                <Box sx={{ height: 320 }}>
                  {loading ? (
                    <Skeleton variant="rounded" width="100%" height="100%" />
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={history}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="t" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="orders" stroke="#1976d2" strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* KPI Breakdown */}
          <Grid item xs={12} md={5}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>Current KPI Breakdown</Typography>
                <Box sx={{ height: 320 }}>
                  {loading ? (
                    <Skeleton variant="rounded" width="100%" height="100%" />
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={kpiBarData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="value" fill="#388e3c" />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
}
