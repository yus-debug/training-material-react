'use client';
import React from 'react';
import { Container, Typography, Grid, CircularProgress, Alert, Paper } from '@mui/material';
import { InventoryChart } from '../../components/charts/InventoryChart';
import { SalesChart } from '../../components/charts/SalesChart';
import TopProductsChart from '../../components/charts/TopProductsChart';
import { useReportData } from '../../hooks/useReportData';
import StockStatusMini from '../../components/charts/StockStatusChart';  // ← add this

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
          
          <StockStatusMini data={data.stockStatus} />
        </Grid>
      </Grid>
    </Container>
  );
}
