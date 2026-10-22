import Link from "next/link";
import type { Genre } from "@/lib/tmdb/types";

const base = "block whitespace-nowrap rounded-full px-3 py-1.5 text-sm transition";
const on = "bg-zinc-100 font-bold text-zinc-900";
const off = "bg-zinc-800 text-zinc-200 hover:bg-zinc-700";

export function GenreChips({
  genres,
  activeId,
  basePath,
}: {
  genres: Genre[];
  activeId: number | null;
  basePath: string;
}) {
  return (
    <nav aria-label="Gêneros" className="py-2">
      <ul className="flex gap-2 overflow-x-auto px-4 pb-1">
        <li>
          <Link
            href={basePath}
            aria-current={activeId === null ? "true" : undefined}
            className={`${base} ${activeId === null ? on : off}`}
          >
            Todos
          </Link>
        </li>
        {genres.map((g) => (
          <li key={g.id}>
            <Link
              href={`${basePath}?genero=${g.id}`}
              aria-current={activeId === g.id ? "true" : undefined}
              className={`${base} ${activeId === g.id ? on : off}`}
            >
              {g.name}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
