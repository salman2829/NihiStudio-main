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
      {
        protocol: "https",
        hostname: "lightsalmon-squid-120374.hostingersite.com",
      },
      {
        protocol: "https",
        hostname: "*.hostingersite.com",
      },
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
