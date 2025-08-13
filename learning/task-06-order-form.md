# Task 6: Create an Order Form

**Difficulty: ⭐⭐⭐ (Medium)**  
**Time: 2-3 hours**  
**Prerequisites: Tasks 1-5 completed**

## 🎯 Learning Goals

- Master React Hook Form for complex forms
- Learn Zod schema validation
- Practice dynamic form arrays (add/remove items)
- Understand form state management
- Learn calculated fields and totals

## 📋 Task Description

Create a complete order form where users can select a customer and add multiple items with automatic total calculation.

## 🏗️ What You'll Build

```
┌─────────────────────────────────────────────────────────────┐
│                    Create New Order                          │
├─────────────────────────────────────────────────────────────┤
│ Customer: [Alice Cooper ▼]                                  │
│                                                              │
│ Order Items:                                         [+ Add] │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Product: [Wireless Headphones ▼] Qty: [2] Price: $99.99│ │
│ │ Total: $199.98                               [Remove]   │ │
│ └─────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Product: [Cotton T-Shirt ▼]      Qty: [1] Price: $19.99│ │
│ │ Total: $19.99                                [Remove]   │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                              │
│ Subtotal: $219.97                                           │
│ Tax (8%): $17.60                                            │
│ Shipping: $9.99                                             │
│ Total: $247.56                                              │
│                                                              │
│                                    [Cancel] [Create Order]  │
└─────────────────────────────────────────────────────────────┘
```

## 📁 Files to Create/Modify

- `apps/web/app/create-order/page.tsx` (new file)
- `apps/web/components/OrderForm.tsx` (new file)
- `apps/web/components/OrderItemForm.tsx` (new file)
- `apps/web/schemas/orderSchema.ts` (new file)

## ✅ Requirements

- [ ] Customer selection dropdown (fetch from API)
- [ ] Dynamic add/remove order items
- [ ] Product selection with inventory availability
- [ ] Quantity and price validation
- [ ] Real-time total calculations (subtotal, tax, shipping, total)
- [ ] Form validation using Zod
- [ ] Submit order to API
- [ ] Success/error feedback

## 💡 Hints & Guidance

### Step 1: Create Zod Schema

```tsx
// apps/web/schemas/orderSchema.ts
import { z } from 'zod';

export const orderItemSchema = z.object({
  inventory_item_id: z.number().min(1, 'Please select a product'),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  unit_price: z.number().min(0, 'Price must be positive')
});

export const orderSchema = z.object({
  customer_id: z.number().min(1, 'Please select a customer'),
  items: z.array(orderItemSchema).min(1, 'At least one item is required'),
  tax_rate: z.number().min(0).max(1).default(0.08),
  shipping_cost: z.number().min(0).default(9.99),
  notes: z.string().optional()
});

export type OrderFormData = z.infer<typeof orderSchema>;
export type OrderItemData = z.infer<typeof orderItemSchema>;
```

### Step 2: Create Order Item Component

```tsx
// apps/web/components/OrderItemForm.tsx
import React from 'react';
import {
  Card,
  CardContent,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Typography,
  IconButton,
  Box
} from '@mui/material';
import { Delete } from '@mui/icons-material';
import { Controller, useFormContext } from 'react-hook-form';

interface OrderItemFormProps {
  index: number;
  onRemove: () => void;
  inventoryItems: Array<{
    id: number;
    name: string;
    price: number;
    quantity: number;
  }>;
}

export const OrderItemForm: React.FC<OrderItemFormProps> = ({
  index,
  onRemove,
  inventoryItems
}) => {
  const { control, watch, setValue } = useFormContext();
  
  const selectedItemId = watch(`items.${index}.inventory_item_id`);
  const quantity = watch(`items.${index}.quantity`) || 0;
  const unitPrice = watch(`items.${index}.unit_price`) || 0;
  
  const selectedItem = inventoryItems.find(item => item.id === selectedItemId);
  const totalPrice = quantity * unitPrice;

  // Update unit price when product changes
  React.useEffect(() => {
    if (selectedItem) {
      setValue(`items.${index}.unit_price`, selectedItem.price);
    }
  }, [selectedItem, setValue, index]);

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <Controller
              name={`items.${index}.inventory_item_id`}
              control={control}
              render={({ field, fieldState: { error } }) => (
                <FormControl fullWidth error={!!error}>
                  <InputLabel>Product</InputLabel>
                  <Select {...field} label="Product">
                    {inventoryItems.map((item) => (
                      <MenuItem key={item.id} value={item.id}>
                        {item.name} (Stock: {item.quantity})
                      </MenuItem>
                    ))}
                  </Select>
                  {error && <Typography color="error">{error.message}</Typography>}
                </FormControl>
              )}
            />
          </Grid>
          
          <Grid item xs={6} md={2}>
            <Controller
              name={`items.${index}.quantity`}
              control={control}
              render={({ field, fieldState: { error } }) => (
                <TextField
                  {...field}
                  label="Quantity"
                  type="number"
                  fullWidth
                  error={!!error}
                  helperText={error?.message}
                  inputProps={{ min: 1, max: selectedItem?.quantity }}
                />
              )}
            />
          </Grid>
          
          <Grid item xs={6} md={2}>
            <Controller
              name={`items.${index}.unit_price`}
              control={control}
              render={({ field, fieldState: { error } }) => (
                <TextField
                  {...field}
                  label="Unit Price"
                  type="number"
                  fullWidth
                  error={!!error}
                  helperText={error?.message}
                  InputProps={{ startAdornment: '$' }}
                />
              )}
            />
          </Grid>
          
          <Grid item xs={8} md={3}>
            <Typography variant="h6">
              Total: ${totalPrice.toFixed(2)}
            </Typography>
            {selectedItem && quantity > selectedItem.quantity && (
              <Typography color="error" variant="caption">
                Insufficient stock ({selectedItem.quantity} available)
              </Typography>
            )}
          </Grid>
          
          <Grid item xs={4} md={1}>
            <IconButton onClick={onRemove} color="error">
              <Delete />
            </IconButton>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};
```

### Step 3: Create Main Order Form

```tsx
// apps/web/components/OrderForm.tsx
import React, { useState, useEffect } from 'react';
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
  Alert
} from '@mui/material';
import { Add } from '@mui/icons-material';
import { useForm, useFieldArray, FormProvider, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { orderSchema, type OrderFormData } from '../schemas/orderSchema';
import { OrderItemForm } from './OrderItemForm';

export const OrderForm: React.FC = () => {
  const [customers, setCustomers] = useState([]);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const methods = useForm<OrderFormData>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      customer_id: 0,
      items: [{ inventory_item_id: 0, quantity: 1, unit_price: 0 }],
      tax_rate: 0.08,
      shipping_cost: 9.99,
      notes: ''
    }
  });

  const { fields, append, remove } = useFieldArray({
    control: methods.control,
    name: 'items'
  });

  const watchedItems = methods.watch('items');
  const taxRate = methods.watch('tax_rate');
  const shippingCost = methods.watch('shipping_cost');

  // Calculate totals
  const subtotal = watchedItems.reduce((sum, item) => 
    sum + (item.quantity || 0) * (item.unit_price || 0), 0
  );
  const taxAmount = subtotal * taxRate;
  const total = subtotal + taxAmount + shippingCost;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [customersRes, inventoryRes] = await Promise.all([
        fetch('http://localhost:8000/api/customers'),
        fetch('http://localhost:8000/api/inventory')
      ]);

      const customersData = await customersRes.json();
      const inventoryData = await inventoryRes.json();

      setCustomers(customersData.items || customersData);
      setInventoryItems(inventoryData.items || inventoryData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  };

  const onSubmit = async (data: OrderFormData) => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8000/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!response.ok) throw new Error('Failed to create order');

      setSuccess(true);
      methods.reset();
    } catch (error) {
      console.error('Order creation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Alert severity="success" action={
        <Button onClick={() => setSuccess(false)}>Create Another</Button>
      }>
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
          {/* Customer Selection */}
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Controller
                name="customer_id"
                control={methods.control}
                render={({ field, fieldState: { error } }) => (
                  <FormControl fullWidth error={!!error}>
                    <InputLabel>Customer</InputLabel>
                    <Select {...field} label="Customer">
                      {customers.map((customer: any) => (
                        <MenuItem key={customer.id} value={customer.id}>
                          {customer.full_name || `${customer.first_name} ${customer.last_name}`}
                        </MenuItem>
                      ))}
                    </Select>
                    {error && <Typography color="error">{error.message}</Typography>}
                  </FormControl>
                )}
              />
            </Grid>
          </Grid>

          {/* Order Items */}
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

          {/* Order Totals */}
          <Paper sx={{ p: 2, mt: 3, backgroundColor: '#f5f5f5' }}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography>Subtotal:</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography align="right">${subtotal.toFixed(2)}</Typography>
              </Grid>
              
              <Grid item xs={6}>
                <Typography>Tax ({(taxRate * 100).toFixed(1)}%):</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography align="right">${taxAmount.toFixed(2)}</Typography>
              </Grid>
              
              <Grid item xs={6}>
                <Typography>Shipping:</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography align="right">${shippingCost.toFixed(2)}</Typography>
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
              control={methods.control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Order Notes"
                  multiline
                  rows={3}
                  fullWidth
                />
              )}
            />
          </Box>

          {/* Actions */}
          <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
            <Button variant="outlined" onClick={() => methods.reset()}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Order'}
            </Button>
          </Box>
        </form>
      </Paper>
    </FormProvider>
  );
};
```

## 🔧 Key Concepts

### React Hook Form with Arrays:
```tsx
const { fields, append, remove } = useFieldArray({
  control,
  name: 'items'
});

// Add item
append({ inventory_item_id: 0, quantity: 1, unit_price: 0 });

// Remove item
remove(index);
```

### Calculated Fields:
```tsx
const watchedItems = watch('items');
const subtotal = watchedItems.reduce((sum, item) => 
  sum + (item.quantity || 0) * (item.unit_price || 0), 0
);
```

### Form Validation:
```tsx
const methods = useForm<OrderFormData>({
  resolver: zodResolver(orderSchema),
  mode: 'onChange' // Validate on change
});
```

## ✨ Bonus Challenges

- [ ] Add shipping address fields
- [ ] Implement order draft saving
- [ ] Add product search in item selection
- [ ] Show order preview before submission
- [ ] Add discount/coupon field
- [ ] Implement order templates

## ✅ How to Test

1. Select a customer from dropdown
2. Add multiple items to order
3. Verify quantity validation against stock
4. Check real-time total calculations
5. Test form validation (empty fields, invalid data)
6. Submit order and verify success

## 🎉 Completion Criteria

Your order form is complete when:
- ✅ Customer selection works
- ✅ Can add/remove order items dynamically
- ✅ Totals calculate automatically
- ✅ Form validation prevents invalid submissions
- ✅ Stock validation prevents over-ordering
- ✅ Order submits successfully to API

---

**← Previous: [Task 5 - Inventory Search](./task-05-inventory-search.md)**  
**Next Step: [Task 7 - Charts & Visualization](./task-07-charts.md) →**
