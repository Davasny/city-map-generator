import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ["@chakra-ui/react"],
  },
  images: {
    remotePatterns: [
      {
        hostname: "avatars.githubusercontent.com",
      },
    ],
  },
  transpilePackages: ["three"],
  reactStrictMode: false, // strict mode is not triggering reload on change in useEffect
};

export default nextConfig;
