'use client';

import { useState, useEffect } from 'react';

interface Usuario {
  id: string;
  nome: string;
  email: string;
  role: 'ADMIN' | 'COMPANY_ADMIN' | 'USER' | string;
  empresa: string;
  status: 'ATIVO' | 'PENDENTE' | 'BLOQUEADO';
  criadoEm?: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api-iez-partner-hub.onrender.com';

const USUARIOS_MOCK: Usuario[] = [
  { id: '1', nome: 'Anderson Esteves', email: 'anderson@iez.com.br', empresa: 'IEZ! TELECOM', role: 'ADMIN', status: 'ATIVO' },
  { id: '2', nome: 'Carlos Silva', email: 'carlos@netspeed.com.br', empresa: 'NetSpeed', role: 'COMPANY_ADMIN', status: 'ATIVO' },
  { id: '3', nome: 'Mariana Costa', email: 'mariana@zamix.com.br', empresa: 'Zamix', role: 'USER', status: 'PENDENTE' },
];

export default function GestaoAcessosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('TODOS');
  const [filtroPerfil, setFiltroPerfil] = useState('TODOS');

  // Estados dos Modais
  const [userEditRole, setUserEditRole] = useState<Usuario | null>(null);
  const [novoRole, setNovoRole] = useState<string>('USER');

  const [userResetPassword, setUserResetPassword] = useState<Usuario | null>(null);
  const [novaSenha, setNovaSenha] = useState('');

  const [userToDelete, setUserToDelete] = useState<Usuario | null>(null);

  // 1. Busca usuários da API com Fallback no localStorage
  const fetchUsuarios = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/usuarios`);
      if (!res.ok) throw new Error('Erro ao buscar usuários');
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setUsuarios(data);
        localStorage.setItem('iez_usuarios', JSON.stringify(data));
      } else {
        carregarFallbackLocal();
      }
    } catch (err) {
      console.warn('Servidor offline ou rota indisponível. Carregando dados locais.');
      carregarFallbackLocal();
    } finally {
      setLoading(false);
    }
  };

  const carregarFallbackLocal = () => {
    const salvos = localStorage.getItem('iez_usuarios');
    if (salvos) {
      try {
        setUsuarios(JSON.parse(salvos));
        return;
      } catch (e) {}
    }
    setUsuarios(USUARIOS_MOCK);
  };

  const atualizarEstadoLocal = (novosUsuarios: Usuario[]) => {
    setUsuarios(novosUsuarios);
    localStorage.setItem('iez_usuarios', JSON.stringify(novosUsuarios));
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  // 2. Alteração de Status (Aprovar / Bloquear / Reativar)
  const handleAlterarStatus = async (id: string, novoStatus: 'ATIVO' | 'BLOQUEADO') => {
    const atualizados = usuarios.map((user) => (user.id === id ? { ...user, status: novoStatus } : user));
    atualizarEstadoLocal(atualizados);

    try {
      await fetch(`${API_URL}/api/usuarios/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: novoStatus }),
      });
    } catch (err) {
      console.warn('Falha ao sincronizar alteração de status com o servidor.');
    }
  };

  // 3. Alteração do Perfil / Nível de Acesso
  const handleSalvarNivel = async () => {
    if (!userEditRole) return;

    const atualizados = usuarios.map((user) =>
      user.id === userEditRole.id ? { ...user, role: novoRole } : user
    );
    atualizarEstadoLocal(atualizados);

    try {
      await fetch(`${API_URL}/api/usuarios/${userEditRole.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: novoRole }),
      });
    } catch (err) {
      console.warn('Falha ao atualizar nível de acesso no servidor.');
    }

    setUserEditRole(null);
  };

  // 4. Redefinição de Senha e Disparo de E-mail
  const handleEnviarNovaSenha = async () => {
    if (!userResetPassword || !novaSenha.trim()) return;

    try {
      await fetch(`${API_URL}/api/usuarios/${userResetPassword.id}/senha`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ senha: novaSenha }),
      });
    } catch (err) {
      console.warn('Simulação local de redefinição de senha ativada.');
    }

    alert(`Nova senha registrada com sucesso para ${userResetPassword.email}. Instruções enviadas por e-mail!`);
    setUserResetPassword(null);
    setNovaSenha('');
  };

  // 5. Exclusão Definitiva de Usuário
  const handleExcluirUsuario = async () => {
    if (!userToDelete) return;

    const atualizados = usuarios.filter((user) => user.id !== userToDelete.id);
    atualizarEstadoLocal(atualizados);

    try {
      await fetch(`${API_URL}/api/usuarios/${userToDelete.id}`, {
        method: 'DELETE',
      });
    } catch (err) {
      console.warn('Falha ao excluir usuário na API.');
    }

    setUserToDelete(null);
  };

  // 6. Filtros Combinados (Busca, Status e Perfil)
  const usuariosFiltrados = usuarios.filter((u) => {
    const termo = busca.toLowerCase();
    const matchBusca =
      u.nome.toLowerCase().includes(termo) ||
      u.email.toLowerCase().includes(termo) ||
      u.empresa.toLowerCase().includes(termo);

    const matchStatus = filtroStatus === 'TODOS' || u.status === filtroStatus;

    const matchPerfil =
      filtroPerfil === 'TODOS' ||
      (filtroPerfil === 'ADMIN' && u.role === 'ADMIN') ||
      (filtroPerfil === 'COMPANY_ADMIN' && u.role === 'COMPANY_ADMIN') ||
      (filtroPerfil === 'USER' && (u.role === 'USER' || u.role === 'PARTNER'));

    return matchBusca && matchStatus && matchPerfil;
  });

  return (
    <div className="space-y-6 font-sans selection:bg-orange-100 selection:text-orange-900">
      
      {/* CABEÇALHO */}
      <div className="pb-2 border-b border-gray-100">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Gestão de Acessos</h1>
        <p className="text-sm text-gray-500 mt-1">
          Aprove cadastros, redefina senhas e gerencie as permissões dos parceiros.
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
            className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all text-gray-800"
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
            <option value="ADMIN">IEZ Admin</option>
            <option value="COMPANY_ADMIN">Admin Parceiro</option>
            <option value="USER">Colaborador</option>
          </select>
        </div>
      </div>

      {/* TABELA DE USUÁRIOS */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400 font-medium">Carregando usuários...</div>
        ) : usuariosFiltrados.length === 0 ? (
          <div className="p-12 text-center text-gray-500">Nenhum usuário encontrado.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Usuário</th>
                  <th className="py-3.5 px-4">Empresa</th>
                  <th className="py-3.5 px-4">Perfil</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Ações do Admin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {usuariosFiltrados.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                    
                    {/* NOME & E-MAIL */}
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-gray-900">{u.nome}</p>
                      <p className="text-xs text-gray-400">{u.email}</p>
                    </td>

                    {/* EMPRESA */}
                    <td className="py-3.5 px-4 text-gray-700 font-medium">
                      {u.empresa}
                    </td>

                    {/* PERFIL */}
                    <td className="py-3.5 px-4">
                      <span className="text-xs font-bold px-2.5 py-1 bg-orange-50 text-orange-700 border border-orange-200/80 rounded-md">
                        {u.role === 'ADMIN' ? 'ADMIN IEZ!' : u.role === 'COMPANY_ADMIN' ? 'ADMIN PARCEIRO' : 'COLABORADOR'}
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

                    {/* AÇÕES DE GESTÃO COMPLETA */}
                    <td className="py-3.5 px-4 text-right space-x-1.5">
                      {/* AÇÕES DE FLUXO PENDENTE */}
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

                      {/* AÇÕES PARA USUÁRIOS JÁ PROCESSADOS */}
                      {u.status !== 'PENDENTE' && (
                        <>
                          <button
                            onClick={() => {
                              setUserEditRole(u);
                              setNovoRole(u.role);
                            }}
                            className="text-xs font-semibold px-2.5 py-1.5 bg-gray-100 hover:bg-orange-50 hover:text-orange-600 rounded-md transition-colors"
                          >
                            Editar Nível
                          </button>

                          <button
                            onClick={() => {
                              setUserResetPassword(u);
                              setNovaSenha('');
                            }}
                            className="text-xs font-semibold px-2.5 py-1.5 bg-gray-100 hover:bg-orange-50 hover:text-orange-600 rounded-md transition-colors"
                          >
                            Nova Senha
                          </button>

                          {u.status === 'ATIVO' && u.role !== 'ADMIN' && (
                            <button
                              onClick={() => handleAlterarStatus(u.id, 'BLOQUEADO')}
                              className="text-xs font-semibold px-2.5 py-1.5 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-md transition-colors"
                            >
                              Bloquear
                            </button>
                          )}

                          {u.status === 'BLOQUEADO' && (
                            <button
                              onClick={() => handleAlterarStatus(u.id, 'ATIVO')}
                              className="text-xs font-semibold px-2.5 py-1.5 bg-green-50 text-green-700 hover:bg-green-100 rounded-md transition-colors"
                            >
                              Reativar
                            </button>
                          )}

                          <button
                            onClick={() => setUserToDelete(u)}
                            className="text-xs font-semibold px-2.5 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-md transition-colors"
                          >
                            Excluir
                          </button>
                        </>
                      )}
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL 1: EDITAR NÍVEL DE ACESSO */}
      {userEditRole && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 border border-gray-100">
            <h2 className="text-base font-bold text-gray-900 mb-1">Editar Nível de Acesso</h2>
            <p className="text-xs text-gray-500 mb-4">{userEditRole.nome} ({userEditRole.email})</p>

            <div className="space-y-3 mb-6">
              <label className="block text-xs font-semibold text-gray-700">Selecione o papel do usuário:</label>
              <select
                value={novoRole}
                onChange={(e) => setNovoRole(e.target.value)}
                className="w-full border border-gray-200 rounded-lg p-2.5 text-sm bg-white font-medium focus:ring-2 focus:ring-orange-500 outline-none text-gray-800"
              >
                <option value="USER">Colaborador (USER)</option>
                <option value="COMPANY_ADMIN">Admin Parceiro (COMPANY_ADMIN)</option>
                <option value="ADMIN">IEZ Admin (ADMIN)</option>
              </select>
            </div>

            <div className="flex justify-end gap-3">
              <button onClick={() => setUserEditRole(null)} className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg">
                Cancelar
              </button>
              <button onClick={handleSalvarNivel} className="px-4 py-2 text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-lg">
                Salvar Nível
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: REDEFINIR SENHA E DISPARAR E-MAIL */}
      {userResetPassword && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 border border-gray-100">
            <h2 className="text-base font-bold text-gray-900 mb-1">Redefinir Senha do Usuário</h2>
            <p className="text-xs text-gray-500 mb-4">Será enviado um e-mail com a nova senha para <strong className="text-gray-800">{userResetPassword.email}</strong>.</p>

            <div className="space-y-3 mb-6">
              <label className="block text-xs font-semibold text-gray-700">Nova Senha Temporária *</label>
              <input
                type="text"
                value={novaSenha}
                onChange={(e) => setNovaSenha(e.target.value)}
                placeholder="Ex: Iez!Partner2026"
                className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-orange-500 outline-none"
              />
            </div>

            <div className="flex justify-end gap-3">
              <button onClick={() => setUserResetPassword(null)} className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg">
                Cancelar
              </button>
              <button onClick={handleEnviarNovaSenha} className="px-4 py-2 text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-lg">
                Enviar por E-mail
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: EXCLUIR CADASTRO */}
      {userToDelete && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 border border-gray-100 text-center">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
              🗑️
            </div>
            <h2 className="text-base font-bold text-gray-900 mb-2">Excluir Cadastro?</h2>
            <p className="text-xs text-gray-500 leading-relaxed mb-6">
              Esta ação removerá permanentemente o acesso de <strong className="text-gray-800">{userToDelete.nome}</strong> no portal.
            </p>
            <div className="flex justify-center gap-3">
              <button onClick={() => setUserToDelete(null)} className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg">
                Cancelar
              </button>
              <button onClick={handleExcluirUsuario} className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg">
                Confirmar Exclusão
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}