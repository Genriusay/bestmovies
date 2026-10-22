import "server-only";
import { tmdbFetch, toMovieSummary } from "./client";
import { SERVICES, getServiceIds, groupProviderVariants, toProviderInfo } from "./providers";
import type {
  Genre,
  MovieSummary,
  Paged,
  ProviderInfo,
  RawMovie,
  RawPaged,
  RawProvider,
} from "./types";
import type { ServiceSlug } from "./providers";

const MAX_PAGES = 500;

export async function getGenres(): Promise<Genre[]> {
  const data = await tmdbFetch<{ genres: Genre[] }>("/genre/movie/list", {}, 86400);
  return data.genres;
}

export async function discoverMovies(
  providerIds: number[],
  opts: { genreId?: number | null; page?: number } = {},
): Promise<Paged<MovieSummary>> {
  const data = await tmdbFetch<RawPaged<RawMovie>>(
    "/discover/movie",
    {
      with_watch_providers: providerIds.join("|"),
      watch_region: "BR",
      with_watch_monetization_types: "flatrate",
      sort_by: "popularity.desc",
      with_genres: opts.genreId ?? undefined,
      page: opts.page ?? 1,
    },
    21600,
  );
  return {
    page: data.page,
    totalPages: Math.min(data.total_pages, MAX_PAGES),
    results: data.results.map(toMovieSummary),
  };
}

async function allServiceIds(): Promise<number[]> {
  const ids = await getServiceIds();
  return SERVICES.flatMap((s) => ids[s.slug]);
}

export async function getTop10(genreId?: number | null): Promise<MovieSummary[]> {
  const { results } = await discoverMovies(await allServiceIds(), { genreId });
  return results.slice(0, 10);
}

export async function getHero(genreId?: number | null): Promise<MovieSummary[]> {
  const { results } = await discoverMovies(await allServiceIds(), { genreId, page: 1 });
  return results.filter((m) => m.backdropPath).slice(0, 5);
}

export async function getServiceRow(
  slug: ServiceSlug,
  genreId?: number | null,
): Promise<MovieSummary[]> {
  const ids = (await getServiceIds())[slug];
  const { results } = await discoverMovies(ids, { genreId, page: 1 });
  return results.slice(0, 20);
}

export async function searchMovies(query: string, page = 1): Promise<Paged<MovieSummary>> {
  const q = query.trim();
  if (!q) return { page: 1, totalPages: 0, results: [] };
  const data = await tmdbFetch<RawPaged<RawMovie>>(
    "/search/movie",
    { query: q, include_adult: "false", page },
    3600,
  );
  return {
    page: data.page,
    totalPages: Math.min(data.total_pages, MAX_PAGES),
    results: data.results.map(toMovieSummary),
  };
}

export async function getFlatrateProviders(movieId: number): Promise<ProviderInfo[]> {
  const data = await tmdbFetch<{
    results: Record<string, { flatrate?: RawProvider[] }>;
  }>(`/movie/${movieId}/watch/providers`, {}, 21600);
  return groupProviderVariants((data.results?.BR?.flatrate ?? []).map(toProviderInfo));
}
