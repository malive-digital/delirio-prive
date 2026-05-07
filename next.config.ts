import type { NextConfig } from "next";

process.env.TZ = "America/Sao_Paulo";

const nextConfig: NextConfig = {
  env: {
    TZ: "America/Sao_Paulo",
  },
};

export default nextConfig;
