import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://10.0.0.217:3000",
    // Add your LAN IP:port here if different
  ],
};

export default nextConfig;
