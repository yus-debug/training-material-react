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