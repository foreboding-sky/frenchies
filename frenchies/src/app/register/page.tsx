'use client';

import { auth, db } from '@/lib/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { App, Input, Button, Typography, Form } from 'antd';
import Link from 'next/link';
import styles from '../login/auth.module.css';

const { Title, Text } = Typography;

export default function RegisterPage() {
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { message } = App.useApp();
    const [form] = Form.useForm();

    const handleRegister = async (values: { email: string; password: string }) => {
        setLoading(true);
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
            const user = userCredential.user;
            const cartRef = doc(db, "carts", user.uid);

            await setDoc(doc(db, 'users', user.uid), {
                email: user.email,
                name: '',
                surname: '',
                createdAt: serverTimestamp(),
                phone: '',
                isAdmin: false
            });

            await setDoc(cartRef, {
                userId: user.uid,
                createdAt: new Date(),
                updatedAt: new Date(),
            });

            message.success('Registration successful!');
            router.push('/');
        } catch (error: any) {
            message.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.authPage}>
            <div className={styles.contentSection}>
                <div className={styles.header}>
                    <Title level={2} className={styles.title}>Create Account</Title>
                    <Text className={styles.subtitle}>Sign up to get started</Text>
                </div>

                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleRegister}
                    className={styles.form}
                >
                    <Form.Item
                        name="email"
                        rules={[
                            { required: true, message: 'Please enter your email' },
                            { type: 'email', message: 'Please enter a valid email' }
                        ]}
                        className={styles.formItem}
                    >
                        <Input placeholder="Email" />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        rules={[
                            { required: true, message: 'Please enter your password' },
                            { min: 6, message: 'Password must be at least 6 characters' }
                        ]}
                        className={styles.formItem}
                    >
                        <Input.Password placeholder="Password" />
                    </Form.Item>

                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={loading}
                            className={styles.submitButton}
                        >
                            Sign Up
                        </Button>
                    </Form.Item>
                </Form>

                <div className={styles.switchLink}>
                    Already have an account?
                    <Link href="/login">Sign in</Link>
                </div>
            </div>
        </div>
    );
}