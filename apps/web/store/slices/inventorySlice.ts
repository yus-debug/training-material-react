import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit'
import type { InventoryFormData } from '@sample/ui'
import { API_ENDPOINTS } from '../../config/api'

export interface InventoryItem extends InventoryFormData {
  id: number | string  // FastAPI uses numeric IDs
  created_at: string   // FastAPI uses snake_case
  updated_at: string   // FastAPI uses snake_case
}

interface InventoryState {
  items: InventoryItem[]
  loading: boolean
  error: string | null
  filter: {
    category: string
    search: string
  }
}

const initialState: InventoryState = {
  items: [],
  loading: false,
  error: null,
  filter: {
    category: 'all',
    search: '',
  },
}

// Async thunks for API operations
export const fetchInventoryItems = createAsyncThunk(
  'inventory/fetchItems',
  async () => {
    const response = await fetch(API_ENDPOINTS.inventory)
    if (!response.ok) {
      throw new Error('Failed to fetch inventory items')
    }
    const data = await response.json()
    // FastAPI returns { items: [...], total, page, size, pages }
    // We need to return just the items array for compatibility
    return data.items || data
  }
)

export const createInventoryItem = createAsyncThunk(
  'inventory/createItem',
  async (data: InventoryFormData) => {
    const response = await fetch(API_ENDPOINTS.inventory, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    if (!response.ok) {
      throw new Error('Failed to create inventory item')
    }
    return response.json()
  }
)

export const updateInventoryItem = createAsyncThunk(
  'inventory/updateItem',
  async ({ id, data }: { id: string; data: Partial<InventoryFormData> }) => {
    const response = await fetch(`${API_ENDPOINTS.inventory}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    if (!response.ok) {
      throw new Error('Failed to update inventory item')
    }
    return response.json()
  }
)

export const deleteInventoryItem = createAsyncThunk(
  'inventory/deleteItem',
  async (id: string) => {
    const response = await fetch(`${API_ENDPOINTS.inventory}/${id}`, {
      method: 'DELETE',
    })
    if (!response.ok) {
      throw new Error('Failed to delete inventory item')
    }
    return id
  }
)

export const inventorySlice = createSlice({
  name: 'inventory',
  initialState,
  reducers: {
    setFilter: (state, action: PayloadAction<Partial<InventoryState['filter']>>) => {
      state.filter = { ...state.filter, ...action.payload }
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch items
      .addCase(fetchInventoryItems.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchInventoryItems.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload
      })
      .addCase(fetchInventoryItems.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch items'
      })
      // Create item
      .addCase(createInventoryItem.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createInventoryItem.fulfilled, (state, action) => {
        state.loading = false
        state.items.push(action.payload)
      })
      .addCase(createInventoryItem.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to create item'
      })
      // Update item
      .addCase(updateInventoryItem.fulfilled, (state, action) => {
        const index = state.items.findIndex(item => item.id === action.payload.id)
        if (index !== -1) {
          state.items[index] = action.payload
        }
      })
      // Delete item
      .addCase(deleteInventoryItem.fulfilled, (state, action) => {
        state.items = state.items.filter(item => item.id !== action.payload)
      })
  },
})

export const { setFilter, clearError } = inventorySlice.actions

// Selectors
export const selectInventoryItems = (state: { inventory: InventoryState }) => state.inventory.items
export const selectInventoryLoading = (state: { inventory: InventoryState }) => state.inventory.loading
export const selectInventoryError = (state: { inventory: InventoryState }) => state.inventory.error
export const selectInventoryFilter = (state: { inventory: InventoryState }) => state.inventory.filter

export const selectFilteredInventoryItems = (state: { inventory: InventoryState }) => {
  const { items, filter } = state.inventory
  return items.filter(item => {
    const matchesCategory = filter.category === 'all' || item.category === filter.category
    const matchesSearch = !filter.search || 
      item.name.toLowerCase().includes(filter.search.toLowerCase()) ||
      item.sku.toLowerCase().includes(filter.search.toLowerCase())
    return matchesCategory && matchesSearch
  })
}
