export function Footer() {
  return (
    <footer className="mt-auto border-t border-white/10 bg-[#0f1115]">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-4 py-6 text-center text-sm text-white/60 sm:flex-row sm:text-left">
        {/* SVG oficial do TMDB: <img> simples evita a otimização do next/image */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/tmdb-logo.svg" alt="TMDB" className="h-4 w-auto" />
        <div className="space-y-1">
          <p>
            Este produto usa a API do TMDB, mas não é endossado nem certificado
            pelo TMDB.
          </p>
          <p>Disponibilidade de streaming: JustWatch</p>
        </div>
      </div>
    </footer>
  );
}
