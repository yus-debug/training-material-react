# Task 5: Create Inventory List with Search

**Difficulty: ⭐⭐⭐ (Medium)**  
**Time: 90-120 minutes**  
**Prerequisites: Tasks 1-4 completed**

## 🎯 Learning Goals

- Master `useEffect` hook for side effects
- Learn controlled inputs and form handling
- Implement debouncing for performance
- Practice error handling and loading states
- Understand list rendering and React keys

## 📋 Task Description

Create an enhanced inventory list page with real-time search, filtering, and pagination.

## 🏗️ What You'll Build

```
┌─────────────────────────────────────────────────────────────┐
│ [Search...] [Category ▼] [🔍]                    📊 8 items │
├─────────────────────────────────────────────────────────────┤
│ 📦 Wireless Headphones    SKU: WH-001    $99.99    Qty: 25 │
│ 👕 Cotton T-Shirt         SKU: TS-002    $19.99    Qty: 50 │
│ 📚 Python Programming     SKU: PB-003    $29.99    Qty: 15 │
│ ☕ Coffee Mug             SKU: CM-004    $12.99    Qty: 30 │
└─────────────────────────────────────────────────────────────┘
```

## 📁 Files to Create/Modify

- `apps/web/app/inventory-list/page.tsx` (new file)
- `apps/web/components/SearchBar.tsx` (new file)
- `apps/web/components/InventoryList.tsx` (new file)
- `apps/web/hooks/useDebounce.ts` (new file)

## ✅ Requirements

- [ ] Create search bar that filters inventory items in real-time
- [ ] Implement debounced search (300ms delay)
- [ ] Add category filter dropdown
- [ ] Show loading spinner while fetching
- [ ] Display "No items found" when search has no results
- [ ] Add pagination or "Load More" functionality
- [ ] Show total item count and filtered results count

## 💡 Hints & Guidance

### Step 1: Create Custom Debounce Hook

```tsx
// apps/web/hooks/useDebounce.ts
import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
```

### Step 2: Create SearchBar Component

```tsx
// apps/web/components/SearchBar.tsx
import React from 'react';
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment
} from '@mui/material';
import { Search } from '@mui/icons-material';

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  category: string;
  onCategoryChange: (value: string) => void;
  categories: { value: string; label: string }[];
}

export const SearchBar: React.FC<SearchBarProps> = ({
  searchTerm,
  onSearchChange,
  category,
  onCategoryChange,
  categories
}) => {
  return (
    <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
      <TextField
        fullWidth
        placeholder="Search by name, SKU, or description..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search />
            </InputAdornment>
          ),
        }}
      />
      
      <FormControl sx={{ minWidth: 200 }}>
        <InputLabel>Category</InputLabel>
        <Select
          value={category}
          label="Category"
          onChange={(e) => onCategoryChange(e.target.value)}
        >
          <MenuItem value="all">All Categories</MenuItem>
          {categories.map((cat) => (
            <MenuItem key={cat.value} value={cat.value}>
              {cat.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};
```

### Step 3: Create InventoryList Component

```tsx
// apps/web/components/InventoryList.tsx
import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  CircularProgress,
  Alert
} from '@mui/material';

interface InventoryItem {
  id: number;
  name: string;
  description: string;
  category: string;
  quantity: number;
  price: number;
  sku: string;
}

interface InventoryListProps {
  items: InventoryItem[];
  loading: boolean;
  error: string | null;
  searchTerm: string;
}

export const InventoryList: React.FC<InventoryListProps> = ({
  items,
  loading,
  error,
  searchTerm
}) => {
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  if (items.length === 0) {
    return (
      <Alert severity="info" sx={{ mb: 2 }}>
        {searchTerm 
          ? `No items found matching "${searchTerm}"`
          : "No inventory items found"
        }
      </Alert>
    );
  }

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Found {items.length} item{items.length === 1 ? '' : 's'}
        {searchTerm && ` matching "${searchTerm}"`}
      </Typography>
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {items.map((item) => (
          <Card key={item.id}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" component="div">
                    {item.name}
                  </Typography>
                  <Typography color="text.secondary" sx={{ mb: 1 }}>
                    {item.description}
                  </Typography>
                  <Typography variant="body2">
                    SKU: {item.sku}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'end', gap: 1 }}>
                  <Chip 
                    label={item.category} 
                    size="small" 
                    color="primary" 
                    variant="outlined" 
                  />
                  <Typography variant="h6" color="primary">
                    ${item.price}
                  </Typography>
                  <Typography variant="body2">
                    Qty: {item.quantity}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );
};
```

### Step 4: Create Main Inventory Page

```tsx
// apps/web/app/inventory-list/page.tsx
'use client';
import React, { useState, useEffect } from 'react';
import { Container, Typography } from '@mui/material';
import { SearchBar } from '../../components/SearchBar';
import { InventoryList } from '../../components/InventoryList';
import { useDebounce } from '../../hooks/useDebounce';

const categories = [
  { value: 'electronics', label: 'Electronics' },
  { value: 'clothing', label: 'Clothing' },
  { value: 'books', label: 'Books' },
  { value: 'home', label: 'Home & Garden' },
  { value: 'other', label: 'Other' }
];

export default function InventoryListPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('all');
  
  // Debounce search term to avoid too many API calls
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  useEffect(() => {
    fetchItems();
  }, [debouncedSearchTerm, category]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Build query parameters
      const params = new URLSearchParams();
      if (debouncedSearchTerm) {
        params.append('search', debouncedSearchTerm);
      }
      if (category && category !== 'all') {
        params.append('category', category);
      }
      
      const response = await fetch(
        `http://localhost:8000/api/inventory?${params.toString()}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch inventory items');
      }
      
      const data = await response.json();
      setItems(data.items || data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Inventory Search
      </Typography>
      
      <SearchBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        category={category}
        onCategoryChange={setCategory}
        categories={categories}
      />
      
      <InventoryList
        items={items}
        loading={loading}
        error={error}
        searchTerm={debouncedSearchTerm}
      />
    </Container>
  );
}
```

## 🔧 Key Concepts

### Debouncing:
```tsx
// Prevents API call on every keystroke
const debouncedValue = useDebounce(searchTerm, 300);

// Only fetch when debounced value changes
useEffect(() => {
  fetchData();
}, [debouncedValue]);
```

### Query Parameters:
```tsx
const params = new URLSearchParams();
params.append('search', searchTerm);
params.append('category', category);
const url = `${baseUrl}?${params.toString()}`;
```

### Loading States:
```tsx
const [loading, setLoading] = useState(false);

// Always wrap async operations
try {
  setLoading(true);
  await fetchData();
} finally {
  setLoading(false); // Ensures loading stops even if error occurs
}
```

## 🐛 Common Issues & Solutions

**Issue**: Too many API calls
**Solution**: Use debouncing with 300ms delay

**Issue**: Search doesn't work
**Solution**: Check that your backend supports search query parameter

**Issue**: Loading state flickers
**Solution**: Only show loading for searches that take longer than initial load

**Issue**: Category filter not working
**Solution**: Ensure category values match your API exactly

## ✨ Bonus Challenges

- [ ] Add sorting options (name, price, quantity)
- [ ] Implement pagination with page numbers
- [ ] Add "Clear filters" button
- [ ] Save search preferences to localStorage
- [ ] Add keyboard shortcuts (Cmd+K to focus search)
- [ ] Implement search history dropdown

## ✅ How to Test

1. Type in search box - should debounce and search after 300ms
2. Select different categories - should filter immediately
3. Try searches with no results - should show appropriate message
4. Test with backend down - should show error message
5. Verify loading states appear during searches

## 🎉 Completion Criteria

Your inventory search is complete when:
- ✅ Search bar filters items in real-time
- ✅ Search is debounced (doesn't call API on every keystroke)
- ✅ Category filter works independently
- ✅ Loading states show during API calls
- ✅ "No items found" message appears when appropriate
- ✅ Error handling prevents crashes
- ✅ Item count displays correctly

---

**← Previous: [Task 4 - Dashboard with Cards](./task-04-dashboard.md)**  
**Next Step: [Task 6 - Order Form](./task-06-order-form.md) →**
