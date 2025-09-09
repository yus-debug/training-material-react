// apps/web/components/charts/SalesChart.tsx
import React from 'react';
import {LineChart,Line,XAxis,YAxis,CartesianGrid,Tooltip,ResponsiveContainer} from 'recharts';
import { Paper, Typography } from '@mui/material';

interface SalesChartProps {
  data: Array<{ month: string; revenue: number; orders: number }>;
}

export const SalesChart: React.FC<SalesChartProps> = ({ data }) => {
  return (
    <Paper sx={{ p: 3, height: 400, borderRadius: 3, overflow: 'hidden', padding:"50px"}}>
      <Typography variant="h6" gutterBottom>
        Sales Trend
      </Typography>

      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />

          {/* Always show currency + "Revenue" label */}
          <Tooltip
            formatter={(value) => [
              `$${Number(value).toLocaleString()}`,
              'Revenue',
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
