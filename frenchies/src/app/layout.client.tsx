'use client';

import { useAuth } from '@/lib/auth';
import { frenchiesTheme } from '../lib/theme';
import { App as AntdApp, Layout, Menu, ConfigProvider, Button, Space } from 'antd';
import Link from 'next/link';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

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
                <Layout style={{ minHeight: '100vh', background: '#EBE4DE' }}>
                    <Header style={{ background: '#EBE4DE', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        {!loading && (
                            <Space>
                                {user ? (
                                    <>
                                        <span className="text-[#744010] font-medium">Welcome, {user.email}</span>
                                        <Button onClick={handleLogout}>Log Out</Button>
                                    </>
                                ) : (
                                    <>
                                        <Link href="/login">
                                            <Button>Log In</Button>
                                        </Link>
                                        <Link href="/register">
                                            <Button type="default">Register</Button>
                                        </Link>
                                    </>
                                )}
                            </Space>
                        )}
                    </Header>
                    <Menu
                        mode="horizontal"
                        style={{ background: '#EBE4DE', borderBottom: '1px solid #D6CFC9', justifyContent: 'center' }}
                        items={[
                            { key: 'home', label: <Link href="/">Home</Link> },
                            { key: 'about', label: <Link href="/about">About Us</Link> },
                            { key: 'services', label: <Link href="/services">Services</Link> },
                            { key: 'products', label: <Link href="/products">Products</Link> },
                        ]}
                    />
                    <Content style={{ padding: '2rem' }}>{children}</Content>
                    <Footer style={{ textAlign: 'center', background: '#EBE4DE', color: '#744010' }}>
                        ©2025 Frenchies
                    </Footer>
                </Layout>
            </AntdApp>
        </ConfigProvider>
    );
}
