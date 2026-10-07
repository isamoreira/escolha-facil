# Escolha Fácil

Site do escolhafacil.online. Detalhes de estrutura, publicação e como mexer estão no `README.md`.

- HTML, CSS e JavaScript puro, sem build, framework, dependências nem banco de dados. Abre com duplo clique em `index.html`; links internos são relativos e apontam para arquivos (`../index.html`).
- O menu principal está escrito à mão em cada página (início, `t/*/`, `contribua/`, `escolha-facil-estados/*`, `gerador/`). Ao mudar um link do menu, mudar em todas.
- Estilo: `assets/style.css` (início, perguntas, Contribua) e `assets/comum.css` (cabeçalho/rodapé com prefixo `ef-` para páginas com estilo próprio). Cores roxo `#5B21B6`, amarelo `#FFD400`, verde `#0E7A43`; paleta sem vermelho. Fonte Atkinson Hyperlegible.
- As perguntas, textos e selos de cada tema estão em `index.html` (cards `.card` dentro de `section.tema#tema-*`, selo em `p.status`).
- Acessibilidade é prioridade: alto contraste, aumento de texto, leitura em voz alta (`assets/app.js`), VLibras. O site não usa cookies e não guarda dados de quem visita.
- A pasta `estados/` é cópia antiga e está no `.gitignore`; o site usa `escolha-facil-estados/`.

---

# Jogo

Cora contra O Desbotador, uma nova aba do site. Onde as regras abaixo conflitarem com a stack ou as convenções do site (acima), valem as do site.

Jogo de corrida para navegador (estilo Dino do Chrome), fofo e crítico. **Leia o `docs/jogo/GDD.md` inteiro antes de escrever qualquer código.** Ele é a fonte da verdade sobre personagens, nove miçangas, obstáculos, Velhinho, final e fases.

## Stack

- HTML5 + CSS + JavaScript puro, desenhando em `<canvas>` 2D.
- Sem build e sem dependências externas. Não adicionar nenhuma biblioteca sem perguntar.
- Scripts clássicos (não módulos ES), para o `index.html` abrir direto com duplo clique.
- Desenhar tudo por código (formas vetoriais no canvas) no começo. Sem arquivos de imagem.

## Como rodar

- Abrir `index.html` no navegador, ou `python3 -m http.server 8000` e acessar `http://localhost:8000`.

## Estrutura de arquivos sugerida

- `index.html`: página e canvas.
- `style.css`: estilos (separado do JS).
- `config.js`: todas as constantes ajustáveis (velocidades, gravidade, duração, momentos do Velhinho, cores) e os dados das nove miçangas e dos nove obstáculos.
- `game.js`: loop, estados, entrada, colisão, HUD.
- `render.js`: desenho e a função `tint(cor, quantidade)` para desbotar.
- Dividir mais se algum arquivo passar de ~400 linhas.

## Regras técnicas

- Loop com `requestAnimationFrame` e **delta time** (nada de velocidade presa ao FPS).
- Resolução lógica fixa (ex.: 960×360), escalada para caber na janela, com suporte a `devicePixelRatio` e a celular.
- Estados do jogo: menu, jogando, velhinho (sobreposto ao jogando), final, game over.
- Dados em `config.js` (miçangas, obstáculos com campo `tema`, textos), não espalhados pelo código.
- **Não usar `ctx.filter`** (compatibilidade com Safari). Desbotar interpolando cada cor em direção ao seu cinza.
- Nenhuma informação só por cor: cada miçanga tem ícone e nome, e "cinza" também muda o desenho.
- Persistência só com `localStorage`, dentro de try/catch, e o jogo tem que funcionar sem ele.
- Gerar obstáculos com espaçamento justo: distância mínima = velocidade × tempo de reação (valor em `config.js`).
- Modo debug com `?debug=1`: mostrar hitboxes e FPS e permitir teclas `M` (perder miçanga), `V` (chamar o Velhinho), `G` (adicionar gente), `F` (ir para o final). Isso é para testar sem jogar 3 minutos.

## Estilo de código

- Estrutura clara e manutenível, funções pequenas, tratamento de erros onde fizer sentido.
- Comentários em português. Nomes de variáveis e funções em inglês.
- Dar arquivos completos ao entregar mudanças (sem `// resto do código aqui`).

## Como trabalhar

1. Seguir as **fases da seção 10 do GDD, em ordem**. Não pular fases.
2. Ao fim de cada fase: parar, dizer em poucas linhas como testar e o que mudou, e esperar o OK antes de seguir.
3. Decisões da seção 9 do GDD estão em aberto: **perguntar antes** de decidir por conta própria (nome do Velhinho, duração, modo infinito, estilo de arte, textos dos pop-ups).
4. Respostas curtas. Mostrar o resultado funcionando mais do que explicar.

## Regras de conteúdo (importante)

- O Velhinho é **personagem original**. Nunca usar nome, rosto, foto, voz ou frase de pessoa real.
- O Desbotador representa **ideias e políticas** (retrocesso, censura, cortes, desinformação), nunca um grupo de pessoas nem uma pessoa real.
- Os textos dos pop-ups vêm do site https://escolhafacil.online/. Copiar o texto e o status de cada item exatamente como está lá ("Já existe", "Já começou", "Está no programa"). **Não inventar números nem afirmações.** Se não encontrar o texto, deixar um marcador `TODO` em `config.js` e avisar.
- Incluir uma tela "Sobre" dizendo que o jogo tem ponto de vista, que os temas vêm do Escolha Fácil (iniciativa de voluntários, com informações majoritariamente do programa de governo do candidato recomendado) e que é um projeto independente.
- Antes de qualquer divulgação ou impulsionamento, lembrar a usuária de conferir as regras de propaganda eleitoral do TSE.
