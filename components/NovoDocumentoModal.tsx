'use client';

import { useState, useRef } from 'react';
import { Documento } from './DocumentosManager';

interface NovoDocumentoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (doc: Documento) => void;
}

export default function NovoDocumentoModal({ isOpen, onClose, onSave }: NovoDocumentoModalProps) {
  const [titulo, setTitulo] = useState('');
  const [categoria, setCategoria] = useState('Manuais');
  const [resumo, setResumo] = useState('');
  const [visibilidade, setVisibilidade] = useState('geral');
  const [empresa, setEmpresa] = useState('');
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!arquivo) {
      alert('Por favor, selecione um arquivo PDF.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Usamos FormData porque estamos enviando um arquivo físico (multipart/form-data)
      const formData = new FormData();
      formData.append('titulo', titulo);
      formData.append('categoria', categoria);
      formData.append('resumo', resumo);
      formData.append('visibilidade', visibilidade);
      if (visibilidade === 'restrita') {
        formData.append('empresa', empresa);
      }
      formData.append('file', arquivo);

      // Dispara a requisição POST real para a API no Render
      const response = await fetch(`${API_URL}/api/documentos`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Falha ao salvar no banco de dados.');
      }

      const novoDocumento = await response.json();
      
      // Envia o documento retornado pelo backend (com ID real do banco) para a tela
      onSave(novoDocumento);
      
      // Limpa o form e fecha
      setTitulo('');
      setResumo('');
      setCategoria('Manuais');
      setVisibilidade('geral');
      setEmpresa('');
      setArquivo(null);
      onClose();

    } catch (error) {
      console.error('Erro no upload:', error);
      alert('Erro ao enviar documento. Verifique a conexão com a API.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h2 className="text-lg font-bold text-gray-900">Novo Documento</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            ✕
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          <form id="doc-form" onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Título do Documento *</label>
              <input required type="text" value={titulo} onChange={(e) => setTitulo(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all text-sm" placeholder="Ex: Manual de Instalação V2" />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Categoria *</label>
              <select value={categoria} onChange={(e) => setCategoria(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none text-sm bg-white">
                <option value="Manuais">Manuais</option>
                <option value="Contratos e Termos">Contratos e Termos</option>
                <option value="Guias Técnicos">Guias Técnicos</option>
                <option value="Material Comercial">Material Comercial</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Resumo (Opcional)</label>
              <textarea value={resumo} onChange={(e) => setResumo(e.target.value)} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none text-sm resize-none" placeholder="Breve descrição sobre o arquivo..." />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Visibilidade</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                  <input type="radio" name="visibilidade" value="geral" checked={visibilidade === 'geral'} onChange={(e) => setVisibilidade(e.target.value)} className="text-orange-600 focus:ring-orange-500" />
                  Público (Todos os parceiros)
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                  <input type="radio" name="visibilidade" value="restrita" checked={visibilidade === 'restrita'} onChange={(e) => setVisibilidade(e.target.value)} className="text-orange-600 focus:ring-orange-500" />
                  Restrito a uma Empresa
                </label>
              </div>
            </div>

            {visibilidade === 'restrita' && (
              <div className="p-4 bg-orange-50 rounded-lg border border-orange-100">
                <label className="block text-sm font-bold text-gray-700 mb-1 text-orange-900">Nome da Empresa Parceira *</label>
                <input required={visibilidade === 'restrita'} type="text" value={empresa} onChange={(e) => setEmpresa(e.target.value)} className="w-full px-3 py-2 border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none text-sm" placeholder="Ex: Zamix" />
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Arquivo (PDF) *</label>
              <div 
                className="border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <input required type="file" accept="application/pdf" className="hidden" ref={fileInputRef} onChange={(e) => setArquivo(e.target.files?.[0] || null)} />
                <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                {arquivo ? (
                  <span className="text-sm font-bold text-orange-600 truncate max-w-[200px]">{arquivo.name}</span>
                ) : (
                  <>
                    <span className="text-sm text-gray-600 font-medium">Clique para selecionar</span>
                    <span className="text-xs text-gray-400 mt-1">Apenas PDF (Máx 10MB)</span>
                  </>
                )}
              </div>
            </div>
          </form>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-200 rounded-lg transition-colors">
            Cancelar
          </button>
          <button type="submit" form="doc-form" disabled={isSubmitting} className="px-6 py-2 text-sm font-bold text-white bg-orange-600 hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-sm transition-colors flex items-center gap-2">
            {isSubmitting ? 'Salvando...' : 'Salvar Documento'}
          </button>
        </div>
      </div>
    </div>
  );
}