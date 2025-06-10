'use client';

import React from 'react';
import { App, Button, Space, Typography, InputNumber, Image } from 'antd';
import { ShoppingCartOutlined, DeleteOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { useAuth } from '@/lib/auth';
import { useCartItems } from '@/hooks/useCartItems';
import styles from './cart.module.css';
import Link from 'next/link';

const { Title, Text } = Typography;

const CartPage = () => {
    const { cartItems, loading } = useCartItems();
    const { user } = useAuth();
    const router = useRouter();
    const { message } = App.useApp();

    const handleUpdateQuantity = async (productId: string, quantity: number) => {
        try {
            if (!user) return;
            const cartItemRef = doc(db, 'carts', user.uid, 'cartItems', productId);
            await updateDoc(cartItemRef, {
                quantity: quantity,
                updatedAt: new Date(),
            });
            message.success('Cart item updated successfully');
        } catch (error) {
            console.error("Error updating quantity: ", error);
            message.error('Failed to update cart item');
        }
    };

    const handleRemoveItem = async (productId: string) => {
        try {
            if (!user) return;
            const cartItemRef = doc(db, 'carts', user.uid, 'cartItems', productId);
            await deleteDoc(cartItemRef);
            message.success('Cart item removed successfully');
        } catch (error) {
            console.error("Error removing item: ", error);
            message.error('Failed to remove cart item');
        }
    };

    const formatPrice = (price: number | string) => {
        return Number(price).toFixed(2);
    };

    const calculateTotal = () => {
        return cartItems.reduce((total, item) => total + Number(item.priceAtTime) * item.quantity, 0);
    };

    return (
        <div className={styles.cartPage}>
            <div className={styles.contentSection}>
                <div className={styles.cartHeader}>
                    <Title level={2} className={styles.cartTitle}>Shopping Cart</Title>
                </div>

                {loading ? (
                    <div className={styles.cartEmpty}>
                        <Text>Loading...</Text>
                    </div>
                ) : cartItems.length === 0 ? (
                    <div className={styles.cartEmpty}>
                        <ShoppingCartOutlined className={styles.cartEmptyIcon} />
                        <Text className={styles.cartEmptyText}>Your cart is empty</Text>
                        <Button type="primary" onClick={() => router.push('/products')}>
                            Continue Shopping
                        </Button>
                    </div>
                ) : (
                    <>
                        <div className={styles.cartItems}>
                            {cartItems.map((item) => (
                                <div key={item.productId} className={styles.cartItem}>
                                    <Link href={`/products/${item.productId}`} className={styles.itemImageLink}>
                                        <Image
                                            src={item.image}
                                            alt={item.productTitle}
                                            className={styles.itemImage}
                                            preview={false}
                                        />
                                    </Link>
                                    <div className={styles.itemDetails}>
                                        <Link href={`/products/${item.productId}`} className={styles.itemTitleLink}>
                                            <h3 className={styles.itemTitle}>{item.productTitle}</h3>
                                        </Link>
                                        <div className={styles.itemPrice}>${formatPrice(item.priceAtTime)}</div>
                                    </div>
                                    <div className={styles.itemQuantity}>
                                        <Text className={styles.quantityLabel}>Quantity:</Text>
                                        <InputNumber
                                            min={1}
                                            value={item.quantity}
                                            onChange={(value) => handleUpdateQuantity(item.productId, value!)}
                                        />
                                    </div>
                                    <Button
                                        type="text"
                                        className={styles.removeButton}
                                        onClick={() => handleRemoveItem(item.productId)}
                                        icon={<DeleteOutlined />}
                                    >
                                        Remove
                                    </Button>
                                </div>
                            ))}
                        </div>

                        <div className={styles.cartSummary}>
                            <Button
                                type="default"
                                className={styles.backButton}
                                onClick={() => router.push('/products')}
                            >
                                Back to Shopping
                            </Button>
                            <div className={styles.summaryContent}>
                                <div className={styles.summaryRow}>
                                    <Text>Total:</Text>
                                    <Text>${formatPrice(calculateTotal())}</Text>
                                </div>
                                <Button
                                    type="primary"
                                    icon={<ShoppingCartOutlined />}
                                    onClick={() => router.push('/checkout')}
                                    className={styles.checkoutButton}
                                >
                                    Proceed to Checkout
                                </Button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default CartPage;