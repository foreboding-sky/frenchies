import { ConfigProvider } from 'antd';
import { frenchiesTheme } from './theme';

export function AntdConfigProvider({ children }: { children: React.ReactNode }) {
    return (
        <ConfigProvider
            theme={frenchiesTheme}
            // Add React 19 compatibility
            getPopupContainer={(triggerNode) => triggerNode?.parentElement || document.body}
            // Disable the warning
            warning={{
                strict: false
            }}
        >
            {children}
        </ConfigProvider>
    );
} 