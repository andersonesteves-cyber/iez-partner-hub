'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import TopHeader from './TopHeader';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const storedUser = localStorage.getItem('iez_user');
      const storedToken = localStorage.getItem('iez_token');
      const isLoginPage = pathname === '/login';

      if (!storedUser || !storedToken) {
        setIsAuthenticated(false);
        setLoading(false);
        if (!isLoginPage) {
          router.replace('/login');
        }
      } else {
        setIsAuthenticated(true);
        setLoading(false);
        if (isLoginPage) {
          router.replace('/');
        }
      }
    };

    checkAuth();
  }, [pathname, router]);

  // Se estiver na tela de login, exibe apenas o formulário sem Sidebar/Header
  if (pathname === '/login') {
    return <>{children}</>;
  }

  // Enquanto valida a sessão, exibe tela de carregamento com a identidade da iez!
  if (loading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-gray-50 font-sans selection:bg-orange-100 selection:text-orange-900">
        <div className="w-10 h-10 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mb-4" />
        <p className="text-xs font-semibold text-gray-500">Verificando credenciais...</p>
      </div>
    );
  }

  // Se não houver autenticação, bloqueia completamente a renderização do acervo
  if (!isAuthenticated) {
    return null;
  }

  // Layout Protegido Interno (Sidebar + Header + Conteúdo)
  return (
    <div className="flex h-screen w-full overflow-hidden bg-gray-50 selection:bg-orange-100 selection:text-orange-900">
      <Suspense fallback={<div className="w-64 bg-white border-r border-gray-100 h-screen hidden md:block shrink-0" />}>
        <Sidebar />
      </Suspense>

      <div className="flex-1 flex flex-col min-w-0 h-full relative overflow-hidden">
        <Suspense fallback={<div className="h-16 bg-white border-b border-gray-100 shrink-0" />}>
          <TopHeader />
        </Suspense>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 w-full max-w-7xl mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}