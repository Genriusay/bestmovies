"use client";

import { useSearchParams } from "next/navigation";

export const searchInputClass =
  "w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/50 focus:border-[#f5c518] focus:outline-none";

export function HeaderSearchInput() {
  const q = (useSearchParams() as URLSearchParams | null)?.get("q") ?? "";
  // key força o campo a refletir a query atual após navegações.
  return (
    <input
      key={q}
      type="search"
      name="q"
      aria-label="Buscar filme"
      placeholder="Buscar filme"
      defaultValue={q}
      className={searchInputClass}
    />
  );
}
