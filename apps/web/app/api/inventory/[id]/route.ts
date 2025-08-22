import { NextRequest } from 'next/server'
import { z } from 'zod'

// Mock database - same as in route.ts (in real app, this would be shared)
let mockInventory: Array<{
  id: string
  name: string
  description?: string
  category: 'electronics' | 'clothing' | 'books' | 'home' | 'other'
  quantity: number
  price: number
  sku: string
  createdAt: string
  updatedAt: string
}> = [
  {
    id: '1',
    name: 'Wireless Headphones',
    description: 'High-quality bluetooth headphones',
    category: 'electronics',
    quantity: 25,
    price: 99.99,
    sku: 'WH-001',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Cotton T-Shirt',
    description: 'Comfortable 100% cotton t-shirt',
    category: 'clothing',
    quantity: 50,
    price: 19.99,
    sku: 'TS-002',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

const updateInventorySchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  category: z.enum(['electronics', 'clothing', 'books', 'home', 'other']).optional(),
  quantity: z.number().min(0).optional(),
  price: z.number().min(0).optional(),
  sku: z.string().min(1).max(50).optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const item = mockInventory.find(item => item.id === id)
  
  if (!item) {
    return Response.json(
      { error: 'Item not found' },
      { status: 404 }
    )
  }
  
  return Response.json(item)
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const validatedData = updateInventorySchema.parse(body)
    
    const itemIndex = mockInventory.findIndex(item => item.id === id)
    
    if (itemIndex === -1) {
      return Response.json(
        { error: 'Item not found' },
        { status: 404 }
      )
    }
    
    // Check if SKU already exists (excluding current item)
    if (validatedData.sku && mockInventory.some(item => item.sku === validatedData.sku && item.id !== id)) {
      return Response.json(
        { error: 'SKU already exists' },
        { status: 400 }
      )
    }
    
    mockInventory[itemIndex] = {
      ...mockInventory[itemIndex],
      ...validatedData,
      updatedAt: new Date().toISOString(),
    } as typeof mockInventory[number]
    
    return Response.json(mockInventory[itemIndex])
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }
    
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const itemIndex = mockInventory.findIndex(item => item.id === id)
  
  if (itemIndex === -1) {
    return Response.json(
      { error: 'Item not found' },
      { status: 404 }
    )
  }
  
  mockInventory.splice(itemIndex, 1)
  
  return Response.json({ success: true })
}