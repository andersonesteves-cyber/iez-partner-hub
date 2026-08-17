'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

interface SidebarProps {
  isMobileOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isMobileOpen = false, onClose }: SidebarProps) {
  const searchParams = useSearchParams();
  const currentQuery = searchParams.get('q') || '';

  const handleLinkClick = () => {
    if (onClose) onClose();
  };

  const menuContent = (
    <>
      {/* LOGO */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-gray-100 shrink-0">
        <Link href="/" onClick={handleLinkClick} className="relative w-24 h-8 block">
          <Image
            src="/iez-logo-oficial.png"
            alt="iez! telecom"
            fill
            className="object-contain"
            priority
          />
        </Link>
        {onClose && (
          <button
            onClick={onClose}
            className="md:hidden p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            ✕
          </button>
        )}
      </div>

      <nav className="flex-1 py-6 px-4 space-y-6 overflow-y-auto">
        {/* INÍCIO */}
        <div>
          <Link
            href="/"
            onClick={handleLinkClick}
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
            <Link
              href="/"
              onClick={handleLinkClick}
              className={`block px-3 py-1.5 text-sm rounded-lg transition-colors ${!currentQuery ? 'text-orange-600 font-bold' : 'text-gray-600 hover:text-orange-600'}`}
            >
              Todos os Documentos
            </Link>
            <Link
              href="/?q=manuais"
              onClick={handleLinkClick}
              className={`block px-3 py-1.5 text-sm rounded-lg transition-colors ${currentQuery === 'manuais' ? 'text-orange-600 font-bold bg-orange-50' : 'text-gray-600 hover:text-orange-600'}`}
            >
              Manuais
            </Link>
            <Link
              href="/?q=contratos"
              onClick={handleLinkClick}
              className={`block px-3 py-1.5 text-sm rounded-lg transition-colors ${currentQuery === 'contratos' ? 'text-orange-600 font-bold bg-orange-50' : 'text-gray-600 hover:text-orange-600'}`}
            >
              Contratos e Termos
            </Link>
            <Link
              href="/?q=guias"
              onClick={handleLinkClick}
              className={`block px-3 py-1.5 text-sm rounded-lg transition-colors ${currentQuery === 'guias' ? 'text-orange-600 font-bold bg-orange-50' : 'text-gray-600 hover:text-orange-600'}`}
            >
              Guias Técnicos
            </Link>
            <Link
              href="/?q=marketing"
              onClick={handleLinkClick}
              className={`block px-3 py-1.5 text-sm rounded-lg transition-colors ${currentQuery === 'marketing' ? 'text-orange-600 font-bold bg-orange-50' : 'text-gray-600 hover:text-orange-600'}`}
            >
              Material Comercial
            </Link>
          </div>
        </div>

        {/* ADMINISTRAÇÃO & RECURSOS */}
        <div>
          <p className="px-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
            Administração & Atalhos
          </p>
          <div className="space-y-1">
            <Link
              href="/usuarios"
              onClick={handleLinkClick}
              className="block px-3 py-1.5 text-sm text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
            >
              Gestão de Acessos
            </Link>
            <Link
              href="/parceiros"
              onClick={handleLinkClick}
              className="block px-3 py-1.5 text-sm text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
            >
              Gestão de Parceiros
            </Link>
            <Link
              href="/links-uteis"
              onClick={handleLinkClick}
              className="block px-3 py-1.5 text-sm text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
            >
              🔗 Links Úteis
            </Link>
          </div>
        </div>
      </nav>

      <div className="p-4 border-t border-gray-100 bg-gray-50/50">
        <p className="text-[10px] text-gray-400 font-medium text-center">
          iez! Partner Hub © 2026
        </p>
      </div>
    </>
  );

  return (
    <>
      <aside className="hidden md:flex w-64 bg-white border-r border-gray-100 flex-col shrink-0 z-20 h-screen font-sans">
        {menuContent}
      </aside>

      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-40 md:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 w-64 bg-white z-50 flex flex-col h-full font-sans shadow-2xl transition-transform duration-300 ease-in-out md:hidden ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {menuContent}
      </aside>
    </>
  );
}