'use client';

import { useState, useEffect } from 'react';

interface Empresa {
  id: string;
  nome: string;
  name?: string;
  status: string;
}

interface NovoDocumentoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (documento: any) => void;
}

export default function NovoDocumentoModal({ isOpen, onClose, onSave }: NovoDocumentoModalProps) {
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [categoria, setCategoria] = useState('Manuais');
  const [nivelAcesso, setNivelAcesso] = useState('Partner (Todos)');
  const [regraVisibilidade, setRegraVisibilidade] = useState<'publica' | 'restrita'>('publica');
  const [empresaRestrita, setEmpresaRestrita] = useState('');
  const [arquivo, setArquivo] = useState<File | null>(null);

  const [empresasAtivas, setEmpresasAtivas] = useState<Empresa[]>([]);
  const [loadingEmpresas, setLoadingEmpresas] = useState(false);

  const API_URL = 'https://api-iez-partner-hub.onrender.com';

  const aplicarFallback = () => {
    const fallbackList = [
      { id: '1', nome: 'Zamix', status: 'Ativo' },
      { id: '2', nome: 'NetSpeed', status: 'Ativo' },
    ];
    setEmpresasAtivas(fallbackList);
    setEmpresaRestrita(fallbackList[0].nome);
  };

  useEffect(() => {
    if (isOpen) {
      fetchEmpresas();
    }
  }, [isOpen]);

  const fetchEmpresas = async () => {
    setLoadingEmpresas(true);
    try {
      const res = await fetch(`${API_URL}/api/empresas`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const ativas = data
            .map((e: any) => ({
              id: String(e.id),
              nome: e.nome || e.name || 'Empresa Sem Nome',
              status: String(e.status || 'Ativo'),
            }))
            .filter((e) => e.status.toLowerCase() === 'ativo');

          if (ativas.length > 0) {
            setEmpresasAtivas(ativas);
            setEmpresaRestrita(ativas[0].nome);
          } else {
            aplicarFallback();
          }
        } else {
          aplicarFallback();
        }
      } else {
        aplicarFallback();
      }
    } catch (err) {
      console.warn('Falha na comunicação com a API. Aplicando empresas padrão.');
      aplicarFallback();
    } finally {
      setLoadingEmpresas(false);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const novoDoc = {
      id: Date.now().toString(),
      titulo,
      descricao,
      categoria,
      nivelAcesso,
      visibilidade: regraVisibilidade,
      empresaRestrita: regraVisibilidade === 'restrita' ? empresaRestrita : null,
      nomeArquivo: arquivo ? arquivo.name : 'documento.pdf',
      tamanhoArquivo: arquivo ? `${(arquivo.size / 1024 / 1024).toFixed(1)} MB` : '1.2 MB',
      dataEnvio: new Date().toLocaleDateString('pt-BR'),
      enviadoPor: 'Admin',
    };

    onSave(novoDoc);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-sans selection:bg-orange-100 selection:text-orange-900">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto border border-gray-100">
        
        {/* CABEÇALHO DO MODAL */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <h2 className="text-lg font-bold text-gray-900">Cadastrar Novo Documento</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-lg transition-colors"
          >
            ✕
          </button>
        </div>

        {/* FORMULÁRIO */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Título do Documento *</label>
            <input
              type="text"
              required
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ex: Planos e Tarifas Q3"
              className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-orange-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Resumo / Descrição curta</label>
            <textarea
              rows={3}
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Descreva brevemente o conteúdo deste documento..."
              className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-orange-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Categoria *</label>
              <select
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-orange-500 outline-none bg-white font-medium"
              >
                <option value="Manuais">Manuais</option>
                <option value="Contratos e Termos">Contratos e Termos</option>
                <option value="Guias Técnicos">Guias Técnicos</option>
                <option value="Material Comercial">Material Comercial</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Nível de Acesso</label>
              <select
                value={nivelAcesso}
                onChange={(e) => setNivelAcesso(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-orange-500 outline-none bg-white font-medium"
              >
                <option value="Partner (Todos)">Partner (Todos)</option>
                <option value="Apenas Admins">Apenas Admins</option>
              </select>
            </div>
          </div>

          {/* VISIBILIDADE POR EMPRESA */}
          <div className="bg-gray-50/70 p-4 rounded-xl border border-gray-200/80 space-y-3">
            <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider">
              Regra de Visibilidade por Empresa
            </label>
            
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-700">
                <input
                  type="radio"
                  name="visibilidade"
                  checked={regraVisibilidade === 'publica'}
                  onChange={() => setRegraVisibilidade('publica')}
                  className="text-orange-600 focus:ring-orange-500"
                />
                Pública (Todas as empresas)
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-700">
                <input
                  type="radio"
                  name="visibilidade"
                  checked={regraVisibilidade === 'restrita'}
                  onChange={() => setRegraVisibilidade('restrita')}
                  className="text-orange-600 focus:ring-orange-500"
                />
                Restrita a uma Empresa
              </label>
            </div>

            {/* SELEÇÃO DA EMPRESA */}
            {regraVisibilidade === 'restrita' && (
              <div className="pt-2">
                {loadingEmpresas ? (
                  <div className="text-xs text-gray-400 py-2">Carregando lista de parceiros ativos...</div>
                ) : (
                  <select
                    value={empresaRestrita}
                    onChange={(e) => setEmpresaRestrita(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-orange-500 outline-none bg-white font-medium text-gray-900"
                  >
                    {empresasAtivas.map((emp) => (
                      <option key={emp.id} value={emp.nome}>
                        {emp.nome}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Upload do Arquivo *</label>
            <input
              type="file"
              onChange={(e) => setArquivo(e.target.files?.[0] || null)}
              className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100 border border-gray-200 rounded-lg cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-lg transition-colors shadow-sm"
            >
              Salvar Documento
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}