'use client';

import React from 'react';
import { DragDropContext, Droppable, type DropResult } from '@hello-pangea/dnd';
import { Box } from '@mui/material';
import { CategoryItem } from './CategoryItem';
import type { Category } from '../hooks/useCategories';

interface CategoryListProps {
  categories: Category[];
  onReorder: (categories: Category[]) => void;
  onEdit: (category: Category) => void;
  onDelete: (id: string) => void;
}

function reorder<T>(list: T[], startIndex: number, endIndex: number): T[] {
  const result = list.slice();
  if (startIndex < 0 || startIndex >= result.length) return result;
  if (endIndex < 0 || endIndex > result.length) return result;

  const [removed] = result.splice(startIndex, 1);
  if (removed === undefined) return result;

  result.splice(endIndex, 0, removed);
  return result;
}

export const CategoryList: React.FC<CategoryListProps> = ({
  categories,
  onReorder,
  onEdit,
  onDelete,
}) => {
  const handleDragEnd = (result: DropResult): void => {
    const { source, destination } = result;
    if (!destination) return;
    if (source.index === destination.index) return;

    const next = reorder(categories, source.index, destination.index);
    onReorder(next);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="categories">
        {(provided) => (
          <Box ref={provided.innerRef} {...provided.droppableProps}>
            {categories.map((category, index) => (
              <CategoryItem
                key={String(category.id)}
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
