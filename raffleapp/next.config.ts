import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    turbo: {
      root: process.cwd(),
    },
  },
};

export default nextConfig;
