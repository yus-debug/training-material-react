'use client';
import * as React from 'react';
import { Paper, Stack, Typography, Box } from '@mui/material';
import WarningAmberOutlined from '@mui/icons-material/WarningAmberOutlined';
import {ResponsiveContainer,BarChart,Bar,XAxis,YAxis,Tooltip,LabelList,} from 'recharts';

type StockDatum = { name: string; low: number; normal: number; high: number };

export default function StockStatusChart({ data }: { data: StockDatum[] }) {
  const { low = 0, normal = 0, high = 0 } = data?.[0] ?? ({} as StockDatum);
  const total = Math.max(1, low + normal + high);

  // percentages for the three rows
  const chartData = [
    { label: 'Low', value: Math.round((low / total) * 100) },
    { label: 'Normal', value: Math.round((normal / total) * 100) },
    { label: 'High', value: Math.round((high / total) * 100) },
  ];

  return (
    <Paper
      sx={{ p: 3,
        height: 400,                 // same height as your other charts
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 3,
        padding:"50px"
      }}
    >
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
        <WarningAmberOutlined fontSize="small" />
        <Typography variant="h6">Stock Status</Typography>
      </Stack>

      <Box sx={{ flex: 1, width: '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            barCategoryGap={36}
            barGap={10}
            margin={{ top: 8, right: 24, bottom: 8, left: 5 }}
          >
            <YAxis
              type="category"
              dataKey="label"
              width={84}
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'rgba(255,255,255,0.85)', fontSize: 12 }}
            />
            <XAxis type="number" domain={[0, 100]} hide />

            <Tooltip
              cursor={{ fill: 'transparent' }}
              formatter={(v: any) => [`${v}%`, 'Percentage']}
            />

            <defs>
              <pattern id="miniStripe2" patternUnits="userSpaceOnUse" width="8" height="8">
                <rect width="8" height="8" fill="rgba(255, 191, 0, 0.55)" />
                <path d="M0,0 l8,8" stroke="rgba(158, 237, 12, 0.35)" strokeWidth="2" />
              </pattern>
            </defs>

            <Bar
              dataKey="value"
              barSize={22}                         // thicker bars so the card feels filled
              radius={[6, 6, 6, 6]}
              fill="url(#miniStripe2)"
              background={{ fill: 'rgba(255,255,255,0.12)', radius: 6 }}
            >
              <LabelList
                dataKey="value"
                position="right"
                offset={10}
                formatter={(v: any) => `${v}%`}
                style={{ fill: 'rgba(203, 243, 5, 0.85)', fontSize: 12 }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
}
