'use client';

import { useState, useEffect } from 'react';

// Tipagem do Documento
interface Documento {
  id: string;
  titulo: string;
  categoria: string;
  data: string;
}

// Tipagem das Props que o componente recebe da page.tsx
interface DocumentosManagerProps {
  searchQuery?: string;
  categoria?: string;
}

// Dados simulados enquanto o Backend (porta 5000) não está no ar
const DADOS_FALLBACK: Documento[] = [
  { id: '1', titulo: 'Guia de Fibra Óptica', categoria: 'Guias Técnicos', data: '2026-08-14' },
  { id: '2', titulo: 'Tabela de Preços 2026', categoria: 'Material Comercial', data: '2026-08-10' },
  { id: '3', titulo: 'Contrato Padrão de Parceria', categoria: 'Contratos e Termos', data: '2026-08-01' },
  { id: '4', titulo: 'Manual do Roteador Wi-Fi 6', categoria: 'Manuais', data: '2026-07-25' }
];

export default function DocumentosManager({ 
  searchQuery = '', 
  categoria = '' 
}: DocumentosManagerProps) {
  
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erroConexao, setErroConexao] = useState(false);

  // Efeito para buscar os documentos da API na inicialização
  useEffect(() => {
    const fetchDocumentos = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        const res = await fetch(`${API_URL}/api/documentos`);
        
        if (!res.ok) throw new Error('Falha na API');
        
        const data = await res.json();
        setDocumentos(data);
        setErroConexao(false);
      } catch (error) {
        console.warn('Usando dados locais de fallback devido a erro na API:', error);
        setDocumentos(DADOS_FALLBACK);
        setErroConexao(true);
      } finally {
        setCarregando(false);
      }
    };

    fetchDocumentos();
  }, []);

  // Lógica de filtragem baseada nos parâmetros da URL
  const documentosFiltrados = documentos.filter((doc) => {
    const matchBusca = doc.titulo.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCategoria = categoria ? doc.categoria === categoria : true;
    return matchBusca && matchCategoria;
  });

  // Renderização de estado de carregamento
  if (carregando) {
    return (
      <div className="flex items-center justify-center p-12">
        <span className="text-orange-600 font-medium">Carregando documentos...</span>
      </div>
    );
  }

  // Renderização principal
  return (
    <div className="space-y-6">
      {/* Aviso de Fallback da API */}
      {erroConexao && (
        <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-md">
          <p className="text-sm text-orange-700">
            <strong className="font-semibold">Modo Offline:</strong> Não foi possível conectar ao servidor de documentos. Exibindo arquivos armazenados localmente.
          </p>
        </div>
      )}

      {/* Grid de Documentos */}
      {documentosFiltrados.length === 0 ? (
        <div className="text-gray-500 p-8 text-center bg-white rounded-lg border border-gray-200">
          Nenhum documento encontrado para a sua busca.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {documentosFiltrados.map((doc) => (
            <div 
              key={doc.id} 
              className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm hover:shadow-md hover:border-orange-200 transition-all cursor-pointer group"
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