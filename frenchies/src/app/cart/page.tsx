'use client';

import React from 'react';
import { App, Layout, Button, Space, Typography, InputNumber, Row, Col, Card, Avatar } from 'antd';
import { ShoppingCartOutlined, DeleteOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { useAuth } from '@/lib/auth';
import { useCartItems } from '@/hooks/useCartItems';

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

    // Remove cart item from Firestore
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

    // Calculate total price
    const calculateTotalPrice = () => {
        return cartItems.reduce((total, item) => total + item.priceAtTime * item.quantity, 0);
    };

    return (
        <Layout style={{ padding: '20px' }}>
            <Title level={2}>Shopping Cart</Title>
            {loading ? (
                <Text>Loading...</Text>
            ) : (
                <>
                    {cartItems.length === 0 ? (
                        <Text>Your cart is empty</Text>
                    ) : (
                        <Row gutter={[16, 16]}>
                            {cartItems.map((item) => (
                                <Col span={8} key={item.productId}>
                                    <Card
                                        hoverable
                                        cover={<img alt={item.productTitle} src={item.image} />}
                                        actions={[
                                            <Button
                                                type="link"
                                                onClick={() => handleRemoveItem(item.productId)}
                                                icon={<DeleteOutlined />}
                                            >
                                                Remove
                                            </Button>,
                                        ]}
                                    >
                                        <Card.Meta
                                            avatar={<Avatar src={item.image} />}
                                            title={item.productTitle}
                                            description={`$${item.priceAtTime}`}
                                        />
                                        <Space style={{ marginTop: 16 }}>
                                            <Text>Quantity:</Text>
                                            <InputNumber
                                                min={1}
                                                value={item.quantity}
                                                onChange={(value) => handleUpdateQuantity(item.productId, value!)}
                                            />
                                        </Space>
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                    )}

                    {cartItems.length > 0 && (
                        <Space style={{ marginTop: 24 }} direction="vertical" size="middle" align="center">
                            <Title level={3}>Total: ${calculateTotalPrice().toFixed(2)}</Title>
                            <Button
                                type="primary"
                                icon={<ShoppingCartOutlined />}
                                onClick={() => router.push('/checkout')}
                            >
                                Proceed to Checkout
                            </Button>
                        </Space>
                    )}
                </>
            )}
        </Layout>
    );
};

export default CartPage;