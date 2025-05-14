import './globals.css';
import 'antd/dist/reset.css';
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
          <ClientLayoutWrapper>{children}</ClientLayoutWrapper>
        </AntdStyleProvider>
      </body>
    </html>
  );
}
