'use client';

import { useState, useEffect, FormEvent } from 'react';

interface LinkUtil {
  id: string;
  titulo: string;
  url: string;
  descricao: string;
  categoria: string;
  visibilidade: 'GLOBAL' | 'COMPANY';
  empresaRestrita?: string;
  criadoPor?: string;
}

const LINKS_PADRAO: LinkUtil[] = [
  {
    id: '1',
    titulo: 'Jira Service Management',
    url: 'https://jira.ieztelecom.com.br',
    descricao: 'Abertura e acompanhamento de chamados técnicos e suporte operacionais.',
    categoria: 'Suporte',
    visibilidade: 'GLOBAL',
  },
  {
    id: '2',
    titulo: 'Painel de Faturamento',
    url: 'https://faturamento.ieztelecom.com.br',
    descricao: 'Acesso a faturas, extratos e relatórios financeiros da parceria.',
    categoria: 'Sistemas',
    visibilidade: 'GLOBAL',
  },
  {
    id: '3',
    titulo: 'Portal do Desenvolvedor Zamix',
    url: 'https://dev.zamix.com.br',
    descricao: 'Documentação de APIs e integrações exclusivas para o parceiro Zamix.',
    categoria: 'Integrações',
    visibilidade: 'COMPANY',
    empresaRestrita: 'Zamix',
  },
];

export default function LinksUteisPage() {
  const [links, setLinks] = useState<LinkUtil[]>(LINKS_PADRAO);
  const [user, setUser] = useState<any>(null);
  const [empresasAtivas, setEmpresasAtivas] = useState<{ id: string; nome: string }[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [titulo, setTitulo] = useState('');
  const [url, setUrl] = useState('');
  const [descricao, setDescricao] = useState('');
  const [categoria, setCategoria] = useState('Sistemas');
  const [visibilidade, setVisibilidade] = useState<'GLOBAL' | 'COMPANY'>('COMPANY');
  const [empresaRestrita, setEmpresaRestrita] = useState('');

  const API_URL = 'https://api-iez-partner-hub.onrender.com';

  useEffect(() => {
    // 1. Identifica o usuário logado
    const storedUser = localStorage.getItem('iez_user') || localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
      } catch (e) {}
    }

    // 2. Carrega lista local ou da API
    const salvos = localStorage.getItem('iez_links_uteis');
    if (salvos) {
      try {
        setLinks(JSON.parse(salvos));
      } catch (e) {}
    }

    // 3. Carrega lista de parceiros ativos para o formulário
    const parceirosSalvos = localStorage.getItem('iez_parceiros');
    if (parceirosSalvos) {
      try {
        const parsed = JSON.parse(parceirosSalvos);
        const ativas = parsed.filter((p: any) => String(p.status).toLowerCase() === 'ativo');
        setEmpresasAtivas(ativas);
        if (ativas.length > 0) setEmpresaRestrita(ativas[0].nome);
      } catch (e) {}
    }
  }, []);

  // Regras de Autorização
  const userRole = user?.role?.toUpperCase() || 'USER';
  const userEmpresa = user?.empresa || user?.company || 'IEZ! TELECOM';

  const isAdmin = ['ADMIN', 'IEZ_ADMIN', 'COMPANY_ADMIN'].includes(userRole);
  const isIezAdmin = ['ADMIN', 'IEZ_ADMIN'].includes(userRole) && 
    (userEmpresa.toUpperCase().includes('IEZ') || userEmpresa === 'IEZ! TELECOM');

  const salvarLinks = (novosLinks: LinkUtil[]) => {
    setLinks(novosLinks);
    localStorage.setItem('iez_links_uteis', JSON.stringify(novosLinks));
  };

  const handleCreateLink = (e: FormEvent) => {
    e.preventDefault();
    if (!titulo || !url) return;

    // Regra de Proteção: Se não for admin da iez!, força a visibilidade para COMPANY
    const finalVisibilidade = isIezAdmin ? visibilidade : 'COMPANY';
    const finalEmpresa = finalVisibilidade === 'COMPANY' 
      ? (isIezAdmin ? empresaRestrita : userEmpresa) 
      : undefined;

    const novoLink: LinkUtil = {
      id: Date.now().toString(),
      titulo,
      url: url.startsWith('http') ? url : `https://${url}`,
      descricao,
      categoria,
      visibilidade: finalVisibilidade,
      empresaRestrita: finalEmpresa,
      criadoPor: user?.nome || 'Admin',
    };

    const atualizados = [novoLink, ...links];
    salvarLinks(atualizados);

    // Reset Form
    setIsModalOpen(false);
    setTitulo('');
    setUrl('');
    setDescricao('');
  };

  // Filtro de Visibilidade por Usuário Logado
  const linksVisiveis = links.filter((link) => {
    const matchesSearch =
      link.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      link.descricao.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    // Admins da iez! enxergam tudo
    if (isIezAdmin) return true;

    // Usuários e Admins de empresas enxergam apenas Globais ou do seu próprio domínio
    if (link.visibilidade === 'GLOBAL') return true;
    return link.empresaRestrita?.toLowerCase() === userEmpresa.toLowerCase();
  });

  return (
    <div className="w-full h-full font-sans selection:bg-orange-100 selection:text-orange-900">
      
      {/* CABEÇALHO DA PÁGINA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Links Úteis</h1>
          <p className="text-sm text-gray-500 mt-1">
            Atalhos rápidos para ferramentas, portais e sistemas homologados.
          </p>
        </div>

        {/* Apenas Admins possuem acesso ao botão de criação */}
        {isAdmin && (
          <button
            onClick={() => {
              setVisibilidade(isIezAdmin ? 'GLOBAL' : 'COMPANY');
              setIsModalOpen(true);
            }}
            className="inline-flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs px-4 py-2.5 rounded-lg shadow-sm transition-all"
          >
            <span>+</span> Cadastrar Link Útil
          </button>
        )}
      </div>

      {/* BUSCA */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-6">
        <input
          type="text"
          placeholder="Buscar atalhos por nome ou descrição..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-orange-500 outline-none"
        />
      </div>

      {/* GRID DE LINKS ÚTEIS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {linksVisiveis.map((link) => (
          <a
            key={link.id}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group bg-white p-5 rounded-2xl border border-gray-100 hover:border-orange-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-orange-600 bg-orange-50 px-2.5 py-1 rounded-md">
                  {link.categoria}
                </span>

                {/* Badge de Visibilidade */}
                {link.visibilidade === 'GLOBAL' ? (
                  <span className="text-[10px] font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                    Global (Todas)
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200/60 px-2 py-0.5 rounded">
                    🔒 {link.empresaRestrita}
                  </span>
                )}
              </div>

              <h3 className="text-base font-bold text-gray-900 group-hover:text-orange-600 transition-colors flex items-center justify-between">
                {link.titulo}
                <span className="text-gray-300 group-hover:text-orange-500 transition-colors text-xs">↗</span>
              </h3>

              <p className="text-xs text-gray-500 mt-2 line-clamp-3 leading-relaxed">
                {link.descricao || 'Sem descrição cadastrada.'}
              </p>
            </div>

            <div className="mt-5 pt-3 border-t border-gray-50 flex items-center justify-between text-[11px] text-gray-400">
              <span className="truncate max-w-[200px]">{link.url.replace(/^https?:\/\//, '')}</span>
              <span className="text-orange-600 font-semibold group-hover:underline">Acessar</span>
            </div>
          </a>
        ))}
      </div>

      {linksVisiveis.length === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <p className="text-sm font-semibold text-gray-500">Nenhum link útil encontrado para o seu perfil.</p>
        </div>
      )}

      {/* MODAL DE CADASTRO (APENAS ADMINS) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-5 border-b border-gray-100 pb-3">
              <h2 className="text-lg font-bold text-gray-900">Cadastrar Novo Link Útil</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>

            <form onSubmit={handleCreateLink} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Título do Link *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Painel de Chamados Jira"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3.5 py-2 text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">URL de Acesso *</label>
                <input
                  type="url"
                  required
                  placeholder="https://sistema.exemplo.com.br"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3.5 py-2 text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Descrição</label>
                <textarea
                  rows={2}
                  placeholder="Finalidade do sistema..."
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3.5 py-2 text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Categoria</label>
                <select
                  value={categoria}
                  onChange={(e) => setCategoria(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 outline-none bg-white font-medium"
                >
                  <option value="Sistemas">Sistemas</option>
                  <option value="Suporte">Suporte</option>
                  <option value="Integrações">Integrações</option>
                  <option value="Ferramentas">Ferramentas</option>
                </select>
              </div>

              {/* REGRA DE VISIBILIDADE */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200/80 space-y-3">
                <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider">
                  Regra de Exibição
                </label>

                <div className="space-y-2">
                  <label className={`flex items-center gap-2 text-xs font-semibold ${isIezAdmin ? 'text-gray-800 cursor-pointer' : 'text-gray-400 cursor-not-allowed'}`}>
                    <input
                      type="radio"
                      name="visibilidade"
                      disabled={!isIezAdmin}
                      checked={visibilidade === 'GLOBAL'}
                      onChange={() => setVisibilidade('GLOBAL')}
                      className="text-orange-600 focus:ring-orange-500 disabled:opacity-50"
                    />
                    Exibição Global (Todas as Empresas)
                  </label>
                  {!isIezAdmin && (
                    <p className="text-[10px] text-amber-700 font-medium pl-5">
                      ⚠️ Apenas Administradores da iez! Telecom podem ativar a exibição global.
                    </p>
                  )}

                  <label className="flex items-center gap-2 text-xs font-semibold text-gray-800 cursor-pointer pt-1">
                    <input
                      type="radio"
                      name="visibilidade"
                      checked={visibilidade === 'COMPANY'}
                      onChange={() => setVisibilidade('COMPANY')}
                      className="text-orange-600 focus:ring-orange-500"
                    />
                    Restrita a uma Empresa
                  </label>
                </div>

                {visibilidade === 'COMPANY' && (
                  <div className="pt-2">
                    {isIezAdmin ? (
                      <select
                        value={empresaRestrita}
                        onChange={(e) => setEmpresaRestrita(e.target.value)}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-orange-500 outline-none bg-white font-medium"
                      >
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
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs bg-gray-100 text-gray-600 font-bold"
                      />
                    )}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-lg shadow-sm"
                >
                  Salvar Link Útil
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}