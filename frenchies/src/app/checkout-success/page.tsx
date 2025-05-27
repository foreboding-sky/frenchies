'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Order } from '@/types/order';
import { Descriptions, Spin, Result, Button } from 'antd';
import Link from 'next/link';

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

    if (loading) return <Spin style={{ display: 'block', marginTop: 100 }} />;

    if (!order) {
        return (
            <Result
                status="404"
                title="Order Not Found"
                subTitle="We couldn’t find your order. Please contact support."
                extra={<Link href="/"><Button type="primary">Go Home</Button></Link>}
            />
        );
    }

    return (
        <div style={{ padding: 32, maxWidth: 600, margin: '0 auto' }}>
            <Result
                status="success"
                title="Thank you for your order!"
                subTitle="Our manager will contact you soon to confirm the details."
            />

            <Descriptions title="Order Info" bordered column={1}>
                <Descriptions.Item label="Order Number">{order.orderNumber}</Descriptions.Item>
                <Descriptions.Item label="User Email">{order.userEmail}</Descriptions.Item>
                <Descriptions.Item label="Payment Method">{order.paymentMethod}</Descriptions.Item>
                <Descriptions.Item label="Total price">{order.totalPrice}</Descriptions.Item>
                <Descriptions.Item label="Address">{order.address}</Descriptions.Item>
                <Descriptions.Item label="Created At">
                    {order.createdAt?.toDate?.().toLocaleString()}
                </Descriptions.Item>
            </Descriptions>

            <div style={{ marginTop: 24 }}>
                <Link href="/">
                    <Button type="primary">Back to Home</Button>
                </Link>
            </div>
        </div>
    );
}