import { beforeEach, describe, expect, it, vi } from "vitest";
import full from "../../fixtures/movie-details.json";
import minimal from "../../fixtures/movie-details-minimal.json";

vi.mock("@/lib/tmdb/client", () => {
  class TmdbError extends Error {
    status: number;
    constructor(status: number, path: string) {
      super(path);
      this.status = status;
    }
  }
  return {
    tmdbFetch: vi.fn(),
    TmdbError,
    toMovieSummary: (r: any) => ({
      id: r.id,
      title: r.title,
      posterPath: r.poster_path,
      backdropPath: r.backdrop_path,
      year: null,
      voteAverage: 0,
      genreIds: r.genre_ids ?? [],
    }),
  };
});

import { tmdbFetch, TmdbError } from "@/lib/tmdb/client";
import { getMovieDetails, mapMovieDetails } from "@/lib/tmdb/details";
import type { RawMovieDetails } from "@/lib/tmdb/types";

const fullRaw = full as unknown as RawMovieDetails;
const minimalRaw = minimal as unknown as RawMovieDetails;

beforeEach(() => {
  vi.mocked(tmdbFetch).mockReset();
});

describe("mapMovieDetails", () => {
  it("mapeia o filme completo", () => {
    const v = mapMovieDetails(fullRaw);
    expect(v.id).toBe(969681);
    expect(v.certification).toBe("12");
    expect(v.overview).toBeTruthy();
    expect(v.runtimeMinutes).toBe(143);
    expect(v.year).toBe(2026);
    expect(v.watch.flatrate.length).toBeGreaterThan(0);
    expect(v.trailerYoutubeKey).toBe("QrxivJMVCyU");
    expect(v.cast).toHaveLength(10);
    expect(v.recommendations).toHaveLength(12);
  });

  it("filme mínimo não quebra", () => {
    const v = mapMovieDetails(minimalRaw);
    expect(v.watch).toEqual({ flatrate: [], rent: [], buy: [] });
    expect(v.overview).toBeNull();
    expect(v.posterPath).toBeNull();
    expect(v.trailerYoutubeKey).toBeNull();
    expect(v.certification).toBeNull();
  });

  it("prefere trailer pt sobre en", () => {
    const raw = {
      ...minimalRaw,
      videos: {
        results: [
          { key: "A", site: "YouTube", type: "Trailer", iso_639_1: "en" },
          { key: "B", site: "YouTube", type: "Teaser", iso_639_1: "pt" },
          { key: "C", site: "YouTube", type: "Trailer", iso_639_1: "pt" },
        ],
      },
    };
    expect(mapMovieDetails(raw).trailerYoutubeKey).toBe("C");
  });

  it("usa en e depois qualquer idioma quando não há pt", () => {
    const mk = (results: any[]) => mapMovieDetails({ ...minimalRaw, videos: { results } }).trailerYoutubeKey;
    expect(
      mk([
        { key: "X", site: "YouTube", type: "Trailer", iso_639_1: "es" },
        { key: "Y", site: "YouTube", type: "Trailer", iso_639_1: "en" },
      ]),
    ).toBe("Y");
    expect(mk([{ key: "X", site: "YouTube", type: "Trailer", iso_639_1: "es" }])).toBe("X");
    expect(mk([{ key: "V", site: "Vimeo", type: "Trailer", iso_639_1: "pt" }])).toBeNull();
  });

  it("pula certificações BR vazias", () => {
    const raw = {
      ...minimalRaw,
      release_dates: {
        results: [{ iso_3166_1: "BR", release_dates: [{ certification: "" }, { certification: "14" }] }],
      },
    };
    expect(mapMovieDetails(raw).certification).toBe("14");
  });
});

describe("getMovieDetails", () => {
  it("chama o TMDB com append_to_response e revalida em 43200", async () => {
    vi.mocked(tmdbFetch).mockResolvedValue(fullRaw);
    const v = await getMovieDetails(969681);
    expect(v?.id).toBe(969681);
    expect(tmdbFetch).toHaveBeenCalledWith(
      "/movie/969681",
      {
        append_to_response: "videos,credits,recommendations,release_dates,watch/providers",
        include_video_language: "pt,en,null",
      },
      43200,
    );
  });

  it("404 → null", async () => {
    vi.mocked(tmdbFetch).mockImplementation(async () => {
      throw new TmdbError(404, "/movie/1");
    });
    expect(await getMovieDetails(1)).toBeNull();
  });

  it("outros erros propagam", async () => {
    vi.mocked(tmdbFetch).mockImplementation(async () => {
      throw new TmdbError(500, "/movie/1");
    });
    await expect(getMovieDetails(1)).rejects.toThrow();
  });
});
