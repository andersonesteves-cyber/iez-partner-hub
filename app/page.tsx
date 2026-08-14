import DocumentosManager from '../components/DocumentosManager';
import LinksUteis from '../components/LinksUteis';

interface HomePageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const resolvedSearchParams = await searchParams;
  const rawQuery = resolvedSearchParams.q;
  const searchQuery = typeof rawQuery === 'string' ? rawQuery : '';

  return (
    <main className="flex-1 w-full h-full bg-gray-50 p-6 md:p-8 overflow-y-auto font-sans">
      <div className="max-w-7xl mx-auto flex flex-col justify-between min-h-[calc(100vh-8rem)]">
        
        {/* Seção Principal: Documentos no Topo */}
        <div>
          <DocumentosManager searchQuery={searchQuery} />
        </div>

        {/* Seção de Atalhos: Posicionada na parte inferior da tela */}
        <div className="mt-12 pt-6 border-t border-gray-200/60">
          <LinksUteis />
        </div>

      </div>
    </main>
  );
}