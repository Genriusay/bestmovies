import type { Metadata } from "next";
import { Suspense } from "react";
import { Pagination } from "@/components/Pagination";
import { RowsSkeleton } from "@/components/RowsSkeleton";
import { SearchResults } from "@/components/SearchResults";
import { fetchClampedPage } from "@/lib/params";
import { getFlatrateProviders, searchMovies } from "@/lib/tmdb/movies";

type SearchParams = Promise<{ q?: string | string[]; pagina?: string | string[] }>;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<Metadata> {
  const { q } = await searchParams;
  const query = (Array.isArray(q) ? q[0] : q)?.trim() ?? "";
  return { title: query ? `Busca: ${query}` : "Busca" };
}

async function BuscaContent({ searchParams }: { searchParams: SearchParams }) {
  const { q, pagina } = await searchParams;
  const query = (Array.isArray(q) ? q[0] : q)?.trim() ?? "";
  if (!query) {
    return <p className="px-4 py-8 text-zinc-400">Digite o nome de um filme para buscar.</p>;
  }

  const data = await fetchClampedPage((p) => searchMovies(query, p), pagina);
  const page = data.page;

  const results = await Promise.all(
    data.results.map(async (movie) => ({
      movie,
      providers: await getFlatrateProviders(movie.id).catch(() => null),
    })),
  );

  const hrefFor = (p: number) => {
    const qs = new URLSearchParams({ q: query });
    if (p > 1) qs.set("pagina", String(p));
    return `/busca?${qs.toString()}`;
  };

  return (
    <>
      <h1 className="px-4 pt-6 text-xl font-bold">{`Resultados para "${query}"`}</h1>
      <SearchResults query={query} results={results} />
      <Pagination page={page} totalPages={data.totalPages} hrefFor={hrefFor} />
    </>
  );
}

export default function BuscaPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <main className="mx-auto w-full max-w-6xl flex-1 pb-8">
      <Suspense fallback={<RowsSkeleton />}>
        <BuscaContent searchParams={searchParams} />
      </Suspense>
    </main>
  );
}
