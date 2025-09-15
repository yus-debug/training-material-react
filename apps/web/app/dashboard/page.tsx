// apps/web/app/dashboard/page.tsx
'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import {Container, Grid, Typography, Box, Button, Alert, Stack,Card, CardContent, Skeleton} from '@mui/material';
import { Inventory, Warning } from '@mui/icons-material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useRouter } from 'next/navigation';
import { DashboardCard } from '../../components/DashboardCard';
import { useDashboardData, type DashboardData } from '../../hooks/useDashboardData';
import {LineChart, Line, XAxis, YAxis, CartesianGrid,Tooltip, Legend, ResponsiveContainer, BarChart, Bar, Cell, LabelList} from 'recharts';
import { PiShoppingCartSimpleFill } from "react-icons/pi";
import { IoPerson } from "react-icons/io5";
// % delta map
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

  // % changes
  const prevRef = useRef<DashboardData | null>(null);
  const [deltas, setDeltas] = useState<DeltaMap>(initialDeltas);

  useEffect(() => {
    if (loading) return;
    const prev = prevRef.current;

    const pct = (prevVal: number | null, currVal: number): number | null => {
      if (prevVal === null || prevVal === 0) return null;
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

  // order history chart
  const [history, setHistory] = useState<HistoryPoint[]>([]);
  const lastStampRef = useRef<number>(0);

  useEffect(() => {
    if (loading) return;
    const now = Date.now();
    if (now - lastStampRef.current < 1000) return;
    lastStampRef.current = now;

    setHistory(prev => {
      const next = [...prev, { t: new Date().toLocaleTimeString(), orders: data.pendingOrders }];
      if (next.length > 20) next.shift();
      return next;
    });
  }, [data, loading]);

  // KPI breakdown chart
  const kpiBarData = useMemo(
    () => ([
      { name: 'Items', value: data.totalItems, fill: '#60BEDE' },
      { name: 'Customers', value: data.totalCustomers, fill: '#865CC1' }, 
      { name: 'Orders', value: data.pendingOrders, fill: '#EE4888' },
      { name: 'Low Stock', value: data.lowStockItems, fill: '#FDA63A' },
    ]),
    [data]
  );

  const cardConfigs = [
    { key: 'totalItems' as const, title: 'Total Items', color: '#60BEDE', icon: <Inventory />, href: '/inventory' },
    { key: 'pendingOrders' as const, title: 'Pending Orders', color: '#EE4888', icon:<PiShoppingCartSimpleFill />, href: '/orders?status=pending' },
    { key: 'totalCustomers' as const, title: 'Total Customers', color: '#865CC1', icon:<IoPerson />, href: '/customers' },
    
    { key: 'lowStockItems' as const, title: 'Low Stock Items', color: '#FDA63A', icon: <Warning />, href: '/inventory/low-stock' },
  ];

  return (
    <Container maxWidth="lg" sx={{ mb: 6 }}>
      {/* Error */}
      {error && (
        <Stack spacing={2} sx={{ mb: 3 }}>
          <Alert severity="error" variant="outlined" action={<Button color="error" size="small" onClick={refetch}>Retry</Button>}>
            {error}
          </Alert>
        </Stack>
      )}

      <Grid container spacing={3}>
        {/*KPI Cards */}
        <Grid item xs={12} md={3} >
          <Box sx={{ mb: 2, textAlign: 'left' }}>
            <Typography variant="h4" component="h1" gutterBottom>Dashboard</Typography>
            <Typography variant="body2" color="text.secondary">
              {lastUpdated ? `Last updated: ${lastUpdated.toLocaleString()}` : (loading ? 'Loading…' : 'Ready')}
            </Typography>
          </Box>
          <Grid container spacing={4} sx={{ mt: 4 }}>
            {cardConfigs.map(({ key, title, color, icon, href }) => (
              <Grid item xs={12} key={key}>
                <Box sx={{ maxWidth: 220, mx: 'auto', mb: 2 }}>
                  <DashboardCard
                    title={title}
                    value={data[key]}
                    icon={icon}
                    color={color}
                    loading={loading}
                    delta={deltas[key]}
                    onClick={() => (router.push as any)(href)}
                  />
                </Box>
              </Grid>
            ))}
          </Grid>
        </Grid>

        <Grid item xs={12} md={8}>
          {/* Refresh Button */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Button onClick={refetch} startIcon={<RefreshIcon />} disabled={loading} variant="outlined" sx={{backgroundColor:'#FBA43C',color:'white',border:'none',height:50}}>
              Refresh
            </Button>
          </Box>
          <Grid container spacing={3}>
            {/* Bar Chart */}
            <Grid item xs={12}>
              <Card variant="outlined" sx={{
                maxWidth:550,
                marginTop:10,
                boxShadow: 4,
                '&:hover': {
                  boxShadow: 6,
                  transition: 'box-shadow 0.3s ease-in-out'
                }
              }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="h6">Current KPI Breakdown</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: 12, height: 8, backgroundColor: '#333', borderRadius: 0 }} />
                      <Typography variant="body2" sx={{ fontSize: '12px', color: '#666' }}>Value</Typography>
                    </Box>
                  </Box>
                  <Box sx={{ height: 180 }}>
                    {loading ? (
                      <Skeleton variant="rounded" width="100%" height="100%" />
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart 
                          data={kpiBarData}
                          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                          barCategoryGap="30%" >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name"  tick={{ fontSize: 12 }}  interval={0}/>
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="value" maxBarSize={12} radius={[4, 4, 0, 0]}>
                            <LabelList dataKey="value" position="top" 
                              style={{ 
                                fontSize: '12px', 
                                fontWeight: 'bold',
                                fill: '#333'
                              }} 
                            />
                            {kpiBarData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Line Chart */}
            <Grid item xs={12}>
              <Card variant="outlined" sx={{
                boxShadow: 4,
                borderRadius: 3,
                backgroundColor: '#60BEDE',
                '&:hover': {
                  boxShadow: 6,
                  transition: 'box-shadow 0.3s ease-in-out'
                }
              }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="h6" sx={{ color: 'black' }}>Orders Trend</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: 12, height: 8, backgroundColor: 'black', borderRadius: 0 }} />
                      <Typography variant="body2" sx={{ fontSize: '12px', color: 'black' }}>Orders</Typography>
                    </Box>
                  </Box>
                  <Box sx={{ height: 320 }}>
                    {loading ? (
                      <Skeleton variant="rounded" width="100%" height="100%" />
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={history}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="t" tick={{ fontSize: 12, fill: 'black' }}/>
                          <YAxis  tick={{ fontSize: 12, fill: 'black' }}/>
                          <Tooltip />
                          <Line type="monotone" dataKey="orders" stroke="black" strokeWidth={2} dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Container>
  );
}
