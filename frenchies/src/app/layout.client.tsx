'use client';

import { useAuth } from '@/lib/auth';
import { frenchiesTheme } from '../lib/theme';
import { App as AntdApp, Layout, Menu, Button, Space, Avatar, Dropdown } from 'antd';
import Link from 'next/link';
import { signOut } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import CartBadge from '@/components/CartBadge';
import { UserOutlined, LogoutOutlined, DashboardOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { AntdConfigProvider } from '@/lib/antd-config';
import { UserProfile } from '@/types/user';

const { Header, Content, Footer } = Layout;

export default function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

    useEffect(() => {
        const fetchUserProfile = async () => {
            if (!user) return;

            try {
                const userRef = doc(db, 'users', user.uid);
                const userSnap = await getDoc(userRef);

                if (userSnap.exists()) {
                    const userData = userSnap.data() as UserProfile;
                    setUserProfile(userData);
                }
            } catch (error) {
                console.error('Failed to fetch user profile:', error);
            }
        };

        fetchUserProfile();
    }, [user]);

    const handleLogout = async () => {
        await signOut(auth);
        router.push('/');
    };

    const userMenuItems = [
        {
            key: 'profile',
            label: <Link href="/profile">Профіль</Link>,
            icon: <UserOutlined />
        },
        {
            key: 'logout',
            label: 'Вийти',
            icon: <LogoutOutlined />,
            onClick: handleLogout
        }
    ];

    return (
        <AntdConfigProvider>
            <AntdApp>
                <Layout style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
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
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                {user ? (
                                    <>
                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                            <CartBadge />
                                        </div>
                                        <Dropdown
                                            menu={{ items: userMenuItems }}
                                            placement="bottomRight"
                                            arrow
                                        >
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem',
                                                cursor: 'pointer',
                                                padding: '0.25rem 0.5rem',
                                                borderRadius: '4px',
                                                transition: 'background-color 0.3s'
                                            }}>
                                                <Avatar icon={<UserOutlined />} />
                                                <span style={{ color: 'inherit' }}>
                                                    {userProfile ? `${userProfile.name} ${userProfile.surname}` : user.email?.split('@')[0]}
                                                </span>
                                            </div>
                                        </Dropdown>
                                    </>
                                ) : (
                                    <>
                                        <Link href="/login">
                                            <Button>Логін</Button>
                                        </Link>
                                        <Link href="/register">
                                            <Button type="primary">Реєстрація</Button>
                                        </Link>
                                    </>
                                )}
                            </div>
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
                            { key: 'home', label: <Link href="/">Головна</Link> },
                            { key: 'about', label: <Link href="/about">Про нас</Link> },
                            { key: 'services', label: <Link href="/services">Послуги</Link> },
                            { key: 'products', label: <Link href="/products">Товари</Link> },
                            ...(userProfile?.isAdmin ? [{ key: 'admin', label: <Link href="/admin">Адмін Панель</Link> }] : [])
                        ]}
                    />
                    <Content style={{
                        padding: '2rem',
                        maxWidth: '1200px',
                        margin: '0 auto',
                        width: '100%',
                        flex: 1
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
        </AntdConfigProvider>
    );
}
