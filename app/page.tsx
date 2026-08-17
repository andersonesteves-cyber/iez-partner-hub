import DocumentosManager from '../components/DocumentosManager';

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  // Trata a leitura assíncrona do searchParams no Next.js 15
  const resolvedParams = await searchParams;
  const query = resolvedParams?.q || '';

  return (
    <div className="space-y-6 font-sans">
      {/* CABEÇALHO DO ACERVO */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Acervo de Documentos</h1>
          <p className="text-xs text-gray-500 mt-1">
            Consulte e gerencie os manuais, termos e insumos da iez! telecom.
          </p>
        </div>
      </div>

      {/* GERENCIADOR DE DOCUMENTOS */}
      <DocumentosManager searchQuery={query} />
    </div>
  );
}