import UsuariosManager from '@/components/UsuariosManager';

export default function UsuariosPage() {
  return (
    <main className="flex-1 bg-gray-50 min-h-screen p-6 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Gestão de Acessos</h1>
          <p className="text-sm text-gray-500 mt-1">
            Aprove ou bloqueie os parceiros que solicitaram acesso ao portal.
          </p>
        </div>
        
        <UsuariosManager />
      </div>
    </main>
  );
}