export function RowsSkeleton() {
  return (
    <div aria-busy="true" aria-label="Carregando" className="animate-pulse px-4 py-4">
      <div className="h-56 rounded-xl bg-zinc-800 sm:h-80" />
      {[0, 1, 2].map((r) => (
        <div key={r} className="pt-6">
          <div className="mb-2 h-5 w-40 rounded bg-zinc-800" />
          <div className="flex gap-2 overflow-hidden">
            {Array.from({ length: 8 }, (_, i) => (
              <div key={i} className="aspect-[2/3] w-28 shrink-0 rounded-md bg-zinc-800 sm:w-32" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
