import { describe, it, expect } from "vitest";
import { formatRuntime, formatRating, yearOf } from "@/lib/format";

describe("format", () => {
  it.each([
    [128, "2h 08m"],
    [120, "2h 00m"],
    [45, "45m"],
    [null, null],
    [0, null],
  ])("formatRuntime(%s)", (input, expected) => {
    expect(formatRuntime(input)).toBe(expected);
  });
  it("formatRating", () => {
    expect(formatRating(7.84)).toBe("★ 7.8");
  });
  it.each([[0], [NaN], [Infinity], [-1]])("formatRating(%s) → null", (v) => {
    expect(formatRating(v)).toBeNull();
  });
  it.each([
    ["2021-05-03", 2021],
    ["", null],
    [null, null],
    [undefined, null],
    ["lixo", null],
  ])("yearOf(%s)", (input, expected) => {
    expect(yearOf(input)).toBe(expected);
  });
});
