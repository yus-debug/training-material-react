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
    <Box sx={{ position: 'relative', height: '100%' }}>
      {/* Icon */}
      <Box
        sx={{
          position: 'absolute',
          top: -30,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 2,
        }}>
        {loading ? (
          <Skeleton variant="rounded" width={60} height={60} />
        ) : (
          <Box
            sx={{
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              width: 60, 
              height: 60, 
              borderRadius: '50%',
              backgroundColor: color, 
              color: 'white',
              boxShadow: 2,
              fontSize: '25px',
            }}>
            {icon}
          </Box>
        )}
      </Box>

      <Card
        sx={{ 
          height: 140,
          cursor: onClick ? 'pointer' : 'default',
          pt: 2,
          boxShadow: 3,
          '&:hover': {
            boxShadow: 6,
            transform: 'translateY(-2px)',
            transition: 'all 0.3s ease-in-out'
          }
        }}
        onClick={onClick}>
        <CardContent sx={{ 
          textAlign: 'center', 
          pt: 3,
          pb: 2,
          px: 2,
          '&:last-child': { pb: 2 }
        }}>
          {/* content */}
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            height: '100%',
            gap: 1
          }}>
            {loading ? (
              <>
                <Skeleton variant="text" width={100} height={20} />
                <Skeleton variant="text" width={60} height={28} />
                {renderDelta()}
              </>
            ) : (
              <>
                <Typography variant="body2" component="div" sx={{ fontSize: '0.875rem', fontWeight: 500 }}>
                  {title}
                </Typography>
                <Typography variant="h5" component="div" sx={{ fontWeight: 'bold', lineHeight: 1.2, color: color }}>
                  {value}
                </Typography>
                {renderDelta()}
              </>
            )}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};
