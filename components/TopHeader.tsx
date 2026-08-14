'use client';

import { useEffect, useState, FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface UserData {
  name: string;
  role: string;
  company: string;
}

export default function TopHeader() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<UserData | null>(null);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');

  // Lê os dados e escuta mudanças na memória do navegador em tempo real
  useEffect(() => {
    const loadUser = () => {
      const storedUser = localStorage.getItem('iez_user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      } else {
        setUser(null);
      }
    };

    // Carrega na montagem inicial
    loadUser();

    // Escuta eventos de storage (ex: login/logout em outras abas ou componentes)
    window.addEventListener('storage', loadUser);
    
    // Cleanup do listener
    return () => {
      window.removeEventListener('storage', loadUser);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('iez_token');
    localStorage.removeItem('iez_user');
    setUser(null);
    
    // Força o evento de storage para a mesma aba também reagir (caso necessário)
    window.dispatchEvent(new Event('storage'));
    
    router.push('/login');
  };

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/?q=${encodeURIComponent(searchTerm)}`);
    } else {
      router.push('/');
    }
  };

  const getInitials = (name: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    return parts.length >= 2
      ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
      : name.substring(0, 2).toUpperCase();
  };

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 w-full shrink-0 font-sans">
      
      <form onSubmit={handleSearch} className="w-full max-w-md">
        <input
          type="text"
          placeholder="Buscar processos, PDFs, vídeos (Aperte Enter)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-xs focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all text-gray-700"
        />
      </form>

      <div className="flex items-center gap-4">
        {user ? (
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-gray-900 leading-tight">{user.name}</p>
              <p className="text-[10px] font-semibold text-orange-600 uppercase mt-0.5">
                {user.role === 'IEZ_ADMIN' ? 'ADMIN' : user.role === 'COMPANY_ADMIN' ? 'ADMIN' : 'USER'} 
                <span className="text-gray-400 mx-1">|</span> 
                <span className="text-gray-500">{user.company}</span>
              </p>
            </div>
            
            <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center font-bold text-xs border border-orange-200 shadow-sm">
              {getInitials(user.name)}
            </div>
            
            <button
              onClick={handleLogout}
              className="text-[11px] font-semibold text-gray-400 hover:text-orange-600 ml-2 transition-colors border-l border-gray-200 pl-3"
            >
              Sair
            </button>
          </div>
        ) : (
          <Link
            href="/login"
            className="text-xs font-semibold text-orange-600 hover:text-orange-700 transition-colors"
          >
            Entrar
          </Link>
        )}
      </div>
    </header>
  );
}