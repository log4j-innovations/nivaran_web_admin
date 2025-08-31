import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export for Firebase hosting
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  
  // Add experimental features for better chunk loading
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  
  // Server configuration
  env: {
    PORT: process.env.PORT || '3000',
  },
  
  // Improve chunk loading
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      // Production optimizations
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
        },
      };
    }
    return config;
  },
};

export default nextConfig;
