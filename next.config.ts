import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // ESLint runs via npm test (vitest) — skip pendant le build Vercel
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
