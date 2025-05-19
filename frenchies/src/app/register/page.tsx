'use client';

import { auth } from '@/lib/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { notification, Input, Button, Typography, message } from 'antd';

const { Title } = Typography;

export default function RegisterPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter();

    const handleRegister = async () => {
        try {
            await createUserWithEmailAndPassword(auth, email, password);
            notification.success({
                message: 'Registration Successful',
                description: 'Welcome back!',
            });

            setTimeout(() => {
                router.push('/');
            }, 1000);
        } catch (error: any) {
            notification.error(error.message);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-xl shadow">
            <Title level={2}>Register</Title>
            <Input
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mb-3"
            />
            <Input.Password
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mb-3"
            />
            <Button type="primary" onClick={handleRegister} block>
                Register
            </Button>
        </div>
    );
}
