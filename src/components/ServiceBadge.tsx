import { SERVICES, type ServiceSlug } from "@/lib/tmdb/services";

export function ServiceBadge({ slug }: { slug: ServiceSlug }) {
  const service = SERVICES.find((s) => s.slug === slug);
  if (!service) return null;
  return (
    <span
      className="inline-block rounded px-2 py-0.5 text-xs font-bold text-white"
      style={{ backgroundColor: service.color }}
    >
      {service.name}
    </span>
  );
}
