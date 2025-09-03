import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
  experimental: {
    // Keep any other experimental features here
  },
  serverExternalPackages: ['mongodb', 'bcryptjs'],
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Don't resolve these modules on the client side
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        dns: false,
        tls: false,
        child_process: false,
        'timers/promises': false,
        'fs/promises': false,
      };
      
      // Exclude MongoDB and related packages from client bundle
      config.externals = config.externals || [];
      config.externals.push({
        mongodb: 'commonjs mongodb',
        'mongodb/lib/deps': 'commonjs mongodb/lib/deps',
        'gcp-metadata': 'commonjs gcp-metadata',
      });
    }
    return config;
  },
  output: 'standalone',
};

export default nextConfig;
