'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Order } from '@/types/order';
import { Descriptions, Spin, Result, Button, Typography } from 'antd';
import Link from 'next/link';
import styles from './checkout-success.module.css';

export default function CheckoutSuccessPage() {
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const searchParams = useSearchParams();
    const orderId = searchParams.get('orderId');

    useEffect(() => {
        const fetchOrder = async () => {
            if (!orderId) return;

            try {
                const orderRef = doc(db, 'orders', orderId);
                const orderSnap = await getDoc(orderRef);

                if (orderSnap.exists()) {
                    setOrder({ ...orderSnap.data() as Order, id: orderSnap.id });
                }
            } catch (error) {
                console.error('Error fetching order:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
    }, [orderId]);

    if (loading) {
        return (
            <div className={styles.successPage}>
                <div className={styles.contentSection}>
                    <div className={styles.loadingContainer}>
                        <Spin size="large" />
                        <Typography.Text className={styles.loadingText}>
                            Processing your order...
                        </Typography.Text>
                    </div>
                </div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className={styles.successPage}>
                <div className={styles.contentSection}>
                    <Result
                        status="error"
                        title="Order Not Found"
                        subTitle="We couldn't find your order. Please contact support if this persists."
                        extra={[
                            <Link href="/" key="home">
                                <Button type="primary">Back to Home</Button>
                            </Link>
                        ]}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className={styles.successPage}>
            <div className={styles.contentSection}>
                <Result
                    status="success"
                    title="Thank you for your order!"
                    subTitle="Our manager will contact you soon to confirm the details."
                    className={styles.result}
                />

                <Descriptions title="Order Info" bordered column={1} className={styles.orderInfo}>
                    <Descriptions.Item label="Order Number">{order.orderNumber}</Descriptions.Item>
                    <Descriptions.Item label="User Email">{order.userEmail}</Descriptions.Item>
                    <Descriptions.Item label="Payment Method">{order.paymentMethod}</Descriptions.Item>
                    <Descriptions.Item label="Total price">${order.totalPrice.toFixed(2)}</Descriptions.Item>
                    <Descriptions.Item label="Address">{order.address}</Descriptions.Item>
                    <Descriptions.Item label="Created At">
                        {order.createdAt?.toDate?.().toLocaleString()}
                    </Descriptions.Item>
                </Descriptions>

                <div className={styles.actions}>
                    <Link href="/">
                        <Button type="primary" className={styles.actionButton}>
                            Back to Home
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}