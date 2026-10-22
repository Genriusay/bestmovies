import { describe, it, expect } from "vitest";
import { formatRuntime, formatRating } from "@/lib/format";

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
});
