import DocumentosManager from '@/components/DocumentosManager';

// Tipagem oficial do Next.js para searchParams em Server Components
interface HomeProps {
  searchParams: {
    q?: string;
    categoria?: string;
    [key: string]: string | string[] | undefined;
  };
}

export default function Home({ searchParams }: HomeProps) {
  // Extrai os parâmetros da URL ou define vazio como fallback
  const searchQuery = searchParams.q || '';
  const categoria = searchParams.categoria || '';

  return (
    <main className="flex-1 bg-gray-50 min-h-screen">
      <div className="p-6 md:p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          {categoria ? `Documentos: ${categoria}` : 'Todos os Documentos'}
        </h1>
        
        {/* Agora o TypeScript reconhecerá essas props sem reclamar! */}
        <DocumentosManager 
          searchQuery={searchQuery} 
          categoria={categoria} 
        />
      </div>
    </main>
  );
}