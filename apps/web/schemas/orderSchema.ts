import { z } from 'zod';

export const orderItemSchema = z.object({
  inventory_item_id: z.number().min(1, 'Please select a product'),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  unit_price: z.number().min(0, 'Price must be positive'),
});

export const shippingAddressSchema = z.object({
  full_name: z.string().min(1, 'Full name is required'),
  address1: z.string().min(1, 'Address line 1 is required'),
  address2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State/Region is required'),
  postal_code: z.string().min(1, 'Postal code is required'),
  country: z.string().min(1, 'Country is required').default('US'),
});

export const orderSchema = z.object({
  customer_id: z.number().min(1, 'Please select a customer'),
  items: z.array(orderItemSchema).min(1, 'At least one item is required'),
  tax_rate: z.number().min(0).max(1).default(0.08),
  shipping_cost: z.number().min(0).default(9.99),
  notes: z.string().optional(),
  shipping_address: shippingAddressSchema, // ← added
});

export type OrderFormData = z.infer<typeof orderSchema>;
export type OrderItemData = z.infer<typeof orderItemSchema>;
export type OrderShippingAddress = z.infer<typeof shippingAddressSchema>;
