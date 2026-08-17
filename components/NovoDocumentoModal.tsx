'use client';

import { useState } from 'react';

// Tipagem baseada no que o DocumentosManager espera
interface Documento {
  id: string;
  titulo: string;
  categoria: string;
  dataCriacao?: string;
}

interface NovoDocumentoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (novoDoc: Documento) => void;
}

export default function NovoDocumentoModal({ isOpen, onClose, onSave }: NovoDocumentoModalProps) {
  const [titulo, setTitulo] = useState('');
  const [categoria, setCategoria] = useState('Manuais');
  const [nivelAcesso, setNivelAcesso] = useState('Partner (Todos)');
  const [visibilidade, setVisibilidade] = useState('publica');
  const [empresa, setEmpresa] = useState('');
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Define a URL base dinâmica (Render em Produção ou Localhost em Dev)
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!titulo || !arquivo) {
      alert('Por favor, preencha o título e anexe um arquivo.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepara os dados para envio (Multipart/form-data para suportar o arquivo)
      const formData = new FormData();
      formData.append('titulo', titulo);
      formData.append('categoria', categoria);
      formData.append('nivelAcesso', nivelAcesso);
      formData.append('visibilidade', visibilidade);
      if (visibilidade === 'restrita') {
        formData.append('empresa', empresa);
      }
      formData.append('file', arquivo);

      // Dispara para a API correta baseada no ambiente
      const response = await fetch(`${API_URL}/api/documentos`, {
        method: 'POST',
        body: formData, // Não passamos Content-Type, o browser define o boundary automaticamente
      });

      if (!response.ok) {
        throw new Error('Falha ao enviar documento para a API.');
      }

      const novoDocumentoSalvo = await response.json();
      
      // Atualiza a tela instantaneamente
      onSave(novoDocumentoSalvo);
      onClose();

    } catch (error) {
      console.error('Erro no upload:', error);
      // Fallback para manter a UX funcionando enquanto o backend não está 100% pronto
      alert(`Aviso: Falha ao conectar com o backend em ${API_URL}. Simulando salvamento local.`);
      
      const mockDoc: Documento = {
        id: Math.random().toString(36).substring(7),
        titulo,
        categoria,
        dataCriacao: new Date().toISOString(),
      };
      
      onSave(mockDoc);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm transition-opacity font-sans">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header do Modal */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <h2 className="text-lg font-bold text-gray-900">Cadastrar Novo Documento</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Corpo do Formulário */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Título do Documento *</label>
            <input
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors text-sm"
              placeholder="Ex: Manual de Planos Beta..."
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Categoria</label>
              <select
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors text-sm bg-white"
              >
                <option value="Manuais">Manuais</option>
                <option value="Contratos e Termos">Contratos e Termos</option>
                <option value="Guias Técnicos">Guias Técnicos</option>
                <option value="Marketing">Marketing</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Nível de Acesso</label>
              <select
                value={nivelAcesso}
                onChange={(e) => setNivelAcesso(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors text-sm bg-white"
              >
                <option value="Partner (Todos)">Partner (Todos)</option>
                <option value="Master">Master</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
            <label className="block text-sm font-semibold text-gray-700 mb-3">Regra de Visibilidade por Empresa</label>
            <div className="flex gap-4 text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="visibilidade" 
                  value="publica"
                  checked={visibilidade === 'publica'}
                  onChange={(e) => setVisibilidade(e.target.value)}
                  className="text-orange-600 focus:ring-orange-500" 
                />
                Pública (Todas as empresas)
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="visibilidade" 
                  value="restrita"
                  checked={visibilidade === 'restrita'}
                  onChange={(e) => setVisibilidade(e.target.value)}
                  className="text-orange-600 focus:ring-orange-500" 
                />
                Restrita a uma Empresa
              </label>
            </div>
            
            {visibilidade === 'restrita' && (
              <div className="mt-3">
                <input
                  type="text"
                  value={empresa}
                  onChange={(e) => setEmpresa(e.target.value)}
                  placeholder="Nome da empresa parceira..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors text-sm"
                  required
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Upload do Arquivo *</label>
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:bg-orange-50 hover:border-orange-300 transition-all cursor-pointer relative">
              <input
                type="file"
                accept=".pdf,.doc,.docx,.ppt,.pptx"
                onChange={(e) => setArquivo(e.target.files?.[0] || null)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                required
              />
              {arquivo ? (
                <div className="flex flex-col items-center gap-2 text-green-600">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm font-medium">{arquivo.name}</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 text-gray-500">
                  <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  <span className="text-sm">Arraste um PDF ou clique para selecionar</span>
                </div>
              )}
            </div>
          </div>
        </form>

        {/* Footer do Modal */}
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={isSubmitting}
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`px-6 py-2 text-sm font-bold text-white rounded-lg shadow-sm transition-all flex items-center gap-2 ${
              isSubmitting 
                ? 'bg-orange-400 cursor-not-allowed' 
                : 'bg-orange-600 hover:bg-orange-700 hover:shadow-md'
            }`}
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Enviando...
              </>
            ) : (
              'Salvar Documento'
            )}
          </button>
        </div>

      </div>
    </div>
  );
}