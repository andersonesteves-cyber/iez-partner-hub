import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Suspense } from 'react'
import Sidebar from '@/components/Sidebar'
import Header from '@/components/TopHeader'
import './globals.css'

// Configuração da Fonte Inter (Identidade Visual da marca iez!)
const inter = Inter({ subsets: ['latin'], display: 'swap' })

export const metadata: Metadata = {
  title: 'iez! Partner Hub',
  description: 'Portal de documentos e materiais de apoio aos parceiros da iez! telecom.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" className={inter.className}>
      <body className="bg-gray-50 text-gray-800 antialiased min-h-screen flex overflow-x-hidden">
        
        {/* Suspense em volta da Sidebar para contornar o uso do useSearchParams */}
        <Suspense fallback={<div className="w-64 bg-white border-r h-screen hidden md:block" />}>
          <Sidebar />
        </Suspense>

        {/* Container Principal */}
        <div className="flex-1 flex flex-col min-w-0 w-full">
          
          {/* Suspense no Header também pelo mesmo motivo (barra de busca) */}
          <Suspense fallback={<div className="h-16 bg-white border-b border-gray-200" />}>
            <Header />
          </Suspense>

          {/* Conteúdo Dinâmico */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            <Suspense fallback={<div className="flex justify-center p-10 text-orange-500">Carregando portal...</div>}>
              {children}
            </Suspense>
          </main>
          
        </div>
      </body>
    </html>
  )
}