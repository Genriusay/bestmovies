import "server-only";
import { tmdbFetch } from "@/lib/tmdb/client";
import type { ProviderInfo, RawProvider } from "@/lib/tmdb/types";

export type ServiceSlug =
  | "netflix"
  | "prime-video"
  | "disney-plus"
  | "max"
  | "globoplay"
  | "apple-tv-plus";

export const SERVICES: readonly {
  slug: ServiceSlug;
  name: string;
  color: string;
  pattern: RegExp;
}[] = [
  { slug: "netflix", name: "Netflix", color: "#e50914", pattern: /^Netflix/i },
  { slug: "prime-video", name: "Prime Video", color: "#00a8e1", pattern: /^Amazon Prime Video/i },
  { slug: "disney-plus", name: "Disney+", color: "#113ccf", pattern: /^Disney Plus/i },
  { slug: "max", name: "Max", color: "#5822b4", pattern: /^(HBO )?Max\b/i },
  { slug: "globoplay", name: "Globoplay", color: "#ff4b00", pattern: /^Globoplay/i },
  // O TMDB passou a chamar o Apple TV+ de "Apple TV" (id 350); "Apple TV Store" (aluguel/compra) fica de fora.
  { slug: "apple-tv-plus", name: "Apple TV+", color: "#555555", pattern: /^Apple TV(\+| Plus|$)/i },
];

export function toProviderInfo(raw: RawProvider): ProviderInfo {
  return { id: raw.provider_id, name: raw.provider_name, logoPath: raw.logo_path };
}

export function matchService(providerName: string): ServiceSlug | null {
  if (/Channel/i.test(providerName)) return null;
  return SERVICES.find((s) => s.pattern.test(providerName))?.slug ?? null;
}

export function resolveServiceIds(providers: ProviderInfo[]): Record<ServiceSlug, number[]> {
  const out = Object.fromEntries(SERVICES.map((s) => [s.slug, [] as number[]])) as Record<
    ServiceSlug,
    number[]
  >;
  for (const p of providers) {
    const slug = matchService(p.name);
    if (slug) out[slug].push(p.id);
  }
  return out;
}

export function groupProviderVariants(list: ProviderInfo[]): ProviderInfo[] {
  const seen = new Set<ServiceSlug>();
  return list.filter((p) => {
    const slug = matchService(p.name);
    if (!slug) return true;
    if (seen.has(slug)) return false;
    seen.add(slug);
    return true;
  });
}

export async function getServiceIds(): Promise<Record<ServiceSlug, number[]>> {
  const data = await tmdbFetch<{ results: RawProvider[] }>(
    "/watch/providers/movie",
    { watch_region: "BR" },
    86400,
  );
  return resolveServiceIds(data.results.map(toProviderInfo));
}

export function getService(slug: string): (typeof SERVICES)[number] | null {
  return SERVICES.find((s) => s.slug === slug) ?? null;
}
