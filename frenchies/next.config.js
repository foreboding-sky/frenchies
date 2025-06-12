/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,
    webpack: (config, { isServer }) => {
        // Optimize bundle size
        config.optimization = {
            ...config.optimization,
            moduleIds: 'deterministic',
        };

        return config;
    },
    // Disable HMR in development to prevent the removeChild error
    webpackDevMiddleware: (config) => {
        config.watchOptions = {
            ...config.watchOptions,
            poll: false,
        };
        return config;
    },
    images: {
        domains: ['maps.googleapis.com'],
    },
    eslint: {
        // Warning: This allows production builds to successfully complete even if
        // your project has ESLint errors.
        ignoreDuringBuilds: true,
    },
    typescript: {
        // Warning: This allows production builds to successfully complete even if
        // your project has type errors.
        ignoreBuildErrors: true,
    },
};

module.exports = nextConfig; 