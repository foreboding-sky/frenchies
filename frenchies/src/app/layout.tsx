import './globals.css';
import '@ant-design/v5-patch-for-react-19';
import { ConfigProvider } from 'antd';
import AntdStyleProvider from '../lib/antd';
import ClientLayoutWrapper from './layout.client';

export const metadata = {
  title: 'Frenchies Beauty Salon',
  description: 'Beauty services and products',
  icons: {
    icon: '/favicon.ico',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <AntdStyleProvider>
          <ConfigProvider
            theme={{
              token: {
                colorPrimary: '#00b96b',
              },
            }}
          >
            <ClientLayoutWrapper>{children}</ClientLayoutWrapper>
          </ConfigProvider>
        </AntdStyleProvider>
      </body>
    </html>
  );
}
