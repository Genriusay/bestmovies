import Image from "next/image";
import { imageUrl } from "@/lib/tmdb/images";
import type { CastMember } from "@/lib/tmdb/types";

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  const first = parts[0][0];
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

export function CastList({ cast }: { cast: CastMember[] }) {
  if (cast.length === 0) return null;
  return (
    <section className="py-3">
      <h2 className="mb-2 px-4 text-base font-bold">Elenco</h2>
      <ul className="flex gap-3 overflow-x-auto px-4 pb-2">
        {cast.map((c) => {
          const src = imageUrl(c.profilePath, "w185");
          return (
            <li key={c.id} className="w-20 shrink-0 text-center">
              <div className="relative mx-auto h-16 w-16 overflow-hidden rounded-full bg-zinc-700">
                {src ? (
                  <Image src={src} alt={c.name} fill sizes="64px" className="object-cover" />
                ) : (
                  <span className="flex h-full w-full items-center justify-center text-sm font-bold text-zinc-300">
                    {initials(c.name)}
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs leading-tight">{c.name}</p>
              {c.character && (
                <p className="text-[11px] leading-tight text-zinc-500">{c.character}</p>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
