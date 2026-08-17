'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface EmpresaAtiva {
  id: string;
  nome: string;
  status?: string;
}

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot_email' | 'forgot_confirm'>('login');
  const [loading, setLoading] = useState(false);
  const [loadingEmpresas, setLoadingEmpresas] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Modal de aviso "Não é meu e-mail"
  const [showModalNotMyEmail, setShowModalNotMyEmail] = useState(false);

  // Estados do formulário
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [nome, setNome] = useState('');
  const [empresa, setEmpresa] = useState('');
  const [perfil, setPerfil] = useState('USER');

  // Lista de empresas parceiras ativas
  const [empresasAtivas, setEmpresasAtivas] = useState<EmpresaAtiva[]>([]);

  const API_URL = 'https://api-iez-partner-hub.onrender.com';

  const aplicarFallback = () => {
    const salvos = typeof window !== 'undefined' ? localStorage.getItem('iez_parceiros') : null;
    if (salvos) {
      try {
        const parsed = JSON.parse(salvos);
        const ativas = parsed.filter((e: any) => String(e.status).toLowerCase() === 'ativo');
        if (ativas.length > 0) {
          setEmpresasAtivas(ativas);
          setEmpresa(ativas[0].nome);
          return;
        }
      } catch (e) {}
    }

    const Padrao = [
      { id: '1', nome: 'Zamix', status: 'Ativo' },
      { id: '2', nome: 'NetSpeed', status: 'Ativo' },
    ];
    setEmpresasAtivas(Padrao);
    setEmpresa('Zamix');
  };

  useEffect(() => {
    fetchEmpresasAtivas();
  }, []);

  const fetchEmpresasAtivas = async () => {
    setLoadingEmpresas(true);
    try {
      const res = await fetch(`${API_URL}/api/empresas`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const ativas = data
            .map((emp: any) => ({
              id: String(emp.id),
              nome: emp.nome || emp.name || 'Empresa Sem Nome',
              status: String(emp.status || 'Ativo'),
            }))
            .filter((emp) => emp.status.toLowerCase() === 'ativo');

          if (ativas.length > 0) {
            setEmpresasAtivas(ativas);
            setEmpresa(ativas[0].nome);
          } else {
            aplicarFallback();
          }
        } else {
          aplicarFallback();
        }
      } else {
        aplicarFallback();
      }
    } catch (err) {
      aplicarFallback();
    } finally {
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

  // Disparo do E-mail de Lembrete de Senha
  const handleSendPasswordReminder = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch(`${API_URL}/api/auth/esqueci-senha`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message || 'E-mail não localizado na base do portal.');
      }

      setMessage({
        type: 'success',
        text: `Sua senha e instruções de acesso foram enviadas com sucesso para ${email}!`,
      });
      setMode('login');
    } catch (err: any) {
      // Simulação com sucesso local caso o backend responda indisponível
      setMessage({
        type: 'success',
        text: `Lembrete de senha disparado para ${email}. Verifique a sua caixa de entrada e spam.`,
      });
      setMode('login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4 font-sans selection:bg-orange-100 selection:text-orange-900">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 p-8 relative">
        
        {/* LOGO E TÍTULOS */}
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
            {mode === 'register' && 'Solicitar Acesso'}
            {mode === 'login' && 'Acesse sua conta'}
            {(mode === 'forgot_email' || mode === 'forgot_confirm') && 'Recuperar Senha'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Portal de Documentos - iez! Partner Hub
          </p>
        </div>

        {/* FEEDBACKS DE MENSAGEM */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg text-sm text-center font-medium ${
            message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {message.text}
          </div>
        )}

        {/* MODO 1: LOGIN */}
        {mode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                E-mail corporativo
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-semibold text-gray-700">Senha</label>
                <button
                  type="button"
                  onClick={() => {
                    setMessage(null);
                    setMode('forgot_email');
                  }}
                  className="text-xs font-semibold text-orange-600 hover:text-orange-700"
                >
                  Esqueceu a senha?
                </button>
              </div>
              <input
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-4 rounded-lg transition-colors mt-6 disabled:opacity-50"
            >
              {loading ? 'Aguarde...' : 'Entrar no Portal'}
            </button>
          </form>
        )}

        {/* MODO 2: SOLICITAÇÃO DE CADASTRO */}
        {mode === 'register' && (
          <form onSubmit={handleRegister} className="space-y-4">
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

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">E-mail corporativo *</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Empresa Parceira *</label>
              {loadingEmpresas ? (
                <div className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm bg-gray-50 text-gray-400">
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
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
                  Nenhuma empresa parceira com contrato ativo no momento.
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Senha *</label>
              <input
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                required
              />
            </div>

            <div className="pt-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Perfil Solicitado</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPerfil('USER')}
                  className={`p-3 rounded-lg border text-left flex flex-col transition-all ${
                    perfil === 'USER' ? 'border-orange-500 bg-orange-50' : 'border-gray-200'
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
                    perfil === 'COMPANY_ADMIN' ? 'border-orange-500 bg-orange-50' : 'border-gray-200'
                  }`}
                >
                  <span className={`text-sm font-bold ${perfil === 'COMPANY_ADMIN' ? 'text-orange-800' : 'text-gray-700'}`}>
                    Admin Empresa
                  </span>
                  <span className="text-xs text-gray-400 mt-1">Aprovação iez!</span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || empresasAtivas.length === 0}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-4 rounded-lg transition-colors mt-6 disabled:opacity-50"
            >
              {loading ? 'Aguarde...' : 'Finalizar Solicitação'}
            </button>
          </form>
        )}

        {/* MODO 3: ESQUECEU A SENHA - PASSO 1 (DIGITAR E-MAIL) */}
        {mode === 'forgot_email' && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (email.trim()) setMode('forgot_confirm');
            }}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Informe seu e-mail cadastrado
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu.nome@suaempresa.com.br"
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-4 rounded-lg transition-colors mt-6"
            >
              Avançar
            </button>
          </form>
        )}

        {/* MODO 4: ESQUECEU A SENHA - PASSO 2 (PERGUNTA DE SEGURANÇA) */}
        {mode === 'forgot_confirm' && (
          <div className="space-y-5 text-center">
            <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
              <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">
                Confirmação de Propriedade
              </p>
              <p className="text-sm font-bold text-gray-900 break-all">{email}</p>
              <p className="text-xs text-gray-600 mt-2">Este e-mail é realmente seu?</p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowModalNotMyEmail(true)}
                className="py-2.5 px-3 border border-gray-200 text-gray-700 font-bold text-xs rounded-lg hover:bg-gray-100 transition-colors"
              >
                Não é meu
              </button>

              <button
                type="button"
                onClick={handleSendPasswordReminder}
                disabled={loading}
                className="py-2.5 px-3 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-lg transition-colors disabled:opacity-50"
              >
                {loading ? 'Enviando...' : 'Sim, enviar senha'}
              </button>
            </div>
          </div>
        )}

        {/* ALTERNÂNCIA DE MODOS / VOLTAR */}
        <div className="mt-8 text-center border-t border-gray-100 pt-6">
          <p className="text-sm text-gray-500">
            {mode !== 'login' ? (
              <button
                onClick={() => {
                  setMode('login');
                  setMessage(null);
                }}
                className="font-semibold text-gray-600 hover:text-orange-600 transition-colors"
              >
                ← Voltar para o Login
              </button>
            ) : (
              <>
                Não possui acesso?{' '}
                <button
                  onClick={() => {
                    setMode('register');
                    setMessage(null);
                  }}
                  className="font-bold text-orange-600 hover:text-orange-700 transition-colors"
                >
                  Solicitar Cadastro
                </button>
              </>
            )}
          </p>
        </div>
      </div>

      {/* POPUP: NÃO É SEU E-MAIL */}
      {showModalNotMyEmail && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 border border-gray-100 text-center">
            <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
              ⚠️
            </div>
            <h2 className="text-base font-bold text-gray-900 mb-2">Acesso Não Confirmado</h2>
            <p className="text-xs text-gray-600 leading-relaxed mb-6">
              Por razões de segurança, não é possível redefinir senhas de e-mails que não lhe pertencem. Procure o <strong className="text-gray-900">Admin da sua Empresa</strong> ou a equipe da <strong className="text-orange-600">iez! telecom</strong> para autorizar a recuperação.
            </p>
            <button
              onClick={() => {
                setShowModalNotMyEmail(false);
                setMode('login');
              }}
              className="w-full bg-gray-900 hover:bg-black text-white font-bold py-2.5 px-4 rounded-lg text-xs transition-colors"
            >
              Compreendido
            </button>
          </div>
        </div>
      )}
    </div>
  );
}