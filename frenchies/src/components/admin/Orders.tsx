'use client';

import { useState, useEffect } from 'react';
import { Table, Input, Select, Space, Button, App, Modal, Descriptions, message } from 'antd';
import { SearchOutlined, ReloadOutlined, EyeOutlined } from '@ant-design/icons';
import { collection, query, orderBy, getDocs, doc, updateDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import styles from './Orders.module.css';
import type { Key } from 'antd/es/table/interface';

const { Search } = Input;

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
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
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
            align: 'center' as const,
            render: (date: Timestamp) => {
                const orderDate = date.toDate();
                return (
                    <div style={{ textAlign: 'center' }}>
                        <div>{orderDate.toLocaleDateString()}</div>
                        <div style={{ fontSize: '12px', color: '#666' }}>
                            {orderDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                    </div>
                );
            },
            sorter: (a: Order, b: Order) => a.createdAt.toMillis() - b.createdAt.toMillis(),
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
                        style={{ width: 300 }}
                    />
                    <Button
                        type="primary"
                        icon={<ReloadOutlined />}
                        onClick={fetchOrders}
                    >
                        Refresh
                    </Button>
                </Space>
            </div>

            <Table
                columns={columns}
                dataSource={orders}
                rowKey="id"
                loading={loading}
                pagination={{ pageSize: 10 }}
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
                        <Descriptions.Item label="Customer Name" span={2}>
                            {selectedOrder.name} {selectedOrder.surname}
                        </Descriptions.Item>
                        <Descriptions.Item label="Email" span={2}>
                            {selectedOrder.customerEmail}
                        </Descriptions.Item>
                        <Descriptions.Item label="Phone" span={2}>
                            {selectedOrder.phone}
                        </Descriptions.Item>
                        <Descriptions.Item label="Address" span={2}>
                            {selectedOrder.address}, {selectedOrder.city}
                        </Descriptions.Item>
                        <Descriptions.Item label="Order Date" span={2}>
                            {selectedOrder.createdAt.toDate().toLocaleString()}
                        </Descriptions.Item>
                        <Descriptions.Item label="Items" span={2}>
                            <div className={styles.itemsList}>
                                {selectedOrder.items.map((item, index) => (
                                    <div key={index} className={styles.itemRow}>
                                        <div className={styles.itemInfo}>
                                            <span className={styles.itemName}>{item.title}</span>
                                            <span className={styles.itemQuantity}>x{item.quantity}</span>
                                        </div>
                                        <span className={styles.itemPrice}>
                                            ${(item.priceAtTime * item.quantity).toFixed(2)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </Descriptions.Item>
                        {selectedOrder.coupon && (
                            <Descriptions.Item label="Coupon Applied" span={2}>
                                {selectedOrder.coupon.code} (${selectedOrder.coupon.discount.toFixed(2)} off)
                            </Descriptions.Item>
                        )}
                        <Descriptions.Item label="Total Amount" span={2}>
                            ${selectedOrder.totalAmount.toFixed(2)}
                        </Descriptions.Item>
                        <Descriptions.Item label="Total Price" span={2}>
                            ${selectedOrder.totalPrice.toFixed(2)}
                        </Descriptions.Item>
                        <Descriptions.Item label="Payment Method" span={2}>
                            {selectedOrder.paymentMethod}
                        </Descriptions.Item>
                        <Descriptions.Item label="Order Status" span={2}>
                            <Select
                                value={selectedOrder.status}
                                onChange={(value: string) => handleStatusChange(selectedOrder.id, value)}
                                style={{ width: 120 }}
                            >
                                <Select.Option value="pending">Pending</Select.Option>
                                <Select.Option value="processing">Processing</Select.Option>
                                <Select.Option value="shipped">Shipped</Select.Option>
                                <Select.Option value="delivered">Delivered</Select.Option>
                                <Select.Option value="cancelled">Cancelled</Select.Option>
                            </Select>
                        </Descriptions.Item>
                        <Descriptions.Item label="Payment Status" span={2}>
                            <Select
                                value={selectedOrder.paymentStatus}
                                onChange={(value: 'Pending' | 'Not paid' | 'Paid') =>
                                    handlePaymentStatusChange(selectedOrder.id, value)}
                                style={{ width: 120 }}
                                options={[
                                    { value: 'Pending', label: 'Pending' },
                                    { value: 'Not paid', label: 'Not paid' },
                                    { value: 'Paid', label: 'Paid' }
                                ]}
                            />
                        </Descriptions.Item>
                    </Descriptions>
                )}
            </Modal>
        </div>
    );
} 