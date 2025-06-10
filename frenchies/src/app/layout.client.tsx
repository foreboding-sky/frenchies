'use client';

import { useAuth } from '@/lib/auth';
import { frenchiesTheme } from '../lib/theme';
import { App as AntdApp, Layout, Menu, ConfigProvider, Button, Space } from 'antd';
import Link from 'next/link';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import CartBadge from '@/components/CartBadge';

const { Header, Content, Footer } = Layout;

export default function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();
    const router = useRouter();

    const handleLogout = async () => {
        await signOut(auth);
        router.push('/');
    };

    return (
        <ConfigProvider theme={frenchiesTheme}>
            <AntdApp>
                <Layout style={{ minHeight: '100vh' }}>
                    <Header style={{
                        position: 'sticky',
                        top: 0,
                        zIndex: 1000,
                        padding: '0 2rem',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        height: '64px'
                    }}>
                        <div className="text-xl font-semibold">
                            <Link href="/" style={{ color: 'inherit', textDecoration: 'none' }}>
                                Frenchies
                            </Link>
                        </div>
                        {!loading && (
                            <Space size="middle">
                                {user ? (
                                    <>
                                        <span style={{ color: 'inherit' }}>Welcome, {user.email}</span>
                                        <CartBadge />
                                        <Button onClick={handleLogout}>Log Out</Button>
                                    </>
                                ) : (
                                    <>
                                        <Link href="/login">
                                            <Button>Log In</Button>
                                        </Link>
                                        <Link href="/register">
                                            <Button type="primary">Register</Button>
                                        </Link>
                                    </>
                                )}
                            </Space>
                        )}
                    </Header>
                    <Menu
                        mode="horizontal"
                        style={{
                            position: 'sticky',
                            top: 64,
                            zIndex: 999,
                            padding: '0 2rem',
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
                            justifyContent: 'center',
                            height: '48px',
                            lineHeight: '48px'
                        }}
                        items={[
                            { key: 'home', label: <Link href="/">Home</Link> },
                            { key: 'about', label: <Link href="/about">About Us</Link> },
                            { key: 'services', label: <Link href="/services">Services</Link> },
                            { key: 'products', label: <Link href="/products">Products</Link> },
                            ...(user
                                ? [{ key: 'profile', label: <Link href="/profile">Profile</Link> }]
                                : [])
                        ]}
                    />
                    <Content style={{
                        padding: '2rem',
                        maxWidth: '1200px',
                        margin: '0 auto',
                        width: '100%'
                    }}>
                        {children}
                    </Content>
                    <Footer style={{
                        textAlign: 'center',
                        padding: '24px 50px',
                        boxShadow: '0 -2px 8px rgba(0, 0, 0, 0.06)'
                    }}>
                        ©2025 Frenchies
                    </Footer>
                </Layout>
            </AntdApp>
        </ConfigProvider>
    );
}
