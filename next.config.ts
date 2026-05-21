import type { NextConfig } from "next";

process.env.TZ = "America/Sao_Paulo";

const nextConfig: NextConfig = {
  env: {
    TZ: "America/Sao_Paulo",
  },
  async headers() {
    return [
      {
        source: "/:path(admin|dashboard|login|cobranca|historico-pagamentos|editar-perfil|redefinir-senha|diario-trade|perfil-masculino|perfil-trans)",
        headers: [
          {
            key: "X-Robots-Tag",
            value: "noindex, nofollow",
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "www.delirioprive.com.br",
          },
        ],
        destination: "https://delirioprive.com.br/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
