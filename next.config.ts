import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Ativa o Strict Mode do React para ajudar a identificar problemas na interface
  reactStrictMode: true,
  
  // Se futuramente você for carregar imagens de URLs externas (como S3), 
  // a configuração entrará aqui dentro, respeitando a sintaxe do objeto.
};

export default nextConfig;