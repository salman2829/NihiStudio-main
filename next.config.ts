import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "plus.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "assets.giva.co",
      },
      {
        protocol: "https",
        hostname: "nihistudio.com",
      },
    ],
  },
};

export default nextConfig;

