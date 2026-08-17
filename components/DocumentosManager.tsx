'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import NovoDocumentoModal from './NovoDocumentoModal';

interface Documento {
  id: string;
  titulo: string;
  descricao: string;
  categoria: string;
  visibilidade?: 'publica' | 'restrita';
  empresaRestrita?: string;
  enviadoPor?: string;
  dataEnvio?: string;
}

interface DocumentosManagerProps {
  categoriaUrl?: string;
  searchQuery?: string;
}

export default function DocumentosManager({
  categoriaUrl = '',
  searchQuery = '',
}: DocumentosManagerProps) {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [documentoExcluir, setDocumentoExcluir] = useState<Documento | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [documentos, setDocumentos] = useState<Documento[]>([
    {
      id: '1',
      titulo: 'Manual de Vendas e Atendimento',
      descricao: 'Insumos e diretrizes comerciais para atuação em campo.',
      categoria: 'Manuais',
      enviadoPor: 'Admin iez!',
      dataEnvio: '17/08/2026',
    },
    {
      id: '2',
      titulo: 'Apresentação Go-To-Market',
      descricao: 'Guia completo de estratégia comercial e lançamento.',
      categoria: 'Material Comercial',
      enviadoPor: 'Admin iez!',
      dataEnvio: '17/08/2026',
    },
    {
      id: '3',
      titulo: 'Guia Técnico de Integrações',
      descricao: 'Documentação de APIs e configurações para ISPs parceiros.',
      categoria: 'Guias Técnicos',
      enviadoPor: 'Admin iez!',
      dataEnvio: '17/08/2026',
    },
  ]);

  useEffect(() => {
    const storedUser = localStorage.getItem('iez_user') || localStorage.getItem('user');
    if (storedUser) {
      try {
        setCurrentUser(JSON.parse(storedUser));
      } catch (e) {}
    }

    const salvos = localStorage.getItem('iez_documentos');
    if (salvos) {
      try {
        setDocumentos(JSON.parse(salvos));
      } catch (e) {}
    }
  }, []);

  const userRole = currentUser?.role?.toUpperCase() || 'USER';
  const userEmpresa = currentUser?.empresa || currentUser?.company || '';
  const isAdmin = ['ADMIN', 'IEZ_ADMIN', 'COMPANY_ADMIN'].includes(userRole);
  const isIezAdmin = ['ADMIN', 'IEZ_ADMIN'].includes(userRole);

  const handleSalvarNovoDocumento = (novoDoc: Documento) => {
    const atualizados = [novoDoc, ...documentos];
    setDocumentos(atualizados);
    localStorage.setItem('iez_documentos', JSON.stringify(atualizados));
  };

  const handleConfirmarExclusao = () => {
    if (!documentoExcluir) return;
    const atualizados = documentos.filter((d) => d.id !== documentoExcluir.id);
    setDocumentos(atualizados);
    localStorage.setItem('iez_documentos', JSON.stringify(atualizados));
    setDocumentoExcluir(null);
  };

  const documentosFiltrados = documentos.filter((doc) => {
    const termo = searchQuery.toLowerCase();
    const matchesSearch =
      !termo ||
      doc.titulo.toLowerCase().includes(termo) ||
      doc.descricao.toLowerCase().includes(termo) ||
      doc.categoria.toLowerCase().includes(termo);

    const matchesCategoria =
      !categoriaUrl || doc.categoria.toLowerCase().includes(categoriaUrl.toLowerCase());

    if (isIezAdmin) return matchesSearch && matchesCategoria;
    if (doc.visibilidade === 'restrita') {
      return (
        matchesSearch &&
        matchesCategoria &&
        doc.empresaRestrita?.toLowerCase() === userEmpresa.toLowerCase()
      );
    }

    return matchesSearch && matchesCategoria;
  });

  return (
    <div className="space-y-6 font-sans selection:bg-orange-100 selection:text-orange-900">
      
      {/* CABEÇALHO DO ACERVO COM O BOTÃO + NOVO DOCUMENTO */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Acervo de Documentos</h1>
          <p className="text-xs text-gray-500 mt-1">
            Consulte e gerencie os manuais, termos e insumos da iez! telecom.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white font-bold text-xs px-4 py-3 rounded-xl shadow-sm transition-all"
          >
            <span>+</span> Novo Documento
          </button>
        )}
      </div>

      {/* GRID DE CARDS */}
      {documentosFiltrados.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <p className="text-sm font-semibold text-gray-500">
            Nenhum documento encontrado para os filtros selecionados.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {documentosFiltrados.map((doc) => (
            <div
              key={doc.id}
              className="bg-white p-5 rounded-2xl border border-gray-100 hover:border-orange-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-orange-600 bg-orange-50 px-2.5 py-1 rounded-md">
                    {doc.categoria}
                  </span>

                  {isAdmin && (
                    <button
                      onClick={() => setDocumentoExcluir(doc)}
                      title="Excluir arquivo"
                      className="text-gray-300 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      🗑️
                    </button>
                  )}
                </div>

                <h3 className="text-base font-bold text-gray-900 group-hover:text-orange-600 transition-colors">
                  {doc.titulo}
                </h3>

                <p className="text-xs text-gray-500 mt-2 line-clamp-2 leading-relaxed">
                  {doc.descricao || 'Sem descrição cadastrada.'}
                </p>
              </div>

              <div className="mt-6 pt-3 border-t border-gray-50 flex items-center justify-between text-xs">
                <span className="text-[11px] text-gray-400 font-medium">
                  {doc.enviadoPor || 'Admin'}
                </span>

                <Link
                  href={`/documento/${doc.id}`}
                  className="text-orange-600 font-bold hover:text-orange-700 transition-colors"
                >
                  Acessar arquivo →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL DE NOVO DOCUMENTO */}
      <NovoDocumentoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSalvarNovoDocumento}
      />

      {/* MODAL DE EXCLUSÃO */}
      {documentoExcluir && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 border border-gray-100 text-center">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
              🗑️
            </div>
            <h2 className="text-base font-bold text-gray-900 mb-2">Excluir Documento?</h2>
            <p className="text-xs text-gray-500 leading-relaxed mb-6">
              Deseja remover o arquivo <strong className="text-gray-800">{documentoExcluir.titulo}</strong> do acervo público?
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setDocumentoExcluir(null)}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmarExclusao}
                className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm"
              >
                Confirmar Exclusão
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}