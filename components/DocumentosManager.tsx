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
}

interface DocumentosManagerProps {
  searchQuery?: string;
}

export default function DocumentosManager({ searchQuery = '' }: DocumentosManagerProps) {
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Estado para Edição In-line
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ titulo: '', categoria: '', resumo: '' });

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

  // Funções de Edição
  const startEdit = (e: React.MouseEvent, doc: Documento) => {
    e.preventDefault(); // Evita que o Link de leitura seja acionado
    setEditingId(doc.id);
    setEditForm({ titulo: doc.titulo, categoria: doc.categoria, resumo: doc.resumo || '' });
  };

  const cancelEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    setEditingId(null);
  };

  const saveEdit = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/api/documentos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      if (!res.ok) throw new Error('Erro ao editar');
      
      setDocumentos(prev => prev.map(d => d.id === id ? { ...d, ...editForm } : d));
      setEditingId(null);
    } catch (err) {
      alert('Erro ao salvar edição. Simulando no frontend.');
      setDocumentos(prev => prev.map(d => d.id === id ? { ...d, ...editForm } : d));
      setEditingId(null);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div></div>;
  }

  return (
    <div className="space-y-8 font-sans">
      <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900">Acervo de Documentos</h2>
          <p className="text-sm text-gray-500 mt-1">Gerencie e acesse todos os insumos do iez! Partner Hub.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-2.5 px-6 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center gap-2">
          + Novo Documento
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {documentosFiltrados.map((doc) => (
          <div key={doc.id} className="relative group">
            {editingId === doc.id ? (
              /* MODO DE EDIÇÃO DO CARD */
              <div className="bg-white p-6 rounded-2xl border-2 border-orange-400 shadow-lg h-full flex flex-col gap-3 relative z-10">
                <input type="text" value={editForm.titulo} onChange={e => setEditForm({...editForm, titulo: e.target.value})} className="font-bold text-gray-900 border-b border-gray-300 focus:border-orange-500 focus:outline-none py-1" />
                <select value={editForm.categoria} onChange={e => setEditForm({...editForm, categoria: e.target.value})} className="text-xs border border-gray-300 rounded p-1 text-gray-600">
                  <option value="Manuais">Manuais</option>
                  <option value="Contratos e Termos">Contratos e Termos</option>
                  <option value="Material Comercial">Material Comercial</option>
                </select>
                <textarea value={editForm.resumo} onChange={e => setEditForm({...editForm, resumo: e.target.value})} className="text-sm text-gray-600 border border-gray-300 rounded p-2 focus:outline-none focus:border-orange-500 resize-none" rows={3} placeholder="Resumo do documento..." />
                <div className="flex gap-2 mt-auto pt-2">
                  <button onClick={(e) => saveEdit(e, doc.id)} className="flex-1 bg-orange-600 text-white text-xs font-bold py-2 rounded-md hover:bg-orange-700">Salvar</button>
                  <button onClick={cancelEdit} className="flex-1 bg-gray-100 text-gray-600 text-xs font-bold py-2 rounded-md hover:bg-gray-200">Cancelar</button>
                </div>
              </div>
            ) : (
              /* VISUALIZAÇÃO PADRÃO DO CARD (REDESIGNADO) */
              <Link href={`/documento/${doc.id}`} className="block h-full">
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <span className="inline-flex items-center gap-1.5 bg-orange-50 text-orange-700 text-xs font-bold px-3 py-1 rounded-full border border-orange-200">
                        📄 {doc.categoria}
                      </span>
                      {/* Botão de Editar visível no hover */}
                      <button onClick={(e) => startEdit(e, doc)} className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-orange-600 transition-all p-1 bg-gray-50 rounded-md border border-gray-200 hover:border-orange-300">
                        ✏️
                      </button>
                    </div>
                    <h3 className="font-extrabold text-gray-900 text-lg leading-tight mb-2 group-hover:text-orange-600 transition-colors">
                      {doc.titulo}
                    </h3>
                    <p className="text-sm text-gray-500 line-clamp-3 leading-relaxed">
                      {doc.resumo || "Sem resumo disponível. Clique em editar para adicionar uma descrição."}
                    </p>
                  </div>
                  
                  <div className="mt-6 border-t border-gray-100 pt-4 flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Enviado por</span>
                      <span className="text-xs font-semibold text-gray-700">{doc.enviadoPor || "IEZ! Telecom"}</span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Data</span>
                      <span className="text-xs font-medium text-gray-500">
                        {doc.dataCriacao ? new Date(doc.dataCriacao).toLocaleDateString('pt-BR') : '--/--/----'}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            )}
          </div>
        ))}
      </div>

      <NovoDocumentoModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleAdicionarDocumento} />
    </div>
  );
}