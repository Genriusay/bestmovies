import { notFound } from "next/navigation";
import { Suspense } from "react";
import { GenreChips } from "@/components/GenreChips";
import { MovieGrid } from "@/components/MovieGrid";
import { Pagination } from "@/components/Pagination";
import { RowsSkeleton } from "@/components/RowsSkeleton";
import { ServiceBadge } from "@/components/ServiceBadge";
import { parseGenreParam, parsePageParam } from "@/lib/params";
import { getGenres, discoverMovies } from "@/lib/tmdb/movies";
import { getService, getServiceIds, SERVICES } from "@/lib/tmdb/providers";

type SearchParams = Promise<{ genero?: string; pagina?: string }>;

export function generateStaticParams() {
  return SERVICES.map((s) => ({ slug: s.slug }));
}

async function ServiceContent({
  slug,
  searchParams,
}: {
  slug: string;
  searchParams: SearchParams;
}) {
  const { genero, pagina } = await searchParams;
  const service = getService(slug);
  if (!service) notFound();

  const [genres, ids] = await Promise.all([getGenres(), getServiceIds()]);
  const genre = parseGenreParam(genero, genres);
  const genreId = genre?.id;
  const providerIds = ids[service.slug] ?? [];

  const requested = parsePageParam(pagina);
  let page = requested;
  let data = await discoverMovies(providerIds, { genreId, page });
  // A página pedida é limitada ao total, que só se conhece após a primeira busca.
  const clamped = parsePageParam(pagina, data.totalPages);
  if (clamped !== requested) {
    page = clamped;
    data = await discoverMovies(providerIds, { genreId, page });
  }

  const basePath = `/servico/${service.slug}`;
  const hrefFor = (p: number) => {
    const qs = new URLSearchParams();
    if (genre) qs.set("genero", String(genre.id));
    if (p > 1) qs.set("pagina", String(p));
    const s = qs.toString();
    return s ? `${basePath}?${s}` : basePath;
  };

  return (
    <>
      <h1 className="flex items-center gap-2 px-4 pt-6 text-xl font-bold">
        <ServiceBadge slug={service.slug} /> Todos os filmes
      </h1>
      <GenreChips genres={genres} activeId={genre?.id ?? null} basePath={basePath} />
      {data.results.length === 0 ? (
        <p className="px-4 py-8 text-zinc-400">
          Nenhum filme deste gênero neste serviço no momento.
        </p>
      ) : (
        <MovieGrid movies={data.results} />
      )}
      <Pagination page={page} totalPages={data.totalPages} hrefFor={hrefFor} />
    </>
  );
}

export default async function ServicePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: SearchParams;
}) {
  // O slug é validado fora do Suspense para o 404 sair com status HTTP correto.
  const { slug } = await params;
  if (!getService(slug)) notFound();
  return (
    <main className="mx-auto w-full max-w-6xl flex-1 pb-8">
      <Suspense fallback={<RowsSkeleton />}>
        <ServiceContent slug={slug} searchParams={searchParams} />
      </Suspense>
    </main>
  );
}
