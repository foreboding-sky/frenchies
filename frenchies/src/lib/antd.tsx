'use client';

import { StyleProvider } from '@ant-design/cssinjs';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { App } from 'antd';

export default function AntdStyleProvider({ children }: { children: React.ReactNode }) {
    return (
        <AntdRegistry>
            <StyleProvider hashPriority="high">
                <App>{children}</App>
            </StyleProvider>
        </AntdRegistry>
    );
}
