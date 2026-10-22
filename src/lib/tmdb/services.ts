export type ServiceSlug =
  | "netflix"
  | "prime-video"
  | "disney-plus"
  | "max"
  | "globoplay"
  | "apple-tv-plus";

export const SERVICES: readonly {
  slug: ServiceSlug;
  name: string;
  color: string;
  pattern: RegExp;
}[] = [
  { slug: "netflix", name: "Netflix", color: "#e50914", pattern: /^Netflix/i },
  { slug: "prime-video", name: "Prime Video", color: "#00a8e1", pattern: /^Amazon Prime Video/i },
  { slug: "disney-plus", name: "Disney+", color: "#113ccf", pattern: /^Disney Plus/i },
  { slug: "max", name: "HBO Max", color: "#5822b4", pattern: /^(HBO )?Max\b/i },
  { slug: "globoplay", name: "Globoplay", color: "#ff4b00", pattern: /^Globoplay/i },
  // O TMDB passou a chamar o Apple TV+ de "Apple TV" (id 350); "Apple TV Store" (aluguel/compra) fica de fora.
  { slug: "apple-tv-plus", name: "Apple TV", color: "#555555", pattern: /^Apple TV(\+| Plus|$)/i },
];
