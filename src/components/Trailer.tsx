export function Trailer({ youtubeKey, title }: { youtubeKey: string | null; title: string }) {
  if (!youtubeKey) return null;
  return (
    <section className="px-4 py-3">
      <h2 className="mb-2 text-base font-bold">Trailer</h2>
      <div className="aspect-video w-full overflow-hidden rounded-lg bg-zinc-900">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${encodeURIComponent(youtubeKey)}`}
          title={`Trailer de ${title}`}
          loading="lazy"
          allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="h-full w-full"
        />
      </div>
    </section>
  );
}
