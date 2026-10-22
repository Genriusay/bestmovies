import Link from "next/link";

const linkCls =
  "rounded-full bg-zinc-800 px-4 py-2 text-sm text-zinc-200 transition hover:bg-zinc-700";

export function Pagination({
  page,
  totalPages,
  hrefFor,
}: {
  page: number;
  totalPages: number;
  hrefFor: (p: number) => string;
}) {
  if (totalPages <= 1) return null;
  return (
    <nav aria-label="Paginação" className="flex items-center justify-center gap-4 px-4 py-6">
      {page > 1 && (
        <Link href={hrefFor(page - 1)} className={linkCls}>
          ‹ Anterior
        </Link>
      )}
      <span className="text-sm text-zinc-400">
        Página {page} de {totalPages}
      </span>
      {page < totalPages && (
        <Link href={hrefFor(page + 1)} className={linkCls}>
          Próxima ›
        </Link>
      )}
    </nav>
  );
}
