'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import NovoDocumentoModal from './NovoDocumentoModal';
import EditarDocumentoModal from './EditarDocumentoModal';

export interface Documento {
  id: string;
  titulo: string;
  categoria: string;
  resumo?: string;
  nivelAcesso?: string;
  enviadoPor?: string;
  dataCriacao?: string;
  pdfUrl?: string;
  regraVisibilidade?: string;
}

interface DocumentosManagerProps {
  searchQuery?: string;
}

export default function DocumentosManager({ searchQuery = '' }: DocumentosManagerProps) {
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [documentoEdicao, setDocumentoEdicao] = useState<Documento | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Simulação do usuário logado no portal (Futuro Auth Context)
  const usuarioLogado = {
    role: 'ADMIN', // 'ADMIN' ou 'GESTOR'
    empresa: 'iez! telecom',
  };

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  useEffect(() => {
    fetch(`${API_URL}/api/documentos`)
      .then((res) => res.json())
      .then((data) => setDocumentos(data))
      .catch((err) => console.error('Falha na API', err))
      .finally(() => setIsLoading(false));
  }, [API_URL]);

  const documentosFiltrados = documentos.filter((doc) => {
    const query = searchQuery.toLowerCase();
    return doc.titulo.toLowerCase().includes(query) || doc.categoria.toLowerCase().includes(query);
  });

  const handleAdicionarDocumento = (novoDoc: Documento) => {
    setDocumentos((prev) => [novoDoc, ...prev]);
    setIsModalOpen(false);
  };

  const handleSalvarEdicao = (docAtualizado: Documento) => {
    setDocumentos((prev) =>
      prev.map((doc) => (doc.id === docAtualizado.id ? docAtualizado : doc))
    );
    setDocumentoEdicao(null);
  };

  const handleExcluir = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();

    if (confirm('Tem certeza que deseja excluir este documento permanentemente?')) {
      try {
        const response = await fetch(`${API_URL}/api/documentos/${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setDocumentos((prev) => prev.filter((doc) => doc.id !== id));
        } else {
          alert('Erro ao excluir o documento no servidor.');
        }
      } catch (error) {
        console.error('Erro ao excluir:', error);
        alert('Falha na comunicação com a API.');
      }
    }
  };

  // Regra de validação de permissão para abrir a edição
  const podeEditarDocumento = (doc: Documento) => {
    if (usuarioLogado.role === 'ADMIN') return true; // Admin iez! edita tudo
    
    if (usuarioLogado.role === 'GESTOR') {
      const isRestrito = doc.regraVisibilidade?.startsWith('RESTRITA');
      if (!isRestrito) return true; // Gestor iez! edita gerais da iez!
      const empresaRestrita = doc.regraVisibilidade?.split(':')[1];
      return empresaRestrita === usuarioLogado.empresa;
    }

    return false;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans">
      <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900">Acervo de Documentos</h2>
          <p className="text-sm text-gray-500 mt-1">Consulte e gerencie os manuais, termos e insumos da iez! telecom.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-2.5 px-6 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center gap-2 text-sm"
        >
          + Novo Documento
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {documentosFiltrados.map((doc) => {
          const isRestrito = doc.regraVisibilidade?.startsWith('RESTRITA');
          const empresaRestrita = isRestrito ? doc.regraVisibilidade?.split(':')[1] : '';
          const podeEditar = podeEditarDocumento(doc);

          return (
            <div key={doc.id} className="relative group">
              <Link href={`/documento/${doc.id}`} className="block h-full">
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 h-full flex flex-col justify-between">
                  
                  {/* HEADER DO CARD */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex flex-wrap gap-1.5">
                      <span className="inline-flex w-fit items-center bg-orange-50 text-orange-600 text-[10px] font-bold px-2.5 py-1 rounded-md border border-orange-100 uppercase tracking-wider">
                        {doc.categoria}
                      </span>

                      <span className="inline-flex w-fit items-center bg-gray-100 text-gray-700 text-[10px] font-bold px-2.5 py-1 rounded-md border border-gray-200">
                        👤 {doc.nivelAcesso || 'Partner (Todos)'}
                      </span>

                      {isRestrito && (
                        <span className="inline-flex w-fit items-center gap-1 bg-amber-50 text-amber-700 text-[10px] font-bold px-2 py-1 rounded-md border border-amber-200 truncate max-w-[150px]">
                          🔒 {empresaRestrita || 'Restrito'}
                        </span>
                      )}
                    </div>

                    {/* BOTÕES DE AÇÃO (EDITAR E EXCLUIR) */}
                    <div className="flex items-center gap-1 relative z-10">
                      {podeEditar && (
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            setDocumentoEdicao(doc);
                          }}
                          title="Editar documento"
                          className="text-gray-300 hover:text-orange-600 transition-colors p-1 rounded-md hover:bg-orange-50"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                      )}

                      <button
                        onClick={(e) => handleExcluir(e, doc.id)}
                        title="Excluir arquivo"
                        className="text-gray-300 hover:text-red-500 transition-colors p-1 rounded-md hover:bg-red-50"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>

                  </div>

                  {/* CORPO DO CARD */}
                  <div className="mb-6">
                    <h3 className="font-extrabold text-gray-900 text-lg leading-tight mb-2 group-hover:text-orange-600 transition-colors">
                      {doc.titulo}
                    </h3>
                    <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">
                      {doc.resumo || 'Documento sem descrição.'}
                    </p>
                  </div>

                  {/* FOOTER DO CARD */}
                  <div className="mt-auto border-t border-gray-100 pt-4 flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-400">
                      {doc.enviadoPor || 'Admin iez!'}
                    </span>
                    <span className="text-xs font-bold text-orange-600 group-hover:underline">
                      Acessar arquivo →
                    </span>
                  </div>
                </div>
              </Link>
            </div>
          );
        })}
      </div>

      <NovoDocumentoModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleAdicionarDocumento} />
      
      <EditarDocumentoModal
        isOpen={!!documentoEdicao}
        documento={documentoEdicao}
        onClose={() => setDocumentoEdicao(null)}
        onSave={handleSalvarEdicao}
      />
    </div>
  );
}