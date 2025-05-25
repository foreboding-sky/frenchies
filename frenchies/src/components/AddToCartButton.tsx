'use client';

import { Button } from 'antd';
import { ShoppingCartOutlined } from '@ant-design/icons';
import { doc, setDoc, updateDoc, increment, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/auth';

interface Props {
  product: any;
  compact?: boolean;
}

export default function AddToCartButton({ product, compact = false }: Props) {
  const { user } = useAuth();

  const handleAddToCart = async () => {
    if (!user) return;

    const cartItemRef = doc(db, 'carts', user.uid, 'cartItems', product.id);
    const existing = await getDoc(cartItemRef);

    if (existing.exists()) {
      await updateDoc(cartItemRef, {
        quantity: increment(1),
        updatedAt: new Date(),
      });
    } else {
      await setDoc(cartItemRef, {
        productId: product.id,
        productTitle: product.title,
        image: product.images?.[0] ?? '',
        priceAtTime: (product.price - product.price * product.discount / 100).toFixed(2),
        quantity: 1,
        productRef: `/products/${product.id}`,
        updatedAt: new Date(),
      });
    }
  };

  return (
    <Button icon={<ShoppingCartOutlined />} onClick={handleAddToCart}>
      {!compact && 'Add to Cart'}
    </Button>
  );
}