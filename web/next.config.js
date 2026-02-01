/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Turbopack configuration (default in Next.js 16)
  turbopack: {
    resolveAlias: {
      '@': './',
    },
    root: __dirname,
  },
  allowedDevOrigins: ['127.0.0.1'],
  experimental: {
    turbopackFileSystemCacheForDev: false,
  },
  // Webpack configuration (for dev:webpack fallback)
  webpack: (config, { dev, isServer }) => {
    if (dev) {
      // Optimize file watching to reduce memory usage and prevent spikes
      config.watchOptions = {
        poll: false,
        ignored: [
          '**/node_modules/**',
          '**/.next/**',
          '**/.git/**',
          '**/.turbo/**',
          '**/dist/**',
          '**/build/**',
          '**/.cache/**',
          '**/coverage/**',
          '**/.venv/**',
          '**/venv/**',
          '**/test-results/**',
        ],
        aggregateTimeout: 300,
      };
      config.infrastructureLogging = { level: 'error' };
    }
    return config;
  },
};

module.exports = nextConfig;
