// src/app/page.tsx
import DocumentosManager from './components/DocumentosManager';

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  // No Next.js 15, searchParams é uma Promise, então precisamos aguardar (await)
  const resolvedParams = await searchParams;
  const query = resolvedParams?.q || '';

  return (
    <main className="flex-1 p-8">
      {/* O DocumentosManager recebe a query da URL e filtra internamente */}
      <DocumentosManager searchQuery={query} />
    </main>
  );
}