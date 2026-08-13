import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Image from 'next/image';
import Link from 'next/link';
import TopHeader from './components/TopHeader';
import { Suspense } from 'react';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'iez! Partner Hub',
  description: 'Portal de Documentos para parceiros da iez! telecom',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${inter.variable} font-sans`}>
      <body className="flex h-screen bg-gray-50 overflow-hidden text-gray-900 selection:bg-orange-100 selection:text-orange-900">
        
        {/* SIDEBAR */}
        <aside className="w-64 bg-white border-r border-gray-100 flex flex-col shrink-0 z-10">
          <div className="h-16 flex items-center px-6 border-b border-gray-100 shrink-0">
            <Link href="/" className="relative w-24 h-8 block">
              <Image
                src="/iez-logo-oficial.png"
                alt="iez! telecom"
                fill
                className="object-contain"
                priority
              />
            </Link>
          </div>

          <nav className="flex-1 py-6 px-4 space-y-1.5 overflow-y-auto">
            <Link href="/" className="block px-3 py-2 text-sm font-medium text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors">
              Início
            </Link>
            <Link href="/?q=onboarding" className="block px-3 py-2 text-sm font-medium text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors">
              Onboarding
            </Link>
            <Link href="/?q=processos" className="block px-3 py-2 text-sm font-medium text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors">
              Processos
            </Link>
            <Link href="/?q=marketing" className="block px-3 py-2 text-sm font-medium text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors">
              Marketing
            </Link>

            <div className="pt-4 pb-1">
              <p className="px-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Admin</p>
            </div>
            <Link href="/usuarios" className="block px-3 py-2 text-sm font-medium text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors">
              Gestão de Acessos
            </Link>
          </nav>

          <div className="p-4 border-t border-gray-100 bg-gray-50/50">
            <p className="text-[10px] text-gray-400 font-medium text-center">
              iez! Partner Hub v1.0
            </p>
          </div>
        </aside>

        {/* CONTEÚDO PRINCIPAL */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
          
          {/* TopHeader envolvido em Suspense para atender ao build de produção */}
          <Suspense fallback={<div className="h-16 bg-white border-b border-gray-100" />}>
            <TopHeader />
          </Suspense>
          
          {children}
          
        </div>
      </body>
    </html>
  );
}