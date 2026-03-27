import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable React strict mode for better dev warnings
  reactStrictMode: true,
  // Image domains for future use (e.g. user avatars, blog images)
  images: {
    remotePatterns: [],
  },
};

export default nextConfig;
