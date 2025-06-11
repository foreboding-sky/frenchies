import './globals.css';
import { ConfigProvider } from 'antd';
import AntdStyleProvider from '../lib/antd';
import ClientLayoutWrapper from './layout.client';

export const metadata = {
  title: 'Frenchies Beauty Salon',
  description: 'Beauty services and products',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
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
