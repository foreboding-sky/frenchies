'use client';

import { App, Input, Button, Typography } from 'antd';
import { auth } from '@/lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const { Title } = Typography;

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter();
    const { message } = App.useApp();

    const handleLogin = async () => {
        try {
            await signInWithEmailAndPassword(auth, email, password);
            message.success('Login successfully!');

            setTimeout(() => {
                router.push('/');
            }, 1000);
        } catch (error: any) {
            message.error(error.message);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-xl shadow">
            <Title level={2}>Login</Title>
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
            <Button type="primary" onClick={handleLogin} block>
                Log In
            </Button>
        </div>
    );
}