import { PosterCard } from "@/components/PosterCard";
import type { MovieSummary } from "@/lib/tmdb/types";

export function MovieGrid({ movies }: { movies: MovieSummary[] }) {
  return (
    <ul className="grid grid-cols-3 gap-2 px-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
      {movies.map((movie) => (
        <li key={movie.id}>
          <PosterCard movie={movie} />
        </li>
      ))}
    </ul>
  );
}
