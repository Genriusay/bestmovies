import "server-only";
import { tmdbFetch } from "@/lib/tmdb/client";
import type { ProviderInfo, RawProvider } from "@/lib/tmdb/types";

import { SERVICES, type ServiceSlug } from "@/lib/tmdb/services";

export { SERVICES };
export type { ServiceSlug };

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
