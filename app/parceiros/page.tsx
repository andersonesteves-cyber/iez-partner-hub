'use client';

import { useEffect, useState, FormEvent } from 'react';

interface Empresa {
  id: string;
  nome: string;
  status: 'Em Contratação' | 'Ativo' | 'Suspenso' | 'Encerrado';
  createdAt?: string;
}

const EMPRESAS_INICIAIS: Empresa[] = [
  { id: '1', nome: 'NetSpeed', status: 'Ativo' },
  { id: '2', nome: 'Telecom S.A.', status: 'Em Contratação' },
  { id: '3', nome: 'Conecta Fibra', status: 'Suspenso' },
];

export default function ParceirosPage() {
  const [empresas, setEmpresas] = useState<Empresa[]>(EMPRESAS_INICIAIS);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modal de Novo Cadastramento
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [novoNome, setNovoNome] = useState('');
  const [novoStatus, setNovoStatus] = useState<Empresa['status']>('Ativo');

  const API_URL = 'https://api-iez-partner-hub.onrender.com';

  const fetchEmpresas = async () => {
    try {
      const res = await fetch(`${API_URL}/api/empresas`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setEmpresas(data);
        }
      }
    } catch (error) {
      console.warn('Usando lista de fallback local para parceiros.');
    }
  };

  useEffect(() => {
    fetchEmpresas();
  }, []);

  const handleUpdateStatus = async (id: string, status: Empresa['status']) => {
    try {
      await fetch(`${API_URL}/api/empresas/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      setEmpresas(empresas.map((emp) => (emp.id === id ? { ...emp, status } : emp)));
    } catch (error) {
      alert('Erro ao atualizar status do contrato.');
    }
  };

  const handleCreateEmpresa = async (e: FormEvent) => {
    e.preventDefault();
    if (!novoNome.trim()) return;

    const nova: Empresa = {
      id: Date.now().toString(),
      nome: novoNome.trim(),
      status: novoStatus,
    };

    try {
      await fetch(`${API_URL}/api/empresas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: novoNome, status: novoStatus }),
      });

      setEmpresas([nova, ...empresas]);
      setIsModalOpen(false);
      setNovoNome('');
      setNovoStatus('Ativo');
    } catch (error) {
      alert('Erro ao cadastrar empresa.');
    }
  };

  const filteredEmpresas = empresas.filter((emp) => {
    const matchesSearch = emp.nome.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter ? emp.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: Empresa['status']) => {
    switch (status) {
      case 'Ativo':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'Em Contratação':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Suspenso':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Encerrado':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="w-full h-full font-sans">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Gestão de Parceiros</h1>
          <p className="text-sm text-gray-500 mt-1">Cadastre e controle os contratos das empresas parceiras.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs px-4 py-2.5 rounded-lg shadow-sm transition-all"
        >
          <span>+</span> Novo Parceiro
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-6 flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Buscar por nome da empresa..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-orange-500 outline-none"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-gray-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-orange-500 outline-none bg-white font-medium"
        >
          <option value="">Todos os Status</option>
          <option value="Ativo">Ativo</option>
          <option value="Em Contratação">Em Contratação</option>
          <option value="Suspenso">Suspenso</option>
          <option value="Encerrado">Encerrado</option>
        </select>
      </div>

      {/* Tabela de Empresas */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-gray-50 border-b border-gray-200 text-gray-500">
            <tr>
              <th className="px-6 py-4 font-semibold">Empresa Parceira</th>
              <th className="px-6 py-4 font-semibold">Status do Contrato</th>
              <th className="px-6 py-4 font-semibold text-right">Alterar Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredEmpresas.map((emp) => (
              <tr key={emp.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-bold text-gray-900">{emp.nome}</td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${getStatusBadge(emp.status)}`}>
                    {emp.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <select
                    value={emp.status}
                    onChange={(e) => handleUpdateStatus(emp.id, e.target.value as Empresa['status'])}
                    className="text-xs border border-gray-200 rounded px-2 py-1 bg-white focus:ring-1 focus:ring-orange-500 outline-none font-medium"
                  >
                    <option value="Ativo">Ativo</option>
                    <option value="Em Contratação">Em Contratação</option>
                    <option value="Suspenso">Suspenso</option>
                    <option value="Encerrado">Encerrado</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal de Cadastro de Empresa */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Cadastrar Empresa Parceira</h2>
            <form onSubmit={handleCreateEmpresa} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Nome da Empresa *</label>
                <input
                  type="text"
                  value={novoNome}
                  onChange={(e) => setNovoNome(e.target.value)}
                  required
                  placeholder="Ex: NetSpeed Telecom"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Status do Contrato</label>
                <select
                  value={novoStatus}
                  onChange={(e) => setNovoStatus(e.target.value as Empresa['status'])}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 outline-none bg-white font-medium"
                >
                  <option value="Ativo">Ativo</option>
                  <option value="Em Contratação">Em Contratação</option>
                  <option value="Suspenso">Suspenso</option>
                  <option value="Encerrado">Encerrado</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-lg"
                >
                  Salvar Empresa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}