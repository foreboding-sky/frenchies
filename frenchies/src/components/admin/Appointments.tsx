'use client';

import { useState, useEffect } from 'react';
import { Table, Input, Select, Tag, Space, Button, message } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import { collection, query, orderBy, getDocs, doc, updateDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { AppointmentRequest } from '@/types/appointment';
import styles from './Appointments.module.css';
import type { Key } from 'antd/es/table/interface';

const { Search } = Input;

const statusColors = {
    pending: 'warning',
    confirmed: 'processing',
    completed: 'success',
    cancelled: 'error'
};

export default function Appointments() {
    const [appointments, setAppointments] = useState<AppointmentRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState('');
    const [statusFilter, setStatusFilter] = useState<string | null>(null);

    const fetchAppointments = async () => {
        setLoading(true);
        try {
            const appointmentsRef = collection(db, 'appointmentRequests');
            const q = query(appointmentsRef, orderBy('createdAt', 'desc'));
            const querySnapshot = await getDocs(q);
            const appointmentsData = querySnapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    createdAt: data.createdAt instanceof Timestamp ? data.createdAt : Timestamp.fromDate(new Date(data.createdAt)),
                    preferredDate: data.preferredDate instanceof Timestamp ? data.preferredDate : Timestamp.fromDate(new Date(data.preferredDate))
                } as AppointmentRequest;
            });
            setAppointments(appointmentsData);
        } catch (error) {
            console.error('Error fetching appointments:', error);
            message.error('Failed to fetch appointments');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAppointments();
    }, []);

    const handleStatusChange = async (appointmentId: string, newStatus: string) => {
        try {
            const appointmentRef = doc(db, 'appointmentRequests', appointmentId);
            await updateDoc(appointmentRef, {
                status: newStatus,
                updatedAt: serverTimestamp()
            });
            message.success('Appointment status updated successfully');
            fetchAppointments(); // Refresh the appointments list
        } catch (error) {
            console.error('Error updating appointment status:', error);
            message.error('Failed to update appointment status');
        }
    };

    const columns = [
        {
            title: 'Customer',
            dataIndex: 'name',
            key: 'customer',
            render: (_: any, record: AppointmentRequest) => `${record.name} ${record.surname}`,
            sorter: (a: AppointmentRequest, b: AppointmentRequest) =>
                `${a.name} ${a.surname}`.localeCompare(`${b.name} ${b.surname}`),
        },
        {
            title: 'Service',
            dataIndex: 'service',
            key: 'service',
            render: (service: string) => service,
            sorter: (a: AppointmentRequest, b: AppointmentRequest) =>
                a.service.localeCompare(b.service),
        },
        {
            title: 'Preferred Date',
            dataIndex: 'preferredDate',
            key: 'preferredDate',
            render: (date: Timestamp) => date?.toDate().toLocaleDateString(),
            sorter: (a: AppointmentRequest, b: AppointmentRequest) =>
                a.preferredDate.toDate().getTime() - b.preferredDate.toDate().getTime(),
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status: string, record: AppointmentRequest) => (
                <Select
                    value={status}
                    onChange={(value: string) => handleStatusChange(record.id, value)}
                    style={{ width: 120 }}
                >
                    <Select.Option value="pending">Pending</Select.Option>
                    <Select.Option value="confirmed">Confirmed</Select.Option>
                    <Select.Option value="completed">Completed</Select.Option>
                    <Select.Option value="cancelled">Cancelled</Select.Option>
                </Select>
            ),
            filters: [
                { text: 'Pending', value: 'pending' },
                { text: 'Confirmed', value: 'confirmed' },
                { text: 'Completed', value: 'completed' },
                { text: 'Cancelled', value: 'cancelled' },
            ],
            onFilter: (value: boolean | Key, record: AppointmentRequest) => record.status === value,
        },
        {
            title: 'Comment',
            dataIndex: 'comment',
            key: 'comment',
            render: (comment: string) => comment || '-',
        },
    ];

    const filteredAppointments = appointments.filter(appointment => {
        const matchesSearch = searchText === '' ||
            `${appointment.name} ${appointment.surname}`.toLowerCase().includes(searchText.toLowerCase()) ||
            appointment.service.toLowerCase().includes(searchText.toLowerCase());

        const matchesStatus = !statusFilter || appointment.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>Appointments</h1>
                <Search
                    placeholder="Search appointments..."
                    allowClear
                    onSearch={setSearchText}
                    style={{ width: 300 }}
                />
            </div>
            <Table
                dataSource={filteredAppointments}
                columns={columns}
                rowKey="id"
                pagination={{ pageSize: 10 }}
                loading={loading}
            />
        </div>
    );
} 