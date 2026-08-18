'use client';

import { useState, useEffect, useRef } from 'react';
import { Documento } from './DocumentosManager';

interface Empresa {
  id: string;
  nome?: string;
  name?: string;
}

interface NovoDocumentoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (doc: Documento) => void;
}

export default function NovoDocumentoModal({ isOpen, onClose, onSave }: NovoDocumentoModalProps) {
  const [titulo, setTitulo] = useState('');
  const [categoria, setCategoria] = useState('Manuais');
  const [resumo, setResumo] = useState('');
  const [visibilidade, setVisibilidade] = useState('geral'); // 'geral' ou 'restrita'
  const [empresaSelecionada, setEmpresaSelecionada] = useState('');
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [arquivo, setArquivo] = useState<File | null>(null);
  
  const [isLoadingEmpresas, setIsLoadingEmpresas] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  // Carrega as empresas reais cadastradas na API ao abrir o modal
  useEffect(() => {
    if (isOpen) {
      setIsLoadingEmpresas(true);
      fetch(`${API_URL}/api/empresas`)
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setEmpresas(data);
            if (data.length > 0) {
              setEmpresaSelecionada(data[0].nome || data[0].name || '');
            }
          }
        })
        .catch((err) => console.error('Erro ao buscar empresas da API:', err))
        .finally(() => setIsLoadingEmpresas(false));
    }
  }, [isOpen, API_URL]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!arquivo) {
      alert('Por favor, selecione um arquivo PDF.');
      return;
    }

    if (visibilidade === 'restrita' && !empresaSelecionada) {
      alert('Por favor, selecione uma empresa para o acesso restrito.');
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('titulo', titulo);
      formData.append('categoria', categoria);
      formData.append('resumo', resumo);
      formData.append('visibilidade', visibilidade);
      if (visibilidade === 'restrita') {
        formData.append('empresa', empresaSelecionada);
      }
      formData.append('file', arquivo);

      const response = await fetch(`${API_URL}/api/documentos`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Falha ao salvar no banco de dados.');
      }

      const novoDocumento = await response.json();
      
      onSave(novoDocumento);
      
      // Reset do formulário
      setTitulo('');
      setResumo('');
      setCategoria('Manuais');
      setVisibilidade('geral');
      setEmpresaSelecionada('');
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
    <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-sans selection:bg-orange-100 selection:text-orange-900">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* CABEÇALHO */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div>
            <h2 className="text-lg font-extrabold text-gray-900">Novo Documento</h2>
            <p className="text-xs text-gray-500 mt-0.5">Adicione um novo arquivo ao acervo digital.</p>
          </div>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-orange-600 transition-colors p-1 rounded-lg hover:bg-orange-50"
          >
            ✕
          </button>
        </div>

        {/* CORPO DO FORMULÁRIO */}
        <div className="p-6 overflow-y-auto">
          <form id="doc-form" onSubmit={handleSubmit} className="space-y-5">
            
            {/* TÍTULO */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Título do Documento *
              </label>
              <input 
                required 
                type="text" 
                value={titulo} 
                onChange={(e) => setTitulo(e.target.value)} 
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-600 outline-none transition-all text-sm font-medium text-gray-900 placeholder:text-gray-400" 
                placeholder="Ex: Manual de Vendas e Atendimento 2026" 
              />
            </div>

            {/* CATEGORIA */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Categoria *
              </label>
              <select 
                value={categoria} 
                onChange={(e) => setCategoria(e.target.value)} 
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-600 outline-none text-sm font-medium text-gray-900 bg-white cursor-pointer"
              >
                <option value="Manuais">Manuais</option>
                <option value="Contratos e Termos">Contratos e Termos</option>
                <option value="Guias Técnicos">Guias Técnicos</option>
                <option value="Material Comercial">Material Comercial</option>
              </select>
            </div>

            {/* RESUMO */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Resumo / Descrição
              </label>
              <textarea 
                value={resumo} 
                onChange={(e) => setResumo(e.target.value)} 
                rows={2} 
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-600 outline-none text-sm font-medium text-gray-900 resize-none placeholder:text-gray-400" 
                placeholder="Breve resumo sobre as diretrizes ou conteúdo deste PDF..." 
              />
            </div>

            {/* REGRAS DE VISIBILIDADE / ACESSO */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Nível de Acesso e Visibilidade *
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label 
                  className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${
                    visibilidade === 'geral' 
                      ? 'border-orange-500 bg-orange-50/50 text-orange-900 font-bold' 
                      : 'border-gray-200 hover:border-gray-300 text-gray-600 font-medium'
                  }`}
                >
                  <input 
                    type="radio" 
                    name="visibilidade" 
                    value="geral" 
                    checked={visibilidade === 'geral'} 
                    onChange={(e) => setVisibilidade(e.target.value)} 
                    className="text-orange-600 focus:ring-orange-500" 
                  />
                  <span className="text-xs">Geral (Público)</span>
                </label>

                <label 
                  className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${
                    visibilidade === 'restrita' 
                      ? 'border-orange-500 bg-orange-50/50 text-orange-900 font-bold' 
                      : 'border-gray-200 hover:border-gray-300 text-gray-600 font-medium'
                  }`}
                >
                  <input 
                    type="radio" 
                    name="visibilidade" 
                    value="restrita" 
                    checked={visibilidade === 'restrita'} 
                    onChange={(e) => setVisibilidade(e.target.value)} 
                    className="text-orange-600 focus:ring-orange-500" 
                  />
                  <span className="text-xs">Restrito a Empresa</span>
                </label>
              </div>
            </div>

            {/* PICKLIST DE EMPRESA (VISÍVEL APENAS QUANDO RESTRITO) */}
            {visibilidade === 'restrita' && (
              <div className="p-4 bg-orange-50/60 rounded-xl border border-orange-100 space-y-2">
                <label className="block text-xs font-bold text-orange-900 uppercase tracking-wider">
                  Selecione a Empresa Parceira *
                </label>
                
                {isLoadingEmpresas ? (
                  <div className="text-xs text-orange-600 font-medium py-1 animate-pulse">
                    Carregando lista de empresas parceiras...
                  </div>
                ) : empresas.length === 0 ? (
                  <div className="text-xs text-red-500 font-medium py-1">
                    Nenhuma empresa cadastrada no sistema.
                  </div>
                ) : (
                  <select
                    value={empresaSelecionada}
                    onChange={(e) => setEmpresaSelecionada(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none text-sm font-bold text-gray-900 bg-white cursor-pointer"
                  >
                    {empresas.map((emp) => {
                      const nomeFormatado = emp.nome || emp.name;
                      return (
                        <option key={emp.id} value={nomeFormatado}>
                          {nomeFormatado}
                        </option>
                      );
                    })}
                  </select>
                )}
              </div>
            )}

            {/* UPLOAD DO ARQUIVO PDF */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Arquivo Digital (PDF) *
              </label>
              <div 
                className="border-2 border-dashed border-gray-200 hover:border-orange-400 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-orange-50/30 transition-all group"
                onClick={() => fileInputRef.current?.click()}
              >
                <input 
                  required 
                  type="file" 
                  accept="application/pdf" 
                  className="hidden" 
                  ref={fileInputRef} 
                  onChange={(e) => setArquivo(e.target.files?.[0] || null)} 
                />
                
                <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>

                {arquivo ? (
                  <span className="text-sm font-bold text-orange-600 truncate max-w-[250px]">
                    {arquivo.name}
                  </span>
                ) : (
                  <>
                    <span className="text-xs font-bold text-gray-700">Clique para selecionar o PDF</span>
                    <span className="text-[11px] text-gray-400 mt-0.5">Formato aceito: .pdf</span>
                  </>
                )}
              </div>
            </div>

          </form>
        </div>

        {/* RODAPÉ DO MODAL */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3">
          <button 
            type="button" 
            onClick={onClose} 
            className="px-4 py-2.5 text-xs font-bold text-gray-600 hover:bg-gray-200/60 rounded-xl transition-colors"
          >
            Cancelar
          </button>
          <button 
            type="submit" 
            form="doc-form" 
            disabled={isSubmitting} 
            className="px-6 py-2.5 text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 active:bg-orange-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-sm transition-all flex items-center gap-2"
          >
            {isSubmitting ? 'Salvando no banco...' : 'Salvar Documento'}
          </button>
        </div>

      </div>
    </div>
  );
}