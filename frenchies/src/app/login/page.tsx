'use client';

import { App, Input, Button, Typography, Form, Modal } from 'antd';
import { auth } from '@/lib/firebase';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import styles from './auth.module.css';

const { Title, Text } = Typography;

export default function LoginPage() {
    const [loading, setLoading] = useState(false);
    const [resetLoading, setResetLoading] = useState(false);
    const router = useRouter();
    const { message } = App.useApp();
    const [form] = Form.useForm();
    const [resetForm] = Form.useForm();
    const [showResetModal, setShowResetModal] = useState(false);

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

    const handleResetPassword = async (values: { email: string }) => {
        setResetLoading(true);
        try {
            await sendPasswordResetEmail(auth, values.email);
            message.success('Password reset email sent! Please check your inbox.');
            setShowResetModal(false);
            resetForm.resetFields();
        } catch (error: any) {
            message.error(error.message);
        } finally {
            setResetLoading(false);
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
                            { type: 'email', message: 'Please enter a valid email' },
                            { max: 100, message: 'Email cannot exceed 100 characters' }
                        ]}
                        className={styles.formItem}
                    >
                        <Input placeholder="Email" />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        rules={[
                            { required: true, message: 'Please enter your password' },
                            { min: 6, message: 'Password must be at least 6 characters' },
                            { max: 50, message: 'Password cannot exceed 50 characters' }
                        ]}
                        className={styles.formItem}
                    >
                        <Input.Password placeholder="Password" />
                    </Form.Item>

                    <div className={styles.forgotPassword}>
                        <Button type="link" onClick={() => setShowResetModal(true)}>
                            Forgot Password?
                        </Button>
                    </div>

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

            <Modal
                title="Reset Password"
                open={showResetModal}
                onCancel={() => {
                    setShowResetModal(false);
                    resetForm.resetFields();
                }}
                footer={null}
            >
                <Form
                    form={resetForm}
                    layout="vertical"
                    onFinish={handleResetPassword}
                >
                    <Form.Item
                        name="email"
                        rules={[
                            { required: true, message: 'Please enter your email' },
                            { type: 'email', message: 'Please enter a valid email' }
                        ]}
                    >
                        <Input placeholder="Enter your email" />
                    </Form.Item>

                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={resetLoading}
                            className={styles.submitButton}
                        >
                            Send Reset Link
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}