import DocumentosManager from '../components/DocumentosManager';

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const resolvedParams = await searchParams;
  const query = resolvedParams?.q || '';

  return <DocumentosManager searchQuery={query} />;
}