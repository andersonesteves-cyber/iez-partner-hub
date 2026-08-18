'use client';

import { useState, useEffect } from 'react';
import { Documento } from './DocumentosManager';

interface Empresa {
  id: string;
  nome?: string;
  name?: string;
}

interface EditarDocumentoModalProps {
  isOpen: boolean;
  documento: Documento | null;
  onClose: () => void;
  onSave: (docAtualizado: Documento) => void;
}

export default function EditarDocumentoModal({
  isOpen,
  documento,
  onClose,
  onSave,
}: EditarDocumentoModalProps) {
  const [titulo, setTitulo] = useState('');
  const [categoria, setCategoria] = useState('Manuais');
  const [resumo, setResumo] = useState('');
  const [nivelAcesso, setNivelAcesso] = useState('Partner (Todos)');
  const [visibilidade, setVisibilidade] = useState('geral');
  const [empresaSelecionada, setEmpresaSelecionada] = useState('');
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  
  const [isLoadingEmpresas, setIsLoadingEmpresas] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  // Preenche os campos com os dados atuais do card selecionado
  useEffect(() => {
    if (documento && isOpen) {
      setTitulo(documento.titulo || '');
      setCategoria(documento.categoria || 'Manuais');
      setResumo(documento.resumo || '');
      setNivelAcesso(documento.nivelAcesso || 'Partner (Todos)');

      const isRestrito = documento.regraVisibilidade?.startsWith('RESTRITA');
      if (isRestrito) {
        setVisibilidade('restrita');
        const nomeEmpresa = documento.regraVisibilidade?.split(':')[1] || '';
        setEmpresaSelecionada(nomeEmpresa);
      } else {
        setVisibilidade('geral');
        setEmpresaSelecionada('');
      }

      // Busca picklist de empresas
      setIsLoadingEmpresas(true);
      fetch(`${API_URL}/api/empresas`)
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setEmpresas(data);
          }
        })
        .catch((err) => console.error('Erro ao buscar empresas:', err))
        .finally(() => setIsLoadingEmpresas(false));
    }
  }, [documento, isOpen, API_URL]);

  if (!isOpen || !documento) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (visibilidade === 'restrita' && !empresaSelecionada) {
      alert('Por favor, selecione uma empresa parceira.');
      return;
    }

    setIsSubmitting(true);

    try {
      const regraFormatada = visibilidade === 'restrita' ? `RESTRITA:${empresaSelecionada}` : 'GERAL';

      const bodyData = {
        titulo,
        categoria,
        resumo,
        nivelAcesso,
        regraVisibilidade: regraFormatada,
      };

      const response = await fetch(`${API_URL}/api/documentos/${documento.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData),
      });

      if (!response.ok) {
        throw new Error('Erro ao atualizar documento no servidor.');
      }

      const docAtualizado = await response.json();

      onSave({
        ...documento,
        titulo: docAtualizado.titulo || titulo,
        categoria: docAtualizado.categoria || categoria,
        resumo: docAtualizado.resumo || resumo,
        nivelAcesso: docAtualizado.nivelAcesso || nivelAcesso,
        regraVisibilidade: docAtualizado.regraVisibilidade || regraFormatada,
      });

      onClose();
    } catch (error) {
      console.error('Erro na edição:', error);
      alert('Falha ao atualizar o documento.');
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
            <h2 className="text-lg font-extrabold text-gray-900">Editar Documento</h2>
            <p className="text-xs text-gray-500 mt-0.5">Atualize as informações e permissões do card.</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-orange-600 transition-colors p-1 rounded-lg hover:bg-orange-50">
            ✕
          </button>
        </div>

        {/* FORMULÁRIO */}
        <div className="p-6 overflow-y-auto space-y-5">
          <form id="edit-doc-form" onSubmit={handleSubmit} className="space-y-5">
            
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
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-600 outline-none text-sm font-medium text-gray-900"
              />
            </div>

            {/* CATEGORIA E NÍVEL */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Perfil de Usuário *
                </label>
                <select
                  value={nivelAcesso}
                  onChange={(e) => setNivelAcesso(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-600 outline-none text-sm font-medium text-gray-900 bg-white cursor-pointer"
                >
                  <option value="Partner (Todos)">Partner (Todos)</option>
                  <option value="Gestor / Supervisor">Gestor / Supervisor</option>
                  <option value="Apenas Administradores">Apenas Administradores</option>
                </select>
              </div>
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
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-600 outline-none text-sm font-medium text-gray-900 resize-none"
              />
            </div>

            {/* ESCOPO DE VISIBILIDADE */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Escopo de Visibilidade *
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${visibilidade === 'geral' ? 'border-orange-500 bg-orange-50/50 text-orange-900 font-bold' : 'border-gray-200 text-gray-600 font-medium'}`}>
                  <input type="radio" name="visibilidade_edit" value="geral" checked={visibilidade === 'geral'} onChange={(e) => setVisibilidade(e.target.value)} className="text-orange-600 focus:ring-orange-500" />
                  <span className="text-xs">Geral (Público)</span>
                </label>

                <label className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${visibilidade === 'restrita' ? 'border-orange-500 bg-orange-50/50 text-orange-900 font-bold' : 'border-gray-200 text-gray-600 font-medium'}`}>
                  <input type="radio" name="visibilidade_edit" value="restrita" checked={visibilidade === 'restrita'} onChange={(e) => setVisibilidade(e.target.value)} className="text-orange-600 focus:ring-orange-500" />
                  <span className="text-xs">Restrito a Empresa</span>
                </label>
              </div>
            </div>

            {/* PICKLIST DE EMPRESA */}
            {visibilidade === 'restrita' && (
              <div className="p-4 bg-orange-50/60 rounded-xl border border-orange-100 space-y-2">
                <label className="block text-xs font-bold text-orange-900 uppercase tracking-wider">
                  Selecione a Empresa Parceira *
                </label>
                {isLoadingEmpresas ? (
                  <div className="text-xs text-orange-600 font-medium animate-pulse">Carregando empresas...</div>
                ) : (
                  <select
                    value={empresaSelecionada}
                    onChange={(e) => setEmpresaSelecionada(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none text-sm font-bold text-gray-900 bg-white cursor-pointer"
                  >
                    {empresas.map((emp) => {
                      const nome = emp.nome || emp.name;
                      return (
                        <option key={emp.id} value={nome}>
                          {nome}
                        </option>
                      );
                    })}
                  </select>
                )}
              </div>
            )}

          </form>
        </div>

        {/* RODAPÉ */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-4 py-2.5 text-xs font-bold text-gray-600 hover:bg-gray-200/60 rounded-xl transition-colors">
            Cancelar
          </button>
          <button type="submit" form="edit-doc-form" disabled={isSubmitting} className="px-6 py-2.5 text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 disabled:opacity-50 rounded-xl shadow-sm transition-all">
            {isSubmitting ? 'Atualizando...' : 'Salvar Alterações'}
          </button>
        </div>

      </div>
    </div>
  );
}