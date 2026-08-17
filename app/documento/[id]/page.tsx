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
  const [modoView, setModoView] = useState<'leitura' | 'pdf'>('pdf');
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
          setModoView('leitura');
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
          <p className="text-sm font-medium text-gray-500">Carregando documento do iez! Hub...</p>
        </div>
      </div>
    );
  }

  if (!doc) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center font-sans">
        <div className="text-center bg-white p-8 rounded-xl border border-gray-200 shadow-sm max-w-md">
          <h1 className="text-xl font-bold text-gray-900 mb-2">Documento não encontrado</h1>
          <p className="text-sm text-gray-500 mb-6">O arquivo solicitado não foi localizado no servidor.</p>
          <Link href="/" className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-2.5 px-5 rounded-lg text-sm transition-colors">
            ← Voltar para o início
          </Link>
        </div>
      </div>
    );
  }

  // Concatena explicitamente a URL do Render quando o caminho retornado é relativo (/uploads/...)
  const fullPdfUrl = doc.pdfUrl.startsWith('http') ? doc.pdfUrl : `${API_URL}${doc.pdfUrl}`;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-800">
      <header className="sticky top-0 z-20 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-sm font-semibold text-gray-500 hover:text-orange-600 transition-colors flex items-center gap-1">
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
                modoView === 'leitura' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-900 disabled:opacity-40 disabled:cursor-not-allowed'
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

          <a
            href={fullPdfUrl}
            download
            target="_blank"
            rel="noopener noreferrer"
            className="bg-orange-600 hover:bg-orange-700 text-white text-sm font-bold px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm"
          >
            📥 Baixar PDF
          </a>
        </div>
      </header>

      <div className="flex flex-1 max-w-7xl w-full mx-auto p-6 gap-6">
        <main className="flex-1 bg-white rounded-xl border border-gray-200 shadow-sm min-h-[75vh] overflow-hidden p-2">
          <iframe src={`${fullPdfUrl}#toolbar=0`} className="w-full h-full min-h-[75vh] rounded-lg border-none" title={doc.titulo} />
        </main>
      </div>
    </div>
  );
}