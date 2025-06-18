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

            message.success('Реєстрація успішна!');
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
                    <Title level={2} className={styles.title}>Створити акаунт</Title>
                    <Text className={styles.subtitle}>Зареєструйтесь, щоб розпочати</Text>
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
                            { required: true, message: 'Будь ласка введіть свій email' },
                            { type: 'email', message: 'Будь ласка введіть правильний email' },
                            { max: 100, message: 'Email не може бути більше 100 символів' }
                        ]}
                        className={styles.formItem}
                    >
                        <Input placeholder="Email" />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        rules={[
                            { required: true, message: 'Будь ласка введіть свій пароль' },
                            { min: 6, message: 'Пароль повинен бути щонайменше 6 символів' },
                            { max: 50, message: 'Пароль не повинен перевищувати 50 символів' },
                            {
                                pattern: /^(?=.*[\p{Ll}])(?=.*[\p{Lu}])(?=.*\d)[\p{L}\d]{6,}$/u,
                                message: 'Пароль повинен містити щонайменше одну велику літеру, одну малу літеру та одну цифру'
                            }
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
                    Вже маєте аккаунт?
                    <Link href="/login">Увійти</Link>
                </div>
            </div>
        </div>
    );
}