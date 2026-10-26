import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["172.16.8.17"],

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "tcroxwbgrqtenhdxqptc.supabase.co",
      },
      {
        protocol: "https",
        hostname: "aknaxmrilnlgerfamwmc.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
