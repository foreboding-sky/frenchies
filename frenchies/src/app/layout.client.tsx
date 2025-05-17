'use client';

import { frenchiesTheme } from '../lib/theme';
import { Layout, Menu, ConfigProvider } from 'antd';
import Link from 'next/link';

const { Header, Content, Footer } = Layout;

export default function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
    return (
        <ConfigProvider theme={frenchiesTheme}>
            <Layout style={{ minHeight: '100vh', background: '#EBE4DE' }}>
                <Header style={{ background: '#EBE4DE' }}>
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
                </Header>
                <Content style={{ padding: '2rem' }}>{children}</Content>
                <Footer style={{ textAlign: 'center', background: '#EBE4DE', color: '#744010' }}>
                    ©2025 Frenchies
                </Footer>
            </Layout>
        </ConfigProvider>
    );
}
