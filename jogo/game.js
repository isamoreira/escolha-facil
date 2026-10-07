/* =========================================================
   Cora contra O Desbotador — loop, estados e regras
   Fase 3: nove obstáculos temáticos, obstáculo → miçanga,
   efeitos de cada miçanga cinza.
   Estados: 'menu' | 'playing' | 'gameover'
   ========================================================= */

(function () {
  'use strict';

  var canvas = document.getElementById('jogo');
  if (!canvas || !canvas.getContext) return;
  var ctx = canvas.getContext('2d');
  var announcer = document.getElementById('jogo-aviso');

  var DEBUG = /[?&]debug=1\b/.test(window.location.search);
  var G = CONFIG.grayEffects;

  var game = {
    state: 'menu',
    stateTime: 0,     // segundos desde a última troca de estado
    time: 0,          // relógio geral (animações)
    speed: CONFIG.speed.start,
    distance: 0,      // pixels percorridos (também usado para o paralaxe)
    obstacles: [], coins: [], puddles: [], distanceToNext: 0,
    player: Player.create(),
    beads: [],        // [{ def, lost }]
    lostOrder: [],    // índices na ordem em que foram perdidas (o Velhinho devolve a última)
    points: 0,
    pops: [],         // "+2" subindo
    notes: [], noteState: { timer: 0 },
    energy: 1,        // só cai com Família e fome cinza
    slowTimer: 0,     // poça (Clima cinza)
    invulnerable: 0,
    shake: 0,
    toast: null,      // { def, time }
    fogEdge: CONFIG.desbotador.offscreenX,
    fps: 60
  };

  /* ---------- Tela ---------- */
  function resize() {
    var rect = canvas.getBoundingClientRect();
    if (!rect.width) return;
    var dpr = Math.min(window.devicePixelRatio || 1, CONFIG.maxDevicePixelRatio);
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.width * (CONFIG.height / CONFIG.width) * dpr);
  }

  // Leitores de tela recebem as mudanças importantes por uma região aria-live
  function announce(text) {
    if (!announcer) return;
    announcer.textContent = '';
    window.setTimeout(function () { announcer.textContent = text; }, 50);
  }

  /* ---------- Estados ---------- */
  function newBeads() {
    return CONFIG.beads.map(function (def) { return { def: def, lost: false }; });
  }

  function setState(name) {
    game.state = name;
    game.stateTime = 0;
  }

  function startRun() {
    game.speed = CONFIG.speed.start;
    game.distance = 0;
    Spawner.reset(game);
    game.player = Player.create();
    game.beads = newBeads();
    game.lostOrder = [];
    game.points = 0;
    game.pops = [];
    game.notes = [];
    game.energy = 1;
    game.slowTimer = 0;
    game.invulnerable = 0;
    game.shake = 0;
    game.toast = null;
    game.fogEdge = CONFIG.desbotador.offscreenX;
    setState('playing');
  }

  function canRestart() {
    return game.stateTime >= Math.max(CONFIG.restartDelay, CONFIG.desbotador.gameOverSweepTime);
  }

  function onPress(action) {
    if (game.state === 'menu') startRun();
    else if (game.state === 'gameover') { if (canRestart()) startRun(); }
    else if (game.state === 'playing' && action === 'jump') Player.requestJump(game.player);
  }

  /* ---------- Miçangas ---------- */
  function lostCount() {
    return game.lostOrder.length;
  }

  function isGray(tema) {
    for (var i = 0; i < game.beads.length; i++) {
      if (game.beads[i].def.tema === tema) return game.beads[i].lost;
    }
    return false;
  }

  // Perde a miçanga do tema; se ela já foi perdida (ou não há tema), perde qualquer uma que reste
  function loseBead(tema) {
    var remaining = [];
    var index = -1;
    for (var i = 0; i < game.beads.length; i++) {
      if (game.beads[i].lost) continue;
      remaining.push(i);
      if (tema && game.beads[i].def.tema === tema) index = i;
    }
    if (!remaining.length) return;
    if (index < 0) index = remaining[Math.floor(Math.random() * remaining.length)];

    var bead = game.beads[index];
    bead.lost = true;
    game.lostOrder.push(index);
    game.invulnerable = CONFIG.beadRules.invulnerableTime;
    game.shake = CONFIG.beadRules.hitShakeTime;
    game.toast = { def: bead.def, time: CONFIG.beadRules.lossToastTime };

    var left = game.beads.length - lostCount();
    if (left === 0) {
      setState('gameover');
      announce(CONFIG.texts.gameOverTitle + ' ' + CONFIG.texts.gameOverQuestion + ' ' + CONFIG.texts.restart + '.');
    } else {
      announce(CONFIG.texts.lostBead + ' ' + bead.def.nome + '. ' + (left === 1 ? 'Resta 1.' : 'Restam ' + left + '.'));
    }
  }

  /* ---------- Colisões e coleta ---------- */
  function overlaps(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }

  function obstacleBox(o) {
    var i = o.type.hitboxInset || 0;
    return { x: o.x + i, y: o.y + i, w: o.w - i * 2, h: o.h - i * 2 };
  }

  // Cada obstáculo só tira uma miçanga (a do seu tema), nunca durante a invulnerabilidade.
  // Obstáculos falsos (Transparência cinza) não machucam.
  function checkObstacles(pb) {
    if (game.invulnerable > 0) return;
    for (var i = 0; i < game.obstacles.length; i++) {
      var o = game.obstacles[i];
      if (o.fake || o.hit || !overlaps(pb, obstacleBox(o))) continue;
      o.hit = true;
      loseBead(o.type.tema);
      return;
    }
  }

  function collectCoins(pb) {
    var r = CONFIG.coins.radius;
    var value = isGray('bolso') ? G.bolso.coinValue : CONFIG.coins.value;
    for (var i = game.coins.length - 1; i >= 0; i--) {
      var c = game.coins[i];
      if (!overlaps(pb, { x: c.x - r, y: c.y - r, w: r * 2, h: r * 2 })) continue;
      game.coins.splice(i, 1);
      game.points += value;
      game.pops.push({ x: c.x, y: c.y - 14, text: '+' + value, time: CONFIG.coins.popTime });
    }
  }

  // Poça: só atrasa quem pisa nela (no chão)
  function checkPuddles(pb) {
    if (!game.player.onGround) return;
    for (var i = 0; i < game.puddles.length; i++) {
      var p = game.puddles[i];
      if (p.hit || pb.x + pb.w < p.x + 10 || pb.x > p.x + p.w - 10) continue;
      p.hit = true;
      game.slowTimer = G.clima.slowTime;
      game.pops.push({ x: CONFIG.player.x + 20, y: CONFIG.groundY - 100, text: 'splash!', time: CONFIG.coins.popTime });
    }
  }

  /* ---------- Atualização ---------- */
  function worldSpeed() {
    return game.speed * (game.slowTimer > 0 ? G.clima.slowFactor : 1);
  }

  function updateTimers(dt) {
    game.invulnerable = Math.max(0, game.invulnerable - dt);
    game.shake = Math.max(0, game.shake - dt);
    game.slowTimer = Math.max(0, game.slowTimer - dt);
    if (game.toast && (game.toast.time -= dt) <= 0) game.toast = null;
    for (var i = game.pops.length - 1; i >= 0; i--) {
      if ((game.pops[i].time -= dt) <= 0) game.pops.splice(i, 1);
    }
  }

  // Família e fome cinza: a energia cai sozinha; vazia, perde uma miçanga e enche de novo
  function updateEnergy(dt) {
    if (!isGray('familia')) { game.energy = 1; return; }
    game.energy -= dt / CONFIG.energy.drainTime;
    if (game.energy <= 0) {
      game.energy = 1;
      loseBead(null);
    }
  }

  function updateFog(dt) {
    var target = Desbotador.targetEdge(lostCount());
    if (game.slowTimer > 0) target += G.clima.fogLurch * (game.slowTimer / G.clima.slowTime);
    game.fogEdge = Desbotador.follow(game.fogEdge, target, dt);
  }

  function update(dt) {
    game.time += dt;
    game.stateTime += dt;
    updateTimers(dt);
    updateFog(dt);
    if (game.state !== 'playing') return;

    var speed = worldSpeed();
    game.speed = Math.min(CONFIG.speed.max, game.speed + CONFIG.speed.accel * dt);
    game.distance += speed * dt;
    Player.update(game.player, dt, Input, isGray('saude') ? G.saude.jumpMultiplier : 1, speed);
    Spawner.update(game, dt, speed, isGray);
    var py = CONFIG.groundY + game.player.y;
    Effects.updateNotes(game.notes, dt, CONFIG.player.x + 10, py - 90, !isGray('mulheres'), game.noteState);
    updateEnergy(dt);

    var pb = Player.box(game.player);
    collectCoins(pb);
    checkPuddles(pb);
    if (game.state === 'playing') checkObstacles(pb);
  }

  /* ---------- Desenho ---------- */
  function meters() {
    return Math.floor(game.distance / CONFIG.pixelsPerMeter);
  }

  // No game over a névoa avança até cobrir a tela inteira
  function gameOverProgress() {
    if (game.state !== 'gameover') return 0;
    return Math.min(1, game.stateTime / CONFIG.desbotador.gameOverSweepTime);
  }

  function worldFade() {
    var base = (lostCount() / CONFIG.beads.length) * CONFIG.desbotador.worldFadeMax;
    return base + (1 - base) * gameOverProgress();
  }

  // Segurança cinza: o obstáculo só aparece quando já está perto
  function obstacleAlpha(o) {
    var a = 1;
    if (isGray('seguranca')) {
      var S = G.seguranca;
      a = Math.max(0, Math.min(1, (S.revealX - o.x) / S.revealFade));
    }
    return o.fake ? a * 0.85 : a;
  }

  function applyCamera() {
    var scale = canvas.width / CONFIG.width;
    var sx = 0, sy = 0;
    if (game.shake > 0) {
      var a = CONFIG.beadRules.hitShakeAmount * (game.shake / CONFIG.beadRules.hitShakeTime);
      sx = (Math.random() * 2 - 1) * a;
      sy = (Math.random() * 2 - 1) * a;
    }
    ctx.setTransform(scale, 0, 0, scale, sx * scale, sy * scale);
  }

  function blurAmount() {
    return isGray('educacao') ? G.educacao.blur : 0;
  }

  function drawWorld() {
    var i, fade = worldFade();
    Render.setFade(fade);
    Render.drawBackground(ctx, game.distance);
    Effects.drawSigns(ctx, game.distance, blurAmount());
    for (i = 0; i < game.puddles.length; i++) Effects.drawPuddle(ctx, game.puddles[i]);
    for (i = 0; i < game.coins.length; i++) Effects.drawCoin(ctx, game.coins[i], game.time);
    for (i = 0; i < game.obstacles.length; i++) {
      Obstacles.draw(ctx, game.obstacles[i], game.time, obstacleAlpha(game.obstacles[i]));
    }
    Effects.drawNotes(ctx, game.notes);

    // A Cora desbota menos e pisca enquanto está invulnerável
    Render.setFade(fade * CONFIG.desbotador.playerFadeShare);
    ctx.save();
    if (game.invulnerable > 0 && Math.floor(game.invulnerable * 12) % 2 === 0) ctx.globalAlpha = 0.35;
    Render.drawPlayer(ctx, game.player, game.beads);
    ctx.restore();

    var edge = game.fogEdge + (CONFIG.width + 120 - game.fogEdge) * gameOverProgress();
    Desbotador.draw(ctx, edge, game.time);
    Render.setFade(0);
    if (isGray('seguranca') && game.state === 'playing') Effects.drawVignette(ctx, G.seguranca.vignetteAlpha);
  }

  function drawHud() {
    var T = CONFIG.texts;
    if (game.state === 'menu') {
      Render.drawPanel(ctx, T.title, [T.start, T.controls]);
      return;
    }
    Hud.drawNecklace(ctx, game.beads);
    Effects.drawStats(ctx, meters(), game.points, blurAmount());
    if (isGray('familia') && game.state === 'playing') Effects.drawEnergy(ctx, game.energy, blurAmount());
    Effects.drawPops(ctx, game.pops);
    if (game.toast && game.state === 'playing') {
      Hud.drawLossToast(ctx, game.toast.def, Math.min(1, game.toast.time * 3));
    }
    if (game.state === 'gameover' && gameOverProgress() >= 1) {
      Render.drawPanel(ctx, T.gameOverTitle, [
        T.gameOverQuestion,
        'Você correu ' + meters() + ' m e fez ' + game.points + ' ' + T.points + '.',
        T.restart
      ]);
    }
  }

  function drawDebugLayer() {
    var pb = Player.box(game.player);
    pb.color = '#00A3FF';
    var boxes = [pb];
    for (var i = 0; i < game.obstacles.length; i++) {
      var ob = obstacleBox(game.obstacles[i]);
      ob.color = game.obstacles[i].fake ? '#22C55E' : '#E000A0';
      boxes.push(ob);
    }
    Render.drawDebug(ctx, boxes, game.fps);
  }

  function draw() {
    applyCamera();
    drawWorld();
    drawHud();
    if (DEBUG) drawDebugLayer();
  }

  /* ---------- Teclas de debug (?debug=1) ---------- */
  function onDebugKey(e) {
    if (game.state !== 'playing') return;
    if (e.code === 'KeyM') loseBead(null);                 // perder uma miçanga qualquer
    var n = /^Digit([1-9])$/.exec(e.code);                  // 1–9: perder a miçanga daquele número
    if (n) loseBead(CONFIG.beads[Number(n[1]) - 1].tema);
    // V (Velhinho), G (gente) e F (final) entram nas Fases 4 e 5
  }

  /* ---------- Loop ---------- */
  var lastTime = 0;
  function frame(now) {
    var dt = lastTime ? (now - lastTime) / 1000 : 0;
    lastTime = now;
    if (dt > 0) game.fps += (1 / dt - game.fps) * 0.1;
    dt = Math.min(dt, CONFIG.maxDeltaTime);

    try {
      update(dt);
      draw();
    } catch (err) {
      // Um erro num quadro não deve travar a página inteira
      if (window.console) console.error('Erro no jogo:', err);
    }
    window.requestAnimationFrame(frame);
  }

  function init() {
    game.beads = newBeads();
    Input.onPress = onPress;
    Input.init(canvas);
    if (DEBUG) window.addEventListener('keydown', onDebugKey);

    resize();
    if (window.ResizeObserver) new ResizeObserver(resize).observe(canvas);
    else window.addEventListener('resize', resize);

    // Ao voltar para a aba, recomeça a contagem de tempo do zero
    document.addEventListener('visibilitychange', function () { lastTime = 0; });

    // Pede a fonte do site para os textos do canvas (o loop redesenha sozinho)
    if (document.fonts && document.fonts.load) {
      document.fonts.load('700 22px "Atkinson Hyperlegible"').catch(function () {});
    }

    window.requestAnimationFrame(frame);
  }

  init();
})();
