// apps/web/components/InventoryList.tsx
import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';

interface InventoryItem {
  id: string | number;
  name: string;
  description?: string;
  category: string;
  quantity: number;
  price: number;
  sku: string;
}

interface InventoryListProps {
  items: InventoryItem[];
  loading: boolean;
  error: string | null;
  searchTerm: string;
}

export const InventoryList: React.FC<InventoryListProps> = ({
  items,
  loading,
  error,
  searchTerm,
}) => {
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  if (items.length === 0) {
    return (
      <Alert severity="info" sx={{ mb: 2 }}>
        {searchTerm ? `No items found matching "${searchTerm}"` : 'No inventory items found'}
      </Alert>
    );
  }

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Found {items.length} item{items.length === 1 ? '' : 's'}
        {searchTerm && ` matching "${searchTerm}"`}
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {items.map((item) => (
          <Card key={item.id}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" component="div">
                    {item.name}
                  </Typography>
                  {item.description && (
                    <Typography color="text.secondary" sx={{ mb: 1 }}>
                      {item.description}
                    </Typography>
                  )}
                  <Typography variant="body2">SKU: {item.sku}</Typography>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'end', gap: 1 }}>
                  <Chip label={item.category} size="small" color="primary" variant="outlined" />
                  <Typography variant="h6" color="primary">
                    ${item.price}
                  </Typography>
                  <Typography variant="body2">Qty: {item.quantity}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );
};
