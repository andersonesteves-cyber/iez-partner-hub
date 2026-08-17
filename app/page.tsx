// app/page.tsx
import DocumentosManager from '../components/DocumentosManager';

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  // No Next.js 15, searchParams é uma Promise
  const resolvedParams = await searchParams;
  const query = resolvedParams?.q || '';

  return (
    <main className="flex-1 p-8 bg-gray-50 min-h-screen">
      <DocumentosManager searchQuery={query} />
    </main>
  );
}