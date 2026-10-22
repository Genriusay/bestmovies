// Tipos view (usados pela interface)
export type MovieSummary = {
  id: number;
  title: string;
  posterPath: string | null;
  backdropPath: string | null;
  year: number | null;
  voteAverage: number;
  genreIds: number[];
};
export type Genre = { id: number; name: string };
export type ProviderInfo = { id: number; name: string; logoPath: string | null };
export type WatchOptions = {
  flatrate: ProviderInfo[];
  rent: ProviderInfo[];
  buy: ProviderInfo[];
};
export type CastMember = {
  id: number;
  name: string;
  character: string;
  profilePath: string | null;
};
export type Paged<T> = { page: number; totalPages: number; results: T[] };
export type MovieDetailsView = {
  id: number;
  title: string;
  overview: string | null;
  posterPath: string | null;
  backdropPath: string | null;
  year: number | null;
  runtimeMinutes: number | null;
  certification: string | null;
  voteAverage: number;
  genres: Genre[];
  watch: WatchOptions;
  trailerYoutubeKey: string | null;
  cast: CastMember[];
  recommendations: MovieSummary[];
};

// Tipos crus (resposta do TMDB)
export type RawMovie = {
  id: number;
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  genre_ids: number[];
};
export type RawProvider = {
  provider_id: number;
  provider_name: string;
  logo_path: string | null;
  display_priority?: number;
};
export type RawPaged<T> = {
  page: number;
  total_pages: number;
  total_results: number;
  results: T[];
};
