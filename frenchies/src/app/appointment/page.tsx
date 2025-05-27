'use client';

import { useEffect, useState } from 'react';
import { Form, Input, DatePicker, Button, Select, App } from 'antd';
import { useAuth } from '@/lib/auth';
import { db } from '@/lib/firebase';
import { doc, getDoc, addDoc, collection, getDocs, query, serverTimestamp, where } from 'firebase/firestore';

const { TextArea } = Input;

export default function AppointmentPage() {
    const [submitting, setSubmitting] = useState(false);
    const [services, setServices] = useState<any[]>([]);
    const { message } = App.useApp();
    const [form] = Form.useForm();
    const { user } = useAuth();
    const [initialName, setInitialName] = useState('');
    const [initialPhone, setInitialPhone] = useState('');

    useEffect(() => {
        const fetchServices = async () => {
            const q = query(collection(db, 'services'), where('isActive', '==', true));
            const snapshot = await getDocs(q);
            const servicesData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));
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
            await addDoc(collection(db, 'appointmentRequests'), {
                name: values.name,
                surName: values.name,
                phone: values.phone,
                service: values.service,
                preferredDate: values.datetime.toISOString(),
                comment: values.comment || '',
                status: 'pending',
                createdAt: serverTimestamp(),
            });
            message.success('Request submitted! Our manager will contact you soon.');
        } catch (err) {
            console.error('Failed to submit:', err);
            message.error('Submission failed. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="max-w-xl mx-auto p-6">
            <h2 className="text-2xl font-bold mb-4">Book an Appointment</h2>
            <Form layout="vertical" onFinish={handleFinish} form={form}>
                <Form.Item name="name" label="Your Name" rules={[{ required: true }]}>
                    <Input placeholder="Enter your full name" />
                </Form.Item>

                <Form.Item name="phone" label="Phone Number" rules={[{ required: true }]}>
                    <Input placeholder="Enter your phone number" />
                </Form.Item>

                <Form.Item name="service" label="Select Service" rules={[{ required: true }]}>
                    <Select placeholder="Choose a service">
                        {services.map((service) => (
                            <Select.Option key={service.id} value={service.title}>
                                {service.title}
                            </Select.Option>
                        ))}
                    </Select>
                </Form.Item>

                <Form.Item name="datetime" label="Preferred Date & Time" rules={[{ required: true }]}>
                    <DatePicker showTime format="YYYY-MM-DD HH:mm" />
                </Form.Item>

                <Form.Item name="comment" label="Comment (optional)">
                    <TextArea rows={4} />
                </Form.Item>

                <Button type="primary" htmlType="submit" loading={submitting}>
                    Submit
                </Button>
            </Form>
        </div>
    );
}