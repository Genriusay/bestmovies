# Como colocar o Bestmovies na internet

Este guia leva você, passo a passo, de "o site só funciona no meu computador" até "qualquer pessoa abre o site por um link". Não precisa saber programar. Siga na ordem e confira o que aparece depois de cada passo.

Você vai usar três coisas, todas gratuitas:

- **GitHub**: um "armário" na internet onde fica guardado o código do site.
- **Vercel**: o serviço que pega o código do GitHub e o transforma em um site com endereço público.
- **TMDB**: o site de onde vêm as informações dos filmes (você já tem uma conta lá).

---

## 1. Criar uma conta no GitHub

1. Abra https://github.com/signup e crie a conta (e-mail, senha e nome de usuário).
2. Confirme o e-mail quando o GitHub pedir.

**Você deve ver:** a página inicial do GitHub, com o seu nome de usuário no canto superior direito.

(Se você já tem conta, só entre nela.)

## 2. Criar o repositório vazio

"Repositório" é a pasta do projeto dentro do GitHub.

1. Entre em https://github.com/new.
2. Em **Repository name**, escreva `bestmovies`.
3. Escolha **Public** (ou **Private**, tanto faz para a Vercel).
4. **Não marque nada** em "Add a README file", "Add .gitignore" e "Choose a license". O repositório precisa nascer vazio.
5. Clique em **Create repository**.

**Você deve ver:** uma página quase vazia com o título "Quick setup" e um endereço parecido com `https://github.com/SEU-USUARIO/bestmovies.git`. Deixe essa página aberta.

## 3. Enviar o código para o GitHub

O projeto já está preparado no seu computador. Falta só avisar de onde é o "armário" e enviar.

1. No VS Code, abra a pasta do projeto (Aulamovies).
2. Abra o terminal: menu **Terminal → New Terminal**.
3. Copie e cole o comando abaixo, trocando `SEU-USUARIO` pelo seu nome de usuário do GitHub, e aperte Enter:

   ```
   git remote add origin https://github.com/SEU-USUARIO/bestmovies.git
   ```

   **Você deve ver:** nada. Se o terminal só mostrar uma nova linha, deu certo.

4. Confirme que você está no ramo principal, chamado `main`:

   ```
   git branch --show-current
   ```

   **Você deve ver:** a palavra `main`. Se aparecer outra coisa, peça ajuda antes de continuar: o código ainda não foi juntado ao ramo principal.

5. Envie o código:

   ```
   git push -u origin main
   ```

   Na **primeira vez**, abre uma janela do navegador pedindo para você entrar no GitHub. Entre e clique em autorizar. Depois volte ao VS Code.

   **Você deve ver:** várias linhas terminando com algo como `branch 'main' set up to track 'origin/main'`.

6. Recarregue a página do repositório no GitHub.

   **Você deve ver:** a lista de arquivos do projeto (pastas `src`, `docs`, `package.json` etc.).

**Sobre o arquivo `.env.local`:** ele guarda a sua chave secreta do TMDB. Ele **não** foi enviado de propósito: quem tiver essa chave pode usar a sua conta do TMDB, e o GitHub pode ser público. Por isso você vai informar a chave diretamente à Vercel no passo 5. Se o `.env.local` aparecer na lista de arquivos do GitHub, pare e peça ajuda.

## 4. Criar a conta na Vercel

1. Abra https://vercel.com/signup.
2. Escolha o plano gratuito (**Hobby**) e informe seu nome.
3. Clique em **Continue with GitHub** e autorize.

**Você deve ver:** o painel da Vercel (Dashboard), ainda sem nenhum projeto.

## 5. Importar o projeto e colocar a chave do TMDB

1. No painel da Vercel, clique em **Add New…** e depois em **Project**.
2. Na lista "Import Git Repository", ache `bestmovies` e clique em **Import**. (Se não aparecer, clique em "Adjust GitHub App Permissions", dê acesso ao repositório e volte.)

   **Você deve ver:** uma tela de configuração com **Framework Preset: Next.js** já escolhido sozinho. Não mude nada nela.

3. Abra a seção **Environment Variables** (variáveis de ambiente: configurações secretas do site).
4. Preencha:
   - **Key** (nome): `TMDB_READ_TOKEN` (exatamente assim, em maiúsculas).
   - **Value** (valor): a sua chave do TMDB. Para pegá-la, abra https://www.themoviedb.org/settings/api, entre na sua conta e copie o campo **API Read Access Token** (é um texto bem longo, começando com `eyJ`). Cole inteiro, sem espaços antes ou depois. **Não** use o campo "API Key", que é mais curto.
5. Clique em **Add**.

**Você deve ver:** `TMDB_READ_TOKEN` na lista de variáveis, com o valor escondido por pontinhos.

## 6. Publicar (Deploy)

1. Clique no botão **Deploy**.
2. Espere cerca de 1 a 3 minutos. Aparece uma tela de "Building" com linhas de texto passando.

   **Você deve ver:** confete e a mensagem "Congratulations!", com uma imagem do site.

3. Clique na imagem ou no botão **Visit**.

**Você deve ver:** o Bestmovies no ar, com filmes e capas, em um endereço como `https://bestmovies-xxxx.vercel.app`. Esse é o link que você pode mandar para qualquer pessoa.

## 7. Atualizar o endereço no cadastro do TMDB

O TMDB pede o endereço do seu site. Vale deixar o link certo lá.

1. Abra https://www.themoviedb.org/settings/api e entre.
2. Na parte dos detalhes do seu app, ache o campo **URL** (ou "URL do app") e edite.
3. Cole o link da Vercel (por exemplo, `https://bestmovies-xxxx.vercel.app`) e salve.

**Você deve ver:** a página de configurações recarregada com o novo endereço.

---

## Como atualizar o site depois

Sempre que o código mudar e for enviado ao GitHub, a Vercel republica sozinha. No terminal do VS Code:

```
git push
```

**Você deve ver:** no painel da Vercel, em **Deployments**, uma nova publicação "Building" e depois "Ready". Em cerca de 2 minutos o link já mostra a versão nova. (Isso vale para o ramo `main`.)

---

## Se algo der errado

**A publicação falhou ("Build failed", em vermelho).**
A chave do TMDB não é usada durante a publicação, então ela não costuma ser a causa. Na Vercel, abra **Deployments**, clique na publicação que falhou e leia o **Build Log** (as últimas linhas em vermelho dizem o motivo). Se não entender a mensagem, copie o texto do erro e peça ajuda.

**O site abre, mas mostra "Não foi possível carregar os filmes agora".**
Quase sempre a chave está faltando ou errada na Vercel. Faça assim:
1. No painel da Vercel, abra o projeto → **Settings → Environment Variables**.
2. Confira se o nome é exatamente `TMDB_READ_TOKEN` e se o valor é o **API Read Access Token** inteiro, sem espaços.
3. Corrija o que estiver errado, vá em **Deployments**, clique nos três pontinhos da última publicação e escolha **Redeploy**.
A chave só passa a valer em publicações feitas *depois* de ela ser salva, por isso o Redeploy é necessário.

**O `git push` pede senha ou dá erro de permissão.**
Entre no GitHub pelo navegador quando a janela abrir. Se a janela não abrir, feche e abra o VS Code e tente de novo.

**O `git remote add origin` diz "remote origin already exists".**
Significa que o endereço já foi cadastrado antes. Pule esse comando e vá direto para o `git push -u origin main`.
