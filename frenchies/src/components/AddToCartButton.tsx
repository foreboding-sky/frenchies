'use client';

import { useState } from 'react';
import { Button, App } from 'antd';
import { ShoppingCartOutlined } from '@ant-design/icons';
import { useAuth } from '@/lib/auth';
import { useCart } from '@/lib/cart';
import { AddToCartButtonProps } from '@/types/components';
import styles from './AddToCartButton.module.css';

export default function AddToCartButton({ product, compact = false }: AddToCartButtonProps) {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [loading, setLoading] = useState(false);
  const { message } = App.useApp();

  const handleAddToCart = async () => {
    if (!user) {
      message.warning('Please sign in to add items to cart');
      return;
    }

    setLoading(true);
    try {
      await addToCart(product);
      message.success('Added to cart');
    } catch (error) {
      message.error('Failed to add to cart');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      type="primary"
      icon={<ShoppingCartOutlined />}
      onClick={handleAddToCart}
      loading={loading}
      className={compact ? styles.compactButton : styles.button}
    >
      {compact ? '' : 'Add to Cart'}
    </Button>
  );
}