'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

const categorias = [
  { slug: 'todos', label: 'Todos os Documentos' },
  { slug: 'manuais', label: 'Manuais' },
  { slug: 'contratos', label: 'Contratos e Termos' },
  { slug: 'tecnico', label: 'Guias Técnicos' },
  { slug: 'comercial', label: 'Material Comercial' },
]

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const searchParams = useSearchParams()
  const currentCategory = searchParams.get('q') || 'todos'

  const toggleMenu = () => setIsOpen(!isOpen)

  return (
    <>
      {/* BOTÃO MOBILE (Exibido apenas em telas pequenas < md) */}
      <div className="md:hidden fixed top-3 left-4 z-50">
        <button
          onClick={toggleMenu}
          className="p-2 rounded-lg bg-white border border-gray-200 shadow-sm text-gray-700 hover:text-orange-600 focus:outline-none"
          aria-label="Abrir Menu"
        >
          {isOpen ? (
            /* Ícone de Fechar (X) */
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            /* Ícone Hambúrguer */
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* OVERLAY ESCURO NO MOBILE (Quando o menu estiver aberto) */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="md:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm transition-opacity"
        />
      )}

      {/* SIDEBAR CONTAINER */}
      <aside
        className={`
          fixed top-0 left-0 z-40 h-screen bg-white border-r border-gray-200 w-64 p-5 flex flex-col transition-transform duration-300 ease-in-out
          /* Mobile behavior */
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          /* Desktop behavior (Sempre visível e fixo em telas >= md) */
          md:translate-x-0 md:static md:z-auto
        `}
      >
        {/* LOGO DA IEZ */}
        <div className="flex items-center justify-center py-4 mb-6 border-b border-gray-100">
          <Image
            src="/iez-logo-oficial.png"
            alt="iez! telecom"
            width={130}
            height={40}
            priority
            className="h-auto w-auto"
          />
        </div>

        {/* NAVEGAÇÃO DE CATEGORIAS */}
        <nav className="flex-1 space-y-1">
          <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Categorias
          </p>
          {categorias.map((cat) => {
            const isActive = currentCategory === cat.slug
            return (
              <Link
                key={cat.slug}
                href={`/?q=${cat.slug}`}
                onClick={() => setIsOpen(false)} // Fecha o menu ao clicar no mobile
                className={`
                  flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors
                  ${
                    isActive
                      ? 'bg-orange-50 text-orange-600 font-semibold'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-orange-500'
                  }
                `}
              >
                {cat.label}
              </Link>
            )
          })}
        </nav>

        {/* RODAPÉ DA SIDEBAR */}
        <div className="pt-4 border-t border-gray-100 text-xs text-gray-400 text-center">
          iez! Partner Hub &copy; {new Date().getFullYear()}
        </div>
      </aside>
    </>
  )
}