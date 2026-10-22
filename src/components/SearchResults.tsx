import Image from "next/image";
import Link from "next/link";
import { PosterCard } from "@/components/PosterCard";
import { formatRating } from "@/lib/format";
import { imageUrl } from "@/lib/tmdb/images";
import type { MovieSummary, ProviderInfo } from "@/lib/tmdb/types";

const MAX_LOGOS = 4;

export type SearchResult = {
  movie: MovieSummary;
  providers: ProviderInfo[] | null;
};

export function SearchResults({
  query,
  results,
}: {
  query: string;
  results: SearchResult[];
}) {
  if (results.length === 0) {
    return (
      <p className="px-4 py-8 text-zinc-400">{`Nenhum filme encontrado para "${query}".`}</p>
    );
  }
  return (
    <ul className="flex flex-col gap-3 px-4 py-4">
      {results.map(({ movie, providers }) => {
        const rating = formatRating(movie.voteAverage);
        return (
          <li key={movie.id} className="flex gap-3">
            <div className="w-20 shrink-0 sm:w-24">
              <PosterCard movie={movie} />
            </div>
            <div className="min-w-0 flex-1">
              <Link
                href={`/filme/${movie.id}`}
                className="font-semibold hover:text-accent"
              >
                {movie.title}
              </Link>
              <p className="text-sm text-zinc-400">
                {movie.year !== null && <span>{movie.year}</span>}
                {movie.year !== null && rating && " · "}
                {rating && <span>{rating}</span>}
              </p>
              {providers === null ? null : providers.length === 0 ? (
                <p className="mt-2 text-sm text-zinc-400">
                  Não disponível em streaming no BR
                </p>
              ) : (
                <ul className="mt-2 flex gap-2">
                  {providers.slice(0, MAX_LOGOS).map((p) => {
                    const src = imageUrl(p.logoPath, "w92");
                    return (
                      <li key={p.id}>
                        {src ? (
                          <Image
                            src={src}
                            alt={p.name}
                            title={p.name}
                            width={32}
                            height={32}
                            className="h-8 w-8 rounded-md object-cover"
                          />
                        ) : (
                          <span className="flex h-8 items-center rounded-md bg-zinc-800 px-2 text-xs">
                            {p.name}
                          </span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
