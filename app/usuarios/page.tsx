'use client';

import { useEffect, useState } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  companyName: string;
  role: string;
  status: string;
  createdAt: string;
}

export default function UsuariosPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const fetchUsers = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleUpdateUser = async (id: string, updates: Partial<User>) => {
    try {
      const res = await fetch(`http://localhost:5000/api/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (res.ok) {
        setUsers(users.map((u) => (u.id === id ? { ...u, ...updates } : u)));
      } else {
        alert('Erro ao atualizar usuário.');
      }
    } catch (error) {
      console.error('Erro na requisição:', error);
    }
  };

  const filteredUsers = users.filter((user) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      user.name.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower) ||
      user.companyName.toLowerCase().includes(searchLower);
    
    const matchesStatus = statusFilter ? user.status === statusFilter : true;
    const matchesRole = roleFilter ? user.role === roleFilter : true;
    
    return matchesSearch && matchesStatus && matchesRole;
  });

  return (
    <main className="flex-1 w-full h-full bg-gray-50 p-6 md:p-8 overflow-y-auto font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* Cabeçalho */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Gestão de Acessos</h1>
          <p className="text-sm text-gray-500 mt-1">Aprove ou gerencie os perfis de usuários do portal.</p>
        </div>

        {/* Barra de Filtros */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-6 flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Buscar por nome, e-mail ou empresa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
            />
          </div>
          <div className="flex gap-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-orange-500 outline-none bg-white"
            >
              <option value="">Todos os Status</option>
              <option value="PENDING">Pendentes</option>
              <option value="APPROVED">Aprovados</option>
              <option value="REJECTED">Reprovados</option>
            </select>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="border border-gray-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-orange-500 outline-none bg-white"
            >
              <option value="">Todos os Perfis</option>
              <option value="USER">Colaborador</option>
              <option value="COMPANY_ADMIN">Admin Empresa</option>
              <option value="IEZ_ADMIN">Admin iez!</option>
            </select>
          </div>
        </div>

        {/* Tabela de Usuários */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-500">
                <tr>
                  <th className="px-6 py-4 font-semibold">Usuário</th>
                  <th className="px-6 py-4 font-semibold">Empresa</th>
                  <th className="px-6 py-4 font-semibold">Perfil</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">Carregando usuários...</td></tr>
                ) : filteredUsers.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">Nenhum usuário encontrado.</td></tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-bold text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </td>
                      <td className="px-6 py-4 text-gray-700">{user.companyName}</td>
                      <td className="px-6 py-4">
                        <select
                          value={user.role}
                          onChange={(e) => handleUpdateUser(user.id, { role: e.target.value })}
                          className="text-xs border border-gray-200 rounded p-1 bg-white focus:outline-none focus:ring-1 focus:ring-orange-500"
                        >
                          <option value="USER">Colaborador</option>
                          <option value="COMPANY_ADMIN">Admin Empresa</option>
                          <option value="IEZ_ADMIN">Admin iez!</option>
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                          user.status === 'APPROVED' ? 'bg-green-100 text-green-700 border border-green-200' :
                          user.status === 'REJECTED' ? 'bg-red-100 text-red-700 border border-red-200' :
                          'bg-yellow-100 text-yellow-700 border border-yellow-200'
                        }`}>
                          {user.status === 'APPROVED' ? 'Aprovado' : user.status === 'REJECTED' ? 'Reprovado' : 'Pendente'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        {user.status !== 'APPROVED' && (
                          <button
                            onClick={() => handleUpdateUser(user.id, { status: 'APPROVED' })}
                            className="text-xs font-semibold text-green-600 hover:text-green-800 bg-green-50 px-3 py-1.5 rounded-md transition-colors"
                          >
                            Aprovar
                          </button>
                        )}
                        {user.status !== 'REJECTED' && (
                          <button
                            onClick={() => handleUpdateUser(user.id, { status: 'REJECTED' })}
                            className="text-xs font-semibold text-red-600 hover:text-red-800 bg-red-50 px-3 py-1.5 rounded-md transition-colors"
                          >
                            Bloquear
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </main>
  );
}