import { RowsSkeleton } from "@/components/RowsSkeleton";

export default function Loading() {
  return (
    <main className="mx-auto w-full max-w-6xl flex-1">
      <RowsSkeleton />
    </main>
  );
}
