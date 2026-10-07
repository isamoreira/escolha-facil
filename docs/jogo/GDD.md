# Cora contra O Desbotador — Resumo de design (GDD)

Título de trabalho. Versão 0.1, 07/10/2026.

## 1. Conceito

Corrida de navegador no estilo do Dino do Chrome, com tom fofo e crítico. O mundo é alegre e colorido. Uma força chamada **O Desbotador** quer tirar a cor de tudo. Cora corre, pula e abaixa. Cada vez que o Desbotador a alcança, ela perde uma das nove miçangas do colar, e cada miçanga é um direito (um tema do site Escolha Fácil). Com a ajuda de um velhinho barbudo de vermelho e de gente que se junta pelo caminho, as cores voltam e o Desbotador é derrotado.

Mensagem central: **ninguém vence sozinho, e a gente vence junto.**

Tom: leve, colorido, acolhedor. Crítica feita com humor e imagens, nunca com agressividade.

## 2. Personagens

**Cora.** Pessoa alegre, bonita e colorida, com adornos coloridos. Usa um colar de nove miçangas, que aparece no corpo dela e no HUD. Controles: pular e abaixar.

**O Desbotador.** Névoa cinza que persegue pela esquerda da tela e desbota o cenário por onde passa. Visualmente: corpo de névoa com barras de censura, tesouras e balões de boato presos nele. É uma força de ideias (retrocesso, censura, cortes, desinformação), nunca a caricatura de um grupo de pessoas. Cada miçanga perdida deixa ele mais perto.

**O Velhinho.** Senhor barbudo de roupa vermelha, bondoso, que corre junto com Cora em trechos especiais. **Personagem original do jogo: sem nome, rosto, foto ou voz de pessoa real.** Nome a definir.

**A gente.** Pessoas com cartazes, instrumentos e panelas que aparecem pelo caminho. Quem Cora coleta passa a correr atrás dela, formando uma multidão.

## 3. Jogabilidade

**Controles**
- Teclado: Espaço ou seta para cima pula; seta para baixo abaixa.
- Toque: tocar na metade de cima da tela pula; segurar a metade de baixo abaixa.

**Estrutura da corrida (modo história, 2,5 a 3 minutos)**
- Ato 1 (0–30%): mundo colorido, o Desbotador chega e a corrida acelera.
- Ato 2 (30–85%): perdas e ganhos. O Velhinho aparece 3 vezes (perto de 35%, 60% e 85%), cada vez por cerca de 8 segundos.
- Ato 3 (85–100%): reta final com o Velhinho e a multidão. Final coletivo.
- Depois da vitória, pode abrir um modo infinito (decisão em aberto, ver seção 9).

**Vida e derrota**
- Bater em um obstáculo faz Cora perder a miçanga ligada àquele obstáculo (se ela ainda tiver essa miçanga; se não tiver, perde qualquer uma que reste). Um instante de invulnerabilidade evita perder duas de uma vez.
- Cada miçanga perdida: o cenário desbota mais e o Desbotador chega mais perto.
- Perdeu as nove: tela cinza com a mensagem "Ninguém vence sozinho. Tenta de novo?".

**Desbotador e dessaturação**
- Posição do Desbotador = miçangas perdidas ÷ 9 (com 0 perdidas fica fora da tela; com 8 quase encosta).
- Dessaturação do cenário proporcional às miçangas perdidas, mais uma mancha cinza que acompanha o monstro.

## 4. As nove miçangas

| # | Miçanga (cor) | Tema | Quando fica cinza | Com o Velhinho por perto | Ícone |
|---|---|---|---|---|---|
| 1 | Azul-marinho | Segurança | Tela escurece nas bordas; obstáculos aparecem em cima da hora | A luz volta e Cora ganha um escudo curto | escudo |
| 2 | Verde | Saúde | Cora cansa: pulo mais baixo | Aparecem remédios no caminho que recarregam energia | cruz |
| 3 | Amarelo | Custo de vida | Moedas valem menos | Botijões e lâmpadas viram moedas em dobro | moeda |
| 4 | Laranja | Trabalho | A corrida não tem pausa | Aparecem "folgas", trechos de descanso que funcionam como checkpoint | relógio |
| 5 | Roxo | Mulheres | A música perde a voz e o coro | O coro volta e empurra o Desbotador para trás por alguns segundos | voz |
| 6 | Rosa | Família e fome | A energia cai sozinha com o tempo | Aparece uma mesa farta que recarrega tudo | prato |
| 7 | Azul-claro | Educação | Placas e textos ficam borrados | Moedinhas de poupança acumulam e viram bônus de pontos no final | livro |
| 8 | Cristal transparente | Transparência | Aparecem obstáculos falsos que confundem | Os boatos ficam marcados e dá para ignorar | lupa |
| 9 | Turquesa | Clima e água | Poças e fogo atrasam a corrida | Chove na hora certa e as cisternas enchem, dando bônus | gota |

**Acessibilidade:** o jogo trata de cor, então nenhuma informação pode depender só de cor. Cada miçanga tem ícone e nome, e o estado "cinza" também muda o desenho (miçanga opaca e rachada), não só a saturação.

**Inspiração dos itens (programas citados no site):** Farmácia Popular, Gás do Povo, Luz do Povo, Pé-de-Meia, Bolsa Família, Celular Seguro, cisternas do Semiárido, fim da escala 6x1.

## 5. Obstáculos e a miçanga que cada um tira

| Obstáculo | Ação | Tira | Visual |
|---|---|---|---|
| Muro cinza | Pular | Segurança | Muro baixo com grade |
| Tesoura de corte | Pular | Saúde | Tesoura grande no chão cortando uma cruz |
| Preço subindo | Pular | Custo de vida | Etiqueta de preço que cresce |
| Relógio sem parar | Abaixar | Trabalho | Pêndulo alto |
| Barra de censura | Abaixar | Mulheres | Barra preta alta sobre a "boca" do cenário |
| Prato vazio | Pular | Família e fome | Prato gigante vazio |
| Livro riscado | Pular | Educação | Livro com rabiscos e tesoura |
| Boato | Abaixar | Transparência | Balão de fofoca voando |
| Poça ou fogo | Pular | Clima e água | Poça escura ou chama baixa |

Seis para pular, três para abaixar. Cada obstáculo é cadastrado com o campo `tema`, para o jogo saber qual miçanga tirar. O jogador aprende o significado de cada obstáculo jogando.

## 6. O Velhinho (estado especial)

- Aparece 3 vezes no Ato 2 (cerca de 35%, 60% e 85% da corrida) e na reta final.
- Enquanto ele corre junto: o Desbotador recua, as cores voltam, a música ganha instrumentos e valem os "ganhos" da coluna "Com o Velhinho por perto" da seção 4, para as miçangas que Cora ainda tem.
- Ao fim de cada aparição ele devolve **uma** miçanga cinza (a mais recentemente perdida).
- Ele é um aliado, não um botão de vitória: depende de Cora ter chegado até ali.

## 7. Final coletivo

- Ao longo da corrida, "gente" coletável aparece (coletar é passar por cima ou pegar no pulo) e passa a correr atrás de Cora.
- Na reta final, o tamanho do Desbotador diminui conforme a quantidade de gente reunida.
- Quem chega ao fim sempre vence, mas o final muda com a multidão: poucos (vitória apertada), médio (vitória) e muitos (festa).
- Cena final: o Desbotador encolhe, o mundo se recolore, as nove miçangas voltam, e a tela mostra "A gente vence junto."

## 8. Direção de arte e som

- Formas arredondadas e fofas, cores saturadas e vivas no começo. Começar com formas vetoriais desenhadas no próprio canvas (sem arquivos de imagem); trocar por sprites depois, se quiserem.
- Desbotar: interpolar cada cor do cenário em direção ao seu cinza (função `tint(cor, quantidade)`). **Evitar `ctx.filter`** por compatibilidade com Safari.
- Som (fase final): música em camadas com Web Audio API, uma camada que some quando a miçanga fica cinza e volta com o Velhinho. A camada de voz é a da miçanga Mulheres.

## 9. Decisões em aberto

1. Nome do Velhinho e nome definitivo do jogo.
2. Duração exata da corrida (alvo: 2,5 a 3 minutos).
3. Haverá modo infinito depois de vencer?
4. Arte: vetor no canvas (padrão) ou sprites/pixel art?
5. Textos dos pop-ups: por miçanga, um texto curto copiado do site Escolha Fácil junto com o status do item ("Já existe", "Já começou", "Está no programa"). **Copiar o status exatamente como está no site e não inventar nem acrescentar números.**

## 10. Fases de desenvolvimento

Cada fase termina com algo jogável e testável.

1. **Corrida básica:** Cora, chão com rolagem, pular e abaixar (teclado e toque), um obstáculo genérico de cada tipo, colisão, reinício.
2. **Miçangas e Desbotador:** HUD com as nove miçangas, perda por colisão, Desbotador se aproximando, cenário desbotando, game over.
3. **Obstáculos temáticos:** os nove obstáculos, mapa obstáculo → miçanga, efeitos de "cinza" de cada tema.
4. **O Velhinho:** estado especial, os nove ganhos, devolução de miçangas.
5. **Gente e final:** coletáveis, multidão, final coletivo com três variações, tela de game over.
6. **Polimento:** áudio em camadas, mobile, acessibilidade (ícones), textos e status do site, tela de créditos/Sobre, recorde em `localStorage`.
7. **Publicação:** hospedagem estática.

## 11. Notas de conteúdo

- O jogo defende um ponto de vista. Mirar em ideias e políticas, não em grupos de pessoas.
- Fonte dos temas: https://escolhafacil.online/ (iniciativa de um coletivo de voluntários; o próprio site se apresenta como manifestação de eleitores e as informações vêm majoritariamente do programa de governo do candidato que ele recomenda). Dizer isso na tela "Sobre".
- Não atribuir falas inventadas a pessoas reais. O Velhinho é personagem original.
- Antes de divulgar ou impulsionar o jogo, conferir as regras de propaganda eleitoral do TSE.
