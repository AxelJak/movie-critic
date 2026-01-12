import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'image.tmdb.org',
        pathname: '/t/p/**',
      },
      {
        protocol: 'https',
        hostname: 'movie-critic.pockethost.io',
        pathname: '/api/files/**',
      },
    ],
  },
};

export default nextConfig;
