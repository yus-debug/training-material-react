// apps/web/app/api/inventory/route.ts
import { NextRequest } from 'next/server'
import { z } from 'zod'
import type { InventoryFormData } from '@sample/ui'

// Mock database
type Category = 'electronics' | 'clothing' | 'books' | 'home' | 'other'
type Item = {
  id: string
  name: string
  description?: string
  category: Category
  quantity: number
  price: number
  sku: string
  createdAt: string
  updatedAt: string
}

let mockInventory: Item[] = [
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

// Validation for POST 
const inventorySchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  category: z.enum(['electronics', 'clothing', 'books', 'home', 'other']),
  quantity: z.number().min(0),
  price: z.number().min(0),
  sku: z.string().min(1).max(50),
})


export async function GET(request: NextRequest) {
  const url = new URL(request.url)

  const search = (url.searchParams.get('search') || '').trim().toLowerCase()
  const category = (url.searchParams.get('category') || 'all') as Category | 'all'

  const sortByParam = (url.searchParams.get('sortBy') || 'name').toLowerCase()
  const sortBy: 'name' | 'price' | 'quantity' =
    sortByParam === 'price' || sortByParam === 'quantity' ? (sortByParam as any) : 'name'

  const sortDirParam = (url.searchParams.get('sortDir') || 'asc').toLowerCase()
  const sortDir: 'asc' | 'desc' = sortDirParam === 'desc' ? 'desc' : 'asc'

  const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10))
  const limit = Math.max(1, Math.min(100, parseInt(url.searchParams.get('limit') || '5', 10)))

  const delay = Math.max(0, parseInt(url.searchParams.get('delay') || '0', 10))
  if (delay > 0) {
    await new Promise((r) => setTimeout(r, delay))
  }

  // 1) filter
  let results = mockInventory.slice()

  if (category !== 'all') {
    results = results.filter((i) => i.category === category)
  }

  if (search) {
    results = results.filter((i) => {
      const blob = `${i.name} ${i.sku} ${i.description || ''}`.toLowerCase()
      return blob.includes(search)
    })
  }

  // 2) sort
  results.sort((a, b) => {
    const av = a[sortBy] as string | number
    const bv = b[sortBy] as string | number
    let cmp = 0
    if (typeof av === 'string' && typeof bv === 'string') {
      cmp = av.toLowerCase().localeCompare(bv.toLowerCase())
    } else {
      cmp = av < bv ? -1 : av > bv ? 1 : 0
    }
    return sortDir === 'asc' ? cmp : -cmp
  })

  // 3) paginate
  const total = results.length
  const start = (page - 1) * limit
  const items = results.slice(start, start + limit)

  return Response.json({ items, total, page, limit })
}

// POST 
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = inventorySchema.parse(body)

    // Check if SKU already exists
    if (mockInventory.some((item) => item.sku === validatedData.sku)) {
      return Response.json({ error: 'SKU already exists' }, { status: 400 })
    }

    const now = new Date().toISOString()
    const newItem: Item = {
      id: Date.now().toString(),
      ...validatedData,
      createdAt: now,
      updatedAt: now,
    }

    mockInventory.push(newItem)

    return Response.json(newItem, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 },
      )
    }
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
