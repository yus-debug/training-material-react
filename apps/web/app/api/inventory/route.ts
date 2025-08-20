import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

type Category = 'electronics' | 'clothing' | 'books' | 'home' | 'other';
export type SortBy = 'name' | 'price' | 'quantity';
export type SortDir = 'asc' | 'desc';

type Item = {
  id: string;
  name: string;
  description?: string;
  category: Category;
  quantity: number;
  price: number;
  sku: string;
  createdAt: string;
  updatedAt: string;
};

// mock(10 items)
let mockInventory: Item[] = [
  { id: '1',  name: 'Wireless Headphones', description: 'Bluetooth over-ear', category: 'electronics', quantity: 25, price: 99.99, sku: 'WH-001', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: '2',  name: 'Cotton T-Shirt',      description: '100% cotton',       category: 'clothing',    quantity: 50, price: 19.99, sku: 'TS-002', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: '3',  name: 'Novel',                description: 'Sci-fi bestseller', category: 'books',       quantity: 12, price: 12.99, sku: 'BK-101', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: '4',  name: 'Desk Lamp',            description: 'Warm LED',          category: 'home',        quantity: 8,  price: 24.5,  sku: 'HM-201', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: '5',  name: 'Router',               description: 'Dual-band WiFi 6',  category: 'electronics', quantity: 18, price: 49.0,  sku: 'ELX-003', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: '6',  name: 'Mug',                  description: 'Ceramic 350ml',     category: 'home',        quantity: 40, price: 6.5,   sku: 'HM-202', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: '7',  name: 'Notebook',             description: 'A5 dotted',         category: 'other',       quantity: 13, price: 3.9,   sku: 'OT-001', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: '8',  name: 'HDMI Cable',           description: '2m 4K',             category: 'electronics', quantity: 50, price: 7.49,  sku: 'ELX-888', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: '9',  name: 'Hoodie',               description: 'Fleece pullover',   category: 'clothing',    quantity: 5,  price: 39.99, sku: 'CL-300', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: '10', name: 'Cookbook',             description: 'Quick recipes',     category: 'books',       quantity: 0,  price: 15.00, sku: 'BK-505', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
];

const inventorySchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  category: z.enum(['electronics', 'clothing', 'books', 'home', 'other']),
  quantity: z.number().min(0),
  price: z.number().min(0),
  sku: z.string().min(1).max(50),
});

// GET: search/sort/paginate/delay
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const delayMs = Math.min(Number(searchParams.get('delay') ?? '0') || 0, 5000);
  if (delayMs > 0) await new Promise(r => setTimeout(r, delayMs));

  const search   = (searchParams.get('search')   || '').trim().toLowerCase();
  const category = (searchParams.get('category') || 'all').trim().toLowerCase() as 'all' | Category;
  const sortBy   = (searchParams.get('sortBy')   || 'name') as SortBy;
  const sortDir  = (searchParams.get('sortDir')  || 'asc') as SortDir;
  const page     = Math.max(1, parseInt(searchParams.get('page')  || '1', 10));
  const limit    = Math.max(1, Math.min(100, parseInt(searchParams.get('limit') || '5', 10)));

  // filter
  let results = mockInventory.filter(i => {
    const matchesSearch =
      !search ||
      i.name.toLowerCase().includes(search) ||
      (i.description ?? '').toLowerCase().includes(search) ||
      i.sku.toLowerCase().includes(search);
    const matchesCategory = category === 'all' || i.category === category;
    return matchesSearch && matchesCategory;
  });

  // sort
  results.sort((a, b) => {
    const av = a[sortBy] as string | number;
    const bv = b[sortBy] as string | number;
    const A = typeof av === 'string' ? av.toLowerCase() : av;
    const B = typeof bv === 'string' ? bv.toLowerCase() : bv;
    const cmp = A < B ? -1 : A > B ? 1 : 0;
    return sortDir === 'asc' ? cmp : -cmp;
  });

  // paginate
  const total = results.length;
  const start = (page - 1) * limit;
  const items = results.slice(start, start + limit);

  return NextResponse.json({ items, total, page, limit });
}

// POST: create item with validation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = inventorySchema.parse(body);

    if (mockInventory.some(i => i.sku === validated.sku)) {
      return NextResponse.json({ error: 'SKU already exists' }, { status: 400 });
    }

    const now = new Date().toISOString();
    const newItem: Item = { id: Date.now().toString(), ...validated, createdAt: now, updatedAt: now };
    mockInventory.push(newItem);

    return NextResponse.json(newItem, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
