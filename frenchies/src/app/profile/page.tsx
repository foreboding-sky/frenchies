'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { db } from '@/lib/firebase';
import {
    doc,
    getDoc,
    collection,
    query,
    where,
    orderBy,
    getDocs,
    Timestamp,
} from 'firebase/firestore';
import {
    App,
    Tabs,
    Collapse,
    Typography,
    Table,
    Spin,
    Divider,
    Descriptions,
} from 'antd';

import { Order } from '@/types/order';
import { UserProfile } from '@/types/user';

const { TabPane } = Tabs;
const { Panel } = Collapse;

export default function ProfilePage() {
    const { user } = useAuth();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const { message } = App.useApp();

    useEffect(() => {
        if (!user) return;

        const fetchData = async () => {
            try {
                // Fetch user profile
                const userRef = doc(db, 'users', user.uid);
                const userSnap = await getDoc(userRef);
                if (userSnap.exists()) {
                    const userData = userSnap.data() as UserProfile;
                    setProfile(userData);
                }

                // Fetch orders
                const q = query(
                    collection(db, 'orders'),
                    where('userId', '==', user.uid),
                    orderBy('createdAt', 'desc')
                );
                const snapshot = await getDocs(q);
                const docs = snapshot.docs.map((doc) => ({
                    ...(doc.data() as Order),
                    id: doc.id,
                }));
                setOrders(docs);
            } catch (error) {
                console.error('Failed to fetch data:', error);
                message.error('Could not fetch data');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user]);


    const formatDate = (timestamp: Timestamp | any) => {
        if (!timestamp) return '';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleString();
    };

    const orderColumns = [
        {
            title: 'Item',
            dataIndex: 'title',
            key: 'title',
        },
        {
            title: 'Quantity',
            dataIndex: 'quantity',
            key: 'quantity',
        },
        {
            title: 'Price',
            dataIndex: 'priceAtTime',
            key: 'price',
            render: (priceAtTime: any) => `$${Number(priceAtTime).toFixed(2)}`
        },
        {
            title: 'Total',
            key: 'total',
            render: (_: any, record: any) =>
                `$${(record.priceAtTime * record.quantity).toFixed(2)}`,
        },
    ];

    return (
        <div className="max-w-4xl mx-auto p-6">
            <Typography.Title level={2}>Profile</Typography.Title>
            <Tabs
                defaultActiveKey="1"
                tabPosition="left"
                items={[
                    {
                        label: 'Personal Info',
                        key: '1',
                        children: profile ? (
                            <Descriptions column={1} bordered>
                                <Descriptions.Item label="Email">{profile.email}</Descriptions.Item>
                                <Descriptions.Item label="Phone">{profile.phone}</Descriptions.Item>
                                <Descriptions.Item label="Name">{profile.name}</Descriptions.Item>
                                <Descriptions.Item label="Surname">{profile.surname}</Descriptions.Item>
                            </Descriptions>
                        ) : (
                            <Spin />
                        ),
                    },
                    {
                        label: 'Order History',
                        key: '2',
                        children: loading ? (
                            <Spin />
                        ) : orders.length === 0 ? (
                            <Typography.Text>You have no orders yet.</Typography.Text>
                        ) : (
                            <Collapse
                                accordion
                                items={orders.map((order) => ({
                                    key: order.orderNumber,
                                    label: `${order.orderNumber} - ${formatDate(order.createdAt)}`,
                                    children: (
                                        <>
                                            <Typography.Text strong>Status:</Typography.Text> {order.status}
                                            <Divider />
                                            <Table
                                                columns={orderColumns}
                                                dataSource={order.items}
                                                pagination={false}
                                                rowKey={(item) => item.productId}
                                            />
                                        </>
                                    ),
                                }))}
                            />
                        ),
                    },
                ]}
            />
        </div>
    );
}