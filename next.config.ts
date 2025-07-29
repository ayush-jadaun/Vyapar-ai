import type { NextConfig } from "next";

const nextConfig: NextConfig = {
 
    images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '**', // Allows any path under images.unsplash.com
      },
      {
        protocol: 'https',
        hostname: 'source.unsplash.com',
        port: '',
        pathname: '**', // Allows any path under source.unsplash.com
      },
    ],
  },

};

export default nextConfig;
