import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  typescript: {
    // Impede que arquivos do backend (iez-backend) interrompam o build do Frontend
    ignoreBuildErrors: true,
  },
  eslint: {
    // Ignora regras estáticas durante o build em nuvem
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;