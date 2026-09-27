import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "subincandescent-arnoldo-enormously.ngrok-free.dev",
    "*.ngrok-free.dev",
    "*.ngrok-free.app",
    "*.ngrok.io",
    "localhost:3000",
    "localhost:3001",
    "127.0.0.1:3000"
  ],
  experimental: {
    serverActions: {
      allowedOrigins: [
        "subincandescent-arnoldo-enormously.ngrok-free.dev",
        "*.ngrok-free.dev",
        "*.ngrok-free.app",
        "*.ngrok.io",
        "localhost:3000",
        "localhost:3001",
        "127.0.0.1:3000"
      ],
    },
  },
};

export default nextConfig;
