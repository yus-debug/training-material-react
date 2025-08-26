// apps/web/components/cart/CartStep.tsx
import React from 'react';
import {Box,Typography,Card,CardContent,IconButton,TextField,Button,Divider} from '@mui/material';
import { Add, Remove, Delete } from '@mui/icons-material';
import { useCart } from '../../contexts/CartContext';

interface CartStepProps {
  onNext: () => void;
}

export const CartStep: React.FC<CartStepProps> = ({ onNext }) => {
  const { items, total, updateQuantity, removeItem } = useCart();

  const taxRate = 0.085; // 8.5%
  const shippingCost = 9.99;
  const taxAmount = total * taxRate;
  const finalTotal = total + taxAmount + shippingCost;

  if (items.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h6" color="text.secondary">
          Your cart is empty
        </Typography>
        <Button 
          variant="contained" 
          sx={{ mt: 2 }}
          onClick={() => window.history.back()}
        >
          Continue Shopping
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Shopping Cart ({items.length} {items.length === 1 ? 'item' : 'items'})
      </Typography>

      {items.map((item) => (
        <Card key={item.id} sx={{ mb: 2 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6">{item.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  SKU: {item.sku}
                </Typography>
                <Typography variant="h6" color="primary">
                  ${item.price.toFixed(2)}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <IconButton
                  size="small"
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  disabled={item.quantity <= 1}
                >
                  <Remove />
                </IconButton>
                
                <TextField
                  size="small"
                  value={item.quantity}
                  onChange={(e) => {
                    const newQuantity = parseInt(e.target.value) || 1;
                    updateQuantity(item.id, newQuantity);
                  }}
                  inputProps={{ 
                    min: 1, 
                    max: item.maxQuantity,
                    style: { textAlign: 'center', width: '60px' }
                  }}
                  type="number"
                />
                
                <IconButton
                  size="small"
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  disabled={item.quantity >= item.maxQuantity}
                >
                  <Add />
                </IconButton>
              </Box>

              <Box sx={{ minWidth: 100, textAlign: 'right' }}>
                <Typography variant="h6">
                  ${(item.price * item.quantity).toFixed(2)}
                </Typography>
                {item.quantity >= item.maxQuantity && (
                  <Typography variant="caption" color="warning.main">
                    Max available
                  </Typography>
                )}
              </Box>

              <IconButton
                color="error"
                onClick={() => removeItem(item.id)}
              >
                <Delete />
              </IconButton>
            </Box>
          </CardContent>
        </Card>
      ))}

      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography>Subtotal:</Typography>
            <Typography>${total.toFixed(2)}</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography>Tax ({(taxRate * 100).toFixed(1)}%):</Typography>
            <Typography>${taxAmount.toFixed(2)}</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography>Shipping:</Typography>
            <Typography>${shippingCost.toFixed(2)}</Typography>
          </Box>
          <Divider sx={{ mb: 2 }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="h6">Total:</Typography>
            <Typography variant="h6">${finalTotal.toFixed(2)}</Typography>
          </Box>
        </CardContent>
      </Card>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
        <Button 
          variant="outlined"
          onClick={() => window.history.back()}
        >
          Continue Shopping
        </Button>
        <Button 
          variant="contained"
          onClick={onNext}
          disabled={items.length === 0}
        >
          Proceed to Checkout
        </Button>
      </Box>
    </Box>
  );
};