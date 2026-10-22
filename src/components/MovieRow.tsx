import Link from "next/link";
import type { ReactNode } from "react";
import { PosterCard } from "@/components/PosterCard";
import type { MovieSummary } from "@/lib/tmdb/types";

export function MovieRow({
  title,
  movies,
  seeAllHref,
  ranked = false,
}: {
  title: ReactNode;
  movies: MovieSummary[];
  seeAllHref?: string;
  ranked?: boolean;
}) {
  if (movies.length === 0) return null;
  return (
    <section className="py-3">
      <div className="mb-2 flex items-center justify-between px-4">
        <h2 className="text-base font-bold">{title}</h2>
        {seeAllHref && (
          <Link href={seeAllHref} className="text-sm text-accent hover:underline">
            ver tudo ›
          </Link>
        )}
      </div>
      <ul className="flex snap-x snap-mandatory gap-2 overflow-x-auto px-4 pb-2">
        {movies.map((movie, i) => (
          <li key={movie.id} className="w-28 shrink-0 snap-start sm:w-32">
            <PosterCard movie={movie} rank={ranked ? i + 1 : undefined} />
          </li>
        ))}
      </ul>
    </section>
  );
}
