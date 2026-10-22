import 'server-only';
import { cacheLife } from 'next/cache';
import type { MovieSummary, RawMovie } from './types';

const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

type Params = Record<string, string | number | undefined>;

export class TmdbError extends Error {
  status: number;
  constructor(status: number, path: string) {
    super(`TMDB respondeu ${status} em ${path}`);
    this.name = 'TmdbError';
    this.status = status;
  }
}

export function buildTmdbUrl(path: string, params: Params = {}): string {
  const search = new URLSearchParams({ language: 'pt-BR' });
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) search.set(key, String(value));
  }
  return `${BASE_URL}${path}?${search.toString()}`;
}

// Com cacheComponents o fetch não usa mais `next.revalidate`: o cache fica na
// função 'use cache' e o tempo vem de cacheLife. Os argumentos (url,
// revalidateSeconds) entram na chave do cache; o token é lido aqui dentro para
// não virar parte da chave.
async function cachedGet(
  url: string,
  path: string,
  revalidateSeconds: number,
): Promise<unknown> {
  'use cache';
  cacheLife({ revalidate: revalidateSeconds });
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${process.env.TMDB_READ_TOKEN}`,
      Accept: 'application/json',
    },
  });
  if (!res.ok) throw new TmdbError(res.status, path);
  return res.json();
}

export async function tmdbFetch<T>(
  path: string,
  params?: Params,
  revalidateSeconds = 3600,
): Promise<T> {
  return (await cachedGet(
    buildTmdbUrl(path, params),
    path,
    revalidateSeconds,
  )) as T;
}

export function imageUrl(
  path: string | null,
  size: 'w185' | 'w342' | 'w780' | 'w1280' | 'original',
): string | null {
  return path ? `${IMAGE_BASE_URL}/${size}${path}` : null;
}

export function toMovieSummary(raw: RawMovie): MovieSummary {
  const year = raw.release_date ? Number(raw.release_date.slice(0, 4)) : NaN;
  return {
    id: raw.id,
    title: raw.title,
    posterPath: raw.poster_path,
    backdropPath: raw.backdrop_path,
    year: Number.isNaN(year) ? null : year,
    voteAverage: raw.vote_average,
    genreIds: raw.genre_ids,
  };
}
