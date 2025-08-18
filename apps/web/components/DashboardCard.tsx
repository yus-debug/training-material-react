// apps/web/components/DashboardCard.tsx
'use client';
import React from 'react';
import {Card, CardContent, Typography, Box, Tooltip, Skeleton} from '@mui/material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import RemoveIcon from '@mui/icons-material/Remove';

interface DashboardCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color?: string;
  loading?: boolean;
  delta?: number | null;
  onClick?: () => void;
}

export const DashboardCard: React.FC<DashboardCardProps> = ({
  title, value, icon, color = '#1976d2', loading = false, delta = null, onClick
}) => {
  const renderDelta = () => {
    if (loading) {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.75 }}>
          <Skeleton variant="circular" width={16} height={16} sx={{ mr: 0.75 }} />
          <Skeleton variant="text" width={48} height={18} />
        </Box>
      );
    }

    if (delta === null || delta === undefined) return null;

    const up = delta > 0;
    const down = delta < 0;
    const tint = up ? 'success.main' : down ? 'error.main' : 'text.secondary';
    const Icon = up ? ArrowUpwardIcon : down ? ArrowDownwardIcon : RemoveIcon;

    return (
      <Tooltip title="Change since last update">
        <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
          <Icon fontSize="small" sx={{ color: tint, mr: 0.5 }} />
          <Typography variant="body2" sx={{ color: tint, fontWeight: 600 }}>
            {up ? '+' : ''}{(delta * 100).toFixed(1)}%
          </Typography>
        </Box>
      </Tooltip>
    );
  };

  return (
    <Card
      sx={{ height: '100%', cursor: onClick ? 'pointer' : 'default' }}
      onClick={onClick}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          {/* Icon square skeleton */}
          <Box sx={{ mr: 2 }}>
            {loading ? (
              <Skeleton variant="rounded" width={48} height={48} />
            ) : (
              <Box
                sx={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: 48, height: 48, borderRadius: 1, backgroundColor: color, color: 'white',
                }}>
                {icon}
              </Box>
            )}
          </Box>

          {/* Title and  Value skeleton */}
          <Box>
            {loading ? (
              <>
                <Skeleton variant="text" width={120} height={24} sx={{ mb: 0.5 }} />
                <Skeleton variant="text" width={80} height={36} />
                {renderDelta()}
              </>
            ) : (
              <>
                <Typography variant="h6" component="div">{title}</Typography>
                <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                  {value}
                </Typography>
                {renderDelta()}
              </>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};
