'use client';

import { useEffect, useState } from 'react';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/auth';
import { CartItem } from '@/types/cart';

export function useCartItems() {
    const { user } = useAuth();
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user?.uid) return;

        const cartRef = collection(db, 'carts', user.uid, 'cartItems');
        const q = query(cartRef);

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const items: CartItem[] = snapshot.docs.map((doc) => ({
                ...(doc.data() as CartItem),
                productId: doc.id,
            }));
            setCartItems(items);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user?.uid]);

    return { cartItems, loading };
}