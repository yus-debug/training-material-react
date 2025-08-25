'use client';

import React from 'react';
import {Card,CardContent,Typography,IconButton,Box,Chip,} from '@mui/material';
import { Edit, Delete, DragIndicator } from '@mui/icons-material';
import { Draggable } from '@hello-pangea/dnd';
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
  onDelete,
}) => {
  return (
    <Draggable draggableId={String(category.id)} index={index}>
      {(provided, snapshot) => (
        <Card
          ref={provided.innerRef}
          {...provided.draggableProps}
          sx={{
            mb: 2,
            opacity: snapshot.isDragging ? 0.9 : 1,
            transition: 'transform 120ms ease',
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
                  color: 'text.secondary',
                }}
                aria-label="Drag to reorder"
                title="Drag to reorder"
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
                  fontSize: '1.5rem',
                }}
              >
                {category.icon}
              </Box>

              {/* Category Name */}
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6">{category.name}</Typography>
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
                  '& .MuiChip-label': { color: 'white' },
                }}
              />

              {/* Actions */}
              <Box>
                <IconButton size="small" onClick={() => onEdit(category)}>
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
