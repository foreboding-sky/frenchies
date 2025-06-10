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
        <Link href="/cart" style={{ display: 'flex', alignItems: 'center' }}>
            <Badge count={totalQuantity} showZero>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '4px',
                    transition: 'background-color 0.3s'
                }}>
                    <ShoppingCartOutlined style={{ fontSize: '24px' }} />
                </div>
            </Badge>
        </Link>
    );
};

export default CartBadge;