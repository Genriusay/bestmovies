import Link from "next/link";

export function Header() {
  return (
    <header className="border-b border-white/10 bg-[#0f1115]">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
        <Link href="/" className="text-xl font-bold text-[#f5c518]">
          Aulamovies
        </Link>
        <form action="/busca" method="get" role="search" className="flex-1">
          <input
            type="search"
            name="q"
            aria-label="Buscar filme"
            placeholder="Buscar filme"
            className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/50 focus:border-[#f5c518] focus:outline-none"
          />
        </form>
        <div data-slot="auth" className="min-w-16 shrink-0" />
      </div>
    </header>
  );
}
