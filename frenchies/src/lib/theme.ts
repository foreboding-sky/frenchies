import { theme } from 'antd';
import type { ThemeConfig } from 'antd/es/config-provider/context';

export const frenchiesTheme: ThemeConfig = {
    algorithm: theme.defaultAlgorithm,
    token: {
        colorPrimary: '#8B5A2B',         // Rich brown as primary
        colorBgBase: '#FDF6F0',          // Soft cream background
        colorTextBase: '#2C1810',        // Deep brown text
        colorText: '#2C1810',            // Deep brown text
        colorBorder: '#E8D5C4',          // Warm border color
        fontFamily: '"Playfair Display", Georgia, serif', // More elegant font
        borderRadius: 6,                 // Subtle curves
        colorBgContainer: '#FFFFFF',     // White container background
        colorBgElevated: '#FFFFFF',      // White elevated background
        colorBgLayout: '#FDF6F0',        // Layout background
    },
    components: {
        Layout: {
            headerBg: '#FFFFFF',
            headerColor: '#2C1810',
            bodyBg: '#FDF6F0',
            footerBg: '#FFFFFF',
        },
        Menu: {
            itemColor: '#2C1810',
            itemSelectedColor: '#8B5A2B',
            itemHoverColor: '#8B5A2B',
            itemBg: '#FFFFFF',
            itemSelectedBg: '#FDF6F0',
            itemHoverBg: '#FDF6F0',
            itemActiveBg: '#FDF6F0',
        },
        Button: {
            colorPrimary: '#8B5A2B',
            colorPrimaryHover: '#6B4423',
            colorPrimaryActive: '#4A2F16',
            borderRadius: 6,
        },
        Card: {
            colorBgContainer: '#FFFFFF',
            borderRadius: 8,
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
        },
    },
};
