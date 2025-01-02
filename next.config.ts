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
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    config.module.rules.push({
      test: /\.geojson$/,
      loader: "json-loader",
    });

    // Important: return the modified config
    return config;
  },
};

export default nextConfig;
