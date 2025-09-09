// apps/web/components/OrderForm.tsx
'use client';
import React, { useEffect, useMemo, useState } from 'react';
import {Paper,Typography,Button,Grid,FormControl,InputLabel,Select,MenuItem,TextField,Box,Divider,Alert,} from '@mui/material';
import { Add } from '@mui/icons-material';
import { useForm, useFieldArray, FormProvider, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { orderSchema, type OrderFormData } from '../schemas/orderSchema';
import { OrderItemForm } from './OrderItemForm';

const API = {
  customers: 'http://localhost:8000/api/customers',
  inventory: 'http://localhost:8000/api/inventory',
  orders: 'http://localhost:8000/api/orders',
};

const DRAFT_KEY = 'orderFormDraft_v1';

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
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // minimal defaults — no shipping in schema
  const methods = useForm<OrderFormData>({
    resolver: zodResolver(orderSchema),
    mode: 'onChange',
    defaultValues: {
      customer_id: null as any, // start empty so MUI Select won't warn
      items: [{ inventory_item_id: 0, quantity: 1, unit_price: 0 }],
      tax_rate: 0.08,
      shipping_cost: 9.99,
      notes: '',
    },
  });

  const { control, watch, reset, handleSubmit, formState } = methods;
  const { errors, isSubmitting } = formState;

  const { fields, append, remove } = useFieldArray({ control, name: 'items' });

  // Totals
  const items = watch('items');
  const taxRate = watch('tax_rate');
  const shippingCost = watch('shipping_cost');

  const subtotal = useMemo(
    () => (items ?? []).reduce(
      (sum, it) => sum + (Number(it.quantity) || 0) * (Number(it.unit_price) || 0),
      0
    ),
    [items]
  );
  const taxAmount = subtotal * (Number(taxRate) || 0);
  const total = subtotal + taxAmount + (Number(shippingCost) || 0);

  // Fetch data
  useEffect(() => {
    (async () => {
      try {
        const [cRes, iRes] = await Promise.all([fetch(API.customers), fetch(API.inventory)]);
        const cData = await cRes.json();
        const iData = await iRes.json();
        setCustomers(cData.items || cData);
        setInventoryItems(iData.items || iData);
      } catch (err) {
        console.error('Failed to fetch lists:', err);
      }
    })();
  }, []);

  // Draft load / save
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.form) {
          reset({
            customer_id: parsed.form.customer_id ?? (null as any),
            items:
              parsed.form.items?.length
                ? parsed.form.items.map((i: any) => ({
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
      }
    } catch {}
    const sub = methods.watch((value) => {
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify({ form: value }));
      } catch {}
    });
    return () => sub.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Submit
  const onSubmit = async (data: OrderFormData) => {
    setSubmitError(null);
    setSuccessMsg(null);
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

      // Debug: see the exact payload you’re sending
      console.log('[Order] submitting payload:', payload);

      const res = await fetch(API.orders, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(text || `Failed to create order (HTTP ${res.status})`);
      }

      const order = await res.json().catch(() => ({}));
      setSuccessMsg(`Order created${order?.id ? ` (#${order.id})` : ''}!`);
      reset({
        customer_id: null as any,
        items: [{ inventory_item_id: 0, quantity: 1, unit_price: 0 }],
        tax_rate: 0.08,
        shipping_cost: 9.99,
        notes: '',
      });
      try { localStorage.removeItem(DRAFT_KEY); } catch {}
    } catch (err: any) {
      console.error('[Order] submit failed:', err);
      setSubmitError(err?.message || 'Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  const onInvalid = (errs: any) => {
    // Surface first error quickly
    const first = Object.values(errs)[0] as any;
    const msg = first?.message || 'Please fix the highlighted fields.';
    setSubmitError(msg);
    console.warn('[Order] validation errors:', errs);
  };

  return (
    <FormProvider {...methods}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Create New Order
        </Typography>

        {/* Top errors / success */}
        {submitError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {submitError}
          </Alert>
        )}
        {successMsg && (
          <Alert
            severity="success"
            sx={{ mb: 2 }}
            action={<Button color="inherit" onClick={() => setSuccessMsg(null)}>OK</Button>}
          >
            {successMsg}
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit, onInvalid)} noValidate>
          {/* Customer */}
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Controller
                name="customer_id"
                control={control}
                render={({ field, fieldState: { error } }) => {
                  // keep value safe for MUI Select
                  const valid = customers.some((c) => c.id === field.value);
                  const value: number | '' = valid ? field.value : '';
                  return (
                    <FormControl fullWidth error={!!error}>
                      <InputLabel shrink>Customer</InputLabel>
                      <Select
                        {...field}
                        label="Customer"
                        value={value}
                        onChange={(e) =>
                          field.onChange(e.target.value === '' ? (null as any) : Number(e.target.value))
                        }
                        displayEmpty
                      >
                        <MenuItem value="">
                          <em>Select a customer…</em>
                        </MenuItem>
                        {customers.map((c: any) => (
                          <MenuItem key={c.id} value={c.id}>
                            {c.full_name || `${c.first_name} ${c.last_name}`}
                          </MenuItem>
                        ))}
                      </Select>
                      {error && <Typography color="error" variant="caption">{error.message}</Typography>}
                    </FormControl>
                  );
                }}
              />
            </Grid>
          </Grid>

          {/* Items */}
          <Box sx={{ mt: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
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
              <Grid item xs={6}><Typography>Subtotal:</Typography></Grid>
              <Grid item xs={6}><Typography align="right">${subtotal.toFixed(2)}</Typography></Grid>

              <Grid item xs={6}><Typography>Tax ({((Number(taxRate) || 0) * 100).toFixed(1)}%):</Typography></Grid>
              <Grid item xs={6}><Typography align="right">${taxAmount.toFixed(2)}</Typography></Grid>

              <Grid item xs={6}><Typography>Shipping:</Typography></Grid>
              <Grid item xs={6}><Typography align="right">${(Number(shippingCost) || 0).toFixed(2)}</Typography></Grid>

              <Grid item xs={12}><Divider sx={{ my: 1 }} /></Grid>

              <Grid item xs={6}><Typography variant="h6">Total:</Typography></Grid>
              <Grid item xs={6}><Typography variant="h6" align="right">${total.toFixed(2)}</Typography></Grid>
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
                  customer_id: null as any,
                  items: [{ inventory_item_id: 0, quantity: 1, unit_price: 0 }],
                  tax_rate: 0.08,
                  shipping_cost: 9.99,
                  notes: '',
                });
                try { localStorage.removeItem(DRAFT_KEY); } catch {}
              }}
            >
              Cancel
            </Button>
            <Button type="submit" variant="contained" disabled={loading || isSubmitting}>
              {loading || isSubmitting ? 'Creating…' : 'Create Order'}
            </Button>
          </Box>
        </form>
      </Paper>
    </FormProvider>
  );
};
