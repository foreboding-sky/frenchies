'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Order } from '@/types/order';
import { Descriptions, Spin, Result, Button } from 'antd';
import Link from 'next/link';
import styles from './checkout-success.module.css';

export default function CheckoutSuccessPage() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get('orderId');
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrder = async () => {
            if (!orderId) return;

            try {
                const orderRef = doc(db, 'orders', orderId);
                const orderSnap = await getDoc(orderRef);

                if (orderSnap.exists()) {
                    const data = orderSnap.data() as Order;
                    setOrder(data);
                }
            } catch (err) {
                console.error('Failed to fetch order:', err);
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
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
                        <Spin size="large" />
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
                        status="404"
                        title="Order Not Found"
                        subTitle="We couldn't find your order. Please contact support."
                        extra={
                            <div className={styles.actions}>
                                <Link href="/">
                                    <Button type="primary" className={styles.actionButton}>
                                        Go Home
                                    </Button>
                                </Link>
                            </div>
                        }
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