import { describe, expect, it, vi } from "vitest";
import { fetchClampedPage, parseGenreParam, parsePageParam } from "@/lib/params";

const genres = [
  { id: 35, name: "Comédia" },
  { id: 28, name: "Ação" },
];

describe("params", () => {
  it.each([
    ["35", 35],
    ["lixo", null],
    [undefined, null],
    ["99999", null],
    [["35", "28"], 35],
  ])("parseGenreParam(%s)", (v, expected) => {
    expect(parseGenreParam(v as string | string[] | undefined, genres)?.id ?? null).toBe(expected);
  });

  it.each([
    [undefined, 1],
    ["0", 1],
    ["-3", 1],
    ["abc", 1],
    ["4", 4],
    ["9999", 500],
  ])("parsePageParam(%s)", (v, expected) => {
    expect(parsePageParam(v as string | undefined)).toBe(expected);
  });

  it("parsePageParam respeita totalPages", () => expect(parsePageParam("9", 3)).toBe(3));
});

describe("fetchClampedPage", () => {
  const paged = (page: number, totalPages: number) => ({ page, totalPages, results: [] as number[] });

  it("uma só chamada quando a página existe", async () => {
    const fetchPage = vi.fn(async (p: number) => paged(p, 5));
    expect((await fetchClampedPage(fetchPage, "3")).page).toBe(3);
    expect(fetchPage).toHaveBeenCalledTimes(1);
  });
  it("busca de novo limitada ao total", async () => {
    const fetchPage = vi.fn(async (p: number) => paged(p, 5));
    expect((await fetchClampedPage(fetchPage, "99")).page).toBe(5);
    expect(fetchPage.mock.calls.map((c) => c[0])).toEqual([99, 5]);
  });
  it("página inválida cai na 1", async () => {
    const fetchPage = vi.fn(async (p: number) => paged(p, 5));
    expect((await fetchClampedPage(fetchPage, "x")).page).toBe(1);
  });
});
