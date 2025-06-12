'use client';

import { useState, useEffect } from 'react';
import { Table, Input, Select, Space, Button, App, Modal, Descriptions, message } from 'antd';
import { SearchOutlined, ReloadOutlined, EyeOutlined } from '@ant-design/icons';
import { collection, query, orderBy, getDocs, doc, updateDoc, serverTimestamp, Timestamp, DocumentReference } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import styles from './Appointments.module.css';
import type { Key } from 'antd/es/table/interface';
import { Service } from '@/types/services';

const { Search } = Input;

interface AppointmentRequest {
    id: string;
    name: string;
    surname: string;
    phone: string;
    services: DocumentReference[];
    totalPrice: number;
    preferredDate: Timestamp;
    status: 'Pending' | 'Confirmed' | 'Cancelled';
    createdAt: Timestamp;
    updatedAt: Timestamp;
}

export default function Appointments() {
    const [appointments, setAppointments] = useState<AppointmentRequest[]>([]);
    const [services, setServices] = useState<Record<string, Service>>({});
    const [loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState('');
    const [selectedAppointment, setSelectedAppointment] = useState<AppointmentRequest | null>(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const { message: messageApi } = App.useApp();

    const fetchServices = async () => {
        try {
            const servicesRef = collection(db, 'services');
            const querySnapshot = await getDocs(servicesRef);
            const servicesData: Record<string, Service> = {};
            querySnapshot.forEach((doc) => {
                servicesData[doc.id] = { id: doc.id, ...doc.data() } as Service;
            });
            setServices(servicesData);
        } catch (error) {
            console.error('Error fetching services:', error);
            messageApi.error('Failed to fetch services');
        }
    };

    const fetchAppointments = async () => {
        try {
            setLoading(true);
            const appointmentsRef = collection(db, 'appointmentRequests');
            const q = query(appointmentsRef, orderBy('createdAt', 'desc'));
            const querySnapshot = await getDocs(q);
            const appointmentsData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt instanceof Timestamp ? doc.data().createdAt : Timestamp.fromDate(new Date(doc.data().createdAt)),
                preferredDate: doc.data().preferredDate instanceof Timestamp ? doc.data().preferredDate : Timestamp.fromDate(new Date(doc.data().preferredDate))
            })) as AppointmentRequest[];
            setAppointments(appointmentsData);
        } catch (error) {
            console.error('Error fetching appointments:', error);
            messageApi.error('Failed to fetch appointments');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchServices();
        fetchAppointments();
    }, []);

    const handleStatusChange = async (id: string, newStatus: string) => {
        try {
            const appointmentRef = doc(db, 'appointmentRequests', id);
            await updateDoc(appointmentRef, {
                status: newStatus,
                updatedAt: serverTimestamp()
            });
            messageApi.success('Status updated successfully');
            fetchAppointments();
        } catch (error) {
            console.error('Error updating status:', error);
            messageApi.error('Failed to update status');
        }
    };

    const handleRefresh = () => {
        fetchAppointments();
    };

    const handleSearch = (value: string) => {
        setSearchText(value);
    };

    const handleViewDetails = (appointment: AppointmentRequest) => {
        setSelectedAppointment(appointment);
        setIsModalVisible(true);
    };

    const columns = [
        {
            title: 'Customer',
            dataIndex: 'name',
            key: 'customer',
            render: (_: any, record: AppointmentRequest) => `${record.name} ${record.surname}`,
            onFilter: (value: boolean | Key, record: AppointmentRequest) => {
                const searchValue = String(value).toLowerCase();
                const name = String(record.name).toLowerCase();
                const surname = String(record.surname).toLowerCase();
                return `${name} ${surname}`.includes(searchValue);
            },
        },
        {
            title: 'Service',
            dataIndex: 'services',
            key: 'service',
            render: (serviceRefs: DocumentReference[]) => {
                if (!serviceRefs || !Array.isArray(serviceRefs)) return 'No services';
                return serviceRefs.map((serviceRef) => {
                    const service = services[serviceRef.id];
                    return service?.title || 'Unknown Service';
                }).filter(Boolean).join(', ');
            },
        },
        {
            title: 'Preferred Date',
            dataIndex: 'preferredDate',
            key: 'preferredDate',
            render: (date: Timestamp) => date.toDate().toLocaleString(),
            align: 'center' as const,
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status: string, record: AppointmentRequest) => (
                <Select
                    value={status}
                    onChange={(value) => handleStatusChange(record.id, value)}
                    style={{ width: 120 }}
                >
                    <Select.Option value="Pending">Pending</Select.Option>
                    <Select.Option value="Confirmed">Confirmed</Select.Option>
                    <Select.Option value="Cancelled">Cancelled</Select.Option>
                </Select>
            ),
            filters: [
                { text: 'Pending', value: 'Pending' },
                { text: 'Confirmed', value: 'Confirmed' },
                { text: 'Cancelled', value: 'Cancelled' },
            ],
            onFilter: (value: boolean | Key, record: AppointmentRequest) => record.status === value,
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_: any, record: AppointmentRequest) => (
                <Button
                    type="primary"
                    icon={<EyeOutlined />}
                    onClick={() => handleViewDetails(record)}
                >
                    Details
                </Button>
            ),
        },
    ];

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <Search
                    placeholder="Search by customer name"
                    allowClear
                    enterButton={<SearchOutlined />}
                    onSearch={handleSearch}
                    style={{ width: 300 }}
                />
                <Button
                    type="primary"
                    icon={<ReloadOutlined />}
                    onClick={handleRefresh}
                >
                    Refresh
                </Button>
            </div>

            <Table
                columns={columns}
                dataSource={appointments}
                rowKey="id"
                loading={loading}
                pagination={{ pageSize: 10 }}
            />

            <Modal
                title="Appointment Details"
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={null}
                width={800}
            >
                {selectedAppointment && (
                    <Descriptions bordered column={2}>
                        <Descriptions.Item label="Customer Name" span={2}>
                            {selectedAppointment.name} {selectedAppointment.surname}
                        </Descriptions.Item>
                        <Descriptions.Item label="Phone" span={2}>
                            {selectedAppointment.phone}
                        </Descriptions.Item>
                        <Descriptions.Item label="Preferred Date" span={2}>
                            {selectedAppointment.preferredDate.toDate().toLocaleString()}
                        </Descriptions.Item>
                        <Descriptions.Item label="Services" span={2}>
                            <div className={styles.servicesList}>
                                {selectedAppointment.services
                                    .map((serviceRef, index) => {
                                        const service = services[serviceRef.id];
                                        if (!service) return null;
                                        return (
                                            <div key={index} className={styles.serviceItem}>
                                                <span>{service.title}</span>
                                                <span className={styles.servicePrice}>
                                                    {service.price
                                                        ? `$${service.price.toFixed(2)}`
                                                        : 'Price not available'}
                                                </span>
                                            </div>
                                        );
                                    })
                                    .filter(Boolean)}
                            </div>
                        </Descriptions.Item>
                        <Descriptions.Item label="Total Price" span={2}>
                            {selectedAppointment.totalPrice
                                ? `$${selectedAppointment.totalPrice.toFixed(2)}`
                                : 'Price not available'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Status" span={2}>
                            <Select
                                value={selectedAppointment.status}
                                onChange={(value: string) => handleStatusChange(selectedAppointment.id, value)}
                                style={{ width: 120 }}
                            >
                                <Select.Option value="Pending">Pending</Select.Option>
                                <Select.Option value="Confirmed">Confirmed</Select.Option>
                                <Select.Option value="Cancelled">Cancelled</Select.Option>
                            </Select>
                        </Descriptions.Item>
                    </Descriptions>
                )}
            </Modal>
        </div>
    );
} 