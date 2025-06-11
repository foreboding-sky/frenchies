'use client';

import { useState, useEffect } from 'react';
import { Table, Input, Select, Tag, Space, Button, App } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import { collection, query, orderBy, getDocs, doc, updateDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Order } from '@/types/order';
import styles from './Orders.module.css';
import type { Key } from 'antd/es/table/interface';

const { Search } = Input;

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

export default function Orders() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState('');
    const [statusFilter, setStatusFilter] = useState<string | null>(null);
    const [paymentStatusFilter, setPaymentStatusFilter] = useState<string | null>(null);
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
            title: 'Payment',
            dataIndex: 'paymentStatus',
            key: 'payment',
            render: (status: string) => (
                <Tag color={paymentStatusColors[status as keyof typeof paymentStatusColors] || 'default'}>
                    {status}
                </Tag>
            ),
            filters: [
                { text: 'Not Paid', value: 'Not paid' },
                { text: 'Pending', value: 'Pending' },
                { text: 'Paid', value: 'Paid' },
            ],
            onFilter: (value: boolean | Key, record: Order) => record.paymentStatus === value,
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
        </div>
    );
} 