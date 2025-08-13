import { NextRequest } from 'next/server'
import { z } from 'zod'
import type { InventoryFormData } from '@sample/ui'

// Mock database - in a real app, this would be a proper database
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

const inventorySchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  category: z.enum(['electronics', 'clothing', 'books', 'home', 'other']),
  quantity: z.number().min(0),
  price: z.number().min(0),
  sku: z.string().min(1).max(50),
})

export async function GET() {
  return Response.json(mockInventory)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = inventorySchema.parse(body)
    
    // Check if SKU already exists
    if (mockInventory.some(item => item.sku === validatedData.sku)) {
      return Response.json(
        { error: 'SKU already exists' },
        { status: 400 }
      )
    }
    
    const newItem = {
      id: Date.now().toString(),
      ...validatedData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    
    mockInventory.push(newItem)
    
    return Response.json(newItem, { status: 201 })
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
