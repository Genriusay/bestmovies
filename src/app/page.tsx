import { Suspense } from "react";
import { GenreChips } from "@/components/GenreChips";
import { HeroCarousel } from "@/components/HeroCarousel";
import { MovieRow } from "@/components/MovieRow";
import { RowsSkeleton } from "@/components/RowsSkeleton";
import { ServiceBadge } from "@/components/ServiceBadge";
import { parseGenreParam } from "@/lib/params";
import { SERVICES } from "@/lib/tmdb/services";
import { getGenres, getHero, getServiceRow, getTop10 } from "@/lib/tmdb/movies";

// Com cacheComponents, ler searchParams é acesso dinâmico: fica dentro de um
// Suspense para o shell estático (cabeçalho, esqueleto, rodapé) ser pré-renderizado.
async function HomeContent({ searchParams }: { searchParams: Promise<{ genero?: string }> }) {
  const { genero } = await searchParams;
  const genres = await getGenres();
  const genre = parseGenreParam(genero, genres);
  const genreId = genre?.id ?? null;

  const [hero, top10, rows] = await Promise.all([
    getHero(genreId),
    getTop10(genreId),
    Promise.all(SERVICES.map((s) => getServiceRow(s.slug, genreId))),
  ]);

  return (
    <>
      <HeroCarousel key={genreId ?? "all"} movies={hero} genres={genres} />
      <GenreChips genres={genres} activeId={genreId} basePath="/" />
      <MovieRow
        ranked
        title={genre ? `Top 10 de ${genre.name} em streaming` : "Top 10 em streaming hoje"}
        movies={top10}
      />
      {SERVICES.map((s, i) => (
        <MovieRow
          key={s.slug}
          title={
            <span className="flex items-center gap-2">
              <ServiceBadge slug={s.slug} /> Populares
            </span>
          }
          seeAllHref={`/servico/${s.slug}${genre ? `?genero=${genre.id}` : ""}`}
          movies={rows[i]}
        />
      ))}
    </>
  );
}

export default function Home({ searchParams }: { searchParams: Promise<{ genero?: string }> }) {
  return (
    <main className="mx-auto w-full max-w-6xl flex-1 pb-8">
      <Suspense fallback={<RowsSkeleton />}>
        <HomeContent searchParams={searchParams} />
      </Suspense>
    </main>
  );
}
