import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, CardActions, Button, Stack } from '@mui/material'
import type { ReactElement } from 'react'
import { TextFieldController, SelectFieldController, NumberFieldController } from '../forms'

const inventorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  description: z.string().optional(),
  category: z.enum(['electronics', 'clothing', 'books', 'home', 'other']),
  quantity: z.number().min(0, 'Quantity must be non-negative'),
  price: z.number().min(0, 'Price must be non-negative'),
  sku: z.string().min(1, 'SKU is required').max(50, 'SKU must be less than 50 characters'),
})

export type InventoryFormData = z.infer<typeof inventorySchema>

export interface InventoryFormProps {
  initialData?: Partial<InventoryFormData>
  onSubmit: (data: InventoryFormData) => void | Promise<void>
  onCancel?: () => void
  submitLabel?: string
  isLoading?: boolean
}

const categoryOptions: Array<{ value: string; label: string }> = [
  { value: 'electronics', label: 'Electronics' },
  { value: 'clothing', label: 'Clothing' },
  { value: 'books', label: 'Books' },
  { value: 'home', label: 'Home & Garden' },
  { value: 'other', label: 'Other' },
]

export function InventoryForm({
  initialData,
  onSubmit,
  onCancel,
  submitLabel = 'Save',
  isLoading = false,
}: InventoryFormProps): ReactElement {
  const { control, handleSubmit, reset } = useForm<InventoryFormData>({
    resolver: zodResolver(inventorySchema),
    defaultValues: {
      name: '',
      description: '',
      category: 'other',
      quantity: 0,
      price: 0,
      sku: '',
      ...initialData,
    },
  })

  const handleFormSubmit = async (data: InventoryFormData) => {
    await onSubmit(data)
    if (!initialData) {
      reset() // Reset form after successful creation
    }
  }

  return (
    <Card>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <CardContent>
          <Stack spacing={3}>
            <TextFieldController
              name="name"
              control={control}
              label="Product Name"
              required
            />
            <TextFieldController
              name="description"
              control={control}
              label="Description"
              multiline
              rows={3}
            />
            <TextFieldController
              name="sku"
              control={control}
              label="SKU"
              required
            />
            <SelectFieldController
              name="category"
              control={control}
              label="Category"
              options={categoryOptions}
              required
            />
            <Stack direction="row" spacing={2}>
              <NumberFieldController
                name="quantity"
                control={control}
                label="Quantity"
                required
              />
              <NumberFieldController
                name="price"
                control={control}
                label="Price ($)"
                required
                inputProps={{ step: '0.01' }}
              />
            </Stack>
          </Stack>
        </CardContent>
        <CardActions>
          <Button
            type="submit"
            variant="contained"
            disabled={isLoading}
          >
            {submitLabel}
          </Button>
          {onCancel && (
            <Button onClick={onCancel} disabled={isLoading}>
              Cancel
            </Button>
          )}
        </CardActions>
      </form>
    </Card>
  )
}
