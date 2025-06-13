'use client';

import { useState, useEffect } from 'react';
import { Table, Input, Select, Tag, Space, Button, App, Modal, Descriptions, Typography, message } from 'antd';
import { SearchOutlined, ReloadOutlined, EyeOutlined } from '@ant-design/icons';
import { collection, query, orderBy, getDocs, doc, updateDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import styles from './Orders.module.css';
import type { Key } from 'antd/es/table/interface';

const { Search } = Input;
const { Text } = Typography;

const statusColors = {
    pending: 'warning',
    processing: 'processing',
    shipped: 'info',
    delivered: 'success',
    cancelled: 'error'
};

const paymentStatusColors = {
    'Not paid': 'error',
    'Pending': 'warning',
    'Paid': 'success'
};

interface OrderItem {
    id: string;
    name: string;
    title: string;
    quantity: number;
    price: number;
    priceAtTime: number;
    image: string;
}

interface Order {
    id: string;
    orderNumber: string;
    customerName: string;
    customerEmail: string;
    userEmail: string;
    name: string;
    surname: string;
    phone: string;
    address: string;
    city: string;
    totalAmount: number;
    totalPrice: number;
    status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
    paymentStatus: 'Pending' | 'Not paid' | 'Paid';
    paymentMethod: string;
    coupon?: {
        code: string;
        discount: number;
    };
    createdAt: Timestamp;
    updatedAt: Timestamp;
    items: OrderItem[];
}

export default function Orders() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState('');
    const [statusFilter, setStatusFilter] = useState<string | null>(null);
    const [paymentStatusFilter, setPaymentStatusFilter] = useState<string | null>(null);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const { message: messageApi } = App.useApp();

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const ordersRef = collection(db, 'orders');
            const q = query(ordersRef, orderBy('createdAt', 'desc'));
            const querySnapshot = await getDocs(q);
            const ordersData = querySnapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    createdAt: data.createdAt instanceof Timestamp ? data.createdAt : Timestamp.fromDate(new Date(data.createdAt))
                } as Order;
            });
            setOrders(ordersData);
        } catch (error) {
            console.error('Error fetching orders:', error);
            messageApi.error('Failed to fetch orders');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const handleStatusChange = async (orderId: string, newStatus: string) => {
        try {
            await updateDoc(doc(db, 'orders', orderId), {
                status: newStatus,
                updatedAt: serverTimestamp(),
            });
            messageApi.success('Order status updated successfully');
            fetchOrders();
        } catch (error) {
            console.error('Error updating order status:', error);
            messageApi.error('Failed to update order status');
        }
    };

    const handlePaymentStatusChange = async (orderId: string, newStatus: 'Pending' | 'Not paid' | 'Paid') => {
        try {
            const orderRef = doc(db, 'orders', orderId);
            await updateDoc(orderRef, {
                paymentStatus: newStatus,
                updatedAt: serverTimestamp()
            });
            messageApi.success('Payment status updated successfully');
            fetchOrders();
        } catch (error) {
            console.error('Error updating payment status:', error);
            messageApi.error('Failed to update payment status');
        }
    };

    const showOrderDetails = (order: Order) => {
        setSelectedOrder(order);
        setIsModalVisible(true);
    };

    const columns = [
        {
            title: 'Order Number',
            dataIndex: 'orderNumber',
            key: 'orderNumber',
            sorter: (a: Order, b: Order) => a.orderNumber.localeCompare(b.orderNumber),
        },
        {
            title: 'Customer',
            dataIndex: 'name',
            key: 'customer',
            render: (_: any, record: Order) => `${record.name} ${record.surname}`,
            sorter: (a: Order, b: Order) => `${a.name} ${a.surname}`.localeCompare(`${b.name} ${b.surname}`),
        },
        {
            title: 'Date',
            dataIndex: 'createdAt',
            key: 'date',
            render: (date: Timestamp) => date?.toDate().toLocaleDateString(),
            sorter: (a: Order, b: Order) => a.createdAt.toDate().getTime() - b.createdAt.toDate().getTime(),
        },
        {
            title: 'Total',
            dataIndex: 'totalPrice',
            key: 'total',
            render: (price: number) => `$${price.toFixed(2)}`,
            sorter: (a: Order, b: Order) => a.totalPrice - b.totalPrice,
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status: string, record: Order) => (
                <Select
                    value={status}
                    onChange={(value: string) => record.id && handleStatusChange(record.id, value)}
                    style={{ width: 120 }}
                >
                    <Select.Option value="pending">Pending</Select.Option>
                    <Select.Option value="processing">Processing</Select.Option>
                    <Select.Option value="shipped">Shipped</Select.Option>
                    <Select.Option value="delivered">Delivered</Select.Option>
                    <Select.Option value="cancelled">Cancelled</Select.Option>
                </Select>
            ),
            filters: [
                { text: 'Pending', value: 'pending' },
                { text: 'Processing', value: 'processing' },
                { text: 'Shipped', value: 'shipped' },
                { text: 'Delivered', value: 'delivered' },
                { text: 'Cancelled', value: 'cancelled' },
            ],
            onFilter: (value: boolean | Key, record: Order) => record.status === value,
        },
        {
            title: 'Payment Status',
            dataIndex: 'paymentStatus',
            key: 'paymentStatus',
            render: (status: 'Pending' | 'Not paid' | 'Paid', record: Order) => (
                <Select
                    value={status}
                    onChange={(value: 'Pending' | 'Not paid' | 'Paid') => handlePaymentStatusChange(record.id, value)}
                    style={{ width: 120 }}
                    options={[
                        { value: 'Pending', label: 'Pending' },
                        { value: 'Not paid', label: 'Not paid' },
                        { value: 'Paid', label: 'Paid' }
                    ]}
                />
            ),
        },
        {
            title: 'Actions',
            key: 'actions',
            align: 'center' as const,
            render: (_: unknown, record: Order) => (
                <Button
                    type="text"
                    icon={<EyeOutlined />}
                    onClick={() => showOrderDetails(record)}
                />
            ),
        },
    ];

    const filteredOrders = orders.filter(order => {
        const matchesSearch = searchText === '' ||
            order.orderNumber.toLowerCase().includes(searchText.toLowerCase()) ||
            `${order.name} ${order.surname}`.toLowerCase().includes(searchText.toLowerCase());

        const matchesStatus = !statusFilter || order.status === statusFilter;
        const matchesPaymentStatus = !paymentStatusFilter || order.paymentStatus === paymentStatusFilter;

        return matchesSearch && matchesStatus && matchesPaymentStatus;
    });

    return (
        <div className={styles.ordersContainer}>
            <div className={styles.header}>
                <h2>Orders Management</h2>
                <Space>
                    <Search
                        placeholder="Search orders..."
                        allowClear
                        onSearch={setSearchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        style={{ width: 200 }}
                    />
                    <Select
                        placeholder="Filter by status"
                        allowClear
                        style={{ width: 150 }}
                        onChange={setStatusFilter}
                    >
                        <Select.Option value="pending">Pending</Select.Option>
                        <Select.Option value="processing">Processing</Select.Option>
                        <Select.Option value="shipped">Shipped</Select.Option>
                        <Select.Option value="delivered">Delivered</Select.Option>
                        <Select.Option value="cancelled">Cancelled</Select.Option>
                    </Select>
                    <Select
                        placeholder="Filter by payment"
                        allowClear
                        style={{ width: 150 }}
                        onChange={setPaymentStatusFilter}
                    >
                        <Select.Option value="Not paid">Not Paid</Select.Option>
                        <Select.Option value="Pending">Pending</Select.Option>
                        <Select.Option value="Paid">Paid</Select.Option>
                    </Select>
                    <Button
                        icon={<ReloadOutlined />}
                        onClick={fetchOrders}
                    >
                        Refresh
                    </Button>
                </Space>
            </div>
            <Table
                columns={columns}
                dataSource={filteredOrders}
                rowKey="id"
                loading={loading}
                pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showTotal: (total) => `Total ${total} orders`
                }}
            />
            <Modal
                title="Order Details"
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={null}
                width={800}
            >
                {selectedOrder && (
                    <Descriptions bordered column={2}>
                        <Descriptions.Item label="Order Number" span={2}>
                            {selectedOrder.orderNumber}
                        </Descriptions.Item>
                        <Descriptions.Item label="Customer Name">
                            {`${selectedOrder.name} ${selectedOrder.surname}`}
                        </Descriptions.Item>
                        <Descriptions.Item label="Email">
                            {selectedOrder.userEmail}
                        </Descriptions.Item>
                        <Descriptions.Item label="Phone">
                            {selectedOrder.phone}
                        </Descriptions.Item>
                        <Descriptions.Item label="Address" span={2}>
                            {`${selectedOrder.address}, ${selectedOrder.city}`}
                        </Descriptions.Item>
                        <Descriptions.Item label="Order Date">
                            {selectedOrder.createdAt?.toDate().toLocaleString()}
                        </Descriptions.Item>
                        <Descriptions.Item label="Status">
                            <Tag color={statusColors[selectedOrder.status as keyof typeof statusColors]}>
                                {selectedOrder.status}
                            </Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Payment Status">
                            <Tag color={paymentStatusColors[selectedOrder.paymentStatus as keyof typeof paymentStatusColors]}>
                                {selectedOrder.paymentStatus}
                            </Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Payment Method">
                            {selectedOrder.paymentMethod}
                        </Descriptions.Item>
                        <Descriptions.Item label="Total Amount">
                            {selectedOrder.totalPrice ? `$${selectedOrder.totalPrice.toFixed(2)}` : 'N/A'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Coupon">
                            {selectedOrder.coupon && (
                                typeof selectedOrder.coupon === 'string'
                                    ? selectedOrder.coupon
                                    : `${selectedOrder.coupon.code} (${selectedOrder.coupon.discount}% off)`
                            )}
                        </Descriptions.Item>
                        <Descriptions.Item label="Items" span={2}>
                            <div className={styles.orderItems}>
                                {selectedOrder.items?.map((item, index) => (
                                    <div key={index} className={styles.orderItem}>
                                        <div className={styles.orderItemInfo}>
                                            <Text strong>{item.title}</Text>
                                            <Text type="secondary">Quantity: {item.quantity}</Text>
                                        </div>
                                        <Text strong>${Number(item.priceAtTime).toFixed(2)}</Text>
                                    </div>
                                ))}
                            </div>
                        </Descriptions.Item>
                    </Descriptions>
                )}
            </Modal>
        </div>
    );
} 