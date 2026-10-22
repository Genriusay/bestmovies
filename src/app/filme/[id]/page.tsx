import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { CastList } from "@/components/CastList";
import { MovieRow } from "@/components/MovieRow";
import { RowsSkeleton } from "@/components/RowsSkeleton";
import { Trailer } from "@/components/Trailer";
import { WatchProviders } from "@/components/WatchProviders";
import { formatRating, formatRuntime } from "@/lib/format";
import { getMovieDetails } from "@/lib/tmdb/details";
import { imageUrl } from "@/lib/tmdb/images";

const LONG_OVERVIEW = 300;

function parseId(raw: string): number | null {
  if (!/^\d+$/.test(raw)) return null;
  const n = Number(raw);
  return Number.isSafeInteger(n) && n > 0 ? n : null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const movieId = parseId(id);
  if (movieId === null) return { title: "Filme não encontrado" };
  const movie = await getMovieDetails(movieId);
  if (!movie) return { title: "Filme não encontrado" };
  return { title: movie.title, description: movie.overview ?? undefined };
}

function Synopsis({ overview }: { overview: string | null }) {
  return (
    <section className="px-4 py-3">
      <h2 className="mb-2 text-base font-bold">Sinopse</h2>
      {!overview ? (
        <p className="text-sm text-zinc-400">Sinopse não disponível em português.</p>
      ) : overview.length > LONG_OVERVIEW ? (
        <details className="group text-sm text-zinc-300">
          <summary className="cursor-pointer list-none">
            <span className="group-open:hidden">
              {overview.slice(0, LONG_OVERVIEW).trimEnd()}…{" "}
              <span className="text-accent">ler mais</span>
            </span>
            <span className="hidden group-open:inline">{overview}</span>
          </summary>
        </details>
      ) : (
        <p className="text-sm text-zinc-300">{overview}</p>
      )}
    </section>
  );
}

async function MovieContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const movieId = parseId(id);
  if (movieId === null) notFound();
  const movie = await getMovieDetails(movieId);
  if (!movie) notFound();

  const backdrop = imageUrl(movie.backdropPath, "w1280");
  const poster = imageUrl(movie.posterPath, "w342");
  const meta = [movie.year, formatRuntime(movie.runtimeMinutes), movie.certification].filter(
    Boolean,
  );

  return (
    <>
      <div className="relative h-48 w-full overflow-hidden bg-gradient-to-br from-zinc-700 to-zinc-900 sm:h-72">
        {backdrop && (
          <Image src={backdrop} alt="" fill priority sizes="100vw" className="object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
        <Link
          href="/"
          className="absolute left-4 top-3 rounded-full bg-black/60 px-3 py-1 text-sm"
        >
          ‹ Voltar
        </Link>
      </div>

      <div className="relative -mt-12 flex gap-4 px-4">
        <div className="relative aspect-[2/3] w-24 shrink-0 overflow-hidden rounded-md bg-gradient-to-br from-zinc-700 to-zinc-900 sm:w-32">
          {poster && (
            <Image
              src={poster}
              alt={`Pôster de ${movie.title}`}
              fill
              sizes="128px"
              className="object-cover"
            />
          )}
        </div>
        <div className="flex flex-col justify-end gap-1 pb-1">
          <h1 className="text-xl font-bold leading-tight">{movie.title}</h1>
          {meta.length > 0 && <p className="text-sm text-zinc-400">{meta.join(" · ")}</p>}
          <p className="text-sm">
            <span className="text-accent">{formatRating(movie.voteAverage)}</span>
            {movie.genres.length > 0 && (
              <span className="text-zinc-400"> · {movie.genres.map((g) => g.name).join(", ")}</span>
            )}
          </p>
        </div>
      </div>

      <WatchProviders watch={movie.watch} />
      <Synopsis overview={movie.overview} />
      <Trailer youtubeKey={movie.trailerYoutubeKey} title={movie.title} />
      <CastList cast={movie.cast} />
      <MovieRow title="Parecidos" movies={movie.recommendations} />
    </>
  );
}

export default function MoviePage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <main className="mx-auto w-full max-w-6xl flex-1 pb-8">
      <Suspense fallback={<RowsSkeleton />}>
        <MovieContent params={params} />
      </Suspense>
    </main>
  );
}
