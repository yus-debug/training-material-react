// apps/web/components/OrderForm.tsx
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  Paper,
  Typography,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Box,
  Divider,
  Alert,
} from '@mui/material';
import { Add } from '@mui/icons-material';
import { useForm, useFieldArray, FormProvider, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { orderSchema, type OrderFormData } from '../schemas/orderSchema';
import { OrderItemForm } from './OrderItemForm';
import { API_ENDPOINTS } from '../config/api';

const DRAFT_KEY = 'orderFormDraft_v1';

type Shipping = {
  full_name: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
};

// Only what the FastAPI /api/orders expects
type OrderPayload = {
  customer_id: number;
  items: { inventory_item_id: number; quantity: number; unit_price: number }[];
  tax_rate: number;
  shipping_cost: number;
  notes?: string;
};

export const OrderForm: React.FC = () => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [inventoryItems, setInventoryItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // RHF uses only fields from the schema
  const methods = useForm<OrderFormData>({
    resolver: zodResolver(orderSchema),
    mode: 'onChange',
    defaultValues: {
      customer_id: 0,
      items: [{ inventory_item_id: 0, quantity: 1, unit_price: 0 }],
      tax_rate: 0.08,
      shipping_cost: 9.99,
      notes: '',
    },
  });

  const { control, watch, reset } = methods;

  // Array of items
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  // Simple shipping UI (kept in local state, not sent to API)
  const [shipping, setShipping] = useState<Shipping>({
    full_name: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'US',
  });

  // Totals (UI side)
  const items = watch('items');
  const taxRate = watch('tax_rate');
  const shippingCost = watch('shipping_cost');

  const subtotal = useMemo(
    () =>
      (items ?? []).reduce(
        (sum, it) => sum + (Number(it.quantity) || 0) * (Number(it.unit_price) || 0),
        0
      ),
    [items]
  );

  const taxAmount = subtotal * (Number(taxRate) || 0);
  const total = subtotal + taxAmount + (Number(shippingCost) || 0);

  // Load customers & inventory from FastAPI
  useEffect(() => {
    (async () => {
      try {
        const [cRes, iRes] = await Promise.all([
          fetch(API_ENDPOINTS.fetchCustomers),
          fetch(API_ENDPOINTS.fetchInventory),
        ]);
        const cData = await cRes.json();
        const iData = await iRes.json();
        setCustomers(cData.items || cData);
        setInventoryItems(iData.items || iData);
      } catch (err) {
        console.error('Failed to fetch data:', err);
      }
    })();
  }, []);

  // Draft: load once + autosave
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as {
          form?: Partial<OrderFormData>;
          shipping?: Shipping;
        };
        if (parsed.form) {
          reset({
            customer_id: Number(parsed.form.customer_id) || 0,
            items:
              parsed.form.items && parsed.form.items.length
                ? parsed.form.items.map((i) => ({
                    inventory_item_id: Number(i.inventory_item_id) || 0,
                    quantity: Number(i.quantity) || 1,
                    unit_price: Number(i.unit_price) || 0,
                  }))
                : [{ inventory_item_id: 0, quantity: 1, unit_price: 0 }],
            tax_rate: Number(parsed.form.tax_rate) || 0.08,
            shipping_cost: Number(parsed.form.shipping_cost) || 9.99,
            notes: parsed.form.notes ?? '',
          });
        }
        if (parsed.shipping) setShipping(parsed.shipping);
      }
    } catch {}

    const sub = methods.watch((value) => {
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify({ form: value, shipping }));
      } catch {}
    });

    return () => sub.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Submit → POST to FastAPI (uses endpoint with trailing slash)
  const onSubmit = async (data: OrderFormData) => {
    try {
      setLoading(true);

      const payload: OrderPayload = {
        customer_id: Number(data.customer_id),
        items: (data.items ?? []).map((i) => ({
          inventory_item_id: Number(i.inventory_item_id),
          quantity: Number(i.quantity),
          unit_price: Number(i.unit_price),
        })),
        tax_rate: Number(data.tax_rate),
        shipping_cost: Number(data.shipping_cost),
        notes: data.notes ?? '',
      };

      // helpful log to verify submission triggers
      console.log('Submitting payload:', payload);

      const res = await fetch(API_ENDPOINTS.fetchOrder, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Failed to create order');

      setSuccess(true);
      // clear form + draft
      reset({
        customer_id: 0,
        items: [{ inventory_item_id: 0, quantity: 1, unit_price: 0 }],
        tax_rate: 0.08,
        shipping_cost: 9.99,
        notes: '',
      });
      setShipping({
        full_name: '',
        address1: '',
        address2: '',
        city: '',
        state: '',
        postal_code: '',
        country: 'US',
      });
      try {
        localStorage.removeItem(DRAFT_KEY);
      } catch {}
    } catch (err) {
      console.error('Order creation failed:', err);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Alert
        severity="success"
        action={<Button onClick={() => setSuccess(false)}>Create Another</Button>}
      >
        Order created successfully!
      </Alert>
    );
  }

  return (
    <FormProvider {...methods}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Create New Order
        </Typography>

        <form onSubmit={methods.handleSubmit(onSubmit)}>
          {/* Customer */}
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Controller
                name="customer_id"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <FormControl fullWidth error={!!error}>
                    <InputLabel>Customer</InputLabel>
                    <Select
                      {...field}
                      label="Customer"
                      value={field.value ?? 0}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    >
                      {customers.map((c: any) => (
                        <MenuItem key={c.id} value={c.id}>
                          {c.full_name || `${c.first_name} ${c.last_name}`}
                        </MenuItem>
                      ))}
                    </Select>
                    {error && <Typography color="error">{error.message}</Typography>}
                  </FormControl>
                )}
              />
            </Grid>
          </Grid>

          {/* Shipping (UI-only) */}
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Shipping Address
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Full name"
                  fullWidth
                  value={shipping.full_name}
                  onChange={(e) => setShipping((s) => ({ ...s, full_name: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Country"
                  fullWidth
                  value={shipping.country}
                  onChange={(e) => setShipping((s) => ({ ...s, country: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Address line 1"
                  fullWidth
                  value={shipping.address1}
                  onChange={(e) => setShipping((s) => ({ ...s, address1: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Address line 2 (optional)"
                  fullWidth
                  value={shipping.address2}
                  onChange={(e) => setShipping((s) => ({ ...s, address2: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  label="City"
                  fullWidth
                  value={shipping.city}
                  onChange={(e) => setShipping((s) => ({ ...s, city: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  label="State / Region"
                  fullWidth
                  value={shipping.state}
                  onChange={(e) => setShipping((s) => ({ ...s, state: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  label="Postal code"
                  fullWidth
                  value={shipping.postal_code}
                  onChange={(e) => setShipping((s) => ({ ...s, postal_code: e.target.value }))}
                />
              </Grid>
            </Grid>
          </Box>

          {/* Items */}
          <Box sx={{ mt: 3 }}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 2,
              }}
            >
              <Typography variant="h6">Order Items</Typography>
              <Button
                startIcon={<Add />}
                onClick={() => append({ inventory_item_id: 0, quantity: 1, unit_price: 0 })}
              >
                Add Item
              </Button>
            </Box>

            {fields.map((field, index) => (
              <OrderItemForm
                key={field.id}
                index={index}
                onRemove={() => remove(index)}
                inventoryItems={inventoryItems}
              />
            ))}
          </Box>

          {/* Totals */}
          <Paper sx={{ p: 2, mt: 3, backgroundColor: 'action.hover' }}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography>Subtotal:</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography align="right">${subtotal.toFixed(2)}</Typography>
              </Grid>

              <Grid item xs={6}>
                <Typography>Tax ({((Number(taxRate) || 0) * 100).toFixed(1)}%):</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography align="right">${taxAmount.toFixed(2)}</Typography>
              </Grid>

              <Grid item xs={6}>
                <Typography>Shipping:</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography align="right">
                  ${(Number(shippingCost) || 0).toFixed(2)}
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 1 }} />
              </Grid>

              <Grid item xs={6}>
                <Typography variant="h6">Total:</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="h6" align="right">
                  ${total.toFixed(2)}
                </Typography>
              </Grid>
            </Grid>
          </Paper>

          {/* Notes */}
          <Box sx={{ mt: 3 }}>
            <Controller
              name="notes"
              control={control}
              render={({ field }) => (
                <TextField {...field} label="Order Notes" multiline rows={3} fullWidth />
              )}
            />
          </Box>

          {/* Actions */}
          <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
            <Button
              variant="outlined"
              onClick={() => {
                reset({
                  customer_id: 0,
                  items: [{ inventory_item_id: 0, quantity: 1, unit_price: 0 }],
                  tax_rate: 0.08,
                  shipping_cost: 9.99,
                  notes: '',
                });
                setShipping({
                  full_name: '',
                  address1: '',
                  address2: '',
                  city: '',
                  state: '',
                  postal_code: '',
                  country: 'US',
                });
                try {
                  localStorage.removeItem(DRAFT_KEY);
                } catch {}
              }}
            >
              Cancel
            </Button>
            <Button type="submit" variant="contained" disabled={loading}>
              {loading ? 'Creating...' : 'Create Order'}
            </Button>
          </Box>
        </form>
      </Paper>
    </FormProvider>
  );
};
