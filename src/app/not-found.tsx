import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center gap-4 px-4 py-16 text-center">
      <h1 className="text-2xl font-semibold">Página não encontrada</h1>
      <Link href="/" className="text-accent hover:underline">
        Voltar ao início
      </Link>
    </main>
  );
}
