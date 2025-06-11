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
    Modal,
} from 'antd';
import { EditOutlined, SaveOutlined, CloseOutlined, LockOutlined } from '@ant-design/icons';
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import styles from './profile.module.css';
import { useRouter } from 'next/navigation';

import { Order } from '@/types/order';
import { UserProfile } from '@/types/user';

const { Title, Text } = Typography;
const { Panel } = Collapse;

export default function ProfilePage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);
    const [passwordForm] = Form.useForm();
    const [form] = Form.useForm();
    const { message } = App.useApp();
    const [changingPassword, setChangingPassword] = useState(false);

    useEffect(() => {
        // Wait for auth to initialize
        if (authLoading) return;

        // If auth is initialized and there's no user, redirect
        if (!user) {
            router.push('/');
            return;
        }

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
    }, [user, authLoading, router]);

    // Show loading state while auth is initializing
    if (authLoading) {
        return (
            <div className={styles.profilePage}>
                <div className={styles.contentSection}>
                    <div className={styles.loadingContainer}>
                        <Spin size="large" />
                    </div>
                </div>
            </div>
        );
    }

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

    const handlePasswordChange = async (values: { currentPassword: string; newPassword: string; confirmPassword: string }) => {
        if (!user) return;

        if (values.newPassword !== values.confirmPassword) {
            message.error('New passwords do not match');
            return;
        }

        setChangingPassword(true);
        try {
            // Reauthenticate user before changing password
            const credential = EmailAuthProvider.credential(user.email!, values.currentPassword);
            await reauthenticateWithCredential(user, credential);

            // Change password
            await updatePassword(user, values.newPassword);

            message.success('Password changed successfully');
            setIsPasswordModalVisible(false);
            passwordForm.resetFields();
        } catch (error: any) {
            console.error('Failed to change password:', error);
            if (error.code === 'auth/wrong-password') {
                message.error('Current password is incorrect');
            } else {
                message.error('Failed to change password. Please try again.');
            }
        } finally {
            setChangingPassword(false);
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
                <div className={styles.buttonContainer}>
                    <Button
                        type="primary"
                        icon={<EditOutlined />}
                        onClick={handleEdit}
                        className={styles.editButton}
                    >
                        Edit Profile
                    </Button>
                    <Button
                        icon={<LockOutlined />}
                        onClick={() => setIsPasswordModalVisible(true)}
                        className={styles.passwordButton}
                    >
                        Change Password
                    </Button>
                </div>
                <Descriptions column={1} bordered className={styles.descriptions}>
                    <Descriptions.Item label="Email">{profile?.email}</Descriptions.Item>
                    <Descriptions.Item label="Phone">{profile?.phone}</Descriptions.Item>
                    <Descriptions.Item label="Name">{profile?.name}</Descriptions.Item>
                    <Descriptions.Item label="Surname">{profile?.surname}</Descriptions.Item>
                </Descriptions>

                <Modal
                    title="Change Password"
                    open={isPasswordModalVisible}
                    onCancel={() => {
                        setIsPasswordModalVisible(false);
                        passwordForm.resetFields();
                    }}
                    footer={null}
                >
                    <Form
                        form={passwordForm}
                        layout="vertical"
                        onFinish={handlePasswordChange}
                    >
                        <Form.Item
                            name="currentPassword"
                            label="Current Password"
                            rules={[
                                { required: true, message: 'Please enter your current password' },
                                { min: 6, message: 'Password must be at least 6 characters' }
                            ]}
                        >
                            <Input.Password />
                        </Form.Item>

                        <Form.Item
                            name="newPassword"
                            label="New Password"
                            rules={[
                                { required: true, message: 'Please enter your new password' },
                                { min: 6, message: 'Password must be at least 6 characters' },
                                {
                                    pattern: /^(?=.*[\p{Ll}])(?=.*[\p{Lu}])(?=.*\d)[\p{L}\d]{6,}$/u,
                                    message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
                                }
                            ]}
                        >
                            <Input.Password />
                        </Form.Item>

                        <Form.Item
                            name="confirmPassword"
                            label="Confirm New Password"
                            dependencies={['newPassword']}
                            rules={[
                                { required: true, message: 'Please confirm your new password' },
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        if (!value || getFieldValue('newPassword') === value) {
                                            return Promise.resolve();
                                        }
                                        return Promise.reject(new Error('The two passwords do not match'));
                                    },
                                }),
                            ]}
                        >
                            <Input.Password />
                        </Form.Item>

                        <Form.Item>
                            <Space>
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    loading={changingPassword}
                                >
                                    Change Password
                                </Button>
                                <Button
                                    onClick={() => {
                                        setIsPasswordModalVisible(false);
                                        passwordForm.resetFields();
                                    }}
                                >
                                    Cancel
                                </Button>
                            </Space>
                        </Form.Item>
                    </Form>
                </Modal>
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