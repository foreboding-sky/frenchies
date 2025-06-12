'use client';

import { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Spin, Tabs } from 'antd';
import { ShoppingCartOutlined, CalendarOutlined, DollarOutlined, ShoppingOutlined } from '@ant-design/icons';
import { collection, query, getDocs, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { DashboardStats } from '@/types/admin';
import { AppointmentRequest } from '@/types/appointment';
import { Order } from '@/types/order';
import { Product } from '@/types/product';
import Orders from '@/components/admin/Orders';
import Appointments from '@/components/admin/Appointments';
import Products from '@/components/admin/Products';
import styles from './admin.module.css';

export default function AdminDashboard() {
    const [stats, setStats] = useState<DashboardStats>({
        totalOrders: 0,
        totalAppointments: 0,
        pendingAppointments: 0,
        totalRevenue: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch orders
                const ordersRef = collection(db, 'orders');
                const ordersQuery = query(ordersRef, orderBy('createdAt', 'desc'));
                const ordersSnapshot = await getDocs(ordersQuery);
                const orders = ordersSnapshot.docs.map(doc => {
                    const data = doc.data();
                    return {
                        id: doc.id,
                        ...data,
                        createdAt: data.createdAt instanceof Timestamp ? data.createdAt : Timestamp.fromDate(new Date(data.createdAt))
                    } as Order;
                });

                // Fetch appointments
                const appointmentsRef = collection(db, 'appointmentRequests');
                const appointmentsQuery = query(appointmentsRef, orderBy('createdAt', 'desc'));
                const appointmentsSnapshot = await getDocs(appointmentsQuery);
                const appointments = appointmentsSnapshot.docs.map(doc => {
                    const data = doc.data();
                    return {
                        id: doc.id,
                        ...data,
                        createdAt: data.createdAt instanceof Timestamp ? data.createdAt : Timestamp.fromDate(new Date(data.createdAt)),
                        preferredDate: data.preferredDate instanceof Timestamp ? data.preferredDate : Timestamp.fromDate(new Date(data.preferredDate))
                    } as AppointmentRequest;
                });

                // Calculate statistics
                const totalOrders = orders.length;
                const totalAppointments = appointments.length;
                const pendingAppointments = appointments.filter(app => app.status === 'pending').length;
                const totalRevenue = orders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);

                setStats({
                    totalOrders,
                    totalAppointments,
                    pendingAppointments,
                    totalRevenue
                });
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div className={styles.adminContainer}>
            <div className={styles.statsSection}>
                <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12} lg={6}>
                        <Card>
                            <Statistic
                                title="Total Orders"
                                value={stats.totalOrders}
                                prefix={<ShoppingCartOutlined />}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} lg={6}>
                        <Card>
                            <Statistic
                                title="Total Appointments"
                                value={stats.totalAppointments}
                                prefix={<CalendarOutlined />}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} lg={6}>
                        <Card>
                            <Statistic
                                title="Pending Appointments"
                                value={stats.pendingAppointments}
                                prefix={<CalendarOutlined />}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} lg={6}>
                        <Card>
                            <Statistic
                                title="Total Revenue"
                                value={stats.totalRevenue}
                                prefix={<DollarOutlined />}
                                precision={2}
                            />
                        </Card>
                    </Col>
                </Row>
            </div>

            <div className={styles.contentSection}>
                <Tabs
                    defaultActiveKey="orders"
                    items={[
                        {
                            key: 'orders',
                            label: 'Orders',
                            children: <Orders />,
                        },
                        {
                            key: 'appointments',
                            label: 'Appointments',
                            children: <Appointments />,
                        },
                        {
                            key: 'products',
                            label: 'Products',
                            children: <Products />,
                        },
                    ]}
                    style={{ width: '100%' }}
                />
            </div>
        </div>
    );
} 