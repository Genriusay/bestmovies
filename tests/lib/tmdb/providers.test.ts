import { describe, expect, it, vi } from "vitest";
import fixture from "../../fixtures/providers-br.json";

vi.mock("@/lib/tmdb/client", () => ({ tmdbFetch: vi.fn() }));

import {
  SERVICES,
  getService,
  groupProviderVariants,
  matchService,
  resolveServiceIds,
  toProviderInfo,
} from "@/lib/tmdb/providers";

const n8 = { id: 8, name: "Netflix", logoPath: null };
const n1796 = { id: 1796, name: "Netflix Standard with Ads", logoPath: null };
const mubi = { id: 11, name: "MUBI", logoPath: null };

describe("providers", () => {
  it.each([
    ["Netflix", "netflix"],
    ["Netflix Standard with Ads", "netflix"],
    ["Amazon Prime Video", "prime-video"],
    ["Amazon Prime Video with Ads", "prime-video"],
    ["Disney Plus", "disney-plus"],
    ["Max", "max"],
    ["HBO Max", "max"],
    ["Globoplay", "globoplay"],
    ["Apple TV Plus", "apple-tv-plus"],
    ["Apple TV", "apple-tv-plus"],
    ["Amazon Video", null],
    ["Apple TV Store", null],
    ["Paramount Plus Apple TV Channel", null],
    ["Max Amazon Channel", null],
    ["MUBI", null],
  ])("matchService(%s) = %s", (name, slug) => expect(matchService(name)).toBe(slug));

  it("resolveServiceIds agrupa variantes", () => {
    const ids = resolveServiceIds([n8, n1796, { id: 2, name: "Apple TV Store", logoPath: null }]);
    expect(ids.netflix).toEqual([8, 1796]);
    expect(ids["apple-tv-plus"]).toEqual([]);
  });
  it("groupProviderVariants mantém só o primeiro de cada serviço", () => {
    expect(groupProviderVariants([n8, n1796, mubi]).map((p) => p.id)).toEqual([8, mubi.id]);
  });
  it("fixture real do BR resolve os 6 serviços", () => {
    const ids = resolveServiceIds(fixture.results.map(toProviderInfo));
    for (const s of SERVICES) expect(ids[s.slug].length).toBeGreaterThan(0);
    expect(ids.netflix).toEqual([8, 1796]);
    expect(ids["prime-video"]).toEqual([119, 2100]);
    const channelIds = fixture.results
      .filter((p) => /Channel/i.test(p.provider_name))
      .map((p) => p.provider_id);
    expect(channelIds.length).toBeGreaterThan(0);
    const all = Object.values(ids).flat();
    for (const id of channelIds) expect(all).not.toContain(id);
  });
  it("nomes de exibição seguem as marcas atuais", () => {
    expect(getService("max")?.name).toBe("HBO Max");
    expect(getService("apple-tv-plus")?.name).toBe("Apple TV");
  });
  it("getService inválido → null", () => expect(getService("inexistente")).toBeNull());
});
