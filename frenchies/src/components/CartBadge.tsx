'use client';

import React from 'react';
import { Badge } from 'antd';
import { ShoppingCartOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { useCartItems } from '@/hooks/useCartItems';

const CartBadge = () => {
    const { cartItems } = useCartItems();
    const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <Link href="/cart">
            <Badge count={totalQuantity} showZero>
                <ShoppingCartOutlined style={{ fontSize: '24px' }} />
            </Badge>
        </Link>
    );
};

export default CartBadge;