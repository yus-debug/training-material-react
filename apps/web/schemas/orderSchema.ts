// apps/web/schemas/orderSchema.ts
import { z } from 'zod';

export const orderItemSchema = z.object({
  inventory_item_id: z.number().int().positive('Select a product'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
  unit_price: z.number().nonnegative('Unit price must be ≥ 0'),
});

export const orderSchema = z.object({
  customer_id: z.number().int().positive('Select a customer'),
  items: z.array(orderItemSchema).min(1, 'Add at least one item'),
  tax_rate: z.number().min(0, 'Tax rate must be ≥ 0'),
  shipping_cost: z.number().min(0, 'Shipping must be ≥ 0'),
  notes: z.string().optional().nullable(),
});

export type OrderFormData = z.infer<typeof orderSchema>;
