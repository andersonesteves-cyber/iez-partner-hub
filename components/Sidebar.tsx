'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function Sidebar() {
  const searchParams = useSearchParams();
  const currentQuery = searchParams.get('q') || '';

  return (
    <aside className="w-64 bg-white border-r border-gray-100 flex flex-col shrink-0 z-10 h-screen font-sans">
      {/* LOGO */}
      <div className="h-16 flex items-center px-6 border-b border-gray-100 shrink-0">
        <Link href="/" className="relative w-24 h-8 block">
          <Image
            src="/iez-logo-oficial.png"
            alt="iez! telecom"
            fill
            className="object-contain"
            priority
          />
        </Link>
      </div>

      <nav className="flex-1 py-6 px-4 space-y-6 overflow-y-auto">
        {/* INÍCIO */}
        <div>
          <Link
            href="/"
            className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
              !currentQuery ? 'bg-orange-50 text-orange-600 font-bold' : 'text-gray-700 hover:text-orange-600 hover:bg-orange-50'
            }`}
          >
            <span>🏠</span> Início
          </Link>
        </div>

        {/* CATEGORIAS */}
        <div>
          <p className="px-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
            Categorias
          </p>
          <div className="space-y-1">
            <Link href="/" className={`block px-3 py-1.5 text-sm rounded-lg transition-colors ${!currentQuery ? 'text-orange-600 font-bold' : 'text-gray-600 hover:text-orange-600'}`}>
              Todos os Documentos
            </Link>
            <Link href="/?q=manuais" className={`block px-3 py-1.5 text-sm rounded-lg transition-colors ${currentQuery === 'manuais' ? 'text-orange-600 font-bold bg-orange-50' : 'text-gray-600 hover:text-orange-600'}`}>
              Manuais
            </Link>
            <Link href="/?q=contratos" className={`block px-3 py-1.5 text-sm rounded-lg transition-colors ${currentQuery === 'contratos' ? 'text-orange-600 font-bold bg-orange-50' : 'text-gray-600 hover:text-orange-600'}`}>
              Contratos e Termos
            </Link>
            <Link href="/?q=guias" className={`block px-3 py-1.5 text-sm rounded-lg transition-colors ${currentQuery === 'guias' ? 'text-orange-600 font-bold bg-orange-50' : 'text-gray-600 hover:text-orange-600'}`}>
              Guias Técnicos
            </Link>
            <Link href="/?q=marketing" className={`block px-3 py-1.5 text-sm rounded-lg transition-colors ${currentQuery === 'marketing' ? 'text-orange-600 font-bold bg-orange-50' : 'text-gray-600 hover:text-orange-600'}`}>
              Material Comercial
            </Link>
          </div>
        </div>

        {/* ADMINISTRAÇÃO */}
        <div>
          <p className="px-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
            Administração
          </p>
          <div className="space-y-1">
            <Link href="/usuarios" className="block px-3 py-1.5 text-sm text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors">
              Gestão de Acessos
            </Link>
            <Link href="/parceiros" className="block px-3 py-1.5 text-sm text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors">
              Gestão de Parceiros
            </Link>
          </div>
        </div>
      </nav>

      <div className="p-4 border-t border-gray-100 bg-gray-50/50">
        <p className="text-[10px] text-gray-400 font-medium text-center">
          iez! Partner Hub © 2026
        </p>
      </div>
    </aside>
  );
}