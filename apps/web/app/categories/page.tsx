// apps/web/app/categories/page.tsx
'use client';
import React, { useState } from 'react';
import {Container,Typography,Button,Box,Alert,Snackbar} from '@mui/material';
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