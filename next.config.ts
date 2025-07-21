import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export configuration
  output: 'export',
  trailingSlash: true,
  
  // Image optimization - disabled for static export
  images: {
    unoptimized: true,
  },

  // Environment variables
  env: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  },

};

export default nextConfig;
