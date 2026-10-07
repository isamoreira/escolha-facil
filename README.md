# Escolha Fácil

**Perguntas simples. Respostas com fonte.**

Site do [escolhafacil.online](https://escolhafacil.online), feito pelo Coletivo Escolha Fácil para o 2º turno de 25 de outubro de 2026. Cada pergunta ("Você quer…?") tem uma resposta curta, um selo que diz em que pé a proposta está e a fonte para conferir.

O site é **HTML, CSS e JavaScript puro**: não tem build, framework nem banco de dados. Basta abrir os arquivos no navegador.

## O que tem no site

| Página | Arquivo | O que faz |
|---|---|---|
| Início | `index.html` | Todas as perguntas, separadas por tema |
| Pergunta | `t/NOME/index.html` | Uma página por pergunta. É o link que vai no WhatsApp, com o card como prévia |
| Estados | `escolha-facil-estados/estados.html` | Escolher o estado e ver como ele votou no 1º turno, cidade por cidade (dados do TSE) |
| Gerador de peças | `gerador/index.html` | Monta um pedido pronto para colar numa IA (Meta AI, ChatGPT, Claude…) e criar mensagem, post, áudio ou imagem |
| Contribua | `contribua/index.html` | Como apoiar o coletivo por Pix |

### Selos

- **Já existe**: está valendo.
- **Já começou**: está em andamento.
- **Está no programa**: é promessa para o próximo governo.

## Estrutura de pastas

```
.
├── index.html                  página inicial
├── t/NOME/                     uma página por pergunta
├── cards/NOME.png              imagem de cada pergunta (1080 × 1350)
├── escolha-facil-estados/      estados.html + uma página por estado
├── gerador/                    gerador de peças (página única, com tudo embutido)
├── contribua/                  página de contribuição
├── assets/
│   ├── style.css               estilo da página inicial, perguntas e Contribua
│   ├── comum.css               cabeçalho e rodapé usados em Estados e no Gerador
│   ├── app.js                  acessibilidade, compartilhar e copiar Pix
│   ├── fonts/                  Atkinson Hyperlegible
│   └── programa-de-governo-lula-2026.pdf
├── .htaccess                   HTTPS, cache e redirecionamento de links antigos
├── sitemap.xml
└── robots.txt
```

## Ver no computador

Dê dois cliques em `index.html`. Os links internos apontam direto para os arquivos (`../index.html`, `estados.html`), então a navegação funciona sem servidor.

Para testar como no ar, com o `.htaccess` funcionando, use qualquer servidor local. Por exemplo:

```
python -m http.server 8000
```

Depois abra `http://localhost:8000`.

## Publicar

O site fica no Hostinger. Os passos estão no [LEIA-ME.txt](LEIA-ME.txt): enviar os arquivos para a pasta `public_html`, ativar o SSL e testar o compartilhamento no celular.

## Como mexer

- **Menu e rodapé.** Na página inicial, nas perguntas e em Contribua, o menu está escrito em cada arquivo. Em Estados e no Gerador, o visual vem de `assets/comum.css`. Ao trocar um link do menu, troque em todas as páginas.
- **Publicar um estado.** Em `escolha-facil-estados/estados.html`, a lista `DISPONIVEIS` liga cada sigla (UF) à página do estado.
- **Cores e fonte.** Roxo `#5B21B6`, amarelo `#FFD400` e a fonte Atkinson Hyperlegible, pensada para leitura fácil. Ver `:root` em `assets/style.css`.

## Acessibilidade

- Fonte de alta legibilidade, texto grande e linguagem simples.
- Painel com aumento de texto, alto contraste e leitura em voz alta.
- Libras pelo [VLibras](https://www.gov.br/governodigital/pt-br/vlibras).
- O site não usa cookies e não guarda dados de quem visita.

## Fontes

- Programa de governo Lula 2026 (PDF em `assets/`, com a página citada em cada pergunta).
- Dados abertos e portal de resultados do TSE (páginas dos estados).

Achou alguma informação errada? Escreva para **contato@escolhafacil.online**. Nós corrigimos.

---

Manifestação espontânea de eleitoras e eleitores. Responsável: Coletivo Escolha Fácil.
