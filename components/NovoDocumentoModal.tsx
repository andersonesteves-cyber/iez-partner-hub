'use client'

import { useState } from 'react'

interface NovoDocumentoModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (doc: any) => void
}

export default function NovoDocumentoModal({ isOpen, onClose, onSave }: NovoDocumentoModalProps) {
  const [categorias, setCategorias] = useState(['Marketing', 'Onboarding', 'Processos'])
  const [empresas, setEmpresas] = useState(['Telecom Sul Ltda', 'Alpha Conectividade', 'Beta Soluções de Rede'])

  const [isAddingCategoria, setIsAddingCategoria] = useState(false)
  const [isAddingEmpresa, setIsAddingEmpresa] = useState(false)
  
  // Controle de UX para o momento do Upload
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [arquivo, setArquivo] = useState<File | null>(null)

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

  // Lida com a seleção do arquivo
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setArquivo(e.target.files[0])
    }
  }

  // Faz o POST para o Backend Node.js
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!arquivo) {
      alert('Por favor, selecione um arquivo para fazer o upload.')
      return
    }

    setIsSubmitting(true)

    const categoriaFinal = isAddingCategoria ? formData.novaCategoria : formData.categoria
    const empresaFinal = isAddingEmpresa ? formData.novaEmpresa : formData.empresa

    // Utilizamos FormData porque estamos enviando um arquivo (multipart/form-data)
    const payload = new FormData()
    payload.append('titulo', formData.titulo)
    payload.append('categoria', categoriaFinal)
    payload.append('nivelAcesso', formData.nivelAcesso)
    payload.append('regraVisibilidade', formData.regraVisibilidade)
    payload.append('empresa', empresaFinal || '')
    payload.append('descricao', formData.descricao)
    payload.append('arquivo', arquivo) // O nome 'arquivo' deve bater com o Multer no Node

    try {
      const response = await fetch('http://localhost:5000/api/documentos', {
        method: 'POST',
        body: payload, // O navegador define o Content-Type automaticamente para FormData
      })

      if (!response.ok) {
        throw new Error('Falha ao salvar o documento no servidor.')
      }

      const novoDocumentoSalvo = await response.json()
      
      console.log('Sucesso! Documento salvo no banco:', novoDocumentoSalvo)
      
      // Atualiza a lista na tela e fecha o modal
      onSave(novoDocumentoSalvo)
      onClose()
    } catch (error) {
      console.error('Erro no upload:', error)
      alert('Erro ao enviar documento. Verifique se o backend na porta 5000 está rodando.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">Cadastrar Novo Documento</h2>
          <button onClick={onClose} disabled={isSubmitting} className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Título */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Título do Documento <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              disabled={isSubmitting}
              placeholder="Ex: Plano e Ofertas"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm disabled:bg-gray-100"
              value={formData.titulo}
              onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Categoria Inline Creation */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-sm font-medium text-gray-700">Categoria</label>
                <button 
                  type="button" 
                  disabled={isSubmitting}
                  onClick={() => setIsAddingCategoria(!isAddingCategoria)}
                  className="text-xs font-semibold text-orange-600 hover:text-orange-700 disabled:opacity-50"
                >
                  {isAddingCategoria ? 'Cancelar' : '+ Nova Categoria'}
                </button>
              </div>
              
              {isAddingCategoria ? (
                <input
                  type="text"
                  required
                  disabled={isSubmitting}
                  placeholder="Nova categoria"
                  className="w-full px-3 py-2 border border-orange-300 bg-orange-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm disabled:opacity-70"
                  value={formData.novaCategoria}
                  onChange={(e) => setFormData({ ...formData, novaCategoria: e.target.value })}
                />
              ) : (
                <select
                  disabled={isSubmitting}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm bg-white disabled:bg-gray-100"
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
                disabled={isSubmitting}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm bg-white disabled:bg-gray-100"
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
                  disabled={isSubmitting}
                  name="visibilidade"
                  className="text-orange-600 focus:ring-orange-500 mr-2 disabled:opacity-50"
                  checked={formData.regraVisibilidade === 'Pública'}
                  onChange={() => setFormData({ ...formData, regraVisibilidade: 'Pública' })}
                />
                Pública (Todas as empresas)
              </label>
              <label className="flex items-center text-sm text-gray-600">
                <input
                  type="radio"
                  disabled={isSubmitting}
                  name="visibilidade"
                  className="text-orange-600 focus:ring-orange-500 mr-2 disabled:opacity-50"
                  checked={formData.regraVisibilidade === 'Restrita a uma Empresa'}
                  onChange={() => setFormData({ ...formData, regraVisibilidade: 'Restrita a uma Empresa' })}
                />
                Restrita a uma Empresa
              </label>
            </div>

            {formData.regraVisibilidade === 'Restrita a uma Empresa' && (
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-sm font-medium text-gray-700">
                    Selecione a Empresa <span className="text-red-500">*</span>
                  </label>
                  <button 
                    type="button" 
                    disabled={isSubmitting}
                    onClick={() => setIsAddingEmpresa(!isAddingEmpresa)}
                    className="text-xs font-semibold text-orange-600 hover:text-orange-700 disabled:opacity-50"
                  >
                    {isAddingEmpresa ? 'Cancelar' : '+ Nova Empresa'}
                  </button>
                </div>

                {isAddingEmpresa ? (
                  <input
                    type="text"
                    required
                    disabled={isSubmitting}
                    placeholder="Nome da nova empresa"
                    className="w-full px-3 py-2 border border-orange-300 bg-orange-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm disabled:opacity-70"
                    value={formData.novaEmpresa}
                    onChange={(e) => setFormData({ ...formData, novaEmpresa: e.target.value })}
                  />
                ) : (
                  <select
                    disabled={isSubmitting}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm bg-white disabled:bg-gray-100"
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

          {/* Upload de Arquivo Real */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Upload do Arquivo <span className="text-red-500">*</span>
            </label>
            
            <label className={`
              border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center transition-colors cursor-pointer group
              ${arquivo ? 'border-orange-500 bg-orange-50' : 'border-gray-300 hover:bg-gray-50'}
              ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}
            `}>
              <input 
                type="file" 
                className="hidden" 
                onChange={handleFileChange}
                disabled={isSubmitting}
                accept=".pdf,.doc,.docx,.ppt,.pptx,.mp4"
              />
              
              {arquivo ? (
                <>
                  <svg className="w-8 h-8 text-orange-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm font-semibold text-orange-700">{arquivo.name}</p>
                  <p className="text-xs text-orange-500 mt-1">{(arquivo.size / 1024 / 1024).toFixed(2)} MB - Clique para trocar</p>
                </>
              ) : (
                <>
                  <svg className="w-8 h-8 text-orange-500 mb-2 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  <p className="text-sm font-medium text-gray-700">Clique para selecionar um arquivo</p>
                  <p className="text-xs text-gray-400 mt-1">PDF, DOCX, PPT, MP4 (Tamanho máx.: 50MB)</p>
                </>
              )}
            </label>
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
            <textarea
              rows={3}
              disabled={isSubmitting}
              placeholder="Forneça detalhes sobre o conteúdo..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm resize-none disabled:bg-gray-100"
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
            />
          </div>
        </form>

        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-white bg-orange-600 border border-transparent rounded-lg hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 shadow-sm disabled:opacity-70 flex items-center"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Enviando...
              </>
            ) : (
              'Cadastrar Documento'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}