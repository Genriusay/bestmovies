export function formatRuntime(min: number | null): string | null {
  if (!min || min <= 0) return null;
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h === 0) return `${m}m`;
  return `${h}h ${String(m).padStart(2, "0")}m`;
}

export function formatRating(v: number): string | null {
  if (!Number.isFinite(v) || v <= 0) return null;
  return `★ ${v.toFixed(1)}`;
}

export function yearOf(date: string | null | undefined): number | null {
  if (!date) return null;
  const year = Number(date.slice(0, 4));
  return Number.isNaN(year) ? null : year;
}
