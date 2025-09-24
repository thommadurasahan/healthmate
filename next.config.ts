import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["@prisma/client", "bcryptjs"],
  },
  typescript: {
    ignoreBuildErrors: false,
  }
};

export default nextConfig;
