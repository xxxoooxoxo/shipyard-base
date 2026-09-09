import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The Shipyard preview loads the dev server through the Vercel Sandbox
  // proxy (sb-*.vercel.run). Next 16 blocks cross-origin dev requests such
  // as the HMR websocket unless the origin is allowlisted, and without that
  // socket the page never hydrates.
  allowedDevOrigins: ["*.vercel.run"],
  devIndicators: false,
  turbopack: {
    root: path.join(__dirname),
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" },
    ],
  },
};

export default nextConfig;
