'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface EmpresaAtiva {
  id: string;
  nome: string;
  status?: string;
}

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingEmpresas, setLoadingEmpresas] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Estados do formulário
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [nome, setNome] = useState('');
  const [empresa, setEmpresa] = useState('');
  const [perfil, setPerfil] = useState('USER');

  // Lista de empresas parceiras ativas
  const [empresasAtivas, setEmpresasAtivas] = useState<EmpresaAtiva[]>([]);

  const API_URL = 'https://api-iez-partner-hub.onrender.com';

  useEffect(() => {
    fetchEmpresasAtivas();
  }, []);

  const fetchEmpresasAtivas = async () => {
    setLoadingEmpresas(true);
    try {
      const res = await fetch(`${API_URL}/api/empresas`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          // Normalizador tolerante a caixa alta/baixa e nomes de propriedades
          const ativas = data
            .map((emp: any) => ({
              id: String(emp.id),
              nome: emp.nome || emp.name || 'Empresa Sem Nome',
              status: emp.status || 'Ativo',
            }))
            .filter((emp) => emp.status.toString().toLowerCase() === 'ativo');

          setEmpresasAtivas(ativas);
          if (ativas.length > 0) {
            setEmpresa(ativas[0].nome);
          }
        }
      }
    } catch (err) {
      console.warn('Servidor indisponível, aplicando fallback de empresas ativas.');
      const fallback = [
        { id: '1', nome: 'Zamix', status: 'Ativo' },
        { id: '2', nome: 'NetSpeed', status: 'Ativo' },
      ];
      setEmpresasAtivas(fallback);
      setEmpresa('Zamix');
    } fontually {
      setLoadingEmpresas(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || !data) {
        throw new Error(data?.message || 'E-mail ou senha inválidos. Tente novamente.');
      }

      setMessage({ type: 'success', text: 'Login realizado! Redirecionando...' });

      if (data.user) {
        localStorage.setItem('iez_user', JSON.stringify(data.user));
        localStorage.setItem('user', JSON.stringify(data.user));
      }
      if (data.token) {
        localStorage.setItem('iez_token', data.token);
      }

      window.location.href = '/';
    } catch (err: any) {
      setMessage({
        type: 'error',
        text: err.message === 'Failed to fetch' ? 'Servidor indisponível. Verifique se a API está rodando.' : err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!empresa) {
      setMessage({ type: 'error', text: 'Selecione uma empresa parceira com contrato ativo.' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch(`${API_URL}/api/solicitacoes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, email, empresa, senha, perfil }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.message || 'Erro ao realizar cadastro.');
      }

      setMessage({ type: 'success', text: 'Cadastro realizado com sucesso! Aguardando aprovação.' });

      setNome('');
      setSenha('');
      setPerfil('USER');
      if (empresasAtivas.length > 0) {
        setEmpresa(empresasAtivas[0].nome);
      }
    } catch (err: any) {
      setMessage({
        type: 'error',
        text: err.message === 'Failed to fetch' ? 'Servidor indisponível. Verifique se a API está rodando.' : err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsRegister(!isRegister);
    setMessage(null);
    setSenha('');
    if (!isRegister) {
      fetchEmpresasAtivas();
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4 font-sans selection:bg-orange-100 selection:text-orange-900">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 p-8 relative">
        <div className="flex flex-col items-center mb-8">
          <div className="relative w-28 h-10 mb-4">
            <Image
              src="/iez-logo-oficial.png"
              alt="iez! telecom"
              fill
              className="object-contain"
              priority
            />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isRegister ? 'Solicitar Acesso' : 'Acesse sua conta'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Portal de Documentos - iez! Partner Hub
          </p>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-lg text-sm text-center font-medium ${
            message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {message.text}
          </div>
        )}

        <form onSubmit={isRegister ? handleRegister : handleLogin} className="space-y-4">
          {isRegister && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nome Completo *</label>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              E-mail corporativo {isRegister && '*'}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-orange-500 outline-none"
              required
            />
          </div>

          {isRegister && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Empresa Parceira *
              </label>
              {loadingEmpresas ? (
                <div className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm bg-gray-50 text-gray-400 font-medium">
                  Carregando parceiros ativos...
                </div>
              ) : empresasAtivas.length > 0 ? (
                <select
                  value={empresa}
                  onChange={(e) => setEmpresa(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-orange-500 outline-none bg-white font-medium text-gray-800"
                  required
                >
                  {empresasAtivas.map((emp) => (
                    <option key={emp.id} value={emp.nome}>
                      {emp.nome}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 font-medium">
                  Nenhuma empresa parceira com contrato ativo no momento. Entre em contato com a iez! telecom para solicitar a liberação do cadastro.
                </div>
              )}
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-semibold text-gray-700">
                Senha {isRegister && '*'}
              </label>
              {!isRegister && (
                <button type="button" className="text-xs font-semibold text-orange-600 hover:text-orange-700">
                  Esqueceu a senha?
                </button>
              )}
            </div>
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-orange-500 outline-none"
              required
            />
          </div>

          {isRegister && (
            <div className="pt-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Perfil Solicitado</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPerfil('USER')}
                  className={`p-3 rounded-lg border text-left flex flex-col transition-all ${
                    perfil === 'USER' ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-orange-200'
                  }`}
                >
                  <span className={`text-sm font-bold ${perfil === 'USER' ? 'text-orange-800' : 'text-gray-700'}`}>
                    Colaborador
                  </span>
                  <span className="text-xs text-gray-400 mt-1">Aprovação local</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPerfil('COMPANY_ADMIN')}
                  className={`p-3 rounded-lg border text-left flex flex-col transition-all ${
                    perfil === 'COMPANY_ADMIN' ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-orange-200'
                  }`}
                >
                  <span className={`text-sm font-bold ${perfil === 'COMPANY_ADMIN' ? 'text-orange-800' : 'text-gray-700'}`}>
                    Admin Empresa
                  </span>
                  <span className="text-xs text-gray-400 mt-1">Aprovação iez!</span>
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || (isRegister && empresasAtivas.length === 0)}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-4 rounded-lg transition-colors mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Aguarde...' : isRegister ? 'Finalizar Solicitação' : 'Entrar no Portal'}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-gray-100 pt-6">
          <p className="text-sm text-gray-500">
            {isRegister ? (
              <button onClick={toggleMode} className="font-semibold text-gray-600 hover:text-orange-600 transition-colors">
                ← Voltar ao Login
              </button>
            ) : (
              <>
                Não possui acesso?{' '}
                <button onClick={toggleMode} className="font-bold text-orange-600 hover:text-orange-700 transition-colors">
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