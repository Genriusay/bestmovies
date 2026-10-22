"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { formatRating } from "@/lib/format";
import { imageUrl } from "@/lib/tmdb/images";
import type { Genre, MovieSummary } from "@/lib/tmdb/types";

const INTERVAL_MS = 6000;

export function HeroCarousel({ movies, genres = [] }: { movies: MovieSummary[]; genres?: Genre[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = movies.length;

  useEffect(() => {
    if (count < 2 || paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % count), INTERVAL_MS);
    return () => clearInterval(id);
  }, [count, index, paused]);

  if (count === 0) return null;
  const movie = movies[index % count];
  const src = imageUrl(movie.backdropPath, "w1280");

  const genreName = genres.find((g) => g.id === movie.genreIds[0])?.name;

  return (
    <section
      aria-label="Filmes em destaque"
      className="px-4 pt-4"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setPaused(false);
      }}
    >
      <div className="relative flex h-56 flex-col justify-end gap-1 overflow-hidden rounded-xl bg-gradient-to-br from-violet-900 to-zinc-900 p-4 sm:h-80 sm:p-6">
        {src && (
          <Image
            key={movie.id}
            src={src}
            alt=""
            fill
            priority={index === 0}
            sizes="(min-width: 1152px) 1120px, 100vw"
            className="object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
        <div className="relative flex flex-col gap-1">
          <h2 className="text-xl font-bold sm:text-3xl">{movie.title}</h2>
          <p className="text-sm text-zinc-300">
            {[movie.year, genreName, formatRating(movie.voteAverage)].filter(Boolean).join(" · ")}
          </p>
          <Link
            href={`/filme/${movie.id}`}
            className="mt-1 w-fit rounded-md bg-accent px-3 py-1.5 text-sm font-bold text-zinc-900 hover:brightness-110"
          >
            Ver onde assistir
          </Link>
        </div>
      </div>
      {count > 1 && (
        <div className="flex justify-center gap-1 pt-2">
          {movies.map((m, i) => (
            <button
              key={m.id}
              type="button"
              aria-label={`Ir para o destaque ${i + 1}`}
              aria-current={i === index ? "true" : undefined}
              onClick={() => setIndex(i)}
              className="p-2"
            >
              <span
                className={`block h-2 w-2 rounded-full ${i === index ? "bg-zinc-100" : "bg-zinc-600"}`}
              />
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
