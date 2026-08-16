'use client';

import { useState, useEffect } from 'react';
import DocumentoModal from './DocumentoModal';

// Tipagem atualizada
interface Documento {
  id: string;
  titulo: string;
  categoria: string;
  data: string;
  enviadoPor?: string;
  arquivoUrl?: string;
}

interface DocumentosManagerProps {
  searchQuery?: string;
  categoria?: string;
}

export default function DocumentosManager({ searchQuery = '', categoria = '' }: DocumentosManagerProps) {
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Controles do Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [docParaEditar, setDocParaEditar] = useState<Documento | null>(null);

  const API_URL = 'https://api-iez-partner-hub.onrender.com';

  const fetchDocumentos = async () => {
    try {
      setCarregando(true);
      const res = await fetch(`${API_URL}/api/documentos`);
      if (res.ok) {
        const data = await res.json();
        setDocumentos(data);
      }
    } catch (error) {
      console.error('Erro ao buscar documentos:', error);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    const userStr = localStorage.getItem('iez_user') || localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.role === 'ADMIN') setIsAdmin(true);
      } catch (e) {}
    }
    fetchDocumentos();
  }, []);

  const abrirModalNovo = () => {
    setDocParaEditar(null);
    setIsModalOpen(true);
  };

  const abrirModalEdicao = (doc: Documento) => {
    setDocParaEditar(doc);
    setIsModalOpen(true);
  };

  const documentosFiltrados = documentos.filter((doc) => {
    const matchBusca = doc.titulo.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCategoria = categoria ? doc.categoria === categoria : true;
    return matchBusca && matchCategoria;
  });

  return (
    <div className="space-y-6">
      
      {/* Botão Novo Documento (Só ADMIN) */}
      {isAdmin && (
        <div className="flex justify-end mb-4">
          <button 
            onClick={abrirModalNovo}
            className="bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white px-4 py-2.5 rounded-lg font-medium text-sm flex items-center transition-colors shadow-sm"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
            Novo Documento
          </button>
        </div>
      )}

      {/* Grid */}
      {carregando ? (
        <div className="text-center p-8 text-orange-600 font-medium">A carregar documentos...</div>
      ) : documentosFiltrados.length === 0 ? (
        <div className="text-gray-500 p-8 text-center bg-white rounded-lg border border-gray-200">Nenhum documento encontrado.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {documentosFiltrados.map((doc) => (
            <div key={doc.id} className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm hover:shadow-md hover:border-orange-300 transition-all group flex flex-col justify-between">
              
              <div>
                <div className="flex justify-between items-start mb-3">
                  <span className="text-[10px] font-bold text-orange-700 bg-orange-100 px-2.5 py-1 rounded-full uppercase tracking-wide">
                    {doc.categoria}
                  </span>
                  
                  {/* Botão Editar (Só ADMIN) */}
                  {isAdmin && (
                    <button 
                      onClick={() => abrirModalEdicao(doc)}
                      className="text-gray-400 hover:text-orange-600 p-1 rounded transition-colors opacity-0 group-hover:opacity-100"
                      title="Editar detalhes"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                    </button>
                  )}
                </div>
                
                {/* Link para abrir o PDF real da API */}
                <a 
                  href={doc.arquivoUrl ? `${API_URL}${doc.arquivoUrl}` : '#'} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="font-semibold text-gray-900 group-hover:text-orange-600 transition-colors block mb-2"
                >
                  {doc.titulo}
                </a>
              </div>

              <div className="pt-3 border-t border-gray-50 mt-3">
                <p className="text-[11px] text-gray-400 flex items-center justify-between">
                  <span>Enviado por: <strong className="text-gray-600">{doc.enviadoPor || 'Sistema'}</strong></span>
                  <span>{doc.data}</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Renderiza o Modal */}
      <DocumentoModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchDocumentos} // Se o upload/edição der certo, recarrega a lista!
        documentoParaEditar={docParaEditar}
      />
    </div>
  );
}