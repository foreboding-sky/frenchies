'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { collection, addDoc, serverTimestamp, deleteDoc, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/auth';
import { useCartItems } from '@/hooks/useCartItems';
import { App, Input, Select, Button, Typography, Form, Spin } from 'antd';
import { Order, OrderItem } from '@/types/order';
import { ArrowLeftOutlined } from '@ant-design/icons';
import styles from './checkout.module.css';

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
        if (initialName || initialSurname || initialPhone) {
            form.setFieldsValue({
                name: initialName,
                surname: initialSurname,
                phone: initialPhone,
            });
        }
    }, [initialName, initialSurname, initialPhone, form]);

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
                status: 'Pending',
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
            <div className={styles.checkoutPage}>
                <div className={styles.contentSection}>
                    <div className="flex justify-center p-10">
                        <Spin size="large" />
                    </div>
                </div>
            </div>
        );
    }

    if (submitting) {
        return (
            <div className={styles.checkoutPage}>
                <div className={styles.contentSection}>
                    <div className={styles.loadingContainer}>
                        <Spin size="large" />
                        <Typography.Text className={styles.loadingText}>Обробка вашого замовлення...</Typography.Text>
                    </div>
                </div>
            </div>
        );
    }

    if (cartItems.length === 0) {
        return (
            <div className={styles.checkoutPage}>
                <div className={styles.contentSection}>
                    <div className={styles.emptyCart}>
                        <Typography.Text>Ваша корзина пуста.</Typography.Text>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.checkoutPage}>
            <div className={styles.contentSection}>
                <div className={styles.navigation}>
                    <Button
                        type="default"
                        icon={<ArrowLeftOutlined />}
                        className={styles.navButton}
                        onClick={() => router.push('/cart')}
                    >
                        Назад
                    </Button>
                </div>
                <div className={styles.header}>
                    <Typography.Title level={2} className={styles.title}>Оформлення замовлення</Typography.Title>
                    <Typography.Text className={styles.subtitle}>Заповніть деталі вашого замовлення</Typography.Text>
                </div>

                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleFinish}
                    className={styles.form}
                    initialValues={{
                        name: initialName,
                        surname: initialSurname,
                        phone: initialPhone
                    }}
                >
                    <Form.Item
                        label="Ім'я"
                        name="name"
                        rules={[
                            { required: true, message: 'Будь ласка, введіть ваше ім\'я' },
                            { min: 2, message: 'Ім\'я має містити щонайменше 2 символи' },
                            { max: 50, message: 'Ім\'я не може перевищувати 50 символів' }
                        ]}
                        className={styles.formItem}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        label="Прізвище"
                        name="surname"
                        rules={[
                            { required: true, message: 'Будь ласка, введіть ваше прізвище' },
                            { min: 2, message: 'Прізвище має містити щонайменше 2 символи' },
                            { max: 50, message: 'Прізвище не може перевищувати 50 символів' }
                        ]}
                        className={styles.formItem}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        label="Телефон"
                        name="phone"
                        rules={[
                            { required: true, message: 'Будь ласка, введіть свій номер телефону' },
                            { pattern: /^\+?[0-9]{10,15}$/, message: 'Будь ласка, введіть дійсний номер телефону' }
                        ]}
                        className={styles.formItem}
                    >
                        <Input placeholder="+380XXXXXXXXX" />
                    </Form.Item>

                    <Form.Item
                        label="Адреса"
                        name="address"
                        rules={[
                            { required: true, message: 'Будь ласка, введіть свою адресу' },
                            { min: 5, message: 'Адреса має містити щонайменше 5 символів' },
                            { max: 200, message: 'Адреса не може перевищувати 200 символів' }
                        ]}
                        className={styles.formItem}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        label="Місто"
                        name="city"
                        rules={[
                            { required: true, message: 'Будь ласка, введіть своє місто' },
                            { min: 2, message: 'Місто має містити щонайменше 2 символи' },
                            { max: 50, message: 'Місто не може перевищувати 50 символів' }
                        ]}
                        className={styles.formItem}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        label="Спосіб оплати"
                        name="paymentMethod"
                        rules={[{ required: true, message: 'Оберіть спосіб оплати' }]}
                        className={styles.formItem}
                    >
                        <Select placeholder="Оберіть спосіб оплати">
                            <Select.Option value="Cash on delivery">Готівка</Select.Option>
                            <Select.Option value="Card">Картка</Select.Option>
                        </Select>
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" loading={submitting} className={styles.submitButton}>
                            Підтвердити замовлення
                        </Button>
                    </Form.Item>
                </Form>
            </div>
        </div>
    );
}