'use client'

import { useState, useEffect } from 'react'

interface Usuario {
  id: string
  nome: string
  email: string
  role: string
  empresa: string
  status: 'ATIVO' | 'PENDENTE' | 'BLOQUEADO'
  criadoEm?: string
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

export default function GestaoAcessosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState('')
  const [filtroStatus, setFiltroStatus] = useState('TODOS')
  const [filtroPerfil, setFiltroPerfil] = useState('TODOS')

  // 1. Busca os usuários salvos no SQLite via API Node
  const fetchUsuarios = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/api/usuarios`)
      if (!res.ok) throw new Error('Erro ao buscar usuários')
      const data = await res.json()
      setUsuarios(data)
    } catch (err) {
      console.error('Erro ao conectar com a API de usuários:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsuarios()
  }, [])

  // 2. Atualiza o status do usuário (Aprovar / Bloquear / Ativar)
  const handleAlterarStatus = async (id: string, novoStatus: 'ATIVO' | 'BLOQUEADO') => {
    try {
      const res = await fetch(`${API_URL}/api/usuarios/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: novoStatus }),
      })

      if (!res.ok) throw new Error('Erro ao atualizar status')

      // Atualiza o estado local imediatamente
      setUsuarios((prev) =>
        prev.map((user) => (user.id === id ? { ...user, status: novoStatus } : user))
      )
    } catch (err) {
      console.error('Erro ao alterar status:', err)
      alert('Falha ao atualizar o status do usuário.')
    }
  }

  // 3. Aplica os filtros de busca, status e perfil
  const usuariosFiltrados = usuarios.filter((u) => {
    const termo = busca.toLowerCase()
    const matchBusca =
      u.nome.toLowerCase().includes(termo) ||
      u.email.toLowerCase().includes(termo) ||
      u.empresa.toLowerCase().includes(termo)

    const matchStatus = filtroStatus === 'TODOS' || u.status === filtroStatus
    
    const matchPerfil =
      filtroPerfil === 'TODOS' ||
      (filtroPerfil === 'ADMIN' && (u.role === 'ADMIN' || u.role === 'ADMIN_EMPRESA')) ||
      (filtroPerfil === 'PARTNER' && u.role === 'PARTNER')

    return matchBusca && matchStatus && matchPerfil
  })

  return (
    <div className="space-y-6">
      {/* CABEÇALHO */}
      <div className="pb-2 border-b border-gray-100">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Gestão de Acessos</h1>
        <p className="text-sm text-gray-500 mt-1">
          Aprove ou gerencie os perfis de usuários do portal.
        </p>
      </div>

      {/* BARRA DE FILTROS */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-1/2">
          <input
            type="text"
            placeholder="Buscar por nome, e-mail ou empresa..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all"
          />
          <svg className="w-4 h-4 text-gray-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <div className="flex w-full md:w-auto gap-3">
          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
            className="w-1/2 md:w-auto px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium text-gray-700"
          >
            <option value="TODOS">Todos os Status</option>
            <option value="PENDENTE">Pendentes</option>
            <option value="ATIVO">Ativos</option>
            <option value="BLOQUEADO">Bloqueados</option>
          </select>

          <select
            value={filtroPerfil}
            onChange={(e) => setFiltroPerfil(e.target.value)}
            className="w-1/2 md:w-auto px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium text-gray-700"
          >
            <option value="TODOS">Todos os Perfis</option>
            <option value="ADMIN">Administradores</option>
            <option value="PARTNER">Parceiros</option>
          </select>
        </div>
      </div>

      {/* TABELA DE USUÁRIOS */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Carregando usuários...</div>
        ) : usuariosFiltrados.length === 0 ? (
          <div className="p-12 text-center text-gray-500">Nenhum usuário encontrado.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Usuário</th>
                  <th className="py-3.5 px-4">Empresa</th>
                  <th className="py-3.5 px-4">Perfil</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {usuariosFiltrados.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                    
                    {/* USUÁRIO & EMAIL */}
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-gray-800">{u.nome}</p>
                      <p className="text-xs text-gray-400">{u.email}</p>
                    </td>

                    {/* EMPRESA */}
                    <td className="py-3.5 px-4 text-gray-600 font-medium">
                      {u.empresa}
                    </td>

                    {/* PERFIL */}
                    <td className="py-3.5 px-4">
                      <span className="text-xs font-semibold px-2.5 py-1 bg-gray-100 text-gray-700 rounded-md">
                        {u.role === 'ADMIN' ? 'ADMIN IEZ!' : u.role === 'ADMIN_EMPRESA' ? 'ADMIN PARCEIRO' : 'COLABORADOR'}
                      </span>
                    </td>

                    {/* STATUS BADGE */}
                    <td className="py-3.5 px-4">
                      {u.status === 'ATIVO' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                          Ativo
                        </span>
                      )}
                      {u.status === 'PENDENTE' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 animate-pulse">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                          Aguardando Aprovação
                        </span>
                      )}
                      {u.status === 'BLOQUEADO' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                          Bloqueado
                        </span>
                      )}
                    </td>

                    {/* AÇÕES (APROVAR / BLOQUEAR) */}
                    <td className="py-3.5 px-4 text-right space-x-2">
                      {u.status === 'PENDENTE' && (
                        <>
                          <button
                            onClick={() => handleAlterarStatus(u.id, 'ATIVO')}
                            className="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-lg shadow-sm transition-all"
                          >
                            Aprovar
                          </button>
                          <button
                            onClick={() => handleAlterarStatus(u.id, 'BLOQUEADO')}
                            className="px-3 py-1.5 bg-white border border-gray-200 text-red-600 hover:bg-red-50 font-bold text-xs rounded-lg transition-all"
                          >
                            Recusar
                          </button>
                        </>
                      )}

                      {u.status === 'ATIVO' && u.role !== 'ADMIN' && (
                        <button
                          onClick={() => handleAlterarStatus(u.id, 'BLOQUEADO')}
                          className="text-xs font-medium text-gray-400 hover:text-red-600 transition-colors"
                        >
                          Bloquear
                        </button>
                      )}

                      {u.status === 'BLOQUEADO' && (
                        <button
                          onClick={() => handleAlterarStatus(u.id, 'ATIVO')}
                          className="text-xs font-bold text-orange-600 hover:text-orange-700 transition-colors"
                        >
                          Reativar
                        </button>
                      )}
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}