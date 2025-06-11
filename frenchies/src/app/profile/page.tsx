'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { db } from '@/lib/firebase';
import {
    doc,
    getDoc,
    updateDoc,
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
    Button,
    Form,
    Input,
    Space,
} from 'antd';
import { EditOutlined, SaveOutlined, CloseOutlined } from '@ant-design/icons';
import styles from './profile.module.css';

import { Order } from '@/types/order';
import { UserProfile } from '@/types/user';

const { Title, Text } = Typography;
const { Panel } = Collapse;

export default function ProfilePage() {
    const { user } = useAuth();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [form] = Form.useForm();
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
                    form.setFieldsValue(userData);
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

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleCancel = () => {
        setIsEditing(false);
        form.setFieldsValue(profile);
    };

    const handleSave = async () => {
        try {
            const values = await form.validateFields();
            const userRef = doc(db, 'users', user!.uid);
            await updateDoc(userRef, values);
            setProfile({ ...profile!, ...values });
            setIsEditing(false);
            message.success('Profile updated successfully');
        } catch (error) {
            console.error('Failed to update profile:', error);
            message.error('Could not update profile');
        }
    };

    const formatDate = (timestamp: Timestamp | any) => {
        if (!timestamp) return '';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleString();
    };

    const getStatusClass = (status: string) => {
        switch (status.toLowerCase()) {
            case 'completed':
                return styles.statusCompleted;
            case 'cancelled':
                return styles.statusCancelled;
            default:
                return styles.statusPending;
        }
    };

    const getPaymentStatusClass = (status: string) => {
        switch (status.toLowerCase()) {
            case 'paid':
                return styles.statusCompleted;
            case 'failed':
                return styles.statusCancelled;
            default:
                return styles.statusPending;
        }
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

    const renderOrderDetails = (order: Order) => (
        <>
            <div className={styles.orderInfo}>
                <div className={styles.orderInfoRow}>
                    <div className={styles.orderInfoItem}>
                        <Text type="secondary">Order Date:</Text>
                        <Text>{formatDate(order.createdAt)}</Text>
                    </div>
                    <div className={styles.orderInfoItem}>
                        <Text type="secondary">Total:</Text>
                        <Text strong>${order.totalPrice?.toFixed(2)}</Text>
                    </div>
                </div>
                <div className={styles.orderInfoRow}>
                    <div className={styles.orderInfoItem}>
                        <Text type="secondary">Status:</Text>
                        <span className={`${styles.orderStatus} ${getStatusClass(order.status)}`}>
                            {order.status}
                        </span>
                    </div>
                    <div className={styles.orderInfoItem}>
                        <Text type="secondary">Payment:</Text>
                        <span className={`${styles.orderStatus} ${getPaymentStatusClass(order.paymentStatus)}`}>
                            {order.paymentStatus}
                        </span>
                    </div>
                </div>
                <div className={styles.orderInfoRow}>
                    <div className={styles.orderInfoItem}>
                        <Text type="secondary">Customer:</Text>
                        <Text>{order.name} {order.surname}</Text>
                    </div>
                    <div className={styles.orderInfoItem}>
                        <Text type="secondary">Phone:</Text>
                        <Text>{order.phone}</Text>
                    </div>
                </div>
                <div className={styles.orderInfoRow}>
                    <div className={styles.orderInfoItem}>
                        <Text type="secondary">Email:</Text>
                        <Text>{order.userEmail}</Text>
                    </div>
                </div>
                <div className={styles.orderInfoRow}>
                    <div className={styles.orderInfoItem}>
                        <Text type="secondary">Address:</Text>
                        <Text>{order.address}, {order.city}</Text>
                    </div>
                </div>
            </div>
            <Divider />
            <Text strong>Order Items</Text>
            <Table
                columns={orderColumns}
                dataSource={order.items}
                pagination={false}
                rowKey={(item) => item.productId}
                className={styles.orderTable}
            />
        </>
    );

    const renderPersonalInfo = () => {
        if (loading) {
            return (
                <div className={styles.loadingContainer}>
                    <Spin size="large" />
                </div>
            );
        }

        if (isEditing) {
            return (
                <Form
                    form={form}
                    layout="vertical"
                    className={styles.editForm}
                >
                    <Form.Item
                        name="name"
                        label="Name"
                        rules={[
                            { required: true, message: 'Please enter your name' },
                            { min: 2, message: 'Name must be at least 2 characters' },
                            { max: 50, message: 'Name cannot exceed 50 characters' }
                        ]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="surname"
                        label="Surname"
                        rules={[
                            { required: true, message: 'Please enter your surname' },
                            { min: 2, message: 'Surname must be at least 2 characters' },
                            { max: 50, message: 'Surname cannot exceed 50 characters' }
                        ]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="phone"
                        label="Phone"
                        rules={[
                            { required: true, message: 'Please enter your phone number' },
                            { pattern: /^\+?[0-9]{10,15}$/, message: 'Please enter a valid phone number' }
                        ]}
                    >
                        <Input placeholder="+380XXXXXXXXX" />
                    </Form.Item>
                    <Form.Item
                        name="email"
                        label="Email"
                        rules={[
                            { required: true, message: 'Please enter your email' },
                            { type: 'email', message: 'Please enter a valid email' }
                        ]}
                    >
                        <Input disabled />
                    </Form.Item>
                    <Form.Item>
                        <Space>
                            <Button
                                type="primary"
                                icon={<SaveOutlined />}
                                onClick={handleSave}
                            >
                                Save
                            </Button>
                            <Button
                                icon={<CloseOutlined />}
                                onClick={handleCancel}
                            >
                                Cancel
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            );
        }

        return (
            <>
                <div className={styles.editButtonContainer}>
                    <Button
                        type="primary"
                        icon={<EditOutlined />}
                        onClick={handleEdit}
                    >
                        Edit Profile
                    </Button>
                </div>
                <Descriptions column={1} bordered className={styles.descriptions}>
                    <Descriptions.Item label="Email">{profile?.email}</Descriptions.Item>
                    <Descriptions.Item label="Phone">{profile?.phone}</Descriptions.Item>
                    <Descriptions.Item label="Name">{profile?.name}</Descriptions.Item>
                    <Descriptions.Item label="Surname">{profile?.surname}</Descriptions.Item>
                </Descriptions>
            </>
        );
    };

    return (
        <div className={styles.profilePage}>
            <div className={styles.contentSection}>
                <Title level={2}>My Profile</Title>
                <div className={styles.profileCard}>
                    <Tabs
                        defaultActiveKey="1"
                        tabPosition="left"
                        className={styles.tabs}
                        items={[
                            {
                                label: 'Personal Info',
                                key: '1',
                                children: (
                                    <div className={styles.tabContent}>
                                        {renderPersonalInfo()}
                                    </div>
                                ),
                            },
                            {
                                label: 'Order History',
                                key: '2',
                                children: (
                                    <div className={styles.tabContent}>
                                        {loading ? (
                                            <div className={styles.loadingContainer}>
                                                <Spin size="large" />
                                            </div>
                                        ) : orders.length === 0 ? (
                                            <Typography.Text>You have no orders yet.</Typography.Text>
                                        ) : (
                                            <Collapse
                                                accordion
                                                className={styles.orderCollapse}
                                                items={orders.map((order) => ({
                                                    key: order.orderNumber,
                                                    label: `${order.orderNumber} - ${formatDate(order.createdAt)}`,
                                                    children: renderOrderDetails(order),
                                                }))}
                                            />
                                        )}
                                    </div>
                                ),
                            },
                        ]}
                    />
                </div>
            </div>
        </div>
    );
}