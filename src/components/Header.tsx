import Link from "next/link";
import { Suspense } from "react";
import { HeaderSearchInput, searchInputClass } from "@/components/HeaderSearchInput";

export function Header() {
  return (
    <header className="border-b border-white/10 bg-[#0f1115]">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
        <Link href="/" className="text-xl font-bold text-[#f5c518]">
          Bestmovies
        </Link>
        <form action="/busca" method="get" role="search" className="flex-1">
          <Suspense
            fallback={
              <input
                type="search"
                name="q"
                aria-label="Buscar filme"
                placeholder="Buscar filme"
                className={searchInputClass}
              />
            }
          >
            <HeaderSearchInput />
          </Suspense>
        </form>
        <div data-slot="auth" className="min-w-16 shrink-0" />
      </div>
    </header>
  );
}
