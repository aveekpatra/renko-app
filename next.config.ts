import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  // Ensure consistent font loading behavior
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  // Stable CSS class names to prevent hydration issues
  webpack: (config, { dev }) => {
    if (dev) {
      config.optimization.splitChunks = {
        ...config.optimization.splitChunks,
        cacheGroups: {
          ...config.optimization.splitChunks?.cacheGroups,
          fonts: {
            name: "fonts",
            test: /\.(woff|woff2|eot|ttf|otf)$/,
            chunks: "all",
            enforce: true,
          },
        },
      };
    }
    return config;
  },
};

export default nextConfig;
