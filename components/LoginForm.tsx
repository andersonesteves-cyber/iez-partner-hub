'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    setCarregando(true);

    // Obtém a URL da API da variável de ambiente (Vercel) ou usa localhost
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'E-mail ou senha inválidos.');
      }

      // Salva o token / usuário no armazenamento local
      if (data.token) {
        localStorage.setItem('iez_token', data.token);
      }
      if (data.user) {
        localStorage.setItem('iez_user', JSON.stringify(data.user));
      }

      router.push('/');
      router.refresh();
    } catch (err: any) {
      setErro(
        err.message === 'Failed to fetch'
          ? 'O servidor está inicializando. Por favor, aguarde alguns segundos e tente novamente.'
          : err.message || 'Erro ao realizar login.'
      );
    } finally {
      setCarregando(false);
    }
  };

  return (
    <form onSubmit={handleLogin} className="space-y-4 text-left">
      {erro && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-md text-center">
          {erro}
        </div>
      )}

      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">
          E-mail corporativo
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="seu.nome@iez.com.br"
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
      </div>

      <div>
        <div className="flex justify-between items-center mb-1">
          <label className="block text-xs font-semibold text-gray-700">
            Senha
          </label>
          <a href="#" className="text-xs text-orange-600 hover:underline">
            Esqueceu a senha?
          </a>
        </div>
        <input
          type="password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          required
          placeholder="••••••••"
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
      </div>

      <button
        type="submit"
        disabled={carregando}
        className="w-full py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-medium text-sm rounded-md transition duration-200 disabled:opacity-50"
      >
        {carregando ? 'Conectando ao servidor...' : 'Entrar no Portal'}
      </button>
    </form>
  );
}