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

  // --- NOVA LÓGICA DE EXCLUSÃO CONECTADA AO BACKEND ---
  const handleExcluir = async (e: React.MouseEvent, id: string) => {
    e.preventDefault(); // Impede que o clique na lixeira abra o card do PDF

    if (confirm('Tem certeza que deseja excluir este documento permanentemente?')) {
      try {
        const response = await fetch(`${API_URL}/api/documentos/${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          // Remove da tela apenas se o backend confirmou a exclusão no banco
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
          // Extrai o nome da empresa se for RESTRITA:NomeDaEmpresa
          const isRestrito = doc.regraVisibilidade?.startsWith('RESTRITA');
          const empresaRestrita = isRestrito ? doc.regraVisibilidade?.split(':')[1] : '';

          return (
            <div key={doc.id} className="relative group">
              <Link href={`/documento/${doc.id}`} className="block h-full">
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 h-full flex flex-col justify-between">
                  {/* HEADER DO CARD */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex flex-col gap-2">
                      <span className="inline-flex w-fit items-center bg-orange-50 text-orange-600 text-[10px] font-bold px-2.5 py-1 rounded-md border border-orange-100 uppercase tracking-wider">
                        {doc.categoria}
                      </span>

                      {/* CADEADO DE EMPRESA RESTRITA */}
                      {isRestrito && (
                        <span className="inline-flex w-fit items-center gap-1 bg-