'use client';

import { auth, db } from '@/lib/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { App, Input, Button, Typography } from 'antd';

const { Title } = Typography;

export default function RegisterPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter();
    const { message } = App.useApp();

    const handleRegister = async () => {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            const cartRef = doc(db, "carts", user.uid);

            message.success('Registered successfully!');

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

            setTimeout(() => {
                router.push('/');
            }, 1000);
        } catch (error: any) {
            message.error(error.message);
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