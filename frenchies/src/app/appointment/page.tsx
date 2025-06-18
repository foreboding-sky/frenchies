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
                        Назад
                    </Button>
                </div>
                <div className={styles.header}>
                    <Title level={2} className={styles.title}>Записатися</Title>
                    <Text className={styles.subtitle}>Заплануйте свій візит до наших досвідчених майстрів</Text>
                </div>

                <Form
                    layout="vertical"
                    onFinish={handleFinish}
                    form={form}
                    className={styles.form}
                >
                    <Form.Item
                        name="name"
                        label="Ваше ім'я"
                        rules={[
                            { required: true, message: 'Будь ласка, введіть ваше ім\'я' },
                            { min: 2, message: 'Ім\'я має містити щонайменше 2 символи' },
                            { max: 50, message: 'Ім\'я не може перевищувати 50 символів' }
                        ]}
                    >
                        <Input placeholder="Enter your full name" />
                    </Form.Item>

                    <Form.Item
                        name="phone"
                        label="Номер телефону"
                        rules={[
                            { required: true, message: 'Будь ласка, введіть свій номер телефону' },
                            { pattern: /^\+?[0-9]{10,15}$/, message: 'Будь ласка, введіть дійсний номер телефону' }
                        ]}
                    >
                        <Input placeholder="+380XXXXXXXXX" />
                    </Form.Item>

                    <Form.Item
                        name="service"
                        label="Оберіть послуги"
                        rules={[
                            { required: true, message: 'Будь ласка, виберіть принаймні одну послугу' },
                            { type: 'array', min: 1, message: 'Будь ласка, виберіть принаймні одну послугу' }
                        ]}
                    >
                        <Select
                            mode="multiple"
                            placeholder="Оберіть одну або декілька послуг"
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
                        label="Дата й час"
                        rules={[
                            { required: true, message: 'Будь ласка, виберіть дату та час' },
                            {
                                validator: async (_, value) => {
                                    if (value && value.toDate() < new Date()) {
                                        throw new Error('Будь ласка, виберіть майбутню дату та час');
                                    }
                                }
                            }
                        ]}
                    >
                        <DatePicker showTime format="YYYY-MM-DD HH:mm" />
                    </Form.Item>

                    <Form.Item
                        name="comment"
                        label="Коментар"
                        rules={[
                            { max: 500, message: 'Коментарі не можуть перевищувати 500 символів' }
                        ]}
                    >
                        <TextArea
                            rows={4}
                            placeholder="Якісь особливі запити чи інформація, які нам слід знати?"
                        />
                    </Form.Item>

                    <Button
                        type="primary"
                        htmlType="submit"
                        loading={submitting}
                        className={styles.submitButton}
                    >
                        Записатися
                    </Button>
                </Form>
            </div>
        </div>
    );
}