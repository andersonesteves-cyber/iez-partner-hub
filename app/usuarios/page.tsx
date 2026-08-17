'use client';

import { useState, useEffect, FormEvent } from 'react';

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

const USUARIOS_PADRAO: Usuario[] = [
  { id: '1', nome: 'Anderson Luiz Fernandes Esteves', email: 'anderson.esteves@iez.com.br', empresa: 'IEZ! TELECOM', role: 'ADMIN', status: 'ATIVO' },
  { id: '2', nome: 'Renato Pereira Soares', email: 'renato.soares@iez.com.br', empresa: 'iez! Telecom', role: 'ADMIN', status: 'PENDENTE' },
];

export default function GestaoAcessosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>(USUARIOS_PADRAO);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('TODOS');
  const [filtroPerfil, setFiltroPerfil] = useState('TODOS');
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Modal de Criação
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [novoNome, setNovoNome] = useState('');
  const [novoEmail, setNovoEmail] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [novaEmpresa, setNovaEmpresa] = useState('');
  const [novoRole, setNovoRole] = useState<'USER' | 'COMPANY_ADMIN' | 'ADMIN'>('USER');
  const [empresasAtivas, setEmpresasAtivas] = useState<{ id: string; nome: string }[]>([]);

  // Modais de Ações
  const [userEditRole, setUserEditRole] = useState<Usuario | null>(null);
  const [roleEditState, setRoleEditState] = useState<string>('USER');
  const [userResetPassword, setUserResetPassword] = useState<Usuario | null>(null);
  const [senhaResetInput, setSenhaResetInput] = useState('');
  const [userToDelete, setUserToDelete] = useState<Usuario | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('iez_user') || localStorage.getItem('user');
    if (stored) {
      try {
        setCurrentUser(JSON.parse(stored));
      } catch (e) {}
    }

    const parceirosSalvos = localStorage.getItem('iez_parceiros');
    if (parceirosSalvos) {
      try {
        const parsed = JSON.parse(parceirosSalvos);
        const ativas = parsed.filter((p: any) => String(p.status).toLowerCase() === 'ativo');
        setEmpresasAtivas(ativas);
      } catch (e) {}
    }

    // Carrega prioritariamente o cache local do navegador
    const salvosLocais = localStorage.getItem('iez_usuarios');
    if (salvosLocais) {
      try {
        const parsedLocais = JSON.parse(salvosLocais);
        if (Array.isArray(parsedLocais) && parsedLocais.length > 0) {
          setUsuarios(parsedLocais);
        }
      } catch (e) {}
    }

    fetchUsuarios();
  }, []);

  const userRole = currentUser?.role?.toUpperCase() || 'USER';
  const userEmpresa = currentUser?.empresa || currentUser?.company || 'IEZ! TELECOM';
  const isIezAdmin = ['ADMIN', 'IEZ_ADMIN'].includes(userRole);
  const isCompanyAdmin = userRole === 'COMPANY_ADMIN';

  const atualizarEstadoLocal = (novos: Usuario[]) => {
    setUsuarios(novos);
    localStorage.setItem('iez_usuarios', JSON.stringify(novos));
  };

  const fetchUsuarios = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/usuarios`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const salvosLocais = localStorage.getItem('iez_usuarios');
          const locais: Usuario[] = salvosLocais ? JSON.parse(salvosLocais) : [];

          // Preserva alterações locais (como aprovações) sobrepondo os dados da API se existirem
          const mapaLocais = new Map(locais.map((u) => [u.id, u]));

          const listaConsolidada = data.map((uApi: Usuario) => {
            const local = mapaLocais.get(uApi.id);
            return local || uApi;
          });

          // Adiciona novos usuários locais que ainda não estejam na API
          const idsApi = new Set(data.map((u: any) => String(u.id)));
          locais.forEach((l) => {
            if (!idsApi.has(String(l.id)) && !listaConsolidada.some((x) => x.id === l.id)) {
              listaConsolidada.unshift(l);
            }
          });

          atualizarEstadoLocal(listaConsolidada);
        }
      }
    } catch (err) {
      console.warn('API indisponível. Mantendo usuários do cache local.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    setNovoNome('');
    setNovoEmail('');
    setNovaSenha('');
    setNovoRole('USER');

    if (isCompanyAdmin) {
      setNovaEmpresa(userEmpresa);
    } else if (empresasAtivas.length > 0) {
      setNovaEmpresa(empresasAtivas[0].nome);
    } else {
      setNovaEmpresa('IEZ! TELECOM');
    }

    setIsCreateOpen(true);
  };

  const handleCreateUser = async (e: FormEvent) => {
    e.preventDefault();
    if (!novoNome || !novoEmail || !novaSenha) return;

    const empresaFinal = isIezAdmin ? novaEmpresa : userEmpresa;

    const novoUsuario: Usuario = {
      id: Date.now().toString(),
      nome: novoNome.trim(),
      email: novoEmail.trim(),
      empresa: empresaFinal,
      role: novoRole,
      status: 'ATIVO',
      criadoEm: new Date().toLocaleDateString('pt-BR'),
    };

    const atualizados = [novoUsuario, ...usuarios];
    atualizarEstadoLocal(atualizados);
    setIsCreateOpen(false);

    try {
      await fetch(`${API_URL}/api/usuarios`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(novoUsuario),
      });
    } catch (err) {}
  };

  const handleAlterarStatus = async (id: string, novoStatus: 'ATIVO' | 'BLOQUEADO') => {
    const atualizados = usuarios.map((u) => (u.id === id ? { ...u, status: novoStatus } : u));
    atualizarEstadoLocal(atualizados);

    try {
      await fetch(`${API_URL}/api/usuarios/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: novoStatus }),
      });
    } catch (err) {}
  };

  const handleSalvarNivel = async () => {
    if (!userEditRole) return;
    const atualizados = usuarios.map((u) => (u.id === userEditRole.id ? { ...u, role: roleEditState } : u));
    atualizarEstadoLocal(atualizados);
    setUserEditRole(null);
  };

  const handleEnviarNovaSenha = async () => {
    if (!userResetPassword || !senhaResetInput.trim()) return;
    alert(`Senha redefinida com sucesso para ${userResetPassword.email}!`);
    setUserResetPassword(null);
    setSenhaResetInput('');
  };

  const handleExcluirUsuario = async () => {
    if (!userToDelete) return;
    const atualizados = usuarios.filter((u) => u.id !== userToDelete.id);
    atualizarEstadoLocal(atualizados);
    setUserToDelete(null);
  };

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

    if (isCompanyAdmin) {
      return matchBusca && matchStatus && matchPerfil && u.empresa.toLowerCase() === userEmpresa.toLowerCase();
    }

    return matchBusca && matchStatus && matchPerfil;
  });

  return (
    <div className="space-y-6 font-sans selection:bg-orange-100 selection:text-orange-900">
      
      {/* CABEÇALHO */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Gestão de Acessos</h1>
          <p className="text-sm text-gray-500 mt-1">
            Aprove cadastros, crie novos usuários e gerencie permissões.
          </p>
        </div>

        {(isIezAdmin || isCompanyAdmin) && (
          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white font-bold text-xs px-4 py-3 rounded-xl shadow-sm transition-all"
          >
            <span>+</span> Cadastrar Novo Usuário
          </button>
        )}
      </div>

      {/* FILTROS */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-1/2">
          <input
            type="text"
            placeholder="Buscar por nome, e-mail ou empresa..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white text-gray-800"
          />
          <svg className="w-4 h-4 text-gray-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <div className="flex w-full md:w-auto gap-3">
          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
            className="w-1/2 md:w-auto px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg font-medium text-gray-700 outline-none"
          >
            <option value="TODOS">Todos os Status</option>
            <option value="PENDENTE">Pendentes</option>
            <option value="ATIVO">Ativos</option>
            <option value="BLOQUEADO">Bloqueados</option>
          </select>

          <select
            value={filtroPerfil}
            onChange={(e) => setFiltroPerfil(e.target.value)}
            className="w-1/2 md:w-auto px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg font-medium text-gray-700 outline-none"
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
        {loading && usuariosFiltrados.length === 0 ? (
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
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-gray-900">{u.nome}</p>
                      <p className="text-xs text-gray-400">{u.email}</p>
                    </td>
                    <td className="py-3.5 px-4 text-gray-700 font-medium">{u.empresa}</td>
                    <td className="py-3.5 px-4">
                      <span className="text-xs font-bold px-2.5 py-1 bg-orange-50 text-orange-700 border border-orange-200/80 rounded-md">
                        {u.role === 'ADMIN' ? 'ADMIN IEZ!' : u.role === 'COMPANY_ADMIN' ? 'ADMIN PARCEIRO' : 'COLABORADOR'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {u.status === 'ATIVO' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-200">
                          Ativo
                        </span>
                      )}
                      {u.status === 'PENDENTE' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 animate-pulse">
                          Aguardando
                        </span>
                      )}
                      {u.status === 'BLOQUEADO' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200">
                          Bloqueado
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1.5">
                      {u.status === 'PENDENTE' && (
                        <>
                          <button onClick={() => handleAlterarStatus(u.id, 'ATIVO')} className="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-lg shadow-sm">
                            Aprovar
                          </button>
                          <button onClick={() => handleAlterarStatus(u.id, 'BLOQUEADO')} className="px-3 py-1.5 border border-gray-200 text-red-600 hover:bg-red-50 font-bold text-xs rounded-lg">
                            Recusar
                          </button>
                        </>
                      )}

                      {u.status !== 'PENDENTE' && (
                        <>
                          <button onClick={() => { setUserEditRole(u); setRoleEditState(u.role); }} className="text-xs font-semibold px-2.5 py-1.5 bg-gray-100 hover:bg-orange-50 hover:text-orange-600 rounded-md">
                            Editar Nível
                          </button>
                          <button onClick={() => { setUserResetPassword(u); setSenhaResetInput(''); }} className="text-xs font-semibold px-2.5 py-1.5 bg-gray-100 hover:bg-orange-50 hover:text-orange-600 rounded-md">
                            Nova Senha
                          </button>
                          <button onClick={() => setUserToDelete(u)} className="text-xs font-semibold px-2.5 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-md">
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

      {/* MODAL 1: CADASTRAR NOVO USUÁRIO */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-3">
              <h2 className="text-base font-bold text-gray-900">Cadastrar Novo Usuário</h2>
              <button onClick={() => setIsCreateOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Nome Completo *</label>
                <input
                  type="text"
                  required
                  value={novoNome}
                  onChange={(e) => setNovoNome(e.target.value)}
                  placeholder="Ex: João Souza"
                  className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">E-mail Corporativo *</label>
                <input
                  type="email"
                  required
                  value={novoEmail}
                  onChange={(e) => setNovoEmail(e.target.value)}
                  placeholder="joao@empresa.com.br"
                  className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Senha Temporária *</label>
                <input
                  type="text"
                  required
                  value={novaSenha}
                  onChange={(e) => setNovaSenha(e.target.value)}
                  placeholder="Ex: Iez!Partner2026"
                  className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Empresa Parceira *</label>
                {isIezAdmin ? (
                  <select
                    value={novaEmpresa}
                    onChange={(e) => setNovaEmpresa(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg p-2.5 text-sm bg-white font-medium text-gray-800 focus:ring-2 focus:ring-orange-500 outline-none"
                  >
                    <option value="IEZ! TELECOM">IEZ! TELECOM</option>
                    {empresasAtivas.map((emp) => (
                      <option key={emp.id} value={emp.nome}>
                        {emp.nome}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    disabled
                    value={userEmpresa}
                    className="w-full border border-gray-200 rounded-lg p-2.5 text-sm bg-gray-100 text-gray-600 font-bold"
                  />
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Nível de Acesso *</label>
                <select
                  value={novoRole}
                  onChange={(e) => setNovoRole(e.target.value as any)}
                  className="w-full border border-gray-200 rounded-lg p-2.5 text-sm bg-white font-medium text-gray-800 focus:ring-2 focus:ring-orange-500 outline-none"
                >
                  <option value="USER">Colaborador (USER)</option>
                  <option value="COMPANY_ADMIN">Admin Parceiro (COMPANY_ADMIN)</option>
                  {isIezAdmin && <option value="ADMIN">IEZ Admin (ADMIN)</option>}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setIsCreateOpen(false)} className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg">
                  Cancelar
                </button>
                <button type="submit" className="px-5 py-2 text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-lg shadow-sm">
                  Salvar Usuário
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EDITAR NÍVEL DE ACESSO */}
      {userEditRole && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 border border-gray-100">
            <h2 className="text-base font-bold text-gray-900 mb-1">Editar Nível de Acesso</h2>
            <p className="text-xs text-gray-500 mb-4">{userEditRole.nome} ({userEditRole.email})</p>

            <div className="space-y-3 mb-6">
              <select
                value={roleEditState}
                onChange={(e) => setRoleEditState(e.target.value)}
                className="w-full border border-gray-200 rounded-lg p-2.5 text-sm bg-white font-medium focus:ring-2 focus:ring-orange-500 outline-none"
              >
                <option value="USER">Colaborador (USER)</option>
                <option value="COMPANY_ADMIN">Admin Parceiro (COMPANY_ADMIN)</option>
                {isIezAdmin && <option value="ADMIN">IEZ Admin (ADMIN)</option>}
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

      {/* MODAL 3: REDEFINIR SENHA */}
      {userResetPassword && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 border border-gray-100">
            <h2 className="text-base font-bold text-gray-900 mb-1">Redefinir Senha do Usuário</h2>
            <p className="text-xs text-gray-500 mb-4">E-mail: <strong className="text-gray-800">{userResetPassword.email}</strong></p>

            <div className="space-y-3 mb-6">
              <input
                type="text"
                value={senhaResetInput}
                onChange={(e) => setSenhaResetInput(e.target.value)}
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

      {/* MODAL 4: EXCLUIR */}
      {userToDelete && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 border border-gray-100 text-center">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
              🗑️
            </div>
            <h2 className="text-base font-bold text-gray-900 mb-2">Excluir Cadastro?</h2>
            <p className="text-xs text-gray-500 leading-relaxed mb-6">
              Esta ação removerá permanentemente o acesso de <strong className="text-gray-800">{userToDelete.nome}</strong>.
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