import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header'
import './globals.css'

// Configuração da Fonte Inter (Identidade Visual da marca)
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
      {/* 
        bg-gray-50: Fundo padrão estilo dashboard limpo
        overflow-x-hidden: Previne rolagem horizontal indesejada no mobile
      */}
      <body className="bg-gray-50 text-gray-800 antialiased min-h-screen flex overflow-x-hidden">
        
        {/* Barra Lateral de Navegação (Agora adaptada para Mobile/Desktop) */}
        <Sidebar />

        {/* Container Principal */}
        <div className="flex-1 flex flex-col min-w-0 w-full">
          
          {/* Cabeçalho com barra de busca global */}
          <Header />

          {/* Conteúdo Dinâmico (onde as rotas renderizam) */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {children}
          </main>
          
        </div>
      </body>
    </html>
  )
}