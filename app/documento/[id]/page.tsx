// src/app/documento/[id]/page.tsx
'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';

interface Secao {
  id: string;
  titulo: string;
  conteudo: string;
}

interface Documento {
  id: string;
  titulo: string;
  categoria: string;
  pdfUrl: string;
  secoes?: Secao[];
}

// Fallback visual em caso de falha de conexão na API
const MOCK_FALLBACK: Documento = {
  id: '1',
  titulo: 'Manual de Vendas e Atendimento',
  categoria: 'Manuais',
  pdfUrl: '/docs/manual-vendas.pdf',
  secoes: [
    {
      id: 'introducao',
      titulo: '1. Introdução',
      conteudo: 'Este manual fornece ao parceiro as principais informações e insumos para realizar vendas no ecossistema iez! telecom.',
    },
    {
      id: 'processo-vendas',
      titulo: '2. Processo de Vendas',
      conteudo: 'O processo de vendas é dividido em prospecção, qualificação e apresentação de proposta.',
    },
  ],
};

export default function DocumentoReaderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [doc, setDoc] = useState<Documento | null>(null);
  const [secaoAtiva, setSecaoAtiva] = useState<string>('');
  const [modoView, setModoView] = useState<'leitura' | 'pdf'>('leitura');
  const [isLoading, setIsLoading] = useState(true);

  // Variável de ambiente apontando para o Render em Prod (ou localhost em dev)
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  useEffect(() => {
    setIsLoading(true);
    fetch(`${API_URL}/api/documentos/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error('Documento não encontrado na API');
        return res.json();
      })
      .then((data: Documento) => {
        setDoc(data);
        if (data.secoes && data.secoes.length > 0) {
          setSecaoAtiva(data.secoes[0].id);
        }
      })
      .catch((err) => {
        console.warn('Falha ao buscar da API. Usando mock local como fallback.', err);
        setDoc(MOCK_FALLBACK);
        setSecaoAtiva(MOCK_FALLBACK.secoes?.[0]?.id || '');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [id, API_URL]);

  const scrollToSecao = (secaoId: string) => {
    setSecaoAtiva(secaoId);
    const element = document.getElementById(secaoId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-600"></div>
          <p className="text-sm font-medium text-gray-500">Carregando acervo do iez! Hub...</p>
        </div>
      </div>
    );
  }

  if (!doc) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-800">
      {/* Topbar do Reader */}
      <header className="sticky top-0 z-20 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="text-sm font-medium text-gray-500 hover:text-orange-600 transition-colors flex items-center gap-1"
          >
            ← Voltar para Início
          </Link>
          <span className="text-gray-300">|</span>
          <h1 className="text-lg font-bold text-gray-900">{doc.titulo}</h1>
          <span className="bg-orange-50 text-orange-600 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-orange-200">
            {doc.categoria}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Alternador de Modo de Leitura */}
          <div className="bg-gray-100 p-1 rounded-lg flex gap-1 border border-gray-200">
            <button
              onClick={() => setModoView('leitura')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                modoView === 'leitura'
                  ? 'bg-white text-orange-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Leitura Adaptativa
            </button>
            <button
              onClick={() => setModoView('pdf')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                modoView === 'pdf'
                  ? 'bg-white text-orange-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              PDF Original
            </button>
          </div>

          <a
            href={doc.pdfUrl}
            download
            target="_blank"
            rel="noopener noreferrer"
            className="bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm"
          >
            📥 Baixar PDF
          </a>
        </div>
      </header>

      {/* ÁREA PRINCIPAL DO LEITOR */}
      <div className="flex flex-1 max-w-7xl w-full mx-auto p-6 gap-6">
        {/* LADO ESQUERDO: ÍNDICE DO DOCUMENTO */}
        <aside className="w-80 flex-shrink-0">
          <div className="sticky top-24 bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 px-2">
              Índice do Documento
            </h2>
            <nav className="space-y-1">
              {doc.secoes && doc.secoes.length > 0 ? (
                doc.secoes.map((secao) => {
                  const isSubsecao = secao.titulo.match(/^\d+\.\d+/);
                  return (
                    <button
                      key={secao.id}
                      onClick={() => scrollToSecao(secao.id)}
                      className={`w-full text-left text-sm py-2 px-3 rounded-lg transition-colors flex items-center justify-between ${
                        isSubsecao ? 'pl-6 text-xs' : 'font-medium'
                      } ${
                        secaoAtiva === secao.id
                          ? 'bg-orange-50 text-orange-600 font-semibold'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <span className="truncate">{secao.titulo}</span>
                      {secaoAtiva === secao.id && (
                        <span className="w-1.5 h-1.5 rounded-full bg-orange-600 flex-shrink-0" />
                      )}
                    </button>
                  );
                })
              ) : (
                <p className="text-xs text-gray-400 p-2">Sem seções indexadas.</p>
              )}
            </nav>
          </div>
        </aside>

        {/* LADO DIREITO: LEITURA OU VISUALIZADOR DE PDF */}
        <main className="flex-1 bg-white rounded-xl border border-gray-200 p-8 shadow-sm min-h-[70vh]">
          {modoView === 'leitura' ? (
            <article className="space-y-10 max-w-3xl">
              {doc.secoes && doc.secoes.length > 0 ? (
                doc.secoes.map((secao) => (
                  <section
                    key={secao.id}
                    id={secao.id}
                    className="scroll-mt-28 border-b border-gray-100 pb-8 last:border-none"
                  >
                    <h2 className="text-xl font-bold text-gray-900 mb-3">{secao.titulo}</h2>
                    <p className="text-gray-600 leading-relaxed whitespace-pre-line">{secao.conteudo}</p>
                  </section>
                ))
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <p>Este documento não possui capítulos de texto extraídos.</p>
                  <button
                    onClick={() => setModoView('pdf')}
                    className="mt-3 text-sm text-orange-600 font-semibold hover:underline"
                  >
                    Alternar para o modo PDF Original
                  </button>
                </div>
              )}
            </article>
          ) : (
            <div className="w-full h-[75vh] rounded-lg overflow-hidden border border-gray-200">
              <iframe
                src={`${doc.pdfUrl}#toolbar=0`}
                className="w-full h-full"
                title={doc.titulo}
              />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}