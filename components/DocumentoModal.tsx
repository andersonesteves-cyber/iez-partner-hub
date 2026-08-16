'use client';

import { useState, useEffect, useRef } from 'react';

interface DocumentoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  documentoParaEditar?: any; // Se vier preenchido, é Edição. Se não, é Upload.
}

export default function DocumentoModal({ isOpen, onClose, onSuccess, documentoParaEditar }: DocumentoModalProps) {
  const [titulo, setTitulo] = useState('');
  const [categoria, setCategoria] = useState('Guias Técnicos');
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isEditMode = !!documentoParaEditar;
  const API_URL = 'https://api-iez-partner-hub.onrender.com';

  // Quando o modal abre, preenche os dados se for edição, ou limpa se for novo
  useEffect(() => {
    if (isOpen) {
      if (isEditMode) {
        setTitulo(documentoParaEditar.titulo);
        setCategoria(documentoParaEditar.categoria);
        setArquivo(null);
      } else {
        setTitulo('');
        setCategoria('Guias Técnicos');
        setArquivo(null);
      }
      setErro('');
    }
  }, [isOpen, isEditMode, documentoParaEditar]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErro('');

    try {
      if (isEditMode) {
        // --- FLUXO DE EDIÇÃO (PUT) ---
        const res = await fetch(`${API_URL}/api/documentos/${documentoParaEditar.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ titulo, categoria }),
        });

        if (!res.ok) throw new Error('Erro ao atualizar documento.');
      } else {
        // --- FLUXO DE UPLOAD (POST com FormData) ---
        if (!arquivo) throw new Error('Por favor, selecione um arquivo.');

        // Pega o nome do usuário logado para registrar a autoria
        const userStr = localStorage.getItem('iez_user');
        const userName = userStr ? JSON.parse(userStr).nome : 'Usuário Desconhecido';

        const formData = new FormData();
        formData.append('titulo', titulo);
        formData.append('categoria', categoria);
        formData.append('enviadoPor', userName);
        formData.append('arquivo', arquivo);

        const res = await fetch(`${API_URL}/api/documentos`, {
          method: 'POST',
          body: formData, // Não definimos o Content-Type manualmente ao usar FormData no fetch
        });

        if (!res.ok) throw new Error('Erro ao fazer upload do documento.');
      }

      onSuccess(); // Atualiza a lista lá fora
      onClose();   // Fecha o modal
    } catch (err: any) {
      setErro(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
        
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-900">
            {isEditMode ? 'Editar Documento' : 'Novo Documento'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {erro && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-100">
              {erro}
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Título do Documento *</label>
            <input 
              type="text" 
              value={titulo} 
              onChange={(e) => setTitulo(e.target.value)} 
              required
              className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
              placeholder="Ex: Tabela de Preços 2026"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Categoria *</label>
            <select 
              value={categoria} 
              onChange={(e) => setCategoria(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all bg-white"
            >
              <option value="Guias Técnicos">Guias Técnicos</option>
              <option value="Material Comercial">Material Comercial</option>
              <option value="Contratos e Termos">Contratos e Termos</option>
              <option value="Manuais">Manuais</option>
            </select>
          </div>

          {/* Só mostra o campo de arquivo se for Upload novo */}
          {!isEditMode && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Arquivo (PDF, DOCX, etc) *</label>
              <div 
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={(e) => setArquivo(e.target.files ? e.target.files[0] : null)}
                  className="hidden"
                  required
                />
                <div className="flex flex-col items-center">
                  <svg className="w-8 h-8 text-orange-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                  <span className="text-sm font-medium text-gray-700">
                    {arquivo ? arquivo.name : 'Clique para selecionar um arquivo'}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100 mt-6">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="bg-orange-600 hover:bg-orange-700 text-white px-5 py-2 rounded-lg text-sm font-bold transition-colors disabled:opacity-70"
            >
              {loading ? 'A processar...' : isEditMode ? 'Salvar Alterações' : 'Fazer Upload'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}