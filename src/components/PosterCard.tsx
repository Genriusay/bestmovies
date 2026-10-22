import Image from "next/image";
import Link from "next/link";
import { imageUrl } from "@/lib/tmdb/images";
import type { MovieSummary } from "@/lib/tmdb/types";

export function PosterCard({ movie, rank }: { movie: MovieSummary; rank?: number }) {
  const src = imageUrl(movie.posterPath, "w342");
  return (
    <Link
      href={`/filme/${movie.id}`}
      aria-label={movie.title}
      className="relative block aspect-[2/3] w-full overflow-hidden rounded-md bg-gradient-to-br from-zinc-700 to-zinc-900 transition hover:ring-2 hover:ring-accent focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
    >
      {src ? (
        <Image
          src={src}
          alt=""
          fill
          sizes="(min-width: 1024px) 16vw, (min-width: 640px) 25vw, 33vw"
          className="object-cover"
        />
      ) : (
        <span
          data-testid="poster-placeholder"
          className="flex h-full w-full items-center justify-center p-2 text-center text-xs font-semibold text-zinc-300"
        >
          {movie.title}
        </span>
      )}
      {rank !== undefined && (
        <span
          data-testid="poster-rank"
          aria-hidden="true"
          className="absolute -bottom-1 left-0 text-5xl font-black leading-none text-background [-webkit-text-stroke:1px_#aaa]"
        >
          {rank}
        </span>
      )}
    </Link>
  );
}
