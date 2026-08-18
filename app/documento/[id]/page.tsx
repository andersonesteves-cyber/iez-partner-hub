'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function DocumentoDetalhes({ params }: { params: { id: string } }) {
  const [documento, setDocumento] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  useEffect(() => {
    const fetchDocumento = async () => {
      try {
        const response = await fetch(`${API_URL}/api/documentos/${params.id}`);
        
        if (!response.ok) {
          throw new Error('Documento não encontrado no banco de dados.');
        }

        const data = await response.json();
        setDocumento(data);
      } catch (err: any) {
        console.error(err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDocumento();
  }, [API_URL, params.id]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-orange-600"></div>
      </div>
    );
  }

  if (error || !documento) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <div className="text-4xl">📄</div>
        <h2 className="text-xl font-bold text-gray-900">Documento indisponível</h2>
        <p className="text-sm text-gray-500">O arquivo pode ter sido excluído ou você não tem permissão.</p>
        <Link href="/" className="mt-4 bg-orange-100 text-orange-600 px-6 py-2 rounded-lg font-bold hover:bg-orange-200 transition-colors">
          Voltar para o Acervo
        </Link>
      </div>
    );
  }

  // Garante que o iframe e o download apontem para o Render e não para a Vercel
  const fullPdfUrl = documento.pdfUrl?.startsWith('http') 
    ? documento.pdfUrl 
    : `${API_URL}${documento.pdfUrl}`;

  return (
    <div className="space-y-6 font-sans h-[calc(100vh-100px)] flex flex-col">
      
      {/* CABEÇALHO DO LEITOR */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4 shrink-0">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <button 
            onClick={() => router.push('/')} 
            className="text-sm font-medium text-gray-400 hover:text-orange-600 transition-colors flex items-center gap-1"
          >
            <span>←</span> Voltar
          </button>
          <div className="h-6 w-px bg-gray-200"></div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <h1 className="text-lg font-bold text-gray-900 truncate max-w-md" title={documento.titulo}>
              {documento.titulo}
            </h1>
            <span className="inline-flex w-fit bg-orange-50 text-orange-600 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider">
              {documento.categoria}
            </span>
          </div>
        </div>

        <a 
          href={fullPdfUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-2.5 px-6 rounded-lg shadow-sm transition-colors text-sm flex items-center gap-2 w-full sm:w-auto justify-center"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Baixar PDF Original
        </a>
      </div>

      {/* LEITOR DE PDF (IFRAME) */}
      <div className="flex-1 bg-gray-100 rounded-xl border border-gray-200 overflow-hidden relative shadow-inner">
        {documento.pdfUrl ? (
          <iframe 
            src={`${fullPdfUrl}#view=FitH`} // O #view=FitH faz o PDF abrir preenchendo a largura
            className="w-full h-full border-none"
            title={`Leitor do documento ${documento.titulo}`}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-3">
            <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="font-medium">Nenhum arquivo PDF anexado a este registro.</span>
          </div>
        )}
      </div>

    </div>
  );
}