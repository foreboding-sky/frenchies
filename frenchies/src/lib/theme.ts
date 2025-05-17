import { theme } from 'antd';
import type { ThemeConfig } from 'antd/es/config-provider/context';

export const frenchiesTheme: ThemeConfig = {
    algorithm: theme.defaultAlgorithm, // change to darkAlgorithm if needed
    token: {
        colorPrimary: '#CD9BA7',         // Accent
        colorBgBase: '#EBE4DE',          // Background
        colorTextBase: '#744010',        // Font color
        colorText: '#744010',            // General text
        colorBorder: '#D6CFC9',          // Soft border
        fontFamily: 'Georgia, serif',    // Elegant serif font
        borderRadius: 8,                 // Softer curves

    },
    components: {
        Layout: {
            headerBg: '#EBE4DE',
            headerColor: '#744010',
        },
        Menu: {
            itemColor: '#744010',
            itemSelectedColor: '#CD9BA7',
            itemHoverColor: '#CD9BA7',
            itemBg: '#EBE4DE',
            itemSelectedBg: '#f5e8e4',
        },
        Button: {
            colorPrimary: '#CD9BA7',
        },
        Card: {
            colorPrimary: '#EBE4DE',
        },
    },
};
