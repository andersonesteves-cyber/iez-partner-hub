'use client';

import { useState, ChangeEvent, FormEvent } from 'react';
import { X, Upload, CheckCircle2 } from 'lucide-react';

interface NovoDocumentoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (novoDoc: any) => void;
}

export default function NovoDocumentoModal({
  isOpen,
  onClose,
  onSave,
}: NovoDocumentoModalProps) {
  const [titulo, setTitulo] = useState('');
  const [categoria, setCategoria] = useState('Onboarding');
  const [nivelAcesso, setNivelAcesso] = useState('Partner (Todos)');
  const [visibilidade, setVisibilidade] = useState<'publica' | 'restrita'>('publica');
  const [empresaId, setEmpresaId] = useState('');
  const [descricao, setDescricao] = useState('');
  const [arquivo, setArquivo] = useState<File | null>(null);

  if (!isOpen) return null;

  // Trata a seleção do arquivo
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setArquivo(e.target.files[0]);
    }
  };

  const handleResetAndClose = () => {
    setTitulo('');
    setCategoria('Onboarding');
    setNivelAcesso('Partner (Todos)');
    setVisibilidade('publica');
    setEmpresaId('');
    setDescricao('');
    setArquivo(null);
    onClose();
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!arquivo) {
      alert('Por favor, selecione um arquivo para upload.');
      return;
    }

    // Estrutura do objeto para atualização de estado em tempo real
    const novoDoc = {
      id: Date.now().toString(),
      titulo,
      categoria,
      nivelAcesso,
      visibilidade,
      empresaId: visibilidade === 'restrita' ? empresaId : null,
      descricao,
      nomeArquivo: arquivo.name,
      tamanhoArquivo: `${(arquivo.size / 1024).toFixed(0)} KB`,
      dataUpload: new Date().toLocaleDateString('pt-BR'),
      tipo: arquivo.type.includes('pdf') ? 'PDF' : 'Documento',
    };

    onSave(novoDoc);
    handleResetAndClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto font-sans">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 relative my-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Cabeçalho */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-800">Cadastrar Novo Documento</h2>
          <button
            type="button"
            onClick={handleResetAndClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-left">
          
          {/* Título */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Título do Documento <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Manual de Vendas Fibra 2026"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Categoria e Nível de Acesso */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Categoria
              </label>
              <select
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
              >
                <option value="Onboarding">Onboarding</option>
                <option value="Processos">Processos</option>
                <option value="Marketing">Marketing</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Nível de Acesso
              </label>
              <select
                value={nivelAcesso}
                onChange={(e) => setNivelAcesso(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
              >
                <option value="Partner (Todos)">Partner (Todos)</option>
                <option value="Master Partner">Master Partner</option>
                <option value="Apenas Admin">Apenas Admin</option>
              </select>
            </div>
          </div>

          {/* Visibilidade por Empresa */}
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 space-y-2">
            <label className="block text-xs font-semibold text-gray-700">
              Regra de Visibilidade por Empresa
            </label>
            <div className="flex items-center gap-4 text-xs">
              <label className="flex items-center gap-1.5 cursor-pointer text-gray-700">
                <input
                  type="radio"
                  name="visibilidade"
                  value="publica"
                  checked={visibilidade === 'publica'}
                  onChange={() => setVisibilidade('publica')}
                  className="text-orange-600 focus:ring-orange-500 accent-orange-600"
                />
                Pública (Todas as empresas)
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer text-gray-700">
                <input
                  type="radio"
                  name="visibilidade"
                  value="restrita"
                  checked={visibilidade === 'restrita'}
                  onChange={() => setVisibilidade('restrita')}
                  className="text-orange-600 focus:ring-orange-500 accent-orange-600"
                />
                Restrita a uma Empresa
              </label>
            </div>

            {/* Select dinâmico exibido apenas quando 'restrita' é selecionada */}
            {visibilidade === 'restrita' && (
              <div className="pt-2 animate-in fade-in duration-200">
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Selecione a Empresa Parceira <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={empresaId}
                  onChange={(e) => setEmpresaId(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                >
                  <option value="">Selecione uma empresa...</option>
                  <option value="emp-1"> Telecom Sul Ltda</option>
                  <option value="emp-2"> Alpha Conectividade</option>
                  <option value="emp-3"> Beta Soluções de Rede</option>
                </select>
              </div>
            )}
          </div>

          {/* UPLOAD DE ARQUIVO */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Upload do Arquivo <span className="text-red-500">*</span>
            </label>
            <div className="relative border-2 border-dashed border-gray-300 hover:border-orange-500 bg-gray-50 hover:bg-orange-50/40 rounded-lg p-4 text-center cursor-pointer transition-all group">
              <input
                type="file"
                required
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                accept=".pdf,.doc,.docx,.ppt,.pptx,.png,.jpg,.jpeg,.mp4"
              />
              <div className="flex flex-col items-center justify-center gap-1">
                {arquivo ? (
                  <>
                    <CheckCircle2 size={24} className="text-orange-600" />
                    <span className="text-xs font-semibold text-gray-800 break-all px-2">
                      {arquivo.name}
                    </span>
                    <span className="text-[10px] text-gray-500">
                      {(arquivo.size / (1024 * 1024)).toFixed(2)} MB — Clique para alterar
                    </span>
                  </>
                ) : (
                  <>
                    <Upload size={22} className="text-orange-500 group-hover:scale-110 transition-transform" />
                    <span className="text-xs text-gray-700 font-medium">
                      Clique ou arraste um arquivo até aqui
                    </span>
                    <span className="text-[10px] text-gray-400">
                      PDF, DOCX, PPT, MP4 (Tamanho máx.: 50MB)
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Descrição
            </label>
            <textarea
              rows={3}
              placeholder="Forneça detalhes sobre o conteúdo deste arquivo..."
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all resize-none"
            />
          </div>

          {/* Botões de Ação */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleResetAndClose}
              className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 active:bg-orange-800 rounded-lg shadow-sm transition-colors"
            >
              Cadastrar Documento
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}