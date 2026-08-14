'use client';

import { useState, useEffect } from 'react';
// ... (mantenha seus outros imports aqui)

// 1. Defina a interface dizendo ao TypeScript o que esse componente recebe
interface DocumentosManagerProps {
  searchQuery?: string;
  categoria?: string;
}

// 2. Desestruture as props na função, já tipando com a interface criada
export default function DocumentosManager({ 
  searchQuery = '', 
  categoria = '' 
}: DocumentosManagerProps) {
  
  // ... (mantenha o restante do seu código intacto aqui para baixo)
  // Agora você pode usar `searchQuery` e `categoria` livremente para filtrar seus estados
  
  return (
    // ... seu JSX
  );
}

// Fallback de dados locais caso a API na porta 5000 esteja indisponível
const documentosFallback: Documento[] = [
  {
    id: '1',
    titulo: 'Manual de Onboarding do Parceiro v2.1',
    categoria: 'manuais',
    nivelAcesso: 'Partner (Todos)',
    regraVisibilidade: 'Pública',
    empresa: 'Todas as Empresas',
    descricao: 'Guia completo para configuração de acessos e primeiro atendimento no portal.',
    arquivoUrl: '/uploads/manual-onboarding.pdf',
    criadoEm: '2026-08-10',
  },
  {
    id: '2',
    titulo: 'Contrato Padrão de Prestação de Serviços iez!',
    categoria: 'contratos',
    nivelAcesso: 'Partner (Todos)',
    regraVisibilidade: 'Restrita a uma Empresa',
    empresa: 'Telecom Sul Ltda',
    descricao: 'Minuta contratual homologada para parcerias estaduais e regionais.',
    arquivoUrl: '/uploads/contrato-padrao.pdf',
    criadoEm: '2026-08-12',
  },
]

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

export default function DocumentosManager() {
  const searchParams = useSearchParams()
  const queryCategory = searchParams.get('q') || 'todos'

  const [documentos, setDocumentos] = useState<Documento[]>([])
  const [loading, setLoading] = useState(true)
  const [usingFallback, setUsingFallback] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // 1. Busca documentos da API do Node.js
  const fetchDocumentos = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/api/documentos`)
      if (!res.ok) throw new Error('Erro ao conectar com a API')
      
      const data = await res.json()
      setDocumentos(data)
      setUsingFallback(false)
    } catch (err) {
      console.warn('API indisponível. Utilizando documentos fallback locais.', err)
      setDocumentos(documentosFallback)
      setUsingFallback(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDocumentos()
  }, [])

  // 2. Trata adição de novo documento em tempo real
  const handleSaveDocumento = (novoDoc: Documento) => {
    setDocumentos((prev) => [novoDoc, ...prev])
  }

  // 3. Filtro por Categoria ou Busca por Texto
  const documentosFiltrados = documentos.filter((doc) => {
    const termo = queryCategory.toLowerCase()
    
    if (termo === 'todos') return true
    
    // Filtro por Categoria
    const catNormalizada = doc.categoria.toLowerCase()
    if (catNormalizada.includes(termo)) return true

    // Filtro por Busca Global (Título ou Descrição)
    const tituloMatch = doc.titulo.toLowerCase().includes(termo)
    const descMatch = doc.descricao?.toLowerCase().includes(termo) || false

    return tituloMatch || descMatch
  })

  return (
    <div className="space-y-6">
      
      {/* CABEÇALHO DA SEÇÃO COM O BOTÃO NOVO DOCUMENTO RESTAURADO */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Documentos Recentes
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Acesse rapidamente os arquivos mais importantes do portal.
          </p>
        </div>

        {/* BOTÃO + NOVO DOCUMENTO */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white font-semibold text-sm rounded-lg shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 shrink-0"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Novo Documento
        </button>
      </div>

      {/* AVISO DE USO DE FALLBACK (Se o Backend estiver fora) */}
      {usingFallback && (
        <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-xs flex items-center justify-between">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            Exibindo dados temporários locais (API Backend na porta 5000 offline).
          </span>
          <button 
            onClick={fetchDocumentos} 
            className="font-bold underline hover:text-amber-900 ml-2"
          >
            Tentar Reconectar
          </button>
        </div>
      )}

      {/* ESTADO DE CARREGAMENTO */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-44 bg-gray-100 rounded-xl animate-pulse border border-gray-200" />
          ))}
        </div>
      ) : documentosFiltrados.length === 0 ? (
        /* ESTADO VAZIO */
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-sm">
          <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-gray-500 text-sm font-medium">Nenhum documento encontrado para este filtro.</p>
          <p className="text-xs text-gray-400 mt-1">Tente selecionar outra categoria na barra lateral ou cadastre um novo documento.</p>
        </div>
      ) : (
        /* GRID DE CARDS DE DOCUMENTOS */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {documentosFiltrados.map((doc) => (
            <div
              key={doc.id}
              className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md hover:border-orange-200 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="px-2.5 py-1 bg-orange-50 text-orange-700 text-[11px] font-bold rounded-md uppercase tracking-wider">
                    {doc.categoria}
                  </span>
                  <span className="text-xs text-gray-400">
                    {doc.empresa || 'Público'}
                  </span>
                </div>

                <h3 className="font-bold text-gray-800 text-base group-hover:text-orange-600 transition-colors line-clamp-2">
                  {doc.titulo}
                </h3>

                <p className="text-xs text-gray-500 mt-2 line-clamp-2 leading-relaxed">
                  {doc.descricao || 'Sem descrição cadastrada.'}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                <span className="font-medium text-gray-400">
                  {doc.nivelAcesso}
                </span>

                <Link
                  href={`/documento/${doc.id}`}
                  className="font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 transition-colors"
                >
                  Visualizar
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL DE CADASTRO INTEGRADOR */}
      <NovoDocumentoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveDocumento}
      />
    </div>
  )
}