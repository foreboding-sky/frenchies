import { doc, setDoc, updateDoc, increment, getDoc } from 'firebase/firestore';
import { db, auth } from './firebase';
import { Product } from '@/types/product';

export function useCart() {
    const addToCart = async (product: Product) => {
        const user = auth.currentUser;
        if (!user) throw new Error('User not authenticated');

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

    return { addToCart };
} 