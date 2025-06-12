'use client';

import { useEffect, useState } from 'react';
import { Form, Input, DatePicker, Button, Select, App, Typography } from 'antd';
import { useAuth } from '@/lib/auth';
import { db } from '@/lib/firebase';
import { doc, getDoc, addDoc, collection, getDocs, query, serverTimestamp, where } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { ArrowLeftOutlined } from '@ant-design/icons';
import styles from './appointment.module.css';
import { Service } from '@/types/services';

const { TextArea } = Input;
const { Title, Text } = Typography;

export default function AppointmentPage() {
    const [submitting, setSubmitting] = useState(false);
    const [services, setServices] = useState<Service[]>([]);
    const { message } = App.useApp();
    const [form] = Form.useForm();
    const { user } = useAuth();
    const router = useRouter();
    const [initialName, setInitialName] = useState('');
    const [initialPhone, setInitialPhone] = useState('');

    useEffect(() => {
        const fetchServices = async () => {
            const q = query(collection(db, 'services'), where('isActive', '==', true));
            const snapshot = await getDocs(q);
            const servicesData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            })) as Service[];
            setServices(servicesData);
        };

        fetchServices();
    }, []);

    useEffect(() => {
        const fetchUserProfile = async () => {
            if (!user) return;

            try {
                const userRef = doc(db, 'users', user.uid);
                const userSnap = await getDoc(userRef);

                if (userSnap.exists()) {
                    const userData = userSnap.data();
                    const fullName = `${userData.name || ''} ${userData.surname || ''}`.trim();
                    setInitialName(fullName);
                    setInitialPhone(userData.phone || '');
                }
            } catch (error) {
                console.error('Failed to fetch user profile:', error);
            }
        };

        fetchUserProfile();
    }, [user]);

    useEffect(() => {
        if (initialName || initialPhone) {
            form.setFieldsValue({
                name: initialName,
                phone: initialPhone,
            });
        }
    }, [initialName, initialPhone]);

    const handleFinish = async (values: any) => {
        setSubmitting(true);
        try {
            // Create an array of service references
            const serviceRefs = values.service.map((serviceId: string) =>
                doc(db, 'services', serviceId)
            );

            await addDoc(collection(db, 'appointmentRequests'), {
                name: values.name,
                surname: values.name,
                phone: values.phone,
                services: serviceRefs,
                preferredDate: values.datetime.toDate(),
                comment: values.comment || '',
                status: 'pending',
                createdAt: serverTimestamp(),
            });
            message.success('Request submitted! Our manager will contact you soon.');
            form.resetFields();
            router.push('/');
        } catch (err) {
            console.error('Failed to submit:', err);
            message.error('Submission failed. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className={styles.appointmentPage}>
            <div className={styles.contentSection}>
                <div className={styles.navigation}>
                    <Button
                        type="default"
                        icon={<ArrowLeftOutlined />}
                        className={styles.navButton}
                        onClick={() => router.back()}
                    >
                        Back
                    </Button>
                </div>
                <div className={styles.header}>
                    <Title level={2} className={styles.title}>Book an Appointment</Title>
                    <Text className={styles.subtitle}>Schedule your visit with our expert groomers</Text>
                </div>

                <Form
                    layout="vertical"
                    onFinish={handleFinish}
                    form={form}
                    className={styles.form}
                >
                    <Form.Item
                        name="name"
                        label="Your Name"
                        rules={[
                            { required: true, message: 'Please enter your name' },
                            { min: 2, message: 'Name must be at least 2 characters' },
                            { max: 50, message: 'Name cannot exceed 50 characters' }
                        ]}
                    >
                        <Input placeholder="Enter your full name" />
                    </Form.Item>

                    <Form.Item
                        name="phone"
                        label="Phone Number"
                        rules={[
                            { required: true, message: 'Please enter your phone number' },
                            { pattern: /^\+?[0-9]{10,15}$/, message: 'Please enter a valid phone number' }
                        ]}
                    >
                        <Input placeholder="+380XXXXXXXXX" />
                    </Form.Item>

                    <Form.Item
                        name="service"
                        label="Select Services"
                        rules={[
                            { required: true, message: 'Please select at least one service' },
                            { type: 'array', min: 1, message: 'Please select at least one service' }
                        ]}
                    >
                        <Select
                            mode="multiple"
                            placeholder="Choose one or more services"
                            style={{ width: '100%' }}
                        >
                            {services.map((service) => (
                                <Select.Option key={service.id} value={service.id}>
                                    {service.title} - ${service.price}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="datetime"
                        label="Preferred Date & Time"
                        rules={[
                            { required: true, message: 'Please select date and time' },
                            {
                                validator: async (_, value) => {
                                    if (value && value.toDate() < new Date()) {
                                        throw new Error('Please select a future date and time');
                                    }
                                }
                            }
                        ]}
                    >
                        <DatePicker showTime format="YYYY-MM-DD HH:mm" />
                    </Form.Item>

                    <Form.Item
                        name="comment"
                        label="Additional Comments"
                        rules={[
                            { max: 500, message: 'Comments cannot exceed 500 characters' }
                        ]}
                    >
                        <TextArea
                            rows={4}
                            placeholder="Any special requests or information we should know?"
                        />
                    </Form.Item>

                    <Button
                        type="primary"
                        htmlType="submit"
                        loading={submitting}
                        className={styles.submitButton}
                    >
                        Book Appointment
                    </Button>
                </Form>
            </div>
        </div>
    );
}