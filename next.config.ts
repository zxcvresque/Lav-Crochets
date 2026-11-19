import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // Lets a second dev server run alongside another without sharing .next
  distDir: process.env.NEXT_DIST_DIR || ".next",
  // Separate local builds also skip the default .next/types folder.
  typescript: { tsconfigPath: process.env.NEXT_DIST_DIR ? "tsconfig.local.json" : "tsconfig.json" },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  // track-post is loaded lazily on the server for optional India Post live status.
  serverExternalPackages: ["@prisma/client", "better-auth", "track-post"],
};

export default nextConfig;
