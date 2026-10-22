import { describe, expect, it } from "vitest";
import { parseGenreParam, parsePageParam } from "@/lib/params";

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
