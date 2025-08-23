// apps/web/components/charts/InventoryChart.tsx
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Paper, Typography } from '@mui/material';

interface InventoryChartProps {
  data: Array<{ name: string; value: number; color: string }>;
}

export const InventoryChart: React.FC<InventoryChartProps> = ({ data }) => {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const renderCustomLabel = (entry: any) =>
    total > 0 ? `${((entry.value / total) * 100).toFixed(1)}%` : '0%';

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Inventory by Category
      </Typography>
      <ResponsiveContainer width="100%" height={300}>
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
            {data.map((entry, i) => (
              <Cell key={`cell-${i}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip formatter={(value: number) => [value, 'Items']} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </Paper>
  );
};
