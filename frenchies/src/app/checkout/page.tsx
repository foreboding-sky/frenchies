'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { collection, addDoc, serverTimestamp, deleteDoc, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/auth';
import { useCartItems } from '@/hooks/useCartItems';
import { App, Input, Select, Button, Typography, Form, Spin } from 'antd';
import { Order, OrderItem } from '@/types/order';

export default function CheckoutPage() {
    const router = useRouter();
    const { user } = useAuth();
    const { cartItems, loading } = useCartItems();
    const { message } = App.useApp();
    const [form] = Form.useForm();

    const [submitting, setSubmitting] = useState(false);
    const [initialName, setInitialName] = useState('');
    const [initialSurname, setInitialSurname] = useState('');
    const [initialPhone, setInitialPhone] = useState('');

    useEffect(() => {
        const fetchUserProfile = async () => {
            if (!user) return;

            try {
                const userRef = doc(db, 'users', user.uid);
                const userSnap = await getDoc(userRef);

                if (userSnap.exists()) {
                    const userData = userSnap.data();
                    setInitialName(userData.name || '');
                    setInitialSurname(userData.surname || '');
                    setInitialPhone(userData.phone || '');
                }
            } catch (error) {
                console.error('Failed to fetch user profile:', error);
            }
        };

        fetchUserProfile();
    }, [user]);

    useEffect(() => {
        form.setFieldsValue({
            name: initialName,
            surname: initialSurname,
            phone: initialPhone,
        });
    }, [initialName, initialSurname, initialPhone]);

    const handleFinish = async (values: any) => {
        if (!user) return;

        setSubmitting(true);

        try {
            const timestamp = new Date();
            const orderNumber = `ORDER-${timestamp.toISOString().slice(0, 19).replace(/[-T:]/g, '')}-${user.uid.slice(0, 6)}`;
            const totalPrice = cartItems.reduce(
                (sum, item) => sum + item.priceAtTime * item.quantity,
                0
            );

            const order: Order = {
                userId: user.uid,
                userEmail: user.email || '',
                userRef: doc(db, 'users', user.uid),
                orderNumber: orderNumber,
                name: values.name,
                surname: values.surname,
                address: values.address,
                city: values.city,
                phone: values.phone,
                paymentMethod: values.paymentMethod,
                paymentStatus: values.paymentMethod === 'Card' ? 'Pending' : 'Not paid',
                status: 'pending',
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                deliveredAt: '',
                shippedAt: '',
                totalPrice: totalPrice,
                currency: 'USD',
                coupon: '',
                items: cartItems.map((item): OrderItem => ({
                    productId: item.productId,
                    productRef: `/products/${item.productId}`,
                    title: item.productTitle,
                    imageUrl: item.image,
                    priceAtTime: item.priceAtTime,
                    quantity: item.quantity,
                })),
            };

            const orderRef = await addDoc(collection(db, 'orders'), order);

            const batchDeletes = cartItems.map((item) =>
                deleteDoc(doc(db, 'carts', user.uid, 'cartItems', item.productId))
            );
            await Promise.all(batchDeletes);

            message.success('Order placed successfully!');
            router.push(`/checkout-success?orderId=${orderRef.id}`);
        } catch (err) {
            console.error('Error creating order:', err);
            message.error('Failed to place order. Try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center p-10">
                <Spin size="large" />
            </div>
        );
    }

    if (cartItems.length === 0) {
        return <Typography.Text>Your cart is empty.</Typography.Text>;
    }

    return (
        <div className="max-w-2xl mx-auto p-6">
            <Typography.Title level={2}>Checkout</Typography.Title>

            <Form form={form} layout="vertical" onFinish={handleFinish}>
                <Form.Item
                    label="Name"
                    name="name"
                    rules={[{ required: true, message: 'Please enter your name' }]}
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    label="Surname"
                    name="surname"
                    rules={[{ required: true, message: 'Please enter your surname' }]}
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    label="Phone"
                    name="phone"
                    rules={[{ required: true, message: 'Please enter your surname' }]}
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    label="Address"
                    name="address"
                    rules={[{ required: true, message: 'Please enter your address' }]}
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    label="City"
                    name="city"
                    rules={[{ required: true, message: 'Please enter your city' }]}
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    label="Payment Method"
                    name="paymentMethod"
                    rules={[{ required: true, message: 'Select a payment method' }]}
                >
                    <Select placeholder="Select payment method">
                        <Select.Option value="Cash on delivery">Cash on delivery</Select.Option>
                        <Select.Option value="Card">Card</Select.Option>
                    </Select>
                </Form.Item>

                <Form.Item>
                    <Button type="primary" htmlType="submit" loading={submitting}>
                        Place Order
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
}