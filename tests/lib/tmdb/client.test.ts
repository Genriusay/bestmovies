import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const cacheLife = vi.hoisted(() => vi.fn());
vi.mock("next/cache", () => ({ cacheLife }));

import {
  buildTmdbUrl,
  imageUrl,
  tmdbFetch,
  toMovieSummary,
} from "@/lib/tmdb/client";

describe("tmdb client", () => {
  beforeEach(() => {
    vi.stubEnv("TMDB_READ_TOKEN", "tkn");
    cacheLife.mockClear();
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("monta URL com pt-BR e codifica", () => {
    expect(
      buildTmdbUrl("/search/movie", {
        query: "velozes & furiosos #9",
        page: 2,
        x: undefined,
      }),
    ).toBe(
      "https://api.themoviedb.org/3/search/movie?language=pt-BR&query=velozes+%26+furiosos+%239&page=2",
    );
  });

  it("envia Bearer e aplica o revalidate pedido via cacheLife", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ a: 1 }),
    });
    vi.stubGlobal("fetch", fetchMock);
    const data = await tmdbFetch<{ a: number }>("/movie/1", undefined, 600);
    expect(data).toEqual({ a: 1 });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://api.themoviedb.org/3/movie/1?language=pt-BR");
    expect(init.headers.Authorization).toBe("Bearer tkn");
    expect(cacheLife).toHaveBeenCalledWith({ revalidate: 600 });
  });

  it("usa 3600s de revalidate por padrão", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({}) }),
    );
    await tmdbFetch("/movie/1");
    expect(cacheLife).toHaveBeenCalledWith({ revalidate: 3600 });
  });

  it("lança TmdbError sem vazar token", async () => {
    vi.stubEnv("TMDB_READ_TOKEN", "segredo");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 401, json: async () => ({}) }),
    );
    await expect(tmdbFetch("/movie/1", { query: "x" })).rejects.toMatchObject({
      status: 401,
      message: "TMDB respondeu 401 em /movie/1",
    });
    await expect(tmdbFetch("/movie/1")).rejects.not.toThrow(/segredo/);
  });

  it("sem token lança erro claro e não chama o fetch", async () => {
    vi.stubEnv("TMDB_READ_TOKEN", "");
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    await expect(tmdbFetch("/movie/1")).rejects.toThrow("TMDB_READ_TOKEN não configurado");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("imageUrl", () => {
    expect(imageUrl("/a.jpg", "w342")).toBe("https://image.tmdb.org/t/p/w342/a.jpg");
    expect(imageUrl(null, "w342")).toBeNull();
  });

  it("toMovieSummary trata data vazia", () => {
    const base = {
      id: 1,
      title: "X",
      poster_path: null,
      backdrop_path: null,
      vote_average: 7.1,
      genre_ids: [28],
    };
    expect(toMovieSummary({ ...base, release_date: "" }).year).toBeNull();
    expect(toMovieSummary({ ...base, release_date: "2021-05-03" }).year).toBe(2021);
  });
});
