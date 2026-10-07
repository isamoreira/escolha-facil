/* =========================================================
   Cora contra O Desbotador — geração e movimento do caminho
   Obstáculos, moedas, poças (Clima cinza) e obstáculos falsos
   (Transparência cinza). Espaçamento justo: a distância mínima
   entre obstáculos é velocidade × tempo de reação.
   ========================================================= */

var Spawner = (function () {
  'use strict';

  function reset(game) {
    game.obstacles = [];
    game.coins = [];
    game.puddles = [];
    game.distanceToNext = CONFIG.speed.start * CONFIG.spawn.firstObstacleDelay;
  }

  function randomType() {
    var types = CONFIG.obstacleTypes;
    return types[Math.floor(Math.random() * types.length)];
  }

  function makeObstacle(type, x) {
    var o = { type: type, x: x, w: type.width, hit: false, fake: false };
    var gy = CONFIG.groundY;
    if (type.kind === 'hanging') {
      // Pendurado do alto até um pouco acima da cabeça de quem está abaixado
      o.y = 0;
      o.h = gy - type.gapAboveGround;
    } else if (type.kind === 'flying') {
      o.h = type.height;
      o.y = gy - type.gapAboveGround - type.height;
    } else {
      o.h = type.height;
      o.y = gy - type.height;
    }
    return o;
  }

  // Fileira de moedas no meio do intervalo, baixa (correndo) ou alta (pulando)
  function addCoins(game, startX, gap) {
    var S = CONFIG.spawn;
    var n = S.coinsPerRow[0] + Math.floor(Math.random() * (S.coinsPerRow[1] - S.coinsPerRow[0] + 1));
    var high = Math.random() < 0.5;
    var x0 = startX + gap * 0.3;
    for (var i = 0; i < n; i++) {
      var arc = high ? Math.sin((i / Math.max(1, n - 1)) * Math.PI) * 20 : 0;
      game.coins.push({
        x: x0 + i * S.coinSpacing,
        y: CONFIG.groundY - (high ? CONFIG.coins.highY : CONFIG.coins.lowY) - arc
      });
    }
  }

  function spawnNext(game, isGray) {
    var S = CONFIG.spawn;
    var o = makeObstacle(randomType(), CONFIG.width + 20);
    game.obstacles.push(o);

    // Trabalho cinza: sem folga, os obstáculos vêm sempre no espaçamento mínimo
    var extraMax = isGray('trabalho') ? CONFIG.grayEffects.trabalho.extraGapMax : S.extraGapMax;
    var extra = S.extraGapMin + Math.random() * Math.max(0, extraMax - S.extraGapMin);
    var gap = game.speed * (S.reactionTime + extra);
    game.distanceToNext = gap + o.w;

    var gapStart = o.x + o.w;
    if (Math.random() < S.coinChance) addCoins(game, gapStart, gap);

    // No meio do intervalo: uma poça (Clima cinza) ou um obstáculo falso (Transparência cinza)
    var G = CONFIG.grayEffects;
    if (isGray('clima') && Math.random() < G.clima.puddleChance) {
      game.puddles.push({ x: gapStart + gap * 0.45, w: G.clima.puddleWidth, hit: false });
    } else if (isGray('transparencia') && Math.random() < G.transparencia.fakeChance) {
      var fake = makeObstacle(randomType(), gapStart + gap * 0.5);
      fake.fake = true;
      game.obstacles.push(fake);
    }
  }

  // O preço sobe conforme a etiqueta se aproxima da Cora
  function grow(o) {
    if (!o.type.growTo) return;
    var k = 1 - Math.max(0, Math.min(1, (o.x - CONFIG.player.x) / (CONFIG.width - CONFIG.player.x)));
    o.h = o.type.height + (o.type.growTo - o.type.height) * k;
    o.y = CONFIG.groundY - o.h;
  }

  function moveList(list, dx, widthOf) {
    for (var i = list.length - 1; i >= 0; i--) {
      list[i].x -= dx;
      if (list[i].x + widthOf(list[i]) < -40) list.splice(i, 1);
    }
  }

  function update(game, dt, worldSpeed, isGray) {
    var dx = worldSpeed * dt;
    moveList(game.obstacles, dx, function (o) { return o.w; });
    moveList(game.coins, dx, function () { return CONFIG.coins.radius; });
    moveList(game.puddles, dx, function (p) { return p.w; });
    for (var i = 0; i < game.obstacles.length; i++) grow(game.obstacles[i]);

    game.distanceToNext -= dx;
    if (game.distanceToNext <= 0) spawnNext(game, isGray);
  }

  return { reset: reset, update: update };
})();
