import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  // Ensure consistent font loading behavior
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  // Expose environment variables to client
  env: {
    NEXT_PUBLIC_AUTH_GOOGLE_ID: process.env.AUTH_GOOGLE_ID,
    NEXT_PUBLIC_GOOGLE_API_KEY: process.env.GOOGLE_API_KEY,
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
