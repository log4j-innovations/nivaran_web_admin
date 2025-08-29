import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Remove static export for development
  // output: "export",
  // distDir: "out",
  
  // Add experimental features for better chunk loading
  experimental: {
    optimizePackageImports: ['lucide-react'],
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
