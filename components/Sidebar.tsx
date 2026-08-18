'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';

export default function Sidebar() {
  const searchParams = useSearchParams();
  const currentQuery = searchParams.get('q');

  const categorias = [
    { nome: 'Todos os Documentos', param: '' },
    { nome: 'Manuais', param: 'manuais' },
    { nome: 'Contratos e Termos', param: 'contratos' },
    { nome: 'Guias Técnicos', param: 'guias' },
    { nome: 'Material Comercial', param: 'comercial' },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen sticky top-0 font-sans">
      {/* LOGO E HOME */}
      <div className="p-6 flex flex-col gap-8">
        <Link href="/" className="block px-2">
          <Image 
            src="/iez-logo-oficial.png" 
            alt="iez! telecom logo" 
            width={140} 
            height={48} 
            className="object-contain"
            priority
          />
        </Link>

        {/* BOTÃO HOME */}
        <Link 
          href="/"
          className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors ${
            !currentQuery && typeof window !== 'undefined' && window.location.pathname === '/'
              ? 'bg-orange-50 text-orange-600 font-semibold shadow-sm'
              : 'text-gray-600 font-medium hover:bg-gray-50 hover:text-orange-600'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          Início
        </Link>
      </div>

      {/* CATEGORIAS */}
      <div className="flex-1 px-4 overflow-y-auto">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-4">
          Categorias
        </h3>
        <nav className="space-y-0.5 mb-8">
          {categorias.map((cat) => {
            const href = cat.param ? `/?q=${cat.param}` : '/';
            // Lógica ajustada para o 'Todos os Documentos' não ficar ativo quando outra categoria estiver
            const isActive = cat.param === '' ? currentQuery === null : currentQuery === cat.param;

            return (
              <Link
                key={cat.nome}
                href={href}
                className={`block px-4 py-2 text-sm rounded-lg transition-colors ${
                  isActive
                    ? 'bg-orange-50 text-orange-600 font-semibold'
                    : 'text-gray-600 font-medium hover:bg-gray-50 hover:text-orange-600'
                }`}
              >
                {cat.nome}
              </Link>
            );
          })}
        </nav>

        {/* ÁREA DE ADMINISTRAÇÃO & ATALHOS */}
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-4">
          Administração
        </h3>
        <nav className="space-y-0.5">
          <Link
            href="/usuarios"
            className="block px-4 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-50 hover:text-orange-600 transition-colors"
          >
            Gestão de Acessos
          </Link>
          <Link
            href="/parceiros"
            className="block px-4 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-50 hover:text-orange-600 transition-colors"
          >
            Gestão de Parceiros
          </Link>
          <Link
            href="/links"
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-50 hover:text-orange-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            Links Úteis
          </Link>
        </nav>
      </div>

      {/* FOOTER DA SIDEBAR */}
      <div className="p-6 border-t border-gray-100">
        <p className="text-xs text-gray-400 font-medium">iez! Partner Hub © 2026</p>
      </div>
    </aside>
  );
}