// src/app/components/DocumentosManager.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import NovoDocumentoModal from './NovoDocumentoModal';

export interface Documento {
  id: string;
  titulo: string;
  categoria: string;
  dataCriacao?: string;
}

const MOCK_DOCUMENTOS: Documento[] = [
  { id: '1', titulo: 'Manual de Vendas e Atendimento', categoria: 'Manuais', dataCriacao: '2026-08-10' },
  { id: '2', titulo: 'Tabela de Preços - Q3', categoria: 'Comercial', dataCriacao: '2026-08-12' },
  { id: '3', titulo: 'Apresentação Institucional iez!', categoria: 'Marketing', dataCriacao: '2026-08-15' },
];

interface DocumentosManagerProps {
  searchQuery?: string;
}

export default function DocumentosManager({ searchQuery = '' }: DocumentosManagerProps) {
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState(false);

  // Variável de ambiente apontando para o Render em Prod (ou localhost em dev)
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  useEffect(() => {
    fetch(`${API_URL}/api/documentos`)
      .then((res) => {
        if (!res.ok) throw new Error('Falha na API');
        return res.json();
      })
      .then((data) => {
        setDocumentos(data);
        setApiError(false);
      })
      .catch((err) => {
        console.warn('Backend não encontrado. Usando MOCK de fallback do Hub.', err);
        setApiError(true);
        setDocumentos(MOCK_DOCUMENTOS);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [API_URL]);

  const documentosFiltrados = documentos.filter((doc) => {
    const query = searchQuery.toLowerCase();
    return (
      doc.titulo.toLowerCase().includes(query) ||
      doc.categoria.toLowerCase().includes(query)
    );
  });

  const handleAdicionarDocumento = (novoDoc: Documento) => {
    setDocumentos((prev) => [novoDoc, ...prev]);
    setIsModalOpen(false);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64 w-full">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* HEADER DA SEÇÃO */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Acervo de Documentos</h2>
          {searchQuery && (
            <p className="text-sm text-gray-500 mt-1">
              Resultados para: <span className="font-semibold text-orange-600">"{searchQuery}"</span>
            </p>
          )}
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 px-5 rounded-lg transition-colors shadow-sm text-sm shrink-0"
        >
          + Novo Documento
        </button>
      </div>

      {/* AVISO DE FALLBACK DA API */}
      {apiError && (
        <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-md flex items-center">
          <p className="text-sm text-orange-800">
            <span className="font-bold">Aviso de Desenvolvimento:</span> Conexão com o backend em <code>{API_URL}</code> falhou. Exibindo acervo local de teste.
          </p>
        </div>
      )}

      {/* GRID DE DOCUMENTOS */}
      {documentosFiltrados.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col items-center justify-center">
          <p className="text-gray-500 font-medium">Nenhum documento encontrado.</p>
          <p className="text-sm text-gray-400 mt-1">Tente buscar por um termo ou categoria diferente.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {documentosFiltrados.map((doc) => (
            <Link key={doc.id} href={`/documento/${doc.id}`} className="block group">
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-orange-500 transition-all h-full flex flex-col justify-between cursor-pointer">
                <div>
                  <span className="inline-block bg-orange-50 text-orange-600 text-xs font-semibold px-2.5 py-1 rounded-full border border-orange-100 mb-4">
                    {doc.categoria}
                  </span>
                  <h3 className="font-bold text-gray-900 group-hover:text-orange-600 text-lg mb-2 leading-tight">
                    {doc.titulo}
                  </h3>
                </div>
                
                {doc.dataCriacao && (
                  <div className="mt-5 border-t border-gray-100 pt-4 flex items-center justify-between">
                    <p className="text-xs text-gray-400">
                      Modificado: {new Date(doc.dataCriacao).toLocaleDateString('pt-BR')}
                    </p>
                    <span className="text-orange-600 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                      Ler agora →
                    </span>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* MODAL DE CRIAÇÃO */}
      {isModalOpen && (
        <NovoDocumentoModal
          onClose={() => setIsModalOpen(false)}
          onSave={handleAdicionarDocumento}
        />
      )}
    </div>
  );
}