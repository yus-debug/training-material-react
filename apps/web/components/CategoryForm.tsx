// apps/web/components/CategoryForm.tsx
import React, { useState } from 'react';
import {Dialog,DialogTitle,DialogContent,DialogActions,Button,TextField,Grid,Box,Typography} from '@mui/material';
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