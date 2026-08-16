'use client';

import { useState, useEffect } from 'react';

// Tipagem do Documento
interface Documento {
  id: string;
  titulo: string;
  categoria: string;
  data: string;
}

interface DocumentosManagerProps {
  searchQuery?: string;
  categoria?: string;
}

export default function DocumentosManager({ 
  searchQuery = '', 
  categoria = '' 
}: DocumentosManagerProps) {
  
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // 1. Verifica no LocalStorage se o utilizador logado é ADMIN
    const userStr = localStorage.getItem('iez_user') || localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.role === 'ADMIN') {
          setIsAdmin(true);
        }
      } catch (e) {
        console.error('Erro ao ler utilizador:', e);
      }
    }

    // 2. Busca os documentos na API
    const fetchDocumentos = async () => {
      try {
        const API_URL = 'https://api-iez-partner-hub.onrender.com';
        const res = await fetch(`${API_URL}/api/documentos`);
        
        if (!res.ok) throw new Error('Falha na API');
        
        const data = await res.json();
        setDocumentos(data);
      } catch (error) {
        console.error('Erro ao buscar documentos:', error);
      } finally {
        setCarregando(false);
      }
    };

    fetchDocumentos();
  }, []);

  const documentosFiltrados = documentos.filter((doc) => {
    const matchBusca = doc.titulo.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCategoria = categoria ? doc.categoria === categoria : true;
    return matchBusca && matchCategoria;
  });

  if (carregando) {
    return (
      <div className="flex items-center justify-center p-12">
        <span className="text-orange-600 font-medium">A carregar documentos...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* CABEÇALHO DO MANAGER: Botão visível apenas para ADMIN */}
      {isAdmin && (
        <div className="flex justify-end mb-4">
          <button className="bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white px-4 py-2.5 rounded-lg font-medium text-sm flex items-center transition-colors shadow-sm">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Novo Documento
          </button>
        </div>
      )}

      {/* Grid de Documentos */}
      {documentosFiltrados.length === 0 ? (
        <div className="text-gray-500 p-8 text-center bg-white rounded-lg border border-gray-200 shadow-sm">
          Nenhum documento encontrado para a tua pesquisa.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {documentosFiltrados.map((doc) => (
            <div 
              key={doc.id} 
              className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm hover:shadow-md hover:border-orange-300 transition-all cursor-pointer group"
            >
              <div className="mb-3">
                <span className="text-[10px] font-bold text-orange-700 bg-orange-100 px-2.5 py-1 rounded-full uppercase tracking-wide">
                  {doc.categoria}
                </span>
              </div>
              <h3 className="font-semibold text-gray-900 group-hover:text-orange-600 transition-colors">
                {doc.titulo}
              </h3>
              <p className="text-xs text-gray-500 mt-2">
                Atualizado em: {doc.data}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}