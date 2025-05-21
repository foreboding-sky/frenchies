'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { Input, Button, Form, message } from 'antd';

export default function ProfilePage() {
    const { user } = useAuth();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            const fetchUser = async () => {
                const docRef = doc(db, 'users', user.uid);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    form.setFieldsValue(docSnap.data());
                }
            };
            fetchUser();
        }
    }, [user, form]);

    const handleSave = async (values: any) => {
        if (!user) return;
        setLoading(true);
        try {
            const docRef = doc(db, 'users', user.uid);
            await updateDoc(docRef, values);
            message.success('Profile updated');
        } catch (err) {
            message.error('Error updating profile');
        } finally {
            setLoading(false);
        }
    };

    if (!user) return <p>You need to be logged in to view this page.</p>;

    return (
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
            <h1>Profile</h1>
            <Form form={form} onFinish={handleSave} layout="vertical">
                <Form.Item name="name" label="Name">
                    <Input />
                </Form.Item>
                <Form.Item name="surname" label="Surname">
                    <Input />
                </Form.Item>
                <Form.Item name="phone" label="Phone">
                    <Input />
                </Form.Item>
                <Button type="primary" htmlType="submit" loading={loading}>
                    Save Changes
                </Button>
            </Form>
        </div>
    );
}