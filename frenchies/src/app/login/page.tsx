'use client';

import { App, Input, Button, Typography, Form } from 'antd';
import { auth } from '@/lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import styles from './auth.module.css';

const { Title, Text } = Typography;

export default function LoginPage() {
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { message } = App.useApp();
    const [form] = Form.useForm();

    const handleLogin = async (values: { email: string; password: string }) => {
        setLoading(true);
        try {
            await signInWithEmailAndPassword(auth, values.email, values.password);
            message.success('Login successful!');
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
                    <Title level={2} className={styles.title}>Welcome Back</Title>
                    <Text className={styles.subtitle}>Sign in to your account</Text>
                </div>

                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleLogin}
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
                        rules={[{ required: true, message: 'Please enter your password' }]}
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
                            Sign In
                        </Button>
                    </Form.Item>
                </Form>

                <div className={styles.switchLink}>
                    Don't have an account?
                    <Link href="/register">Sign up</Link>
                </div>
            </div>
        </div>
    );
}