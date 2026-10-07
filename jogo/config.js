/* =========================================================
   Cora contra O Desbotador — configuração
   Todas as constantes ajustáveis do jogo ficam aqui.
   Unidades: pixels lógicos (tela de 960×360) e segundos.
   ========================================================= */

var CONFIG = {
  // Resolução lógica fixa; o canvas é escalado para caber na página
  width: 960,
  height: 360,
  groundY: 300,          // altura da linha do chão
  maxDevicePixelRatio: 3,
  maxDeltaTime: 1 / 20,  // evita saltos grandes depois de trocar de aba

  // Física da Cora
  physics: {
    gravity: 2600,
    jumpVelocity: 900,        // altura máxima ≈ v² / 2g ≈ 155 px
    jumpCutVelocity: 380,     // soltar o pulo cedo corta a subida (pulo curto)
    fastFallMultiplier: 3,    // abaixar no ar faz cair mais rápido
    jumpBufferTime: 0.12      // aperto um pouco antes de pousar ainda vale
  },

  // Velocidade da corrida
  speed: {
    start: 360,
    accel: 9,     // px/s a cada segundo
    max: 720
  },

  // Geração de obstáculos
  spawn: {
    reactionTime: 1.0,        // distância mínima = velocidade × tempo de reação
    extraGapMin: 0,           // folga extra sorteada, em segundos de corrida
    extraGapMax: 0.9,
    firstObstacleDelay: 1.4,  // segundos até o primeiro obstáculo
    coinChance: 0.6,          // chance de vir uma fileira de moedas entre dois obstáculos
    coinsPerRow: [3, 5],
    coinSpacing: 34
  },

  // Moedas (pontos)
  coins: {
    radius: 9,
    value: 2,
    lowY: 30,       // altura acima do chão (dá para pegar correndo)
    highY: 125,     // altura acima do chão (precisa pular)
    popTime: 0.7    // tempo do "+2" subindo
  },

  // Energia (só aparece quando Família e fome fica cinza)
  energy: {
    drainTime: 30   // segundos para esvaziar; vazia, a Cora perde uma miçanga e a energia volta cheia
  },

  // Efeitos de cada miçanga cinza (seção 4 do GDD, coluna "Quando fica cinza")
  grayEffects: {
    seguranca: { vignetteAlpha: 0.6, revealX: 560, revealFade: 90 }, // bordas escuras; obstáculos aparecem em cima da hora
    saude: { jumpMultiplier: 0.85 },                                  // pulo mais baixo
    bolso: { coinValue: 1 },                                          // moedas valem menos
    trabalho: { extraGapMax: 0 },                                     // sem folga entre obstáculos
    mulheres: {},                                                     // some o coro (as notas musicais; o som entra na Fase 6)
    familia: {},                                                      // energia cai sozinha (ver `energy`)
    educacao: { blur: 2.2 },                                          // placas e textos borrados
    transparencia: { fakeChance: 0.45 },                              // obstáculos falsos
    clima: { puddleChance: 0.45, puddleWidth: 96, slowFactor: 0.7, slowTime: 1.4, fogLurch: 60 } // poças atrasam
  },

  // Notas musicais saindo da Cora (o coro). Somem com a miçanga Mulheres cinza.
  notes: {
    interval: 0.38,
    life: 1.4,
    colors: ['#7C3AED', '#EC4899', '#F97316', '#14B8A6', '#FACC15']
  },

  // Placas na beira do caminho (ficam borradas com Educação cinza)
  signs: {
    spacing: 1300,
    words: ['Escola', 'Biblioteca', 'Praça', 'Feira', 'Creche', 'Posto de saúde']
  },

  // Cora
  player: {
    x: 200,              // espaço à esquerda para o Desbotador se aproximar
    width: 46,
    height: 84,
    duckWidth: 66,
    duckHeight: 48,
    hitboxInset: 6
  },

  // Os nove obstáculos (seção 5 do GDD). `tema` diz qual miçanga cada um tira.
  // kind: 'ground' (no chão, pular), 'hanging' (pendurado do alto, abaixar), 'flying' (voando, abaixar)
  // Sorteio uniforme entre os nove: 6 de pular para 3 de abaixar, como no GDD.
  obstacleTypes: [
    { id: 'muro',     nome: 'Muro cinza',        tema: 'seguranca',     action: 'jump', kind: 'ground',  width: 54, height: 46, hitboxInset: 4 },
    { id: 'tesoura',  nome: 'Tesoura de corte',  tema: 'saude',         action: 'jump', kind: 'ground',  width: 52, height: 44, hitboxInset: 6 },
    { id: 'preco',    nome: 'Preço subindo',     tema: 'bolso',         action: 'jump', kind: 'ground',  width: 42, height: 34, growTo: 62, hitboxInset: 4 },
    { id: 'relogio',  nome: 'Relógio sem parar', tema: 'trabalho',      action: 'duck', kind: 'hanging', width: 50, gapAboveGround: 58, hitboxInset: 4 },
    { id: 'censura',  nome: 'Barra de censura',  tema: 'mulheres',      action: 'duck', kind: 'hanging', width: 74, gapAboveGround: 58, hitboxInset: 4 },
    { id: 'prato',    nome: 'Prato vazio',       tema: 'familia',       action: 'jump', kind: 'ground',  width: 56, height: 50, hitboxInset: 6 },
    { id: 'livro',    nome: 'Livro riscado',     tema: 'educacao',      action: 'jump', kind: 'ground',  width: 48, height: 40, hitboxInset: 4 },
    { id: 'boato',    nome: 'Boato',             tema: 'transparencia', action: 'duck', kind: 'flying',  width: 66, height: 52, gapAboveGround: 60, hitboxInset: 6 },
    { id: 'fogo',     nome: 'Fogo',              tema: 'clima',         action: 'jump', kind: 'ground',  width: 44, height: 34, hitboxInset: 6 }
  ],

  // Miçangas: perda por colisão
  beadRules: {
    invulnerableTime: 1.2,  // depois de perder uma, não perde outra logo em seguida
    lossToastTime: 2.0,     // quanto tempo o aviso "Perdeu a miçanga…" fica na tela
    hitShakeTime: 0.25,
    hitShakeAmount: 5
  },

  // O Desbotador (posição = miçangas perdidas; com 0 fica fora da tela, com 8 quase encosta)
  desbotador: {
    offscreenX: -40,        // borda da névoa com 0 perdidas
    closestGap: 30,         // distância até a Cora com 8 perdidas
    followSpeed: 3,         // quão rápido a névoa chega na posição nova
    worldFadeMax: 0.85,     // desbotamento do cenário com 9 perdidas (antes do game over)
    playerFadeShare: 0.25,  // a Cora desbota menos que o cenário
    smudgeWidth: 240,       // mancha cinza à frente da névoa
    gameOverSweepTime: 0.9  // tempo da névoa cobrindo a tela no game over
  },

  restartDelay: 0.5,     // segundos antes de aceitar o reinício
  pixelsPerMeter: 40,    // para mostrar a distância em metros

  // Cores do cenário (desbotadas com tint() nas próximas fases)
  colors: {
    skyTop: '#BFE3FF',
    skyBottom: '#FFF4CC',
    sun: '#FFD400',
    cloud: '#FFFFFF',
    hillFar: '#A8E6B8',
    hillNear: '#5CC27E',
    grass: '#2FA35A',
    soil: '#F0C46A',
    soilMark: '#D19A45',
    ink: '#121014',
    accent: '#5B21B6',
    obstacle: '#6E6878',
    obstacleDark: '#4A4552',
    rope: '#3F3A46',
    // Desbotador
    fog: '#9A96A0',
    fogDark: '#7A7680',
    fogLight: '#BDB9C2',
    censor: '#121014',
    beadLost: '#8C8892',
    // Itens e efeitos
    coin: '#FACC15',
    coinDark: '#B7791F',
    puddle: '#4B4F5C',
    puddleShine: '#8E95A8',
    signPost: '#8B5E34',
    signBoard: '#FFFFFF',
    energy: '#EC4899',
    paper: '#FFFFFF',
    metal: '#C9CCD6',
    flame: '#F97316',
    flameCore: '#FACC15',
    // Cora
    skin: '#8D5524',
    skinShade: '#6E4019',
    hair: '#2A1A14',
    dress: '#7C3AED',
    dressBand: '#FFD400',
    legs: '#5B21B6',
    shoe: '#121014',
    cheek: '#F472B6',
    flowerA: '#EC4899',
    flowerB: '#FFD400',
    flowerC: '#14B8A6'
  },

  // As nove miçangas (seção 4 do GDD). `tema` é o id da seção do tema em ../index.html (#tema-…).
  // `icone` é desenhado em hud.js; o nome aparece no aviso quando a miçanga é perdida.
  beads: [
    { tema: 'seguranca',    nome: 'Segurança',      cor: '#1E3A8A', icone: 'escudo' },
    { tema: 'saude',        nome: 'Saúde',          cor: '#16A34A', icone: 'cruz' },
    { tema: 'bolso',        nome: 'Custo de vida',  cor: '#FACC15', icone: 'moeda' },
    { tema: 'trabalho',     nome: 'Trabalho',       cor: '#F97316', icone: 'relogio' },
    { tema: 'mulheres',     nome: 'Mulheres',       cor: '#7C3AED', icone: 'voz' },
    { tema: 'familia',      nome: 'Família e fome', cor: '#EC4899', icone: 'prato' },
    { tema: 'educacao',     nome: 'Educação',       cor: '#7DD3FC', icone: 'livro' },
    { tema: 'transparencia',nome: 'Transparência',  cor: '#E6F4FF', icone: 'lupa' },
    { tema: 'clima',        nome: 'Clima e água',   cor: '#14B8A6', icone: 'gota' }
  ],

  // Textos que aparecem dentro do canvas
  texts: {
    title: 'Cora contra O Desbotador',
    start: 'Aperte Espaço ou toque para correr',
    controls: 'Pular: Espaço ou ↑  ·  Abaixar: ↓',
    lostBead: 'Perdeu a miçanga',
    energy: 'Energia',
    points: 'pontos',
    gameOverTitle: 'Ninguém vence sozinho.',
    gameOverQuestion: 'Tenta de novo?',
    restart: 'Aperte Espaço ou toque para recomeçar'
  }
};
