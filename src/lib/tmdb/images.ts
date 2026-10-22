const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

export function imageUrl(
  path: string | null,
  size: 'w185' | 'w342' | 'w780' | 'w1280' | 'original',
): string | null {
  return path ? `${IMAGE_BASE_URL}/${size}${path}` : null;
}
