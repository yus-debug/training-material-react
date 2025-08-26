// apps/web/components/cart/CartIcon.tsx
import React from 'react';
import { IconButton, Badge } from '@mui/material';
import { ShoppingCart } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useCart } from '../../contexts/CartContext';

export const CartIcon: React.FC = () => {
  const { itemCount } = useCart();
  const router = useRouter();

  const handleCartClick = () => {
    router.push('/cart');
  };

  return (
    <IconButton color="inherit" onClick={handleCartClick}>
      <Badge badgeContent={itemCount} color="error">
        <ShoppingCart />
      </Badge>
    </IconButton>
  );
};