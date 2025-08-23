// apps/web/components/charts/TopProductsChart.tsx
'use client';

import React, { useMemo } from 'react';
import {ResponsiveContainer,BarChart,Bar,XAxis,YAxis,CartesianGrid,Tooltip,Cell,LabelList,} from 'recharts';
import { Paper, Typography } from '@mui/material';

type TopProduct = { name: string; sales: number; revenue: number };

export default function TopProductsChart({ data }: { data: TopProduct[] }) {
  const safeData = (data ?? []).map((d) => ({
    name: String(d?.name ?? ''),
    sales: Number(d?.sales ?? 0),
    revenue: Number(d?.revenue ?? 0),
  }));

  const COLORS = ['#6366F1','#22C55E','#F97316','#06B6D4','#F43F5E','#84CC16','#A855F7','#EAB308'];

  const domainMax = useMemo(() => {
    const max = safeData.reduce((m, d) => Math.max(m, d.sales), 0);
    if (max <= 10) return 10;
    if (max <= 25) return 25;
    if (max <= 50) return 50;
    if (max <= 100) return 100;
    return Math.ceil(max / 25) * 25;
  }, [safeData]);


  const renderValueLabel = (props: any) => {
    const { x = 0, y = 0, width = 0, height = 0, value } = props;
    const v = Array.isArray(value) ? value[0] : value;
    return (
      <text
        x={x + width + 6}
        y={y + height / 2}
        dy={4}
        textAnchor="start"
        fill="#e5e7eb"
        fontSize={12}
      >
        {v}
      </text>
    );
  };

  return (
    <Paper sx={{ p: 3, height: 400 }}>
      <Typography variant="h6" gutterBottom>
        Top Products by Sales
      </Typography>

      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={safeData}
          layout="vertical"
          margin={{ top: 8, right: 28, left: 12, bottom: 8 }}
          barCategoryGap="24%"
          barGap={8}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            type="number"
            domain={[0, domainMax]}
            allowDecimals={false}
            tick={{ fontSize: 12 }}
          />
          <YAxis
            type="category"
            dataKey="name"
            width={120}
            tick={{ fontSize: 12 }}
          />
          <Tooltip cursor={{ fill: 'transparent' }}
          formatter={(v: number) => [v, 'Units Sold']} />
          <Bar dataKey="sales" radius={[6, 6, 6, 6]} barSize={18}>
            {safeData.map((entry, idx) => (
              <Cell key={`cell-${entry.name}-${idx}`} fill={COLORS[idx % COLORS.length]} />
            ))}
            <LabelList dataKey="sales" position="right" content={renderValueLabel} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Paper>
  );
}
