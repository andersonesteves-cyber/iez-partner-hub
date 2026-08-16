'use client';

import { useState, useEffect } from 'react';

interface Usuario {
  id: string;
  nome: string;
  email: string;
  role: string;
  empresa: string;
  status: string;
  criadoEm: string;
}

export default function UsuariosManager() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const API_URL = 'https://api-iez-partner-hub.onrender.com';

  const fetchUsuarios = async () => {
    try {
      setCarregando(true);
      const res = await fetch(`${API_URL}/api/usuarios`);
      if (res.ok) {
        const data = await res.json();
        setUsuarios(data);
      }
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    // Validação de segurança simples no frontend
    const userStr = localStorage.getItem('iez_user');
    if (userStr) {
      const user = JSON.parse(userStr);
      if (user.role === 'ADMIN') {
        setIsAdmin(true);
        fetchUsuarios();
      } else {
        setCarregando(false); // Não carrega se não for admin
      }
    } else {
      setCarregando(false);
    }
  }, []);

  const alterarStatus = async (id: string, novoStatus: string) => {
    try {
      const res = await fetch(`${API_URL}/api/usuarios/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: novoStatus }),
      });

      if (res.ok) {
        // Atualiza a lista localmente para resposta imediata na tela
        setUsuarios(usuarios.map(u => u.id === id ? { ...u, status: novoStatus } : u));
      } else {
        alert('Erro ao atualizar o status.');
      }
    } catch (error) {
      console.error('Erro de conexão:', error);
    }
  };

  if (carregando) {
    return <div className="text-center p-12 text-orange-600 font-medium">Carregando acessos...</div>;
  }

  if (!isAdmin) {
    return (
      <div className="bg-red-50 text-red-600 p-6 rounded-lg text-center border border-red-100">
        <h3 className="font-bold text-lg mb-2">Acesso Negado</h3>
        <p>Apenas administradores da iez! telecom podem gerenciar acessos.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500 font-semibold">
              <th className="p-4">Usuário</th>
              <th className="p-4">Empresa</th>
              <th className="p-4 text-center">Perfil</th>
              <th className="p-4 text-center">Status</th>
              <th className="p-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {usuarios.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="p-4">
                  <p className="font-bold text-gray-900 text-sm">{user.nome}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </td>
                <td className="p-4 text-sm text-gray-700">{user.empresa}</td>
                <td className="p-4 text-center">
                  <span className="text-xs font-semibold text-gray-600 bg-gray-100 px-2 py-1 rounded-md">
                    {user.role}
                  </span>
                </td>
                <td className="p-4 text-center">
                  {user.status === 'PENDENTE' && (
                    <span className="text-xs font-bold text-yellow-700 bg-yellow-100 px-3 py-1 rounded-full">AGUARDANDO APROVAÇÃO</span>
                  )}
                  {user.status === 'ATIVO' && (
                    <span className="text-xs font-bold text-green-700 bg-green-100 px-3 py-1 rounded-full">ATIVO</span>
                  )}
                  {user.status === 'BLOQUEADO' && (
                    <span className="text-xs font-bold text-red-700 bg-red-100 px-3 py-1 rounded-full">BLOQUEADO</span>
                  )}
                </td>
                <td className="p-4 text-right space-x-2">
                  {user.status !== 'ATIVO' && (
                    <button 
                      onClick={() => alterarStatus(user.id, 'ATIVO')}
                      className="text-xs font-bold text-white bg-green-600 hover:bg-green-700 px-3 py-1.5 rounded transition-colors shadow-sm"
                    >
                      Aprovar
                    </button>
                  )}
                  {user.status !== 'BLOQUEADO' && (
                    <button 
                      onClick={() => alterarStatus(user.id, 'BLOQUEADO')}
                      className="text-xs font-bold text-gray-600 bg-gray-100 border border-gray-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 px-3 py-1.5 rounded transition-colors"
                    >
                      Bloquear
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {usuarios.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-500">Nenhum usuário encontrado.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}