import "server-only";
import { TmdbError, tmdbFetch, toMovieSummary } from "./client";
import { groupProviderVariants, toProviderInfo } from "./providers";
import type {
  MovieDetailsView,
  ProviderInfo,
  RawMovieDetails,
  RawProvider,
  RawVideo,
} from "./types";

export async function getMovieDetails(id: number): Promise<MovieDetailsView | null> {
  try {
    const raw = await tmdbFetch<RawMovieDetails>(
      `/movie/${id}`,
      {
        append_to_response: "videos,credits,recommendations,release_dates,watch/providers",
        include_video_language: "pt,en,null",
      },
      43200,
    );
    return mapMovieDetails(raw);
  } catch (e) {
    if (e instanceof TmdbError && e.status === 404) return null;
    throw e;
  }
}

function pickTrailer(videos: RawVideo[]): string | null {
  const trailers = videos.filter((v) => v.site === "YouTube" && v.type === "Trailer");
  const best =
    trailers.find((v) => v.iso_639_1 === "pt") ??
    trailers.find((v) => v.iso_639_1 === "en") ??
    trailers[0];
  return best?.key ?? null;
}

function pickCertification(raw: RawMovieDetails): string | null {
  for (const country of raw.release_dates?.results ?? []) {
    if (country.iso_3166_1 !== "BR") continue;
    const found = country.release_dates.find((r) => r.certification);
    if (found) return found.certification;
  }
  return null;
}

export function mapMovieDetails(raw: RawMovieDetails): MovieDetailsView {
  const br = raw["watch/providers"]?.results?.BR;
  const group = (list?: RawProvider[]): ProviderInfo[] =>
    groupProviderVariants((list ?? []).map(toProviderInfo));
  const year = raw.release_date ? Number(raw.release_date.slice(0, 4)) : NaN;
  return {
    id: raw.id,
    title: raw.title,
    overview: raw.overview ? raw.overview : null,
    posterPath: raw.poster_path,
    backdropPath: raw.backdrop_path,
    year: Number.isNaN(year) ? null : year,
    runtimeMinutes: raw.runtime ? raw.runtime : null,
    certification: pickCertification(raw),
    voteAverage: raw.vote_average,
    genres: raw.genres ?? [],
    watch: {
      flatrate: group(br?.flatrate),
      rent: group(br?.rent),
      buy: group(br?.buy),
    },
    trailerYoutubeKey: pickTrailer(raw.videos?.results ?? []),
    cast: (raw.credits?.cast ?? []).slice(0, 10).map((c) => ({
      id: c.id,
      name: c.name,
      character: c.character,
      profilePath: c.profile_path,
    })),
    recommendations: (raw.recommendations?.results ?? []).slice(0, 12).map(toMovieSummary),
  };
}
