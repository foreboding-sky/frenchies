'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { Card, Row, Col, Statistic, Spin, Typography, Space, Button } from 'antd';
import {
    ShoppingCartOutlined,
    CalendarOutlined,
    DollarOutlined,
    ClockCircleOutlined,
    DashboardOutlined,
    ShoppingOutlined,
    ScissorOutlined
} from '@ant-design/icons';
import styles from './admin.module.css';
import { AppointmentRequest } from '@/types/appointment';
import { DashboardStats } from '@/types/admin';

const { Title } = Typography;

export default function AdminDashboard() {
    const { user } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<DashboardStats>({
        totalOrders: 0,
        totalAppointments: 0,
        pendingAppointments: 0,
        totalRevenue: 0
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Fetch orders
                const ordersQuery = query(collection(db, 'orders'));
                const ordersSnapshot = await getDocs(ordersQuery);
                const totalOrders = ordersSnapshot.size;
                const totalRevenue = ordersSnapshot.docs.reduce((sum, doc) => {
                    const data = doc.data();
                    return sum + (data.totalPrice || 0);
                }, 0);

                // Fetch appointment requests
                const appointmentRequestsQuery = query(
                    collection(db, 'appointmentRequests')
                );
                const appointmentRequestsSnapshot = await getDocs(appointmentRequestsQuery);
                const appointmentRequests = appointmentRequestsSnapshot.docs.map(doc => {
                    const data = doc.data();
                    return {
                        comment: data.comment || '',
                        createdAt: data.createdAt,
                        name: data.name || '',
                        preferredDate: data.preferredDate,
                        service: data.service || '',
                        status: data.status || '',
                        surname: data.surname || ''
                    } as AppointmentRequest;
                });

                const totalAppointments = appointmentRequests.length;
                const pendingAppointments = appointmentRequests.filter(
                    request => request.status === 'pending'
                ).length;

                setStats({
                    totalOrders,
                    totalAppointments,
                    pendingAppointments,
                    totalRevenue
                });
            } catch (error) {
                console.error('Error fetching stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div className={styles.adminDashboard}>
            <div className={styles.navigationBar}>
                <Button.Group size="large">
                    <Button
                        type="primary"
                        icon={<DashboardOutlined />}
                        onClick={() => router.push('/admin')}
                    >
                        Dashboard
                    </Button>
                    <Button
                        icon={<ShoppingCartOutlined />}
                        onClick={() => router.push('/admin/orders')}
                    >
                        Orders
                    </Button>
                    <Button
                        icon={<ShoppingOutlined />}
                        onClick={() => router.push('/admin/products')}
                    >
                        Products
                    </Button>
                    <Button
                        icon={<ScissorOutlined />}
                        onClick={() => router.push('/admin/services')}
                    >
                        Services
                    </Button>
                    <Button
                        icon={<CalendarOutlined />}
                        onClick={() => router.push('/admin/appointments')}
                    >
                        Appointments
                    </Button>
                </Button.Group>
            </div>

            <Title level={2}>Admin Dashboard</Title>

            <Row gutter={[16, 16]} className={styles.statsRow}>
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
                            prefix={<ClockCircleOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Total Revenue"
                            value={stats.totalRevenue}
                            prefix="$"
                            precision={2}
                        />
                    </Card>
                </Col>
            </Row>

            <Row gutter={[16, 16]} className={styles.managementRow}>
                <Col xs={24} md={12}>
                    <Card title="Quick Actions" className={styles.actionCard}>
                        <Space direction="vertical" style={{ width: '100%' }}>
                            <Title level={4}>Coming Soon</Title>
                            <p>Product management, appointment management, and order management features will be available here.</p>
                        </Space>
                    </Card>
                </Col>
                <Col xs={24} md={12}>
                    <Card title="Recent Activity" className={styles.activityCard}>
                        <Space direction="vertical" style={{ width: '100%' }}>
                            <Title level={4}>Coming Soon</Title>
                            <p>Recent orders, appointments, and system activities will be displayed here.</p>
                        </Space>
                    </Card>
                </Col>
            </Row>
        </div>
    );
} 