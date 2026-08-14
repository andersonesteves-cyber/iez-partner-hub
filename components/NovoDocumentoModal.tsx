'use client'

import { useState } from 'react'

interface NovoDocumentoModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (doc: any) => void // <-- Tipagem corrigida e ativada
}

export default function NovoDocumentoModal({ isOpen, onClose, onSave }: NovoDocumentoModalProps) {
  const [categorias, setCategorias] = useState(['Marketing', 'Onboarding', 'Processos'])
  const [empresas, setEmpresas] = useState(['Telecom Sul Ltda', 'Alpha Conectividade', 'Beta Soluções de Rede'])

  const [isAddingCategoria, setIsAddingCategoria] = useState(false)
  const [isAddingEmpresa, setIsAddingEmpresa] = useState(false)

  const [formData, setFormData] = useState({
    titulo: '',
    categoria: categorias[0],
    novaCategoria: '',
    nivelAcesso: 'Partner (Todos)',
    regraVisibilidade: 'Restrita a uma Empresa',
    empresa: '',
    novaEmpresa: '',
    descricao: ''
  })

  if (!isOpen) return null

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    
    const categoriaFinal = isAddingCategoria ? formData.novaCategoria : formData.categoria
    const empresaFinal = isAddingEmpresa ? formData.novaEmpresa : formData.empresa

    // Montamos o objeto do novo documento (incluindo dados mockados para exibição imediata)
    const novoDocumento = {
      ...formData,
      id: Date.now().toString(), // ID provisório até termos o banco
      data: new Date().toLocaleDateString('pt-BR'),
      categoria: categoriaFinal,
      empresa: empresaFinal,
    }

    console.log('Salvando documento:', novoDocumento)
    
    // Dispara a função passada pelo DocumentosManager
    onSave(novoDocumento)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* HEADER DO MODAL */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">Cadastrar Novo Documento</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* CORPO DO FORMULÁRIO */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-5">
          
          {/* Título */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Título do Documento <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Plano e Ofertas"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
              value={formData.titulo}
              onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Categoria com Inline Creation */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-sm font-medium text-gray-700">Categoria</label>
                <button 
                  type="button" 
                  onClick={() => setIsAddingCategoria(!isAddingCategoria)}
                  className="text-xs font-semibold text-orange-600 hover:text-orange-700"
                >
                  {isAddingCategoria ? 'Cancelar' : '+ Nova Categoria'}
                </button>
              </div>
              
              {isAddingCategoria ? (
                <input
                  type="text"
                  required
                  placeholder="Digite o nome da nova categoria"
                  className="w-full px-3 py-2 border border-orange-300 bg-orange-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                  value={formData.novaCategoria}
                  onChange={(e) => setFormData({ ...formData, novaCategoria: e.target.value })}
                />
              ) : (
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm bg-white"
                  value={formData.categoria}
                  onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                >
                  {categorias.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              )}
            </div>

            {/* Nível de Acesso */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nível de Acesso</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm bg-white"
                value={formData.nivelAcesso}
                onChange={(e) => setFormData({ ...formData, nivelAcesso: e.target.value })}
              >
                <option value="Partner (Todos)">Partner (Todos)</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
          </div>

          {/* Regra de Visibilidade */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <p className="text-sm font-medium text-gray-700 mb-3">Regra de Visibilidade por Empresa</p>
            <div className="flex items-center space-x-4 mb-4">
              <label className="flex items-center text-sm text-gray-600">
                <input
                  type="radio"
                  name="visibilidade"
                  className="text-orange-600 focus:ring-orange-500 mr-2"
                  checked={formData.regraVisibilidade === 'Pública'}
                  onChange={() => setFormData({ ...formData, regraVisibilidade: 'Pública' })}
                />
                Pública (Todas as empresas)
              </label>
              <label className="flex items-center text-sm text-gray-600">
                <input
                  type="radio"
                  name="visibilidade"
                  className="text-orange-600 focus:ring-orange-500 mr-2"
                  checked={formData.regraVisibilidade === 'Restrita a uma Empresa'}
                  onChange={() => setFormData({ ...formData, regraVisibilidade: 'Restrita a uma Empresa' })}
                />
                Restrita a uma Empresa
              </label>
            </div>

            {/* Empresa com Inline Creation */}
            {formData.regraVisibilidade === 'Restrita a uma Empresa' && (
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-sm font-medium text-gray-700">
                    Selecione a Empresa Parceira <span className="text-red-500">*</span>
                  </label>
                  <button 
                    type="button" 
                    onClick={() => setIsAddingEmpresa(!isAddingEmpresa)}
                    className="text-xs font-semibold text-orange-600 hover:text-orange-700"
                  >
                    {isAddingEmpresa ? 'Cancelar' : '+ Nova Empresa'}
                  </button>
                </div>

                {isAddingEmpresa ? (
                  <input
                    type="text"
                    required
                    placeholder="Digite o nome da nova empresa"
                    className="w-full px-3 py-2 border border-orange-300 bg-orange-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                    value={formData.novaEmpresa}
                    onChange={(e) => setFormData({ ...formData, novaEmpresa: e.target.value })}
                  />
                ) : (
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm bg-white"
                    value={formData.empresa}
                    onChange={(e) => setFormData({ ...formData, empresa: e.target.value })}
                  >
                    <option value="">Selecione uma empresa...</option>
                    {empresas.map(emp => <option key={emp} value={emp}>{emp}</option>)}
                  </select>
                )}
              </div>
            )}
          </div>

          {/* Upload de Arquivo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Upload do Arquivo <span className="text-red-500">*</span>
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition-colors cursor-pointer group">
              <svg className="w-8 h-8 text-orange-500 mb-2 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              <p className="text-sm font-medium text-gray-700">Clique ou arraste um arquivo até aqui</p>
              <p className="text-xs text-gray-400 mt-1">PDF, DOCX, PPT, MP4 (Tamanho máx.: 50MB)</p>
            </div>
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
            <textarea
              rows={3}
              placeholder="Forneça detalhes sobre o conteúdo deste arquivo..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm resize-none"
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
            />
          </div>
        </form>

        {/* FOOTER DO MODAL */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-orange-600 border border-transparent rounded-lg hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 shadow-sm"
          >
            Cadastrar Documento
          </button>
        </div>
      </div>
    </div>
  )
}