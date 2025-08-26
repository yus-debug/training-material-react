// apps/web/components/cart/ReviewStep.tsx
import React, { useState, useEffect } from 'react';
import {Box,Typography,Card,CardContent,Button,Divider,Alert,TextField} from '@mui/material';
import { useCart } from '../../contexts/CartContext';

interface ReviewStepProps {
  customerId: number;
  onNext: (orderNumber: string) => void;
  onBack: () => void;
}

export const ReviewStep: React.FC<ReviewStepProps> = ({
  customerId,
  onNext,
  onBack
}) => {
  const { items, total, clearCart } = useCart();
  const [customer, setCustomer] = useState<any>(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const taxRate = 0.085;
  const shippingCost = 9.99;
  const taxAmount = total * taxRate;
  const finalTotal = total + taxAmount + shippingCost;

  useEffect(() => {
    fetchCustomer();
  }, [customerId]);

  const fetchCustomer = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/customers/${customerId}`);
      if (!response.ok) throw new Error('Failed to fetch customer');
      
      const customerData = await response.json();
      setCustomer(customerData);
    } catch (err) {
      setError('Failed to load customer information');
    }
  };

  const handleSubmitOrder = async () => {
    try {
      setLoading(true);
      setError(null);

      const orderData = {
        customer_id: customerId,
        items: items.map(item => ({
          inventory_item_id: item.id,
          quantity: item.quantity,
          unit_price: item.price
        })),
        tax_rate: taxRate,
        shipping_cost: shippingCost,
        notes: notes.trim() || undefined
      };

      const response = await fetch('http://localhost:8000/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      if (!response.ok) throw new Error('Failed to create order');

      const order = await response.json();
      clearCart();
      onNext(order.order_number || `ORD-${order.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  if (!customer) {
    return <Typography>Loading customer information...</Typography>;
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Review Your Order
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Customer Information */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Customer Information
          </Typography>
          <Typography>
            {customer.full_name || `${customer.first_name} ${customer.last_name}`}
          </Typography>
          <Typography color="text.secondary">
            {customer.email}
          </Typography>
          {customer.phone && (
            <Typography color="text.secondary">
              {customer.phone}
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* Order Items */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Order Items
          </Typography>
          {items.map((item) => (
            <Box key={item.id} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Box>
                <Typography>{item.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Qty: {item.quantity} × ${item.price.toFixed(2)}
                </Typography>
              </Box>
              <Typography variant="h6">
                ${(item.price * item.quantity).toFixed(2)}
              </Typography>
            </Box>
          ))}
        </CardContent>
      </Card>

      {/* Order Totals */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Order Summary
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography>Subtotal:</Typography>
            <Typography>${total.toFixed(2)}</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography>Tax:</Typography>
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

      {/* Order Notes */}
      <TextField
        fullWidth
        label="Order Notes (Optional)"
        multiline
        rows={3}
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        sx={{ mb: 3 }}
      />

      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button variant="outlined" onClick={onBack}>
          Back to Customer
        </Button>
        <Button 
          variant="contained"
          onClick={handleSubmitOrder}
          disabled={loading}
        >
          {loading ? 'Placing Order...' : 'Place Order'}
        </Button>
      </Box>
    </Box>
  );
};
