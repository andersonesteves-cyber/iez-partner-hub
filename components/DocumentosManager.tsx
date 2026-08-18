'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import NovoDocumentoModal from './NovoDocumentoModal';

export interface Documento {
  id: string;
  titulo: string;
  categoria: string;
  resumo?: string;
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
  const [isLoading, setIsLoading] = useState(true);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  // Busca os dados APENAS da API no Render (sem localstorage ou mocks)
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

  // Atualiza a lista instantaneamente com o retorno REAL do backend
  const handleAdicionarDocumento = (novoDoc: Documento) => {
    setDocumentos((prev) => [novoDoc, ...prev]);
    setIsModalOpen(false);
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

          return (
            <div key={doc.id} className="relative group">
              <Link href={`/documento/${doc.id}`} className="block h-full">
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 h-full flex flex-col justify-between">
                  
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex flex-col gap-2">
                      <span className="inline-flex w-fit items-center bg-orange-50 text-orange-600 text-[10px] font-bold px-2.5 py-1 rounded-md border border-orange-100 uppercase tracking-wider">
                        {doc.categoria}
                      </span>

                      {isRestrito && (
                        <span className="inline-flex w-fit items-center gap-1 bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-1 rounded-md border border-gray-200 truncate max-w-[150px]">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                          {empresaRestrita || 'Restrito'}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={(e) => handleExcluir(e, doc.id)}
                      title="Excluir arquivo"
                      className="text-gray-300 hover:text-red-500 transition-colors p-1 relative z-10"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>

                  <div className="mb-6">
                    <h3 className="font-extrabold text-gray-900 text-lg leading-tight mb-2 group-hover:text-orange-600 transition-colors">
                      {doc.titulo}
                    </h3>
                    <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">
                      {doc.resumo || 'Documento sem descrição.'}
                    </p>
                  </div>

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
    </div>
  );
}