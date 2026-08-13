'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import NovoDocumentoModal from './NovoDocumentoModal';

interface Documento {
  id: string;
  titulo: string;
  categoria: string;
  nivelAcesso: string;
  visibilidade: string;
  empresaId?: string | null;
  nomeEmpresa?: string;
  descricao: string;
  nomeArquivo?: string;
  tamanhoArquivo: string;
  tipo: string;
}

const DOCUMENTOS_MOCK: Documento[] = [
  {
    id: '1',
    titulo: 'Manual de Vendas e Atendimento',
    categoria: 'Processos',
    nivelAcesso: 'Partner (Todos)',
    visibilidade: 'restrita',
    nomeEmpresa: 'NetSpeed',
    descricao: 'Esse documento fornece ao parceiro as principais informações, insumos e insights para que ele possa realizar suas vendas com eficiência.',
    tamanhoArquivo: '0 KB',
    tipo: 'PDF',
  },
  {
    id: '2',
    titulo: 'Go To Market - Pocket',
    categoria: 'Marketing',
    nivelAcesso: 'Partner (Todos)',
    visibilidade: 'publica',
    descricao: 'Orientação e melhores práticas de lançamento de serviço móvel white label iez! para os ISPs Regionais.',
    tamanhoArquivo: '0 KB',
    tipo: 'PDF',
  },
];

interface DocumentosManagerProps {
  searchQuery?: string;
}

export default function DocumentosManager({ searchQuery = '' }: DocumentosManagerProps) {
  const [documentos, setDocumentos] = useState<Documento[]>(DOCUMENTOS_MOCK);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  // Estados para o Modal de Edição
  const [editingDoc, setEditingDoc] = useState<Documento | null>(null);
  const [editTitulo, setEditTitulo] = useState('');
  const [editDescricao, setEditDescricao] = useState('');

  useEffect(() => {
    const storedUser = localStorage.getItem('iez_user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUserRole(parsedUser.role);
    }

    async function fetchDocumentos() {
      try {
        const res = await fetch('http://localhost:5000/api/documentos');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            setDocumentos(data);
          }
        }
      } catch (err) {
        console.warn('API indisponível. Utilizando mock de fallback.');
      }
    }
    fetchDocumentos();
  }, []);

  const handleAddDocumento = (novoDoc: Documento) => {
    setDocumentos((prev) => [novoDoc, ...prev]);
  };

  const handleDelete = async (id: string) => {
    const confirmDelete = window.confirm('Tem certeza que deseja excluir este documento? Esta ação não pode ser desfeita.');
    if (!confirmDelete) return;

    try {
      const res = await fetch(`http://localhost:5000/api/documentos/${id}`, {
        method: 'DELETE',
      });
      
      if (res.ok) {
        setDocumentos((prev) => prev.filter((doc) => doc.id !== id));
      }
    } catch (error) {
      console.error('Erro ao excluir documento:', error);
      alert('Ocorreu um erro ao tentar excluir o documento.');
    }
  };

  // Funções de Edição
  const openEditModal = (doc: Documento) => {
    setEditingDoc(doc);
    setEditTitulo(doc.titulo);
    setEditDescricao(doc.descricao);
  };

  const closeEditModal = () => {
    setEditingDoc(null);
    setEditTitulo('');
    setEditDescricao('');
  };

  const handleSaveEdit = async () => {
    if (!editingDoc) return;

    try {
      const res = await fetch(`http://localhost:5000/api/documentos/${editingDoc.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ titulo: editTitulo, descricao: editDescricao }),
      });

      if (res.ok) {
        // Atualiza a lista visualmente
        setDocumentos((prev) =>
          prev.map((doc) =>
            doc.id === editingDoc.id
              ? { ...doc, titulo: editTitulo, descricao: editDescricao }
              : doc
          )
        );
        closeEditModal();
      }
    } catch (error) {
      console.error('Erro ao editar documento:', error);
      alert('Ocorreu um erro ao tentar editar o documento.');
    }
  };

  const documentosFiltrados = documentos.filter((doc) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      doc.titulo.toLowerCase().includes(query) ||
      doc.categoria.toLowerCase().includes(query) ||
      doc.descricao.toLowerCase().includes(query)
    );
  });

  const isAdmin = userRole === 'IEZ_ADMIN' || userRole === 'COMPANY_ADMIN';

  return (
    <div className="w-full max-w-7xl font-sans relative">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">
            Documentos Recentes
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Acesse rapidamente os arquivos mais importantes do portal.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white font-semibold text-xs px-3.5 py-2 rounded-lg shadow-sm transition-all duration-150 shrink-0"
          >
            <svg className="w-3.5 h-3.5 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Novo Documento
          </button>
        )}
      </div>

      {documentosFiltrados.length === 0 ? (
        <div className="p-10 text-center bg-white rounded-xl border border-gray-200">
          <p className="text-xs text-gray-500">Nenhum documento encontrado para este filtro.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {documentosFiltrados.map((doc) => (
            <div
              key={doc.id}
              className="bg-white rounded-xl border border-gray-200/80 p-4 shadow-xs hover:shadow-md hover:border-orange-200 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between mb-2.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-semibold text-orange-700 bg-orange-50 border border-orange-100 px-2 py-0.5 rounded-md">
                      {doc.categoria}
                    </span>
                    {doc.nomeEmpresa && (
                      <span className="text-[10px] font-semibold text-orange-800 bg-orange-100/70 border border-orange-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                        <span>🔒</span> {doc.nomeEmpresa}
                      </span>
                    )}
                  </div>
                  
                  {/* Botões de Ação para Admins */}
                  {isAdmin && (
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={() => openEditModal(doc)}
                        className="text-gray-300 hover:text-orange-500 transition-colors p-1"
                        title="Editar documento"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                      <button 
                        onClick={() => handleDelete(doc.id)}
                        className="text-gray-300 hover:text-red-500 transition-colors p-1"
                        title="Excluir documento"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>

                <h3 className="text-sm font-bold text-gray-900 mb-1.5 leading-snug group-hover:text-orange-600 transition-colors">
                  {doc.titulo}
                </h3>

                <p className="text-xs text-gray-500 line-clamp-2 mb-3 leading-relaxed">
                  {doc.descricao}
                </p>
              </div>

              <div className="flex items-center justify-between pt-2.5 border-t border-gray-100 text-[11px] mt-auto">
                <span className="text-gray-400 font-medium">
                  {doc.tipo} • {doc.tamanhoArquivo}
                </span>
                <Link
                  href={`/documento/${doc.id}`}
                  className="font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-1 transition-colors"
                >
                  Acessar arquivo <span className="text-xs transition-transform group-hover:translate-x-0.5">→</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Cadastro de Novo Documento */}
      <NovoDocumentoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleAddDocumento}
      />

      {/* Modal Rápido de Edição */}
      {editingDoc && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Editar Documento</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Título</label>
                <input
                  type="text"
                  value={editTitulo}
                  onChange={(e) => setEditTitulo(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                />
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Descrição</label>
                <textarea
                  value={editDescricao}
                  onChange={(e) => setEditDescricao(e.target.value)}
                  rows={4}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 outline-none resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={closeEditModal}
                className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 text-sm font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-lg transition-colors"
              >
                Salvar Alterações
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}