'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function DocumentoViewerPage({ params }: { params: { id: string } }) {
  // Índice mockado para navegação do leitor
  const sumario = [
    { id: 'sec-1', titulo: '1. Visão Geral do Produto' },
    { id: 'sec-2', titulo: '2. Processo de Vendas' },
    { id: 'sec-3', titulo: '3. Diretrizes de Atendimento' },
    { id: 'sec-4', titulo: '4. Tabela de Preços e Pacotes' },
    { id: 'sec-5', titulo: '5. Suporte Técnico e SLA' },
  ];

  const [secaoAtiva, setSecaoAtiva] = useState('sec-1');

  const handleDownload = () => {
    alert('Iniciando o download do arquivo PDF...');
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 font-sans overflow-hidden">
      
      {/* BARRA SUPERIOR DO LEITOR (Ações do Documento) */}
      <div className="h-14 bg-white border-b border-gray-200 px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="text-xs font-semibold text-gray-500 hover:text-orange-600 transition-colors flex items-center gap-1"
          >
            ← Voltar ao Hub
          </Link>
          <div className="h-4 w-px bg-gray-200"></div>
          <h1 className="text-sm font-bold text-gray-900 truncate">
            Manual de Vendas e Atendimento (PDF)
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleDownload}
            className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs px-3.5 py-1.5 rounded-lg transition-colors shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Baixar PDF
          </button>
        </div>
      </div>

      {/* ÁREA PRINCIPAL DO LEITOR (Índice + Conteúdo) */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        
        {/* NAVEGAÇÃO LATERAL (Índice / Tópicos) */}
        <aside className="w-64 bg-white border-r border-gray-200 p-4 overflow-y-auto shrink-0 hidden md:block">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3 px-2">
            Índice do Documento
          </p>
          <nav className="space-y-1">
            {sumario.map((item) => (
              <button
                key={item.id}
                onClick={() => setSecaoAtiva(item.id)}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  secaoAtiva === item.id
                    ? 'bg-orange-50 text-orange-700 font-bold border border-orange-100'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                {item.titulo}
              </button>
            ))}
          </nav>
        </aside>

        {/* ÁREA DE VISUALIZAÇÃO DO CONTEÚDO */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto bg-gray-100/60 flex justify-center">
          <div className="w-full max-w-4xl bg-white min-h-[800px] rounded-xl border border-gray-200 p-8 shadow-sm">
            
            {/* Exemplo de Conteúdo Renderizado (ou Iframe do PDF) */}
            <div className="prose prose-orange max-w-none">
              <span className="text-[10px] font-bold text-orange-600 uppercase bg-orange-50 px-2 py-0.5 rounded border border-orange-100">
                Visualização do Leitor
              </span>
              <h2 className="text-2xl font-bold text-gray-900 mt-4 mb-2">
                1. Visão Geral do Produto
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed mb-4">
                Este manual fornece ao parceiro as principais informações, insumos e insights para que ele possa realizar suas vendas com eficiência e padrão de excelência iez! telecom.
              </p>

              {/* SIMULAÇÃO DE PDF EMBUTIDO (Pode usar um <iframe> apontando para o PDF real) */}
              <div className="my-6 border border-gray-200 rounded-lg overflow-hidden bg-gray-50 h-[500px] flex items-center justify-center">
                <iframe
                  src="https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
                  className="w-full h-full border-none"
                  title="Visualizador de PDF"
                />
              </div>

            </div>

          </div>
        </main>

      </div>
    </div>
  );
}