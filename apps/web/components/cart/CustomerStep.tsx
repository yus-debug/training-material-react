// apps/web/components/cart/CustomerStep.tsx
import React, { useState, useEffect } from 'react';
import {Box,Typography,FormControl,InputLabel,Select,MenuItem,Button,Alert} from '@mui/material';

interface Customer {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  full_name: string;
}

interface CustomerStepProps {
  onNext: (customerId: number) => void;
  onBack: () => void;
  selectedCustomerId?: number;
}

export const CustomerStep: React.FC<CustomerStepProps> = ({
  onNext,
  onBack,
  selectedCustomerId
}) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedId, setSelectedId] = useState<number>(selectedCustomerId || 0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8000/api/customers');
      if (!response.ok) throw new Error('Failed to fetch customers');
      
      const data = await response.json();
      setCustomers(data.items || data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (selectedId) {
      onNext(selectedId);
    }
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Select Customer
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel>Customer</InputLabel>
        <Select
          value={selectedId}
          label="Customer"
          onChange={(e) => setSelectedId(Number(e.target.value))}
          disabled={loading}
        >
          <MenuItem value={0}>
            <em>Select a customer</em>
          </MenuItem>
          {customers.map((customer) => (
            <MenuItem key={customer.id} value={customer.id}>
              {customer.full_name || `${customer.first_name} ${customer.last_name}`} ({customer.email})
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Alert severity="info" sx={{ mb: 3 }}>
        In a real application, you would have options to create a new customer or guest checkout here.
      </Alert>

      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button variant="outlined" onClick={onBack}>
          Back to Cart
        </Button>
        <Button 
          variant="contained"
          onClick={handleNext}
          disabled={!selectedId || loading}
        >
          Continue to Review
        </Button>
      </Box>
    </Box>
  );
};