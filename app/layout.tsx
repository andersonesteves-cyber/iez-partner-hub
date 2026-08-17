import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Suspense } from 'react';
import Sidebar from '@/components/Sidebar';
import TopHeader from '@/components/TopHeader';
import './globals.css';

// Configuração da Fonte Inter (Identidade Visual da marca iez!)
const inter = Inter({ subsets: ['latin'], display: 'swap' });

export const metadata: Metadata = {
  title: 'iez! Partner Hub',
  description: 'Portal de documentos e materiais de apoio aos parceiros da iez! telecom.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={inter.className}>
      <body className="bg-gray-50 text-gray-800 antialiased h-screen flex overflow-hidden selection:bg-orange-100 selection:text-orange-900">
        
        {/* Sidebar isolada em Suspense (caso consuma useSearchParams para indicar item ativo) */}
        <Suspense fallback={<div className="w-64 bg-white border-r border-gray-100 h-screen hidden md:block shrink-0" />}>
          <Sidebar />
        </Suspense>

        {/* Container Conteúdo Principal */}
        <div className="flex-1 flex flex-col min-w-0 h-full relative overflow-hidden">
          
          {/* TopHeader em Suspense para leitura de busca via useSearchParams */}
          <Suspense fallback={<div className="h-16 bg-white border-b border-gray-100 shrink-0" />}>
            <TopHeader />
          </Suspense>

          {/* Área de Conteúdo com Scroll Próprio */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 w-full max-w-7xl mx-auto">
            <Suspense
              fallback={
                <div className="flex items-center justify-center p-12 text-orange-600 font-semibold text-sm">
                  Carregando portal...
                </div>
              }
            >
              {children}
            </Suspense>
          </main>
          
        </div>
      </body>
    </html>
  );
}