'use client';

import { StyleProvider } from '@ant-design/cssinjs';
import { AntdRegistry } from '@ant-design/nextjs-registry';

export default function AntdStyleProvider({ children }: { children: React.ReactNode }) {
    return (
        <AntdRegistry>
            <StyleProvider hashPriority="high">{children}</StyleProvider>
        </AntdRegistry>
    );
}
