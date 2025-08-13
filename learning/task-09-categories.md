# Task 9: Add Product Categories Management

**Difficulty: ⭐⭐⭐⭐ (Medium-Advanced)**  
**Time: 2-3 hours**  
**Prerequisites: Tasks 1-8 completed**

## 🎯 Learning Goals

- Learn drag & drop functionality with React Beautiful DnD
- Practice local storage for data persistence
- Understand advanced state management patterns
- Learn color picker and icon selection UI
- Practice data organization and filtering

## 📋 Task Description

Create a category management system where users can create, edit, and reorder categories with drag-and-drop functionality.

## 🏗️ What You'll Build

```
┌─────────────────────────────────────────────────────────────┐
│                   Category Management                        │
├─────────────────────────────────────────────────────────────┤
│ [+ Add Category] [Save Order] [Reset]                       │
├─────────────────────────────────────────────────────────────┤
│ ≡ 📱 Electronics      (15 items)  🎨 Blue    [Edit] [×]    │
│ ≡ 👕 Clothing         (8 items)   🎨 Red     [Edit] [×]    │
│ ≡ 📚 Books            (5 items)   🎨 Green   [Edit] [×]    │
│ ≡ 🏠 Home & Garden    (12 items)  🎨 Orange  [Edit] [×]    │
│ ≡ 🔧 Other            (3 items)   �� Purple  [Edit] [×]    │
└─────────────────────────────────────────────────────────────┘
```

## 📁 Files to Create/Modify

- `apps/web/app/categories/page.tsx` (new file)
- `apps/web/components/CategoryList.tsx` (new file)
- `apps/web/components/CategoryForm.tsx` (new file)
- `apps/web/components/CategoryItem.tsx` (new file)
- `apps/web/hooks/useCategories.ts` (new file)
- `apps/web/utils/iconPicker.tsx` (new file)

## ✅ Requirements

- [ ] Install and setup React Beautiful DnD
- [ ] Create category list with drag-and-drop reordering
- [ ] Add/edit categories with form validation
- [ ] Icon picker for category icons
- [ ] Color picker for category colors
- [ ] Show item count per category
- [ ] Save category order to localStorage
- [ ] Filter inventory by selected categories
- [ ] Category preferences persistence

## 💡 Setup Instructions

First, install required dependencies:
```bash
cd apps/web
npm install react-beautiful-dnd
npm install --save-dev @types/react-beautiful-dnd
npm install react-color
npm install --save-dev @types/react-color
```

### Step 1: Create Categories Hook

```tsx
// apps/web/hooks/useCategories.ts
import { useState, useEffect } from 'react';

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  itemCount: number;
  order: number;
}

const defaultCategories: Category[] = [
  { id: '1', name: 'Electronics', icon: '📱', color: '#3b82f6', itemCount: 0, order: 0 },
  { id: '2', name: 'Clothing', icon: '👕', color: '#ef4444', itemCount: 0, order: 1 },
  { id: '3', name: 'Books', icon: '📚', color: '#10b981', itemCount: 0, order: 2 },
  { id: '4', name: 'Home & Garden', icon: '🏠', color: '#f59e0b', itemCount: 0, order: 3 },
  { id: '5', name: 'Other', icon: '��', color: '#8b5cf6', itemCount: 0, order: 4 },
];

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    try {
      // Try to load from localStorage first
      const savedCategories = localStorage.getItem('categories');
      if (savedCategories) {
        const parsed = JSON.parse(savedCategories);
        setCategories(parsed);
      } else {
        setCategories(defaultCategories);
      }

      // Fetch item counts from API
      await updateItemCounts();
    } catch (error) {
      console.error('Failed to load categories:', error);
      setCategories(defaultCategories);
    } finally {
      setLoading(false);
    }
  };

  const updateItemCounts = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/inventory');
      const data = await response.json();
      const items = data.items || data;

      const categoryCounts = items.reduce((acc: Record<string, number>, item: any) => {
        const category = item.category || 'other';
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      }, {});

      setCategories(prev => 
        prev.map(cat => ({
          ...cat,
          itemCount: categoryCounts[cat.name.toLowerCase().replace(/\s+/g, '')] || 0
        }))
      );
    } catch (error) {
      console.error('Failed to update item counts:', error);
    }
  };

  const saveCategories = (newCategories: Category[]) => {
    setCategories(newCategories);
    localStorage.setItem('categories', JSON.stringify(newCategories));
  };

  const addCategory = (category: Omit<Category, 'id' | 'order'>) => {
    const newCategory: Category = {
      ...category,
      id: Date.now().toString(),
      order: categories.length,
    };
    const updatedCategories = [...categories, newCategory];
    saveCategories(updatedCategories);
  };

  const updateCategory = (id: string, updates: Partial<Category>) => {
    const updatedCategories = categories.map(cat =>
      cat.id === id ? { ...cat, ...updates } : cat
    );
    saveCategories(updatedCategories);
  };

  const deleteCategory = (id: string) => {
    const updatedCategories = categories.filter(cat => cat.id !== id);
    saveCategories(updatedCategories);
  };

  const reorderCategories = (newCategories: Category[]) => {
    const reorderedCategories = newCategories.map((cat, index) => ({
      ...cat,
      order: index
    }));
    saveCategories(reorderedCategories);
  };

  const resetCategories = () => {
    saveCategories(defaultCategories);
    updateItemCounts();
  };

  return {
    categories: categories.sort((a, b) => a.order - b.order),
    loading,
    addCategory,
    updateCategory,
    deleteCategory,
    reorderCategories,
    resetCategories,
    updateItemCounts
  };
};
```

### Step 2: Create Icon Picker Utility

```tsx
// apps/web/utils/iconPicker.tsx
export const availableIcons = [
  '📱', '💻', '🖥️', '⌚', '📸', '🎧', // Electronics
  '👕', '👖', '👗', '🧥', '👟', '👠', // Clothing
  '📚', '📖', '📝', '📊', '📋', '🎓', // Books & Education
  '🏠', '🛏️', '🪑', '🛋️', '🚿', '🍽️', // Home
  '🎨', '🎭', '🎪', '🎯', '🎲', '🧩', // Entertainment
  '🔧', '🔨', '⚙️', '🛠️', '📦', '🏷️', // Tools & Other
];

export const categoryColors = [
  '#3b82f6', // Blue
  '#ef4444', // Red
  '#10b981', // Green
  '#f59e0b', // Orange
  '#8b5cf6', // Purple
  '#06b6d4', // Cyan
  '#f43f5e', // Rose
  '#84cc16', // Lime
  '#6366f1', // Indigo
  '#ec4899', // Pink
];
```

### Step 3: Create Category Item Component

```tsx
// apps/web/components/CategoryItem.tsx
import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  IconButton,
  Box,
  Chip
} from '@mui/material';
import { Edit, Delete, DragIndicator } from '@mui/icons-material';
import { Draggable } from 'react-beautiful-dnd';
import type { Category } from '../hooks/useCategories';

interface CategoryItemProps {
  category: Category;
  index: number;
  onEdit: (category: Category) => void;
  onDelete: (id: string) => void;
}

export const CategoryItem: React.FC<CategoryItemProps> = ({
  category,
  index,
  onEdit,
  onDelete
}) => {
  return (
    <Draggable draggableId={category.id} index={index}>
      {(provided, snapshot) => (
        <Card
          ref={provided.innerRef}
          {...provided.draggableProps}
          sx={{
            mb: 2,
            opacity: snapshot.isDragging ? 0.8 : 1,
            transform: snapshot.isDragging ? 'rotate(5deg)' : 'none',
          }}
        >
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {/* Drag Handle */}
              <Box
                {...provided.dragHandleProps}
                sx={{ 
                  cursor: 'grab',
                  display: 'flex',
                  alignItems: 'center',
                  color: 'text.secondary'
                }}
              >
                <DragIndicator />
              </Box>

              {/* Category Icon */}
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 1,
                  backgroundColor: category.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem'
                }}
              >
                {category.icon}
              </Box>

              {/* Category Name */}
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6">
                  {category.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {category.itemCount} items
                </Typography>
              </Box>

              {/* Color Indicator */}
              <Chip
                label="Color"
                size="small"
                sx={{
                  backgroundColor: category.color,
                  color: 'white',
                  '& .MuiChip-label': {
                    color: 'white'
                  }
                }}
              />

              {/* Actions */}
              <Box>
                <IconButton
                  size="small"
                  onClick={() => onEdit(category)}
                >
                  <Edit />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => onDelete(category.id)}
                  color="error"
                >
                  <Delete />
                </IconButton>
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}
    </Draggable>
  );
};
```

### Step 4: Create Category Form

```tsx
// apps/web/components/CategoryForm.tsx
import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Box,
  Typography
} from '@mui/material';
import { availableIcons, categoryColors } from '../utils/iconPicker';
import type { Category } from '../hooks/useCategories';

interface CategoryFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (category: Omit<Category, 'id' | 'order'>) => void;
  initialData?: Partial<Category>;
  title: string;
}

export const CategoryForm: React.FC<CategoryFormProps> = ({
  open,
  onClose,
  onSubmit,
  initialData,
  title
}) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    icon: initialData?.icon || '📦',
    color: initialData?.color || '#3b82f6',
    itemCount: initialData?.itemCount || 0
  });

  const handleSubmit = () => {
    if (!formData.name.trim()) return;
    
    onSubmit({
      name: formData.name.trim(),
      icon: formData.icon,
      color: formData.color,
      itemCount: formData.itemCount
    });
    
    setFormData({ name: '', icon: '📦', color: '#3b82f6', itemCount: 0 });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Category Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom>
              Select Icon
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {availableIcons.map((icon) => (
                <Box
                  key={icon}
                  onClick={() => setFormData({ ...formData, icon })}
                  sx={{
                    width: 40,
                    height: 40,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: formData.icon === icon ? '2px solid' : '1px solid',
                    borderColor: formData.icon === icon ? 'primary.main' : 'divider',
                    borderRadius: 1,
                    cursor: 'pointer',
                    fontSize: '1.2rem',
                    '&:hover': {
                      backgroundColor: 'action.hover'
                    }
                  }}
                >
                  {icon}
                </Box>
              ))}
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom>
              Select Color
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {categoryColors.map((color) => (
                <Box
                  key={color}
                  onClick={() => setFormData({ ...formData, color })}
                  sx={{
                    width: 32,
                    height: 32,
                    backgroundColor: color,
                    border: formData.color === color ? '3px solid' : '1px solid',
                    borderColor: formData.color === color ? 'primary.main' : 'divider',
                    borderRadius: 1,
                    cursor: 'pointer',
                    '&:hover': {
                      transform: 'scale(1.1)'
                    }
                  }}
                />
              ))}
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ 
              p: 2, 
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 2
            }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  backgroundColor: formData.color,
                  borderRadius: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem'
                }}
              >
                {formData.icon}
              </Box>
              <Typography variant="h6">
                {formData.name || 'Category Name'}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained"
          disabled={!formData.name.trim()}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};
```

### Step 5: Create Category List with Drag & Drop

```tsx
// apps/web/components/CategoryList.tsx
import React from 'react';
import { DragDropContext, Droppable, DropResult } from 'react-beautiful-dnd';
import { Box } from '@mui/material';
import { CategoryItem } from './CategoryItem';
import type { Category } from '../hooks/useCategories';

interface CategoryListProps {
  categories: Category[];
  onReorder: (categories: Category[]) => void;
  onEdit: (category: Category) => void;
  onDelete: (id: string) => void;
}

export const CategoryList: React.FC<CategoryListProps> = ({
  categories,
  onReorder,
  onEdit,
  onDelete
}) => {
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(categories);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    onReorder(items);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="categories">
        {(provided) => (
          <Box
            {...provided.droppableProps}
            ref={provided.innerRef}
          >
            {categories.map((category, index) => (
              <CategoryItem
                key={category.id}
                category={category}
                index={index}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
            {provided.placeholder}
          </Box>
        )}
      </Droppable>
    </DragDropContext>
  );
};
```

### Step 6: Create Main Categories Page

```tsx
// apps/web/app/categories/page.tsx
'use client';
import React, { useState } from 'react';
import {
  Container,
  Typography,
  Button,
  Box,
  Alert,
  Snackbar
} from '@mui/material';
import { Add, Save, Refresh } from '@mui/icons-material';
import { CategoryList } from '../../components/CategoryList';
import { CategoryForm } from '../../components/CategoryForm';
import { useCategories } from '../../hooks/useCategories';
import type { Category } from '../../hooks/useCategories';

export default function CategoriesPage() {
  const {
    categories,
    loading,
    addCategory,
    updateCategory,
    deleteCategory,
    reorderCategories,
    resetCategories,
    updateItemCounts
  } = useCategories();

  const [formOpen, setFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [notification, setNotification] = useState({ 
    open: false, 
    message: '', 
    severity: 'success' as 'success' | 'error' 
  });

  const handleAddCategory = (categoryData: Omit<Category, 'id' | 'order'>) => {
    addCategory(categoryData);
    showNotification('Category added successfully', 'success');
    setFormOpen(false);
  };

  const handleEditCategory = (categoryData: Omit<Category, 'id' | 'order'>) => {
    if (!editingCategory) return;
    
    updateCategory(editingCategory.id, categoryData);
    showNotification('Category updated successfully', 'success');
    setEditingCategory(null);
  };

  const handleDeleteCategory = (id: string) => {
    const category = categories.find(cat => cat.id === id);
    if (!category) return;

    if (window.confirm(`Are you sure you want to delete "${category.name}"?`)) {
      deleteCategory(id);
      showNotification('Category deleted successfully', 'success');
    }
  };

  const handleReorderCategories = (newCategories: Category[]) => {
    reorderCategories(newCategories);
    showNotification('Category order saved', 'success');
  };

  const handleResetCategories = () => {
    if (window.confirm('Reset to default categories? This will lose all customizations.')) {
      resetCategories();
      showNotification('Categories reset to defaults', 'success');
    }
  };

  const showNotification = (message: string, severity: 'success' | 'error') => {
    setNotification({ open: true, message, severity });
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Category Management
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            startIcon={<Refresh />}
            onClick={updateItemCounts}
            disabled={loading}
          >
            Refresh Counts
          </Button>
          <Button
            startIcon={<Save />}
            onClick={handleResetCategories}
            color="warning"
          >
            Reset
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setFormOpen(true)}
          >
            Add Category
          </Button>
        </Box>
      </Box>

      <Alert severity="info" sx={{ mb: 3 }}>
        Drag and drop categories to reorder them. Changes are automatically saved to your browser.
      </Alert>

      <CategoryList
        categories={categories}
        onReorder={handleReorderCategories}
        onEdit={setEditingCategory}
        onDelete={handleDeleteCategory}
      />

      <CategoryForm
        open={formOpen || !!editingCategory}
        onClose={() => {
          setFormOpen(false);
          setEditingCategory(null);
        }}
        onSubmit={editingCategory ? handleEditCategory : handleAddCategory}
        initialData={editingCategory || undefined}
        title={editingCategory ? 'Edit Category' : 'Add New Category'}
      />

      <Snackbar
        open={notification.open}
        autoHideDuration={3000}
        onClose={() => setNotification({ ...notification, open: false })}
      >
        <Alert severity={notification.severity}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}
```

## ✨ Bonus Challenges

- [ ] Add category usage analytics
- [ ] Implement category templates
- [ ] Add category descriptions
- [ ] Create category hierarchy (subcategories)
- [ ] Add category-based filtering to inventory
- [ ] Implement category import/export

## ✅ How to Test

1. Navigate to categories page
2. Add new category with icon and color
3. Edit existing category
4. Drag and drop to reorder categories
5. Delete category with confirmation
6. Test data persistence (refresh page)
7. Reset to defaults functionality

## 🎉 Completion Criteria

Your category management is complete when:
- ✅ Categories display with icons and colors
- ✅ Drag and drop reordering works smoothly
- ✅ Add/edit forms with icon and color pickers
- ✅ Item counts update from API
- ✅ Category order persists in localStorage
- ✅ Delete confirmation prevents accidents
- ✅ Reset functionality restores defaults

---

**← Previous: [Task 8 - Customer Management](./task-08-customer-management.md)**  
**Next Step: [Task 10 - Shopping Cart & Checkout](./task-10-shopping-cart.md) →**
