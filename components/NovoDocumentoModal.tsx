'use client';

import { useState } from 'react';

interface Documento {
  id: string;
  titulo: string;
  categoria: string;
  resumo?: string;
  dataCriacao?: string;
  enviadoPor?: string;
}

interface NovoDocumentoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (novoDoc: Documento) => void;
}

export default function NovoDocumentoModal({ isOpen, onClose, onSave }: NovoDocumentoModalProps) {
  const [titulo, setTitulo] = useState('');
  const [resumo, setResumo] = useState('');
  const [categoria, setCategoria] = useState('Manuais');
  const [novaCategoria, setNovaCategoria] = useState('');
  const [criandoCategoria, setCriandoCategoria] = useState(false);
  const [nivelAcesso, setNivelAcesso] = useState('Partner (Todos)');
  const [visibilidade, setVisibilidade] = useState('publica');
  const [empresa, setEmpresa] = useState('');
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  if (!isOpen) return null;

  const categoriaFinal = criandoCategoria ? novaCategoria : categoria;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo || !arquivo || (criandoCategoria && !novaCategoria)) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('titulo', titulo);
      formData.append('resumo', resumo);
      formData.append('categoria', categoriaFinal);
      formData.append('nivelAcesso', nivelAcesso);
      formData.append('visibilidade', visibilidade);
      if (visibilidade === 'restrita') {
        formData.append('empresa', empresa);
      }
      formData.append('file', arquivo);

      const response = await fetch(`${API_URL}/api/documentos`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Falha ao enviar documento');
      const novoDocumentoSalvo = await response.json();
      
      onSave(novoDocumentoSalvo);
      onClose();
    } catch (error) {
      console.error('Erro no upload:', error);
      alert('Aviso: Falha ao conectar com o backend. Salvando localmente.');
      onSave({
        id: Math.random().toString(36).substring(7),
        titulo,
        resumo,
        categoria: categoriaFinal,
        enviadoPor: 'Admin',
        dataCriacao: new Date().toISOString(),
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm transition-opacity font-sans">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between bg-gray-50/50">
          <h2 className="text-lg font-bold text-gray-900">Cadastrar Novo Documento</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 text-sm">
          <div>
            <label className="block font-semibold text-gray-700 mb-1">Título do Documento *</label>
            <input
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
              placeholder="Ex: Planos e Tarifas Q3"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">Resumo / Descrição curta</label>
            <textarea
              value={resumo}
              onChange={(e) => setResumo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none resize-none"
              rows={2}
              placeholder="Descreva brevemente o conteúdo deste documento..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="font-semibold text-gray-700">Categoria *</label>
                <button
                  type="button"
                  onClick={() => setCriandoCategoria(!criandoCategoria)}
                  className="text-xs text-orange-600 font-bold hover:underline"
                >
                  {criandoCategoria ? 'Selecionar existente' : '+ Nova Categoria'}
                </button>
              </div>
              {criandoCategoria ? (
                <input
                  type="text"
                  value={novaCategoria}
                  onChange={(e) => setNovaCategoria(e.target.value)}
                  placeholder="Nome da nova categoria..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  required
                />
              ) : (
                <select
                  value={categoria}
                  onChange={(e) => setCategoria(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none bg-white"
                >
                  <option value="Manuais">Manuais</option>
                  <option value="Contratos e Termos">Contratos e Termos</option>
                  <option value="Guias Técnicos">Guias Técnicos</option>
                  <option value="Material Comercial">Material Comercial</option>
                </select>
              )}
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Nível de Acesso</label>
              <select
                value={nivelAcesso}
                onChange={(e) => setNivelAcesso(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none bg-white"
              >
                <option value="Partner (Todos)">Partner (Todos)</option>
                <option value="Master">Master</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-3">
            <label className="block font-semibold text-gray-700">Regra de Visibilidade por Empresa</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer font-medium text-gray-700">
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
              <label className="flex items-center gap-2 cursor-pointer font-medium text-gray-700">
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
              <input
                type="text"
                value={empresa}
                onChange={(e) => setEmpresa(e.target.value)}
                placeholder="Nome da empresa parceira..."
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none bg-white"
                required
              />
            )}
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-2">Upload do Arquivo *</label>
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:bg-orange-50 transition-all relative">
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => setArquivo(e.target.files?.[0] || null)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                required
              />
              <span className="font-medium text-gray-600">
                {arquivo ? `✅ ${arquivo.name}` : '📁 Arraste um PDF ou clique aqui'}
              </span>
            </div>
          </div>
        </form>

        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/50">
          <button type="button" onClick={onClose} className="px-4 py-2 font-medium text-gray-700 hover:bg-gray-100 rounded-lg">
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-6 py-2 font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-lg transition-colors shadow-sm"
          >
            {isSubmitting ? 'Enviando...' : 'Salvar Documento'}
          </button>
        </div>
      </div>
    </div>
  );
}