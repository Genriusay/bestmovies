# Aulamovies — Catálogo de streaming: Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Site público em pt-BR que mostra os filmes disponíveis agora nos streamings do Brasil (dados TMDB), com tela inicial em fileiras por serviço, "ver tudo", página do filme e busca.

**Architecture:** Next.js App Router com Server Components. Toda chamada ao TMDB passa por `src/lib/tmdb/*`, que roda só no servidor, usa o token de uma variável de ambiente e faz cache com `next.revalidate`. A interface (`src/components`, `src/app`) só consome tipos "view" já mapeados, nunca o JSON cru do TMDB. Isso deixa a camada de dados separada para o login (Supabase) entrar depois.

**Tech Stack:** Next.js (15+), React, TypeScript, Tailwind CSS, Vitest + @testing-library/react + jsdom, deploy na Vercel.

**Spec:** `docs/superpowers/specs/2026-10-22-aulamovies-catalogo-design.md` (ler junto; o mockup aprovado está em `.superpowers/brainstorm/101-1792695016/content/home-a-v2.html`).

## Global Constraints

- Toda chamada ao TMDB leva `language=pt-BR`; toda chamada de disponibilidade leva `watch_region=BR`. Base: `https://api.themoviedb.org/3`.
- Autenticação: header `Authorization: Bearer ${process.env.TMDB_READ_TOKEN}`. O token **nunca** vai para o navegador: nada de `NEXT_PUBLIC_`, e os módulos de `src/lib/tmdb` importam `server-only`.
- Imagens: `https://image.tmdb.org/t/p/<tamanho><path>`, via `next/image` com `remotePatterns` para `image.tmdb.org`.
- Serviços das fileiras, nesta ordem: Netflix, Prime Video, Disney+, Max, Globoplay, Apple TV+. Os IDs são resolvidos de `/watch/providers/movie?watch_region=BR` pelo nome, nunca fixos no código.
- Fileiras e "ver tudo" usam só assinatura (`with_watch_monetization_types=flatrate`) e `sort_by=popularity.desc`.
- Página do filme: "Onde assistir" mostra **todos** os provedores de `results.BR` (flatrate/rent/buy), com variantes de um mesmo serviço agrupadas.
- Sem selo "NOVO". Top 10 sem "ver tudo".
- O filtro de gênero (`?genero=<id>`) vale para a tela inteira: destaque, Top 10 e fileiras. Com gênero selecionado, o título é `Top 10 de <Gênero> em streaming`; sem gênero, `Top 10 em streaming hoje`.
- Rodapé em todas as páginas: logo do TMDB + "Este produto usa a API do TMDB, mas não é endossado nem certificado pelo TMDB." + "Disponibilidade de streaming: JustWatch".
- Toda a interface fica em português, com tema escuro e layout que funciona a partir de 360px de largura.
- O cabeçalho reserva um espaço à direita (vazio por ora) para o futuro botão "Entrar".
- `.env.local` não é versionado; `.env.example` é versionado com `TMDB_READ_TOKEN=`.

## Review Focus

1. **Filme sem nenhum provedor no BR** (`results.BR` ausente). A página do filme mostra "Este filme não está disponível em streaming no Brasil no momento." e não quebra. → teste na Task 5 e na Task 9.
2. **Filme sem pôster, backdrop, sinopse ou foto do elenco** (`null`/`""`). Mostrar um placeholder visual e, sem sinopse, "Sinopse não disponível em português." → testes nas Tasks 5 e 6.
3. **TMDB fora do ar, token inválido ou limite de requisições** (status ≠ 2xx). Mostrar página de erro amigável em português com "Tentar novamente", sem expor o token nem a URL com headers. → teste na Task 2 (`TmdbError` sem token na mensagem) e `error.tsx` na Task 7.
4. **Busca vazia, só espaços, com acentos/símbolos (`&`, `#`) ou sem resultados.** Vazia não chama a API e mostra uma dica; com símbolos, a query é codificada corretamente; sem resultados, mostra "Nenhum filme encontrado para "<q>"." → testes nas Tasks 2, 4 e 10.
5. **URLs inválidas**: `/filme/abc`, `/filme/999999999` (404 do TMDB), `/servico/inexistente`, `?genero=lixo`, `?pagina=0`/`-3`/`9999`. Filme ou serviço inválido → página 404. Gênero inválido → ignorado (equivale a "Todos"). Página → limitada a 1..min(totalPages, 500). → testes nas Tasks 3, 4 e 8.

---

## File Structure

```
src/
  lib/
    tmdb/
      types.ts          # tipos crus (Raw*) e tipos view (MovieSummary, MovieDetailsView…)
      client.ts         # buildTmdbUrl, tmdbFetch, TmdbError, imageUrl
      providers.ts      # SERVICES, matchService, resolveServiceIds, groupProviderVariants, getServiceIds
      movies.ts         # getGenres, discoverMovies, getTop10, getHero, searchMovies, getFlatrateProviders
      details.ts        # getMovieDetails + mapMovieDetails (puro)
    params.ts           # parseGenreParam, parsePageParam
    format.ts           # formatRuntime, yearOf, formatRating
  components/
    Header.tsx  Footer.tsx  PosterCard.tsx  MovieRow.tsx  ServiceBadge.tsx
    GenreChips.tsx  HeroCarousel.tsx (client)  MovieGrid.tsx  Pagination.tsx
    WatchProviders.tsx  CastList.tsx  Trailer.tsx
  app/
    layout.tsx  globals.css  page.tsx  loading.tsx  error.tsx  not-found.tsx
    servico/[slug]/page.tsx
    filme/[id]/page.tsx
    busca/page.tsx
tests/                  # espelha src/ (ex.: tests/lib/tmdb/client.test.ts)
  fixtures/             # JSONs de exemplo do TMDB
docs/publicar.md        # guia de publicação para leigos
```

Interfaces compartilhadas (definidas na Task 2, em `src/lib/tmdb/types.ts`):

```ts
export type MovieSummary = { id: number; title: string; posterPath: string | null; backdropPath: string | null; year: number | null; voteAverage: number; genreIds: number[] };
export type Genre = { id: number; name: string };
export type ProviderInfo = { id: number; name: string; logoPath: string | null };
export type WatchOptions = { flatrate: ProviderInfo[]; rent: ProviderInfo[]; buy: ProviderInfo[] };
export type CastMember = { id: number; name: string; character: string; profilePath: string | null };
export type Paged<T> = { page: number; totalPages: number; results: T[] };
export type MovieDetailsView = {
  id: number; title: string; overview: string | null; posterPath: string | null; backdropPath: string | null;
  year: number | null; runtimeMinutes: number | null; certification: string | null; voteAverage: number;
  genres: Genre[]; watch: WatchOptions; trailerYoutubeKey: string | null; cast: CastMember[]; recommendations: MovieSummary[];
};
```

---

### Task 1: Projeto base, testes e layout com atribuição

**Files:**
- Create: projeto Next.js na raiz (sem sobrescrever `docs/` nem `.gitignore`), `vitest.config.ts`, `tests/setup.ts`, `.env.example`, `.env.local` (não versionado), `src/components/Header.tsx`, `src/components/Footer.tsx`, `public/tmdb-logo.svg`
- Modify: `src/app/layout.tsx`, `src/app/globals.css`, `next.config.ts`, `package.json`
- Test: `tests/components/Footer.test.tsx`, `tests/components/Header.test.tsx`

**Interfaces:**
- Produces: `<Header />` (logo "Aulamovies" linkando para `/`, formulário de busca `GET /busca?q=` com input `name="q"` e `aria-label="Buscar filme"`, espaço vazio reservado `data-slot="auth"`); `<Footer />`; script `npm test` (vitest run).

- [ ] **Step 1:** Rodar `node -v` e confirmar que é ≥ 20. Rodar `npx create-next-app@latest aulamovies-tmp --ts --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm --no-turbopack` e mover o conteúdo para a raiz, mesclando o `.gitignore` gerado com o existente, que deve manter `.superpowers/` e `.env.local`. Depois apagar `aulamovies-tmp`.
- [ ] **Step 2:** `npm i server-only` e `npm i -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom`. Configurar `vitest.config.ts` com ambiente `jsdom`, alias `@` → `src`, `setupFiles: ['tests/setup.ts']` (importa `@testing-library/jest-dom/vitest`) e um alias de `server-only` para um módulo vazio nos testes. Adicionar `"test": "vitest run"` ao `package.json`.
- [ ] **Step 3:** Criar `.env.example` com `TMDB_READ_TOKEN=` e `.env.local` com `TMDB_READ_TOKEN=COLE_SEU_TOKEN_AQUI`. Em `next.config.ts`, adicionar `images.remotePatterns` para `https://image.tmdb.org/t/p/**`. Baixar o logo oficial do TMDB (página de logos e atribuição do TMDB) para `public/tmdb-logo.svg`.
- [ ] **Step 4: Escrever os testes que falham**

```tsx
// tests/components/Footer.test.tsx
it('mostra a atribuição exigida', () => {
  render(<Footer />);
  expect(screen.getByAltText('TMDB')).toBeInTheDocument();
  expect(screen.getByText(/usa a API do TMDB, mas não é endossado nem certificado pelo TMDB/)).toBeInTheDocument();
  expect(screen.getByText(/JustWatch/)).toBeInTheDocument();
});
// tests/components/Header.test.tsx
it('tem busca que envia para /busca com q', () => {
  render(<Header />);
  const input = screen.getByLabelText('Buscar filme');
  expect(input).toHaveAttribute('name', 'q');
  expect(input.closest('form')).toHaveAttribute('action', '/busca');
});
```

- [ ] **Step 5:** `npm test`. Expected: FAIL (módulos não existem).
- [ ] **Step 6:** Implementar `Header` e `Footer` conforme as Interfaces, com tema escuro (fundo `#0f1115`, destaque `#f5c518`, como no mockup). `layout.tsx` usa `<html lang="pt-BR">`, `metadata.title = "Aulamovies"`, e o corpo fica Header → `{children}` → Footer.
- [ ] **Step 7:** `npm test` → PASS; `npm run build` → sucesso.
- [ ] **Step 8:** Commit: `git add -A && git commit -m "chore: projeto Next.js base com layout e atribuição TMDB"`

---

### Task 2: Cliente TMDB

**Files:**
- Create: `src/lib/tmdb/types.ts`, `src/lib/tmdb/client.ts`
- Test: `tests/lib/tmdb/client.test.ts`

**Interfaces:**
- Produces:
  - tipos compartilhados (bloco acima) e os crus `RawMovie`, `RawProvider`, `RawPaged<T>`
  - `buildTmdbUrl(path: string, params?: Record<string, string | number | undefined>): string`. Sempre adiciona `language=pt-BR`, ignora params `undefined` e codifica os valores.
  - `tmdbFetch<T>(path: string, params?: Record<string, string | number | undefined>, revalidateSeconds = 3600): Promise<T>`, que usa `fetch(url, { headers: { Authorization: 'Bearer …' }, next: { revalidate } })`
  - `class TmdbError extends Error { status: number }`, com a mensagem `TMDB respondeu ${status} em ${path}` (sem token e sem query string)
  - `imageUrl(path: string | null, size: 'w185' | 'w342' | 'w780' | 'w1280' | 'original'): string | null`
  - `toMovieSummary(raw: RawMovie): MovieSummary`. `year` vem de `release_date`; uma string vazia vira `null`.

- [ ] **Step 1: Escrever os testes que falham**

```ts
it('monta URL com pt-BR e codifica', () => {
  expect(buildTmdbUrl('/search/movie', { query: 'velozes & furiosos #9', page: 2, x: undefined }))
    .toBe('https://api.themoviedb.org/3/search/movie?language=pt-BR&query=velozes+%26+furiosos+%239&page=2');
});
it('envia Bearer e revalidate', async () => { /* mock global fetch → ok; espera header Authorization 'Bearer tkn' e next.revalidate 600 */ });
it('lança TmdbError sem vazar token', async () => {
  // env TMDB_READ_TOKEN='segredo'; fetch → status 401
  await expect(tmdbFetch('/movie/1')).rejects.toMatchObject({ status: 401 });
  await expect(tmdbFetch('/movie/1')).rejects.not.toThrow(/segredo/);
});
it('imageUrl', () => {
  expect(imageUrl('/a.jpg', 'w342')).toBe('https://image.tmdb.org/t/p/w342/a.jpg');
  expect(imageUrl(null, 'w342')).toBeNull();
});
it('toMovieSummary trata data vazia', () => {
  expect(toMovieSummary({ id: 1, title: 'X', poster_path: null, backdrop_path: null, release_date: '', vote_average: 7.1, genre_ids: [28] }).year).toBeNull();
});
```

- [ ] **Step 2:** `npm test -- client` → FAIL.
- [ ] **Step 3:** Implementar `types.ts` e `client.ts`. A primeira linha de `client.ts` é `import 'server-only'`.
- [ ] **Step 4:** `npm test -- client` → PASS.
- [ ] **Step 5:** Commit: `feat: cliente TMDB com URL, auth, erros e imagens`

---

### Task 3: Serviços de streaming e IDs dos provedores

**Files:**
- Create: `src/lib/tmdb/providers.ts`, `tests/fixtures/providers-br.json` (recorte real de `/watch/providers/movie?watch_region=BR`, salvo do TMDB com o token do dono, contendo pelo menos as variantes listadas nos testes)
- Test: `tests/lib/tmdb/providers.test.ts`

**Interfaces:**
- Produces:
  - `type ServiceSlug = 'netflix' | 'prime-video' | 'disney-plus' | 'max' | 'globoplay' | 'apple-tv-plus'`
  - `SERVICES: readonly { slug: ServiceSlug; name: string; color: string; pattern: RegExp }[]`, na ordem e com os valores abaixo
  - `matchService(providerName: string): ServiceSlug | null`, que retorna `null` para qualquer nome contendo `Channel`
  - `resolveServiceIds(providers: ProviderInfo[]): Record<ServiceSlug, number[]>`
  - `groupProviderVariants(list: ProviderInfo[]): ProviderInfo[]`, que mantém a ordem, deixa só o primeiro de cada serviço e preserva os provedores sem serviço
  - `getServiceIds(): Promise<Record<ServiceSlug, number[]>>`, que busca `/watch/providers/movie` com `watch_region=BR` e revalidate de 86400
  - `getService(slug: string): (typeof SERVICES)[number] | null`

| slug | name | color | pattern |
|---|---|---|---|
| netflix | Netflix | `#e50914` | `/^Netflix/i` |
| prime-video | Prime Video | `#00a8e1` | `/^Amazon Prime Video/i` |
| disney-plus | Disney+ | `#113ccf` | `/^Disney Plus/i` |
| max | Max | `#5822b4` | `/^(HBO )?Max\b/i` |
| globoplay | Globoplay | `#ff4b00` | `/^Globoplay/i` |
| apple-tv-plus | Apple TV+ | `#555555` | `/^Apple TV(\+| Plus)/i` |

- [ ] **Step 1: Escrever os testes que falham**

```ts
it.each([
  ['Netflix', 'netflix'], ['Netflix Standard with Ads', 'netflix'], ['Amazon Prime Video', 'prime-video'],
  ['Amazon Prime Video with Ads', 'prime-video'], ['Disney Plus', 'disney-plus'], ['Max', 'max'], ['HBO Max', 'max'],
  ['Globoplay', 'globoplay'], ['Apple TV Plus', 'apple-tv-plus'],
  ['Amazon Video', null], ['Apple TV', null], ['Paramount Plus Apple TV Channel', null], ['Max Amazon Channel', null], ['MUBI', null],
])('matchService(%s) = %s', (name, slug) => expect(matchService(name)).toBe(slug));

it('resolveServiceIds agrupa variantes', () => {
  const ids = resolveServiceIds([{ id: 8, name: 'Netflix', logoPath: null }, { id: 1796, name: 'Netflix Standard with Ads', logoPath: null }, { id: 2, name: 'Apple TV', logoPath: null }]);
  expect(ids.netflix).toEqual([8, 1796]);
  expect(ids['apple-tv-plus']).toEqual([]);
});
it('groupProviderVariants mantém só o primeiro de cada serviço', () => {
  expect(groupProviderVariants([n8, n1796, mubi]).map(p => p.id)).toEqual([8, mubi.id]);
});
it('fixture real do BR resolve os 6 serviços', () => {
  const ids = resolveServiceIds(fixture.results.map(toProviderInfo));
  for (const s of SERVICES) expect(ids[s.slug].length).toBeGreaterThan(0);
});
it('getService inválido → null', () => expect(getService('inexistente')).toBeNull());
```

- [ ] **Step 2:** `npm test -- providers` → FAIL.
- [ ] **Step 3:** Implementar `providers.ts`. Se o teste da fixture falhar porque o TMDB mudou algum nome, ajustar o `pattern` (é para isso que o teste existe) e registrar a mudança no commit.
- [ ] **Step 4:** `npm test -- providers` → PASS.
- [ ] **Step 5:** Commit: `feat: mapeamento dos 6 serviços de streaming do BR`

---

### Task 4: Listas de filmes (discover, top 10, destaque, gêneros, busca) e parâmetros de URL

**Files:**
- Create: `src/lib/tmdb/movies.ts`, `src/lib/params.ts`
- Test: `tests/lib/tmdb/movies.test.ts`, `tests/lib/params.test.ts`

**Interfaces:**
- Consumes: `tmdbFetch`, `toMovieSummary` (Task 2); `getServiceIds`, `SERVICES`, `ServiceSlug` (Task 3)
- Produces:
  - `getGenres(): Promise<Genre[]>`, de `/genre/movie/list`, com revalidate de 86400
  - `discoverMovies(providerIds: number[], opts: { genreId?: number | null; page?: number }): Promise<Paged<MovieSummary>>`. Params: `with_watch_providers=ids.join('|')`, `watch_region=BR`, `with_watch_monetization_types=flatrate`, `sort_by=popularity.desc`, `with_genres` (se houver), `page`. Revalidate de 21600. `totalPages` = `min(total_pages, 500)`.
  - `getTop10(genreId?: number | null): Promise<MovieSummary[]>`. Faz o discover com os IDs dos 6 serviços juntos e pega os 10 primeiros.
  - `getHero(genreId?: number | null): Promise<MovieSummary[]>`. Usa o mesmo discover (página 1), filtra os que têm `backdropPath` e pega até 5.
  - `getServiceRow(slug: ServiceSlug, genreId?: number | null): Promise<MovieSummary[]>`, com os 20 da página 1
  - `searchMovies(query: string, page = 1): Promise<Paged<MovieSummary>>`. Faz `trim` e, se ficar vazio, retorna `{ page: 1, totalPages: 0, results: [] }` sem chamar a API. Usa `/search/movie` com `include_adult=false`.
  - `getFlatrateProviders(movieId: number): Promise<ProviderInfo[]>`. Busca `/movie/{id}/watch/providers`, pega `results.BR.flatrate ?? []`, passa por `groupProviderVariants` e usa revalidate de 21600.
  - `parseGenreParam(value: string | string[] | undefined, genres: Genre[]): Genre | null`
  - `parsePageParam(value: string | string[] | undefined, totalPages?: number): number`, limitado a `1..min(totalPages ?? 500, 500)`

- [ ] **Step 1: Escrever os testes que falham**

```ts
// movies.test.ts — mock de tmdbFetch e getServiceIds
it('discover monta os params', async () => {
  await discoverMovies([8, 1796], { genreId: 35, page: 2 });
  expect(tmdbFetch).toHaveBeenCalledWith('/discover/movie', expect.objectContaining({
    with_watch_providers: '8|1796', watch_region: 'BR', with_watch_monetization_types: 'flatrate',
    sort_by: 'popularity.desc', with_genres: 35, page: 2 }), 21600);
});
it('discover limita totalPages a 500', …);      // total_pages 812 → 500
it('getTop10 usa todos os serviços e corta em 10', …); // with_watch_providers contém todos os IDs; 20 resultados → 10
it('getHero só com backdrop e no máximo 5', …);
it('busca vazia não chama a API', async () => {
  expect(await searchMovies('   ')).toEqual({ page: 1, totalPages: 0, results: [] });
  expect(tmdbFetch).not.toHaveBeenCalled();
});
it('getFlatrateProviders sem BR → []', …);       // results: { US: {...} } → []
// params.test.ts
it.each([['35', 35], ['lixo', null], [undefined, null], ['99999', null], [['35', '28'], 35]])('parseGenreParam(%s)', …);
it.each([[undefined, 1], ['0', 1], ['-3', 1], ['abc', 1], ['4', 4], ['9999', 500]])('parsePageParam(%s)', …);
it('parsePageParam respeita totalPages', () => expect(parsePageParam('9', 3)).toBe(3));
```

- [ ] **Step 2:** `npm test -- movies params` → FAIL.
- [ ] **Step 3:** Implementar `movies.ts` e `params.ts`.
- [ ] **Step 4:** `npm test -- movies params` → PASS.
- [ ] **Step 5:** Commit: `feat: consultas de listas de filmes e parsing de parâmetros`

---

### Task 5: Detalhes do filme

**Files:**
- Create: `src/lib/tmdb/details.ts`, `tests/fixtures/movie-details.json` (resposta real de um filme popular com `append_to_response`), `tests/fixtures/movie-details-minimal.json` (o mesmo, só que sem BR em watch/providers, sem vídeos, `overview: ""`, `poster_path: null` e sem certificação BR)
- Test: `tests/lib/tmdb/details.test.ts`

**Interfaces:**
- Consumes: `tmdbFetch`, `TmdbError`, `toMovieSummary` (Task 2); `groupProviderVariants` (Task 3)
- Produces:
  - `getMovieDetails(id: number): Promise<MovieDetailsView | null>`. Chama `/movie/{id}` com `append_to_response=videos,credits,recommendations,release_dates,watch/providers`, `include_video_language=pt,en,null` e revalidate de 43200. Retorna `null` se o TMDB responder 404.
  - `mapMovieDetails(raw: RawMovieDetails): MovieDetailsView` (puro)

Regras de `mapMovieDetails`:
- `overview` vazio → `null`.
- `certification`: primeira `certification` não vazia em `release_dates.results` com `iso_3166_1 === 'BR'`; se não houver, `null`.
- `watch`: de `['watch/providers'].results.BR`; cada lista passa por `groupProviderVariants`; se não houver BR, as três listas ficam vazias.
- `trailerYoutubeKey`: o primeiro vídeo com `site === 'YouTube'` e `type === 'Trailer'`, preferindo `iso_639_1 === 'pt'`, depois `en`, depois qualquer um.
- `cast`: os 10 primeiros. `recommendations`: os 12 primeiros.

- [ ] **Step 1: Escrever os testes que falham**

```ts
it('mapeia o filme completo', () => {
  const v = mapMovieDetails(full);
  expect(v.certification).toBe(/* valor BR da fixture */);
  expect(v.watch.flatrate.length).toBeGreaterThan(0);
  expect(v.trailerYoutubeKey).toBe(/* key do trailer pt (ou en) da fixture */);
  expect(v.cast.length).toBeLessThanOrEqual(10);
  expect(v.recommendations.length).toBeLessThanOrEqual(12);
});
it('filme mínimo não quebra', () => {
  const v = mapMovieDetails(minimal);
  expect(v.watch).toEqual({ flatrate: [], rent: [], buy: [] });
  expect(v.overview).toBeNull();
  expect(v.posterPath).toBeNull();
  expect(v.trailerYoutubeKey).toBeNull();
  expect(v.certification).toBeNull();
});
it('prefere trailer pt sobre en', () => { /* vídeos [en Trailer 'A', pt Teaser 'B', pt Trailer 'C'] → 'C' */ });
it('404 → null', async () => { /* tmdbFetch rejeita TmdbError(404) → getMovieDetails(1) resolve null */ });
it('outros erros propagam', async () => { /* TmdbError(500) → rejects */ });
```

- [ ] **Step 2:** `npm test -- details` → FAIL.
- [ ] **Step 3:** Implementar `details.ts`.
- [ ] **Step 4:** `npm test -- details` → PASS.
- [ ] **Step 5:** Commit: `feat: detalhes do filme com onde assistir, trailer e elenco`

---

### Task 6: Componentes visuais compartilhados

**Files:**
- Create: `src/lib/format.ts`, `src/components/PosterCard.tsx`, `src/components/MovieRow.tsx`, `src/components/ServiceBadge.tsx`, `src/components/MovieGrid.tsx`
- Test: `tests/lib/format.test.ts`, `tests/components/PosterCard.test.tsx`, `tests/components/MovieRow.test.tsx`

**Interfaces:**
- Consumes: `MovieSummary`, `imageUrl` (Task 2); `SERVICES`, `ServiceSlug` (Task 3)
- Produces:
  - `formatRuntime(min: number | null): string | null` (`128` → `"2h 08m"`, `45` → `"45m"`, `null`/`0` → `null`); `formatRating(v: number): string` (`7.84` → `"★ 7.8"`)
  - `<PosterCard movie={MovieSummary} rank?: number />`: um link para `/filme/{id}` com `aria-label={title}`. Sem pôster, mostra um bloco com o título em texto (`data-testid="poster-placeholder"`). Com `rank`, mostra o número grande (estilo do mockup).
  - `<MovieRow title: ReactNode; movies: MovieSummary[]; seeAllHref?: string; ranked?: boolean />`: fileira com rolagem horizontal (`overflow-x-auto`, snap). O link "ver tudo ›" só aparece se `seeAllHref` existir. Lista vazia → não renderiza nada.
  - `<ServiceBadge slug={ServiceSlug} />`: selo colorido com o nome do serviço.
  - `<MovieGrid movies={MovieSummary[]} />`: grade responsiva (3 colunas no celular, até 6 no desktop).

- [ ] **Step 1: Escrever os testes que falham**

```ts
it.each([[128, '2h 08m'], [45, '45m'], [null, null], [0, null]])('formatRuntime(%s)', …);
it('PosterCard sem pôster mostra placeholder com título', () => {
  render(<PosterCard movie={{ ...m, posterPath: null, title: 'Sem Capa' }} />);
  expect(screen.getByTestId('poster-placeholder')).toHaveTextContent('Sem Capa');
  expect(screen.getByRole('link')).toHaveAttribute('href', `/filme/${m.id}`);
});
it('PosterCard com rank mostra o número', …);
it('MovieRow sem seeAllHref não mostra ver tudo', …);
it('MovieRow vazia não renderiza', () => { const { container } = render(<MovieRow title="X" movies={[]} />); expect(container).toBeEmptyDOMElement(); });
```

- [ ] **Step 2:** `npm test -- format PosterCard MovieRow` → FAIL.
- [ ] **Step 3:** Implementar. Usar `next/image` com `sizes` adequados.
- [ ] **Step 4:** `npm test` → PASS.
- [ ] **Step 5:** Commit: `feat: componentes de pôster, fileira, grade e selo de serviço`

---

### Task 7: Tela inicial (destaque, gêneros, Top 10, fileiras) e estados globais

**Files:**
- Create: `src/components/GenreChips.tsx`, `src/components/HeroCarousel.tsx`, `src/app/loading.tsx`, `src/app/error.tsx`, `src/app/not-found.tsx`
- Modify: `src/app/page.tsx`
- Test: `tests/components/GenreChips.test.tsx`, `tests/components/HeroCarousel.test.tsx`

**Interfaces:**
- Consumes: `getGenres`, `getTop10`, `getHero`, `getServiceRow`, `parseGenreParam` (Task 4); `SERVICES` (Task 3); `MovieRow`, `ServiceBadge`, `formatRating` (Task 6)
- Produces:
  - `<GenreChips genres={Genre[]} activeId={number | null} basePath={string} />`: um chip "Todos" (link para `basePath`) e um chip por gênero (link para `${basePath}?genero=${id}`). O chip ativo recebe `aria-current="true"`.
  - `<HeroCarousel movies={MovieSummary[]} />` ('use client'): troca de slide a cada 6s e para quando `prefers-reduced-motion`. Tem pontos clicáveis, título, ano, nota e o botão "Ver onde assistir" (link para `/filme/{id}`). Com 0 filmes, não renderiza.
  - `page.tsx` recebe `searchParams: Promise<{ genero?: string }>`, busca tudo em paralelo (`Promise.all`) e monta, em ordem: Hero → GenreChips → Top 10 (`ranked`, sem `seeAllHref`, título conforme Global Constraints) → uma `MovieRow` por serviço com `<ServiceBadge/> Populares` e `seeAllHref=/servico/{slug}` (mais `?genero=` se houver gênero).
  - `error.tsx` ('use client'): mostra "Não foi possível carregar os filmes agora." e um botão "Tentar novamente" (`reset()`). `not-found.tsx`: "Página não encontrada" com link para o início. `loading.tsx`: skeleton de fileiras.

- [ ] **Step 1: Escrever os testes que falham**

```ts
it('GenreChips marca ativo e monta links', () => {
  render(<GenreChips genres={[{ id: 35, name: 'Comédia' }]} activeId={35} basePath="/" />);
  expect(screen.getByRole('link', { name: 'Comédia' })).toHaveAttribute('href', '/?genero=35');
  expect(screen.getByRole('link', { name: 'Comédia' })).toHaveAttribute('aria-current', 'true');
  expect(screen.getByRole('link', { name: 'Todos' })).toHaveAttribute('href', '/');
});
it('HeroCarousel avança após 6s', () => { /* vi.useFakeTimers; 2 filmes; advanceTimersByTime(6000) → segundo título visível */ });
it('HeroCarousel vazio não renderiza', …);
```

- [ ] **Step 2:** `npm test -- GenreChips HeroCarousel` → FAIL.
- [ ] **Step 3:** Implementar os componentes e a `page.tsx`.
- [ ] **Step 4:** `npm test` → PASS. Rodar `npm run dev` com o token real no `.env.local` e abrir `http://localhost:3000` e `http://localhost:3000/?genero=35`. Esperado: destaque, chips, "Top 10 de Comédia em streaming" e as 6 fileiras com pôsteres reais. Abrir também `/?genero=lixo`, que deve se comportar igual a "Todos". Conferir em 360px de largura no DevTools: as fileiras rolam na horizontal e a página não tem rolagem horizontal.
- [ ] **Step 5:** Commit: `feat: tela inicial com destaque, gêneros, top 10 e fileiras por serviço`

---

### Task 8: "Ver tudo" de um serviço

**Files:**
- Create: `src/components/Pagination.tsx`, `src/app/servico/[slug]/page.tsx`
- Test: `tests/components/Pagination.test.tsx`

**Interfaces:**
- Consumes: `getService`, `getServiceIds` (Task 3); `discoverMovies`, `getGenres`, `parseGenreParam`, `parsePageParam` (Task 4); `MovieGrid`, `ServiceBadge` (Task 6); `GenreChips` (Task 7)
- Produces:
  - `<Pagination page={number} totalPages={number} hrefFor={(p: number) => string} />`: links "‹ Anterior" e "Próxima ›" e o texto "Página X de Y". O link "Anterior" fica oculto na página 1 e o "Próxima" na última. Com `totalPages <= 1`, não renderiza nada.
  - Rota `/servico/[slug]?genero=&pagina=`: slug inválido → `notFound()`. Título: `<ServiceBadge/> Todos os filmes`. Depois vêm GenreChips (`basePath=/servico/{slug}`), MovieGrid e Pagination, preservando `genero` nos links. A página é limitada com `parsePageParam(pagina, totalPages)`. Sem resultados, mostra "Nenhum filme deste gênero neste serviço no momento."

- [ ] **Step 1: Escrever os testes que falham**

```ts
it('Pagination na primeira página não tem Anterior', …);
it('Pagination na última não tem Próxima', …);
it('Pagination com 1 página não renderiza', …);
it('hrefFor é usado nos links', () => { /* page 2 of 5, hrefFor p=>`/x?pagina=${p}` → Anterior '/x?pagina=1', Próxima '/x?pagina=3' */ });
```

- [ ] **Step 2:** `npm test -- Pagination` → FAIL.
- [ ] **Step 3:** Implementar `Pagination` e a rota.
- [ ] **Step 4:** `npm test` → PASS. Em `npm run dev`, conferir `/servico/netflix`, `/servico/netflix?genero=35&pagina=2`, `/servico/netflix?pagina=9999` (vai para a última página válida) e `/servico/inexistente` (404).
- [ ] **Step 5:** Commit: `feat: página ver tudo por serviço com paginação`

---

### Task 9: Página do filme

**Files:**
- Create: `src/components/WatchProviders.tsx`, `src/components/CastList.tsx`, `src/components/Trailer.tsx`, `src/app/filme/[id]/page.tsx`
- Test: `tests/components/WatchProviders.test.tsx`, `tests/components/CastList.test.tsx`

**Interfaces:**
- Consumes: `getMovieDetails`, `MovieDetailsView` (Task 5); `imageUrl` (Task 2); `formatRuntime`, `formatRating`, `MovieRow` (Task 6)
- Produces:
  - `<WatchProviders watch={WatchOptions} />`: título "Onde assistir no Brasil" e as linhas "Assinatura", "Alugar" e "Comprar". Cada linha mostra os logos (`alt` = nome do provedor) e é omitida se estiver vazia. Se as três estiverem vazias, mostra "Este filme não está disponível em streaming no Brasil no momento."
  - `<CastList cast={CastMember[]} />`: rolagem horizontal com foto redonda e nome. Sem foto, mostra as iniciais. Lista vazia → não renderiza.
  - `<Trailer youtubeKey={string | null} title={string} />`: iframe `https://www.youtube-nocookie.com/embed/{key}` com proporção 16:9 e `loading="lazy"`. Com `null`, não renderiza.
  - Rota `/filme/[id]`: um id que não seja inteiro positivo → `notFound()`. `getMovieDetails` retornando `null` → `notFound()`. Layout como no mockup: backdrop (com placeholder em gradiente se for `null`), pôster, título, `ano · duração · classificação`, nota e gêneros. Depois vêm WatchProviders, Sinopse (com "ler mais" via `<details>` acima de cerca de 300 caracteres; se for `null`, "Sinopse não disponível em português."), Trailer, Elenco e "Parecidos" (`MovieRow` sem `seeAllHref`). `generateMetadata` usa o título do filme.

- [ ] **Step 1: Escrever os testes que falham**

```ts
it('WatchProviders vazio mostra aviso', () => {
  render(<WatchProviders watch={{ flatrate: [], rent: [], buy: [] }} />);
  expect(screen.getByText('Este filme não está disponível em streaming no Brasil no momento.')).toBeInTheDocument();
});
it('WatchProviders omite linhas vazias', () => {
  render(<WatchProviders watch={{ flatrate: [{ id: 8, name: 'Netflix', logoPath: '/n.png' }], rent: [], buy: [] }} />);
  expect(screen.getByText('Assinatura')).toBeInTheDocument();
  expect(screen.queryByText('Alugar')).toBeNull();
  expect(screen.getByAltText('Netflix')).toBeInTheDocument();
});
it('CastList sem foto mostra iniciais', () => { /* { name: 'Ana Souza', profilePath: null } → 'AS' */ });
```

- [ ] **Step 2:** `npm test -- WatchProviders CastList` → FAIL.
- [ ] **Step 3:** Implementar os componentes e a rota.
- [ ] **Step 4:** `npm test` → PASS. Em `npm run dev`, abrir um filme a partir da tela inicial e conferir todas as seções. Abrir também `/filme/abc` (404), `/filme/999999999` (404) e um filme antigo sem streaming no BR (deve aparecer o aviso).
- [ ] **Step 5:** Commit: `feat: página do filme com onde assistir, sinopse, trailer, elenco e parecidos`

---

### Task 10: Busca

**Files:**
- Create: `src/app/busca/page.tsx`, `src/components/SearchResults.tsx`
- Test: `tests/components/SearchResults.test.tsx`

**Interfaces:**
- Consumes: `searchMovies`, `getFlatrateProviders`, `parsePageParam` (Task 4); `PosterCard`, `formatRating` (Task 6); `Pagination` (Task 8); `imageUrl` (Task 2)
- Produces:
  - `<SearchResults query={string} results={{ movie: MovieSummary; providers: ProviderInfo[] }[]} />`: uma lista em que cada item mostra o pôster, o título, o ano e até 4 logos dos provedores de assinatura. Se não houver provedores, mostra "Não disponível em streaming no BR". Lista vazia → "Nenhum filme encontrado para "<query>"."
  - Rota `/busca?q=&pagina=`: com `q` vazio ou só com espaços, mostra "Digite o nome de um filme para buscar." e não chama a API. Caso contrário, busca, pega os provedores dos resultados da página em paralelo (`Promise.all`) e mostra SearchResults e Pagination, preservando o `q`. O input do Header vem preenchido com o `q` atual (passar `defaultValue` via prop opcional `initialQuery` no `Header`, ou ler com `useSearchParams` num subcomponente client; a escolha fica com o implementador).

- [ ] **Step 1: Escrever os testes que falham**

```ts
it('sem resultados mostra mensagem com a query', () => {
  render(<SearchResults query="xyzzy" results={[]} />);
  expect(screen.getByText('Nenhum filme encontrado para "xyzzy".')).toBeInTheDocument();
});
it('resultado sem provedores mostra aviso', …);
it('mostra no máximo 4 logos', …);
```

- [ ] **Step 2:** `npm test -- SearchResults` → FAIL.
- [ ] **Step 3:** Implementar o componente e a rota.
- [ ] **Step 4:** `npm test` → PASS. Em `npm run dev`, buscar "matrix", "velozes & furiosos", "   " (só espaços) e "xyzzyqq", e conferir as quatro situações.
- [ ] **Step 5:** Commit: `feat: busca de filmes com onde assistir`

---

### Task 11: Guia de publicação e verificação final

**Files:**
- Create: `docs/publicar.md`
- Modify: nenhum código, a não ser para corrigir o que a verificação encontrar

**Interfaces:**
- Consumes: o app inteiro

- [ ] **Step 1:** Escrever `docs/publicar.md` em português simples, para alguém leigo, com seções numeradas. O guia cobre: (1) criar uma conta no GitHub; (2) criar um repositório vazio "aulamovies" e enviar o código, com os comandos `git remote add origin …` e `git push -u origin main` prontos para copiar, e explicando que o `.env.local` **não** vai junto, e por quê; (3) criar uma conta na Vercel entrando com o GitHub; (4) "Add New → Project", importar o repositório e, em "Environment Variables", adicionar `TMDB_READ_TOKEN` com o token; (5) clicar em Deploy e abrir o link; (6) como atualizar depois (cada `git push` publica sozinho); (7) atualizar a "URL do app" no cadastro do TMDB para o link da Vercel. Usar marcadores do tipo "Você deve ver: …" depois de cada passo, em vez de prints.
- [ ] **Step 2:** Rodar `npm test`. Expected: todos passam.
- [ ] **Step 3:** Rodar `npm run lint` e `npm run build`. Expected: sem erros.
- [ ] **Step 4:** Rodar `npm run build && npm start` e conferir no navegador, em 360px e em desktop: a tela inicial com e sem gênero, um "ver tudo", a página de um filme, a busca e uma URL inválida. No DevTools → Network, conferir que nenhuma requisição do navegador vai para `api.themoviedb.org` (só para `image.tmdb.org`). Também procurar o token no bundle do cliente: `grep -r "$(grep TMDB_READ_TOKEN .env.local | cut -d= -f2 | cut -c1-20)" .next/static` deve retornar vazio.
- [ ] **Step 5:** Commit: `docs: guia de publicação na Vercel`
