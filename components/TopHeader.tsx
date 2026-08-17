'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

interface UserData {
  id?: string
  nome?: string
  name?: string
  email?: string
  role?: string
  empresa?: string
  company?: string
}

export default function TopHeader() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Lê a query atual da URL para manter o input sincronizado
  const currentQuery = searchParams.get('q') || ''
  
  const [user, setUser] = useState<UserData | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [searchTerm, setSearchTerm] = useState(currentQuery)

  // Sincroniza o input com a URL se a URL mudar por outro componente (ex: Sidebar)
  useEffect(() => {
    setSearchTerm(currentQuery)
  }, [currentQuery])

  useEffect(() => {
    // Busca na nova chave 'iez_user' (usada no LoginForm atual) ou nas antigas
    const storedUser = localStorage.getItem('iez_user') || localStorage.getItem('user') || localStorage.getItem('iez_partner_user')
    
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (e) {
        console.error('Erro ao ler dados do usuário no localStorage:', e)
      }
    }
    setCarregando(false)
  }, [])

  const handleLogout = () => {
    // Limpa todas as chaves de autenticação possíveis para garantir o logout seguro
    localStorage.removeItem('iez_user')
    localStorage.removeItem('iez_token')
    localStorage.removeItem('user')
    localStorage.removeItem('iez_partner_user')
    localStorage.removeItem('token')
    
    router.push('/login')
  }

  // Função para disparar a busca ao apertar Enter
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (searchTerm.trim()) {
        router.push(`/?q=${encodeURIComponent(searchTerm.trim())}`)
      } else {
        router.push('/')
      }
    }
  }

  // Tratamento dinâmico: mostra "Carregando..." antes de ler os dados
  const nomeExibicao = carregando ? 'Carregando...' : (user?.nome || user?.name || 'Visitante')
  const roleExibicao = carregando ? '...' : (user?.role || 'USUÁRIO')
  const empresaExibicao = carregando ? '...' : (user?.empresa || user?.company || 'IEZ! TELECOM')

  // Gera as iniciais do nome (ex: "Anderson Esteves" -> "AE")
  const getInitials = (fullName: string) => {
    if (fullName === 'Carregando...' || fullName === 'Visitante') return '--'
    const names = fullName.trim().split(' ')
    if (names.length === 1) return names[0].substring(0, 2).toUpperCase()
    return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase()
  }

  const iniciais = getInitials(nomeExibicao)

  return (
    <header className="h-16 bg-white border-b border-gray-200 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-sm">
      
      {/* BARRA DE BUSCA GLOBAL */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Buscar processos, PDFs, vídeos (Aperte Enter)..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* ÁREA DO USUÁRIO LOGADO */}
      <div className="flex items-center space-x-3 sm:space-x-4">
        
        {/* NOME, CARGO E EMPRESA */}
        <div className="text-right hidden sm:block">
          <p className="text-xs font-bold text-gray-800 leading-tight">
            {nomeExibicao}
          </p>
          <p className="text-[11px] font-medium leading-tight mt-0.5">
            <span className="text-orange-600 font-bold">{roleExibicao}</span>
            <span className="text-gray-300 mx-1.5">|</span>
            <span className="text-gray-500">{empresaExibicao}</span>
          </p>
        </div>

        {/* AVATAR COM INICIAIS DA IEZ! */}
        <div className="w-9 h-9 rounded-full bg-orange-100 border border-orange-300 flex items-center justify-center font-bold text-orange-700 text-xs shadow-sm">
          {iniciais}
        </div>

        <div className="h-5 w-px bg-gray-200 hidden sm:block" />

        {/* BOTÃO DE LOGOUT */}
        <button
          onClick={handleLogout}
          className="text-xs font-medium text-gray-500 hover:text-orange-600 transition-colors py-1 px-2 rounded-md hover:bg-gray-100"
        >
          Sair
        </button>
      </div>
    </header>
  )
}