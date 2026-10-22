import type { Genre } from "@/lib/tmdb/types";

const MAX_PAGES = 500;

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export function parseGenreParam(
  value: string | string[] | undefined,
  genres: Genre[],
): Genre | null {
  const v = first(value);
  if (!v || !/^\d+$/.test(v)) return null;
  const id = Number(v);
  return genres.find((g) => g.id === id) ?? null;
}

export function parsePageParam(value: string | string[] | undefined, totalPages?: number): number {
  const max = Math.max(1, Math.min(totalPages ?? MAX_PAGES, MAX_PAGES));
  const v = first(value);
  if (!v || !/^\d+$/.test(v)) return 1;
  return Math.min(Math.max(1, Number(v)), max);
}
