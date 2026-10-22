"use client";

export default function ErrorPage({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center gap-4 px-4 py-16 text-center">
      <p className="text-lg">Não foi possível carregar os filmes agora.</p>
      <button
        type="button"
        onClick={() => retry()}
        className="rounded-md bg-accent px-4 py-2 font-bold text-zinc-900 hover:brightness-110"
      >
        Tentar novamente
      </button>
    </main>
  );
}
