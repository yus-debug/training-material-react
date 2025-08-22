'use client';

import React from 'react';
import {Card,
CardContent,Grid,TextField,Typography,IconButton,Box,InputAdornment,Autocomplete,} from '@mui/material';
import { Delete } from '@mui/icons-material';
import { Controller, useFormContext } from 'react-hook-form';
import type { OrderFormData } from '../schemas/orderSchema';

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
  inventoryItems,
}) => {
  const { control, watch, setValue } = useFormContext<OrderFormData>();

  const selectedItemId = watch(`items.${index}.inventory_item_id`);
  const quantity = watch(`items.${index}.quantity`) || 0;
  const unitPrice = watch(`items.${index}.unit_price`) || 0;

  const selectedItem = inventoryItems.find((item) => item.id === selectedItemId);
  const totalPrice = (Number(quantity) || 0) * (Number(unitPrice) || 0);

  React.useEffect(() => {
    if (selectedItem) {
      setValue(`items.${index}.unit_price`, selectedItem.price, { shouldValidate: true });
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
              render={({ field, fieldState: { error } }) => {
                const valueOption =
                  inventoryItems.find((i) => i.id === field.value) ?? null;

                return (
                  <Autocomplete
                    fullWidth
                    options={inventoryItems}
                    value={valueOption}
                    onChange={(_, option) => field.onChange(option ? Number(option.id) : 0)}
                    getOptionLabel={(opt) => `${opt.name} (Stock: ${opt.quantity})`}
                    isOptionEqualToValue={(opt, val) => opt.id === (val?.id ?? val)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Product"
                        error={!!error}
                        helperText={error?.message}
                        size="small"
                      />
                    )}
                    ListboxProps={{ style: { maxHeight: 300, overflow: 'auto' } }}
                  />
                );
              }}
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
                  size="small"
                  error={!!error}
                  helperText={error?.message}
                  inputProps={{ min: 1, max: selectedItem?.quantity }}
                  onChange={(e) => {
                    const v = e.target.value;
                    field.onChange(v === '' ? '' : Number(v));
                  }}
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
                  size="small"
                  error={!!error}
                  helperText={error?.message}
                  InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                  onChange={(e) => {
                    const v = e.target.value;
                    field.onChange(v === '' ? '' : Number(v));
                  }}
                />
              )}
            />
          </Grid>

          <Grid item xs={8} md={3}>
            <Typography variant="h6">Total: ${totalPrice.toFixed(2)}</Typography>
            {selectedItem && Number(quantity) > selectedItem.quantity && (
              <Typography color="error" variant="caption">
                Insufficient stock ({selectedItem.quantity} available)
              </Typography>
            )}
          </Grid>

          <Grid item xs={4} md={1}>
            <IconButton onClick={onRemove} color="error" aria-label="Remove item">
              <Delete />
            </IconButton>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};
