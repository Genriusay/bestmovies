import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/tmdb/client", () => ({
  tmdbFetch: vi.fn(),
  toMovieSummary: (r: any) => ({
    id: r.id,
    title: r.title,
    posterPath: r.poster_path,
    backdropPath: r.backdrop_path,
    year: null,
    voteAverage: 0,
    genreIds: r.genre_ids ?? [],
  }),
}));
vi.mock("@/lib/tmdb/providers", async (orig) => ({
  ...(await orig<typeof import("@/lib/tmdb/providers")>()),
  getServiceIds: vi.fn(async () => ({
    netflix: [8, 1796],
    "prime-video": [119],
    "disney-plus": [337],
    max: [384],
    globoplay: [307],
    "apple-tv-plus": [350],
  })),
}));

import { tmdbFetch } from "@/lib/tmdb/client";
import {
  discoverMovies,
  getFlatrateProviders,
  getHero,
  getServiceRow,
  getTop10,
  searchMovies,
} from "@/lib/tmdb/movies";

const mocked = vi.mocked(tmdbFetch);
const raw = (n: number, backdrop = true) =>
  Array.from({ length: n }, (_, i) => ({
    id: i + 1,
    title: `F${i + 1}`,
    poster_path: "/p.jpg",
    backdrop_path: backdrop && i % 2 === 0 ? "/b.jpg" : null,
    release_date: "2020-01-01",
    vote_average: 7,
    genre_ids: [],
  }));
const page = (n: number, total = 3) => ({ page: 1, total_pages: total, total_results: 0, results: raw(n) });

beforeEach(() => {
  mocked.mockReset();
  mocked.mockResolvedValue(page(20) as never);
});

describe("movies", () => {
  it("discover monta os params", async () => {
    await discoverMovies([8, 1796], { genreId: 35, page: 2 });
    expect(tmdbFetch).toHaveBeenCalledWith(
      "/discover/movie",
      expect.objectContaining({
        with_watch_providers: "8|1796",
        watch_region: "BR",
        with_watch_monetization_types: "flatrate",
        sort_by: "popularity.desc",
        with_genres: 35,
        page: 2,
      }),
      21600,
    );
  });
  it("discover limita totalPages a 500", async () => {
    mocked.mockResolvedValue(page(20, 812) as never);
    expect((await discoverMovies([8], {})).totalPages).toBe(500);
  });
  it("getTop10 usa todos os serviços e corta em 10", async () => {
    const r = await getTop10();
    expect(r).toHaveLength(10);
    expect(mocked.mock.calls[0][1]?.with_watch_providers).toBe("8|1796|119|337|384|307|350");
  });
  it("getHero só com backdrop e no máximo 5", async () => {
    const r = await getHero();
    expect(r).toHaveLength(5);
    expect(r.every((m) => m.backdropPath)).toBe(true);
  });
  it("getServiceRow traz 20 da página 1", async () => {
    const r = await getServiceRow("max", 28);
    expect(r).toHaveLength(20);
    expect(mocked.mock.calls[0][1]).toMatchObject({ with_watch_providers: "384", with_genres: 28, page: 1 });
  });
  it("busca vazia não chama a API", async () => {
    expect(await searchMovies("   ")).toEqual({ page: 1, totalPages: 0, results: [] });
    expect(tmdbFetch).not.toHaveBeenCalled();
  });
  it("busca usa /search/movie", async () => {
    await searchMovies(" matrix ", 2);
    expect(tmdbFetch).toHaveBeenCalledWith(
      "/search/movie",
      expect.objectContaining({ query: "matrix", include_adult: "false", page: 2 }),
      expect.anything(),
    );
  });
  it("getFlatrateProviders sem BR → []", async () => {
    mocked.mockResolvedValue({ id: 1, results: { US: { flatrate: [] } } } as never);
    expect(await getFlatrateProviders(1)).toEqual([]);
  });
  it("getFlatrateProviders agrupa BR flatrate", async () => {
    mocked.mockResolvedValue({
      id: 1,
      results: {
        BR: {
          flatrate: [
            { provider_id: 8, provider_name: "Netflix", logo_path: null },
            { provider_id: 1796, provider_name: "Netflix Standard with Ads", logo_path: null },
          ],
        },
      },
    } as never);
    const r = await getFlatrateProviders(1);
    expect(r).toHaveLength(1);
    expect(mocked.mock.calls[0][2]).toBe(21600);
  });
});
