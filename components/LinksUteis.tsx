'use client';

import { useState, useEffect, FormEvent } from 'react';

interface LinkUtil {
  id: string;
  titulo: string;
  descricao: string;
  url: string;
}

const LINKS_MOCK: LinkUtil[] = [
  {
    id: '1',
    titulo: 'Jira Service Management',
    descricao: 'Solicitações e Suporte Sistemas',
    url: 'https://iez-develop.atlassian.net/servicedesk/customer/portal/68',
  },
  {
    id: '2',
    titulo: 'Painel de Faturamento',
    descricao: 'Acesso ao portal financeiro',
    url: '#',
  }
];

export default function LinksUteis() {
  const [links, setLinks] = useState<LinkUtil[]>(LINKS_MOCK);
  const [userRole, setUserRole] = useState<string | null>(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [url, setUrl] = useState('');

  useEffect(() => {
    const storedUser = localStorage.getItem('iez_user');
    if (storedUser) {
      setUserRole(JSON.parse(storedUser).role);
    }
  }, []);

  const isAdmin = userRole === 'IEZ_ADMIN' || userRole === 'COMPANY_ADMIN';

  const openModal = (link?: LinkUtil) => {
    if (link) {
      setEditingId(link.id);
      setTitulo(link.titulo);
      setDescricao(link.descricao);
      setUrl(link.url);
    } else {
      setEditingId(null);
      setTitulo('');
      setDescricao('');
      setUrl('');
    }
    setIsModalOpen(true);
  };

  const handleSave = (e: FormEvent) => {
    e.preventDefault();
    if (editingId) {
      setLinks(links.map(l => l.id === editingId ? { ...l, titulo, descricao, url } : l));
    } else {
      const newLink = { id: Date.now().toString(), titulo, descricao, url };
      setLinks([...links, newLink]); // Adiciona ao final para manter a ordem
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.preventDefault(); 
    if (window.confirm('Tem certeza que deseja remover este atalho?')) {
      setLinks(links.filter(l => l.id !== id));
    }
  };

  if (links.length === 0 && !isAdmin) return null;

  return (
    <div className="w-full max-w-7xl font-sans mb-8">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mr-2">
          Acesso Rápido:
        </h2>
        
        {links.map((link) => (
          <div 
            key={link.id} 
            className="group flex items-center bg-white border border-gray-200 hover:border-orange-300 rounded-full shadow-sm hover:shadow transition-all"
          >
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              title={link.descricao} // Tooltip natural do navegador
              className="flex items-center gap-1.5 px-3 py-1.5 text-gray-600 hover:text-orange-700 transition-colors"
            >
              <svg className="w-3.5 h-3.5 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              <span className="text-[11px] font-semibold whitespace-nowrap">{link.titulo}</span>
            </a>

            {isAdmin && (
              <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity pr-1.5">
                <div className="w-px h-3 bg-gray-200 mx-1"></div>
                <button 
                  onClick={(e) => { e.preventDefault(); openModal(link); }}
                  className="p-1 text-gray-400 hover:text-orange-600 transition-colors"
                  title="Editar"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                </button>
                <button 
                  onClick={(e) => handleDelete(link.id, e)}
                  className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                  title="Excluir"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
            )}
          </div>
        ))}

        {isAdmin && (
          <button
            onClick={() => openModal()}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full border border-dashed border-gray-300 text-[11px] font-semibold text-gray-500 hover:text-orange-600 hover:border-orange-300 hover:bg-orange-50 transition-all ml-1"
          >
            <span>+</span> Novo Atalho
          </button>
        )}
      </div>

      {/* Modal permanece igual */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-4">{editingId ? 'Editar Atalho' : 'Novo Atalho'}</h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Título</label>
                <input type="text" value={titulo} onChange={(e) => setTitulo(e.target.value)} required placeholder="Ex: Jira Service Management" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Descrição Curta (Aparece ao passar o mouse)</label>
                <input type="text" value={descricao} onChange={(e) => setDescricao(e.target.value)} required placeholder="Ex: Solicitações Sistemas" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">URL (Link)</label>
                <input type="url" value={url} onChange={(e) => setUrl(e.target.value)} required placeholder="https://..." className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 outline-none" />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">Cancelar</button>
                <button type="submit" className="px-4 py-2 text-sm font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-lg transition-colors">Salvar Atalho</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}