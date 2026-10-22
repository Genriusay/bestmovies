import Image from "next/image";
import { imageUrl } from "@/lib/tmdb/images";
import type { ProviderInfo, WatchOptions } from "@/lib/tmdb/types";

const ROWS: { key: keyof WatchOptions; label: string }[] = [
  { key: "flatrate", label: "Assinatura" },
  { key: "rent", label: "Alugar" },
  { key: "buy", label: "Comprar" },
];

function Logo({ provider }: { provider: ProviderInfo }) {
  const src = imageUrl(provider.logoPath, "w92");
  return (
    <li>
      {src ? (
        <Image
          src={src}
          alt={provider.name}
          title={provider.name}
          width={44}
          height={44}
          className="h-11 w-11 rounded-lg object-cover"
        />
      ) : (
        <span className="flex h-11 items-center rounded-lg bg-zinc-800 px-2 text-xs font-semibold">
          {provider.name}
        </span>
      )}
    </li>
  );
}

export function WatchProviders({ watch }: { watch: WatchOptions }) {
  const rows = ROWS.filter((r) => watch[r.key].length > 0);
  return (
    <section className="px-4 py-3">
      <h2 className="mb-2 text-base font-bold">Onde assistir no Brasil</h2>
      {rows.length === 0 ? (
        <p className="text-sm text-zinc-400">
          Este filme não está disponível em streaming no Brasil no momento.
        </p>
      ) : (
        <div className="space-y-2">
          {rows.map((r) => (
            <div key={r.key} className="flex items-center gap-3">
              <span className="w-24 shrink-0 text-sm text-zinc-400">{r.label}</span>
              <ul className="flex flex-wrap gap-2">
                {watch[r.key].map((p) => (
                  <Logo key={p.id} provider={p} />
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
