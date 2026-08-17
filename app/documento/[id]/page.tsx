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
  resumo?: string;
  secoes?: Secao[];
}

export default function DocumentoReaderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [doc, setDoc] = useState<Documento | null>(null);
  const [secaoAtiva, setSecaoAtiva] = useState<string>('');
  const [modoView, setModoView] = useState<'leitura' | 'pdf'>('pdf'); // Agora o padrão é PDF
  const [isLoading, setIsLoading] = useState(true);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  useEffect(() => {
    setIsLoading(true);
    fetch(`${API_URL}/api/documentos/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error('Documento não encontrado');
        return res.json();
      })
      .then((data: Documento) => {
        setDoc(data);
        if (data.secoes && data.secoes.length > 0) {
          setSecaoAtiva(data.secoes[0].id);
          setModoView('leitura'); // Muda pra leitura se tiver texto extraído
        }
      })
      .catch((err) => {
        console.error('Erro ao buscar documento:', err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [id, API_URL]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-600"></div>
          <p className="text-sm font-medium text-gray-500">Carregando documento...</p>
        </div>
      </div>
    );
  }

  if (!doc) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center font-sans">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Documento não encontrado</h1>
          <Link href="/" className="text-orange-600 hover:underline">← Voltar para o início</Link>
        </div>
      </div>
    );
  }

  // CORREÇÃO CRÍTICA DO 404: Garante que a URL do PDF aponta para o backend
  const fullPdfUrl = doc.pdfUrl.startsWith('http') ? doc.pdfUrl : `${API_URL}${doc.pdfUrl}`;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-800">
      <header className="sticky top-0 z-20 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-sm font-medium text-gray-500 hover:text-orange-600 transition-colors flex items-center gap-1">
            ← Voltar para Início
          </Link>
          <span className="text-gray-300">|</span>
          <h1 className="text-lg font-bold text-gray-900">{doc.titulo}</h1>
          <span className="bg-orange-50 text-orange-600 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-orange-200">
            {doc.categoria}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-gray-100 p-1 rounded-lg flex gap-1 border border-gray-200">
            <button
              onClick={() => setModoView('leitura')}
              disabled={!doc.secoes || doc.secoes.length === 0}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                modoView === 'leitura' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed'
              }`}
            >
              Leitura Adaptativa
            </button>
            <button
              onClick={() => setModoView('pdf')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                modoView === 'pdf' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              PDF Original
            </button>
          </div>

          {/* O Download agora usa a URL absoluta */}
          <a
            href={fullPdfUrl}
            download
            target="_blank"
            rel="noopener noreferrer"
            className="bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm"
          >
            📥 Baixar PDF
          </a>
        </div>
      </header>

      <div className="flex flex-1 max-w-7xl w-full mx-auto p-6 gap-6">
        {modoView === 'leitura' && doc.secoes && doc.secoes.length > 0 && (
          <aside className="w-80 flex-shrink-0">
            <div className="sticky top-24 bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 px-2">Índice do Documento</h2>
              <nav className="space-y-1">
                {doc.secoes.map((secao) => (
                  <button
                    key={secao.id}
                    onClick={() => {
                      setSecaoAtiva(secao.id);
                      document.getElementById(secao.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }}
                    className={`w-full text-left text-sm py-2 px-3 rounded-lg transition-colors flex items-center justify-between font-medium ${
                      secaoAtiva === secao.id ? 'bg-orange-50 text-orange-600 font-semibold' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <span className="truncate">{secao.titulo}</span>
                  </button>
                ))}
              </nav>
            </div>
          </aside>
        )}

        <main className={`flex-1 bg-white rounded-xl border border-gray-200 p-2 shadow-sm min-h-[75vh] ${modoView === 'leitura' ? 'p-8' : ''}`}>
          {modoView === 'leitura' ? (
            <article className="space-y-10 max-w-3xl mx-auto">
              {doc.secoes?.map((secao) => (
                <section key={secao.id} id={secao.id} className="scroll-mt-28 border-b border-gray-100 pb-8 last:border-none">
                  <h2 className="text-xl font-bold text-gray-900 mb-3">{secao.titulo}</h2>
                  <p className="text-gray-600 leading-relaxed whitespace-pre-line">{secao.conteudo}</p>
                </section>
              ))}
            </article>
          ) : (
            <iframe src={`${fullPdfUrl}#toolbar=0`} className="w-full h-full rounded-lg" title={doc.titulo} />
          )}
        </main>
      </div>
    </div>
  );
}