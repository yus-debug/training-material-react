
// apps/web/components/cart/ConfirmationStep.tsx
import React from 'react';
import {Box,Typography,Alert,Button} from '@mui/material';
import { CheckCircle } from '@mui/icons-material';
import { useRouter } from 'next/navigation';

interface ConfirmationStepProps {
  orderNumber: string;
}

export const ConfirmationStep: React.FC<ConfirmationStepProps> = ({
  orderNumber
}) => {
  const router = useRouter();

  return (
    <Box sx={{ textAlign: 'center', py: 4 }}>
      <CheckCircle sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
      
      <Typography variant="h4" gutterBottom>
        Order Confirmed!
      </Typography>
      
      <Typography variant="h6" color="text.secondary" gutterBottom>
        Order Number: {orderNumber}
      </Typography>

      <Alert severity="success" sx={{ mb: 3, maxWidth: 400, mx: 'auto' }}>
        Your order has been successfully placed and is being processed.
      </Alert>

      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
        <Button 
          variant="outlined"
          onClick={() => router.push('/orders')}
        >
          View Orders
        </Button>
        <Button 
          variant="contained"
          onClick={() => router.push('/inventory')}
        >
          Continue Shopping
        </Button>
      </Box>
    </Box>
  );
};