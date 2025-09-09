// apps/web/components/InventoryList.tsx
'use client';

import React from 'react';
import {Card,CardContent,Typography,Box,Chip,CircularProgress,Alert,Button,Tooltip,Snackbar,IconButton,Slide,} from '@mui/material';
import MuiAlert from '@mui/material/Alert'; // Alert Snackbar
import CloseIcon from '@mui/icons-material/Close';
import ShoppingCartOutlined from '@mui/icons-material/ShoppingCartOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useRouter } from 'next/navigation';
import { useCart } from '../contexts/CartContext';

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
  const router = useRouter();
  const { addItem } = useCart();

  //snackbar state
  const [snackOpen, setSnackOpen] = React.useState(false);
  const [snackMsg, setSnackMsg] = React.useState('');

  const handleSnackClose = (
    _?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === 'clickaway') return;
    setSnackOpen(false);
  };

  const handleAdd = (item: InventoryItem) => {
    const id = Number(item.id);
    const stock = Math.max(0, Number(item.quantity) || 0);
    if (!Number.isFinite(id) || stock <= 0) return;

    addItem({
      id,
      name: String(item.name),
      price: Number(item.price) || 0,
      sku: String(item.sku ?? `SKU-${id}`),
      maxQuantity: stock,
      quantity: 1,
    });

    setSnackMsg(`Added “${item.name}” to cart`);
    setSnackOpen(true);
  };

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
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: 2 }}>
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
                    ${Number(item.price).toFixed(2)}
                  </Typography>
                  <Typography variant="body2">Qty: {item.quantity}</Typography>

                  <Tooltip title={item.quantity > 0 ? 'Add to cart' : 'Out of stock'}>
                    <span>
                      <Button
                        size="small"
                        variant="contained"
                        startIcon={<ShoppingCartOutlined />}
                        onClick={() => handleAdd(item)}
                        disabled={item.quantity <= 0}
                        sx={{ mt: 1 }}
                      >
                        Add to cart
                      </Button>
                    </span>
                  </Tooltip>
                </Box>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>

      <Snackbar
        open={snackOpen}
        autoHideDuration={2500}
        onClose={handleSnackClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        TransitionComponent={(props) => <Slide {...props} direction="up" />}
      >
        <MuiAlert
          elevation={8}
          variant="filled"
          icon={<ShoppingCartOutlined fontSize="small" />}
          onClose={handleSnackClose}
          severity="success"
          sx={{
            borderRadius: 2,
            boxShadow: 4,
            bgcolor: 'success.main',
            color: 'success.contrastText',
            '& .MuiAlert-icon': { color: 'success.contrastText' },
            '& .MuiAlert-action': { alignItems: 'center' },
          }}
          action={
            <>
              <Button
                size="small"
                color="inherit"
                endIcon={<ArrowForwardIcon />}
                onClick={() => router.push('/cart')}
              >
                View Cart
              </Button>
              <IconButton
                size="small"
                color="inherit"
                onClick={handleSnackClose}
                aria-label="close"
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </>
          }
        >
          {snackMsg}
        </MuiAlert>
      </Snackbar>
    </Box>
  );
};
