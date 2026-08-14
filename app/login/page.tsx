'use client';

import { useState, FormEvent } from 'react';
import Image from 'next/image';

// Utiliza a variável de ambiente se existir, ou fallback para localhost
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function LoginPage() {
  // Alterna entre a visualização de Login e de Cadastro
  const [isRegistering, setIsRegistering] = useState(false);

  // Estados gerais
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Campos do formulário
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('USER'); // 'USER' = Colaborador, 'COMPANY_ADMIN' = Admin Empresa

  // ---------------------------------------------------------------------------
  // FUNÇÃO DE LOGIN (COM TRATAMENTO DE ERROS E LOCALSTORAGE)
  // ---------------------------------------------------------------------------
  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch(`${API_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.success) {
        throw new Error(data?.error || data?.message || 'E-mail ou senha inválidos. Tente novamente.');
      }

      setMessage({ type: 'success', text: 'Login realizado! Redirecionando...' });
      
      // ========================================================
      // SALVANDO OS DADOS NO NAVEGADOR PARA O HEADER LER
      // ========================================================
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('iez_partner_user', JSON.stringify(data.user));
      }
      if (data.token) {
        localStorage.setItem('token', data.token);
      }
      
      // Redireciona e recarrega a página para atualizar os contextos da aplicação
      window.location.href = '/';
    } catch (err: any) {
      const errorMsg = err.message === 'Failed to fetch' 
        ? 'Servidor indisponível. Verifique se a API está rodando.' 
        : err.message;
      setMessage({ type: 'error', text: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // FUNÇÃO DE CADASTRO
  // ---------------------------------------------------------------------------
  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch(`${API_URL}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, company, role }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.error || data?.message || 'Erro ao realizar cadastro.');
      }

      setMessage({ type: 'success', text: 'Cadastro realizado com sucesso! Aguardando aprovação.' });
      
      // Limpa os campos após enviar
      setName('');
      setPassword('');
      setCompany('');
      setRole('USER');
    } catch (err: any) {
      const errorMsg = err.message === 'Failed to fetch' 
        ? 'Servidor indisponível. Verifique se a API está rodando.' 
        : err.message;
      setMessage({ type: 'error', text: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  const toggleView = () => {
    setIsRegistering(!isRegistering);
    setMessage(null);
    setPassword('');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4 font-sans">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 p-8 relative">
        
        {/* Cabeçalho do Card */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative w-28 h-10 mb-4">
            <Image src="/iez-logo-oficial.png" alt="iez! telecom" fill className="object-contain" priority />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isRegistering ? 'Solicitar Acesso' : 'Acesse sua conta'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">Portal de Documentos - iez! Partner Hub</p>
        </div>

        {/* Mensagens de Feedback */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg text-sm text-center font-medium ${
              message.type === 'success'
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Formulário Dinâmico */}
        <form onSubmit={isRegistering ? handleRegister : handleLogin} className="space-y-4">
          
          {isRegistering && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nome Completo *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              E-mail corporativo {isRegistering && '*'}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-blue-50/30 border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
              required
            />
          </div>

          {isRegistering && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Empresa Parceira *</label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                required
              />
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-semibold text-gray-700">
                Senha {isRegistering && '*'}
              </label>
              {!isRegistering && (
                <button type="button" className="text-xs font-semibold text-orange-600 hover:text-orange-700">
                  Esqueceu a senha?
                </button>
              )}
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
              required
            />
          </div>

          {isRegistering && (
            <div className="pt-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Perfil Solicitado</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('USER')}
                  className={`p-3 rounded-lg border text-left flex flex-col transition-all ${
                    role === 'USER' ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-orange-200'
                  }`}
                >
                  <span className={`text-sm font-bold ${role === 'USER' ? 'text-orange-800' : 'text-gray-700'}`}>
                    Colaborador
                  </span>
                  <span className="text-xs text-gray-400 mt-1">Aprovação local</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('COMPANY_ADMIN')}
                  className={`p-3 rounded-lg border text-left flex flex-col transition-all ${
                    role === 'COMPANY_ADMIN' ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-orange-200'
                  }`}
                >
                  <span className={`text-sm font-bold ${role === 'COMPANY_ADMIN' ? 'text-orange-800' : 'text-gray-700'}`}>
                    Admin Empresa
                  </span>
                  <span className="text-xs text-gray-400 mt-1">Aprovação iez!</span>
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white font-bold py-3 px-4 rounded-lg transition-colors mt-6 disabled:opacity-70"
          >
            {loading ? 'Aguarde...' : isRegistering ? 'Finalizar Solicitação' : 'Entrar no Portal'}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-gray-100 pt-6">
          <p className="text-sm text-gray-500">
            {isRegistering ? (
              <button onClick={toggleView} className="font-semibold text-gray-600 hover:text-orange-600 transition-colors">
                ← Voltar ao Login
              </button>
            ) : (
              <>
                Não possui acesso?{' '}
                <button onClick={toggleView} className="font-bold text-orange-600 hover:text-orange-700 transition-colors">
                  Solicitar Cadastro
                </button>
              </>
            )}
          </p>
        </div>

      </div>
    </div>
  );
}