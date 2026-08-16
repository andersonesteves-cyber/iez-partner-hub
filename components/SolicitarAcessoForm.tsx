'use client';

import { useState } from 'react';

type PerfilType = 'COLABORADOR' | 'ADMIN_EMPRESA';

export default function SolicitarAcessoForm() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [empresa, setEmpresa] = useState('');
  const [senha, setSenha] = useState('');
  const [perfil, setPerfil] = useState<PerfilType>('ADMIN_EMPRESA');

  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    setCarregando(true);

// APAGA ESTA LINHA:
// const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// E COLOCA ESTA NO LUGAR:
const API_URL = 'https://api-iez-partner-hub.onrender.com';

    try {
      const res = await fetch(`${API_URL}/api/solicitacoes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome,
          email,
          empresa,
          senha,
          perfil,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Erro ao realizar cadastro.');
      }

      setSucesso(true);
    } catch (err: any) {
      setErro(
        err.message === 'Failed to fetch'
          ? 'Servidor indisponível no momento ou acordando do repouso. Tente novamente em instantes.'
          : err.message || 'Erro ao enviar solicitação.'
      );
    } finally {
      setCarregando(false);
    }
  };

  if (sucesso) {
    return (
      <div className="text-center p-6 bg-white rounded-lg border border-gray-100 shadow-sm space-y-4">
        <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto text-xl font-bold">
          ✓
        </div>
        <h3 className="text-xl font-bold text-gray-900">Solicitação Enviada!</h3>
        <p className="text-sm text-gray-600 max-w-sm mx-auto">
          Sua solicitação foi registrada no banco de dados da <strong className="text-gray-800">iez! telecom</strong>.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-left">
      {erro && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-md text-center">
          {erro}
        </div>
      )}

      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">
          Nome Completo *
        </label>
        <input
          type="text"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          required
          placeholder="Ex: Anderson Luiz"
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">
          E-mail corporativo *
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="seu.nome@empresa.com.br"
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">
          Empresa Parceira *
        </label>
        <input
          type="text"
          value={empresa}
          onChange={(e) => setEmpresa(e.target.value)}
          required
          placeholder="Nome da empresa"
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">
          Senha *
        </label>
        <input
          type="password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          required
          placeholder="••••••••"
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-2">
          Perfil Solicitado
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setPerfil('COLABORADOR')}
            className={`p-3 border rounded-lg text-left transition-all ${
              perfil === 'COLABORADOR'
                ? 'border-orange-500 bg-orange-50/50 ring-1 ring-orange-500'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <div className="text-xs font-bold text-gray-900">Colaborador</div>
            <div className="text-[10px] text-gray-500 mt-0.5">Aprovação local</div>
          </button>

          <button
            type="button"
            onClick={() => setPerfil('ADMIN_EMPRESA')}
            className={`p-3 border rounded-lg text-left transition-all ${
              perfil === 'ADMIN_EMPRESA'
                ? 'border-orange-500 bg-orange-50/50 ring-1 ring-orange-500'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <div className="text-xs font-bold text-gray-900">Admin Empresa</div>
            <div className="text-[10px] text-orange-600 font-medium mt-0.5">Aprovação iez!</div>
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={carregando}
        className="w-full py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-medium text-sm rounded-md transition duration-200 disabled:opacity-50 mt-2"
      >
        {carregando ? 'Processando...' : 'Solicitar Acesso'}
      </button>
    </form>
  );
}