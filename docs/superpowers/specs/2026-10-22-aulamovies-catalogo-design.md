# Aulamovies — Catálogo de filmes em streaming (design)

Data: 2026-10-22

## Intenção

Um site público, em português, que mostra **quais filmes estão disponíveis agora nos serviços de streaming do Brasil**, usando a API do TMDB (https://developer.themoviedb.org/docs/getting-started). A pessoa abre no navegador (celular ou computador), passeia pelos filmes no estilo Netflix, toca num pôster e descobre **onde assistir**.

O dono do projeto não é programador. O critério de sucesso dele é: **o app estar funcional para qualquer pessoa que entrar**. Ou seja, publicado na internet, carregando rápido e com os dados corretos.

## Objetivos

- Tela inicial no estilo "fileiras por serviço" (aprovada em mockup; ver "Telas" abaixo).
- Página de detalhes de cada filme, com destaque para **onde assistir no Brasil**.
- Busca de filmes.
- Funcionar bem no celular (layout responsivo) e no computador.
- Publicado na internet com um link acessível.
- Estrutura preparada para receber **login (e-mail e senha) e "minha lista"** numa versão futura, sem reescrever o app.

## Fora do escopo desta versão (não-objetivos)

- Login, contas de usuário e listas salvas. Ficam para a versão 2, que vai usar o Supabase (ver "Futuro").
- Séries. O pedido foi de filmes.
- App nas lojas (Play Store / App Store). O navegador é suficiente.
- Assistir filmes dentro do app. O app só indica onde assistir.
- Outros países. O catálogo e o idioma são do Brasil (`pt-BR`, região `BR`).

## Anti-objetivos (seria um fracasso mesmo "funcionando")

- Expor a chave da API do TMDB no navegador.
- Mostrar filme como "disponível na Netflix" quando não está, ou seja, dados de disponibilidade de outra região.
- Ficar lento ou quebrado no celular.
- Faltar a atribuição exigida pelo TMDB/JustWatch, o que violaria os termos de uso da API.

## Telas (aprovadas pelo dono via mockup)

Mockup de referência: `.superpowers/brainstorm/101-1792695016/content/home-a-v2.html`. O dono aprovou "na forma como está".

### Tela inicial
1. **Cabeçalho** com o nome "Aulamovies" e o acesso à busca.
2. **Destaque rotativo**: 5 filmes populares em streaming no BR, trocando automaticamente. Cada um mostra o selo do serviço, título, ano, gênero, nota e o botão "Ver onde assistir", que leva à página do filme.
3. **Filtro de gênero** em "chips" (Todos, Ação, Comédia, Drama, Terror…). Ao selecionar um gênero, **todas as fileiras** da tela passam a mostrar só esse gênero.
4. **"Top 10 em streaming hoje"**: fileira com números grandes de ranking, misturando todos os serviços.
5. **Uma fileira por serviço**, nesta ordem: Netflix, Prime Video, Disney+, Max, Globoplay, Apple TV+. Cada fileira desliza horizontalmente, tem o selo colorido do serviço e um "ver tudo ›".
6. **Rodapé** com a atribuição: TMDB (logo + aviso exigido) e JustWatch como fonte da disponibilidade.

### "Ver tudo" de um serviço
Grade de pôsteres com todos os filmes daquele serviço no BR, ordenados por popularidade, com rolagem ou paginação para carregar mais. Respeita o filtro de gênero.

### Página do filme
- Imagem de fundo (backdrop), pôster, título, ano, duração, classificação indicativa, nota e gêneros.
- **Onde assistir no Brasil**, separado em **Assinatura / Alugar / Comprar**, com os logos dos serviços.
- Sinopse em português, com "ler mais" quando for longa.
- Trailer (YouTube) quando existir.
- Elenco principal (foto e nome).
- Filmes parecidos (fileira de pôsteres).

### Busca
Campo de busca por título. A lista de resultados mostra o pôster e, quando possível, os serviços onde o filme está.

## Decisões técnicas (escolhas do Claude; o dono é leigo e delegou)

- **Next.js (App Router) + TypeScript.** Todas as chamadas ao TMDB são feitas **no servidor**, para a chave nunca chegar ao navegador. As páginas são renderizadas no servidor, o que deixa o carregamento rápido.
- **Tailwind CSS** para o visual: tema escuro, como no mockup.
- **Hospedagem na Vercel** (plano gratuito), com deploy automático a partir do repositório Git.
- **Cache das respostas do TMDB** com o revalidate do Next.js, de algumas horas para listas e um tempo maior para os detalhes do filme. Os dados de disponibilidade mudam devagar, e o cache evita estourar o limite de requisições da API.
- **Chave da API** guardada em variável de ambiente (`TMDB_API_KEY` ou o token de leitura v4) e nunca versionada.
- **Idioma e região fixos**: `language=pt-BR` e `watch_region=BR` em todas as chamadas.

### Como os dados saem do TMDB (orientação para o construtor)
- Fileiras por serviço: `/discover/movie` com `with_watch_providers=<id>`, `watch_region=BR`, `with_watch_monetization_types=flatrate` (assinatura) e `sort_by=popularity.desc`. Quando houver filtro de gênero, adicionar `with_genres`.
- IDs dos serviços: buscar em `/watch/providers/movie?watch_region=BR`, não usar valores fixos de memória. O Max, por exemplo, já mudou de ID.
- Onde assistir na página do filme: `/movie/{id}/watch/providers`, usando apenas a chave `results.BR` (`flatrate`, `rent`, `buy`).
- Lista de gêneros: `/genre/movie/list?language=pt-BR`.
- Trailer: `/movie/{id}/videos`. Tentar `pt-BR` primeiro e usar `en-US` como alternativa.
- Elenco: `/movie/{id}/credits`. Parecidos: `/movie/{id}/recommendations`.
- Classificação indicativa: `/movie/{id}/release_dates`, certificação do país `BR`.

### Decisões do Claude sobre pontos que a API limita
- **Selo "NOVO" removido.** Ele apareceu no mockup como hipótese, mas a API do TMDB não informa **quando** um filme entrou num serviço, então não há como calculá-lo de forma confiável.
- **"Top 10 em streaming hoje"**: o TMDB não tem um ranking por streaming. A fileira será montada com `/discover/movie` filtrado pelos 6 serviços acima (IDs separados por `|`), `watch_region=BR`, assinatura e ordenação por popularidade, pegando os 10 primeiros. O título da fileira continua "Top 10 em streaming hoje".
- **Destaque rotativo**: os 5 primeiros dessa mesma consulta, dando preferência a filmes que tenham backdrop.

### Decisões do Claude após a revisão do documento
- **O filtro de gênero vale para a tela inteira**, inclusive o destaque e o Top 10. Foi assim que ele foi apresentado ao dono ("um toque e todas as fileiras passam a mostrar só aquele gênero"). Com um gênero selecionado, a fileira passa a se chamar "Top 10 de <Gênero> em streaming". O gênero fica na URL (`?genero=<id>`), o que permite compartilhar o link e manter o cache por gênero no servidor. Se houver menos de 5 filmes com backdrop, o destaque mostra os que houver.
- **A fileira Top 10 não tem "ver tudo"**, porque ela é um ranking fechado de 10 filmes. Esse é o único desvio em relação ao mockup aprovado.
- **Onde assistir na página do filme mostra todos os serviços que o TMDB retorna para o BR**, não só os 6, porque é o dado real da região e quanto mais completo, mais útil. As **fileiras** da tela inicial usam só os 6 serviços principais. Variantes de um mesmo serviço (ex.: "Netflix Standard with Ads", "Amazon Prime Video with Ads") entram na fileira do serviço principal, com os IDs combinados por `|`. Na página do filme, as variantes são agrupadas sob o logo do serviço principal para não repetir ícones.

## Restrições

- Termos de uso do TMDB: exibir o logo do TMDB e o aviso "This product uses the TMDB API but is not endorsed or certified by TMDB" (pode ser traduzido), além de creditar o JustWatch como fonte dos dados de onde assistir.
- O app precisa ficar bom em telas a partir de cerca de 360px de largura.
- Custo zero na primeira versão: TMDB, Vercel e GitHub nos planos gratuitos.

## Futuro (versão 2, fora deste plano, mas a estrutura deve permitir)

- Login com e-mail e senha e "minha lista" usando o **Supabase** (autenticação + banco Postgres). Para não exigir reescrita depois, o layout já deve ter espaço no cabeçalho para um botão "Entrar", e o código de acesso ao TMDB deve ficar separado da interface.

## Deixado para o construtor

- Organização das pastas e dos componentes, e o nome das rotas (`/filme/[id]`, `/servico/[slug]`, `/busca`, ou equivalente).
- Os tempos exatos de cache.
- Estados de carregamento (skeletons) e mensagens de erro ou de "nenhum resultado".
- Paginação ou rolagem infinita no "ver tudo".
- Detalhes finos de cores e tipografia, mantendo o tema escuro e o espírito do mockup.
- Testes: os básicos para a camada que acessa o TMDB (montagem das URLs e tratamento das respostas).

## O que o dono precisa providenciar e como o site vai para o ar (decidido)

- **Antes da construção**, o dono cria a conta no TMDB e gera o **API Read Access Token**. Ele mesmo cola o token num arquivo `.env.local` que o construtor deixa preparado, para que o token não precise ser enviado pelo chat. Assim o desenvolvimento e os testes usam dados reais.
- **No final**, o construtor entrega um **passo a passo para leigos**, escrito em português, para criar as contas no GitHub e na Vercel, subir o código e configurar a variável de ambiente na Vercel. O dono publica pelas próprias contas, com o construtor acompanhando. O projeto só está "pronto" quando o site estiver no ar num link público e funcionando.
- O repositório Git é criado localmente pelo construtor. O `.gitignore` deve incluir `.env.local` e `.superpowers/`.
