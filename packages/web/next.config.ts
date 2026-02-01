import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  transpilePackages: ["@cs2overlay/shared"],
};

export default nextConfig;
