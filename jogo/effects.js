/* =========================================================
   Cora contra O Desbotador — itens e efeitos visuais
   Moedas, poças, placas, notas musicais, vinheta, energia,
   texto borrado e o placar.
   ========================================================= */

var Effects = (function () {
  'use strict';

  var C = CONFIG.colors;
  var col = Render.col;
  var FONT = '"Atkinson Hyperlegible", system-ui, sans-serif';

  /* ---------- Texto borrado (Educação cinza), sem ctx.filter ---------- */
  function text(ctx, str, x, y, blur) {
    if (!blur) {
      ctx.fillText(str, x, y);
      return;
    }
    var alpha = ctx.globalAlpha;
    ctx.globalAlpha = alpha * 0.28;
    var offsets = [[-1, 0], [1, 0], [0, -1], [0, 1], [0.7, 0.7], [-0.7, -0.7]];
    for (var i = 0; i < offsets.length; i++) {
      ctx.fillText(str, x + offsets[i][0] * blur, y + offsets[i][1] * blur);
    }
    ctx.globalAlpha = alpha;
  }

  /* ---------- Placas na beira do caminho ---------- */
  function drawSigns(ctx, scroll, blur) {
    var S = CONFIG.signs;
    var first = Math.floor((scroll - 200) / S.spacing);
    for (var k = first; k <= first + 2; k++) {
      if (k < 0) continue;
      var x = 700 + k * S.spacing - scroll;
      if (x < -160 || x > CONFIG.width + 40) continue;
      var word = S.words[k % S.words.length];
      drawSign(ctx, x, word, blur);
    }
  }

  function drawSign(ctx, x, word, blur) {
    var gy = CONFIG.groundY;
    ctx.font = '700 16px ' + FONT;
    var w = Math.max(70, ctx.measureText(word).width + 24);
    Render.limb(ctx, x + w / 2, gy - 4, x + w / 2, gy - 52, 6, col(C.signPost));
    Render.roundRect(ctx, x, gy - 86, w, 34, 8);
    ctx.fillStyle = col(C.signBoard);
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = col(C.signPost);
    ctx.stroke();
    ctx.fillStyle = col(C.accent);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    text(ctx, word, x + w / 2, gy - 68, blur);
  }

  /* ---------- Moedas ---------- */
  function drawCoin(ctx, c, t) {
    var r = CONFIG.coins.radius;
    var squash = Math.abs(Math.cos(t * 4 + c.x * 0.02)); // girando
    ctx.beginPath();
    ctx.ellipse(c.x, c.y, Math.max(2, r * squash), r, 0, 0, Math.PI * 2);
    ctx.fillStyle = col(C.coin);
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = col(C.coinDark);
    ctx.stroke();
    if (squash > 0.5) Render.limb(ctx, c.x, c.y - r * 0.45, c.x, c.y + r * 0.45, 2, col(C.coinDark));
  }

  function drawPops(ctx, pops) {
    ctx.font = '700 18px ' + FONT;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (var i = 0; i < pops.length; i++) {
      var p = pops[i];
      var k = p.time / CONFIG.coins.popTime;
      ctx.globalAlpha = Math.min(1, k * 2);
      ctx.fillStyle = C.ink;
      ctx.fillText(p.text, p.x, p.y - (1 - k) * 30);
    }
    ctx.globalAlpha = 1;
  }

  /* ---------- Poças (Clima e água cinza) ---------- */
  function drawPuddle(ctx, p) {
    var gy = CONFIG.groundY;
    ctx.beginPath();
    ctx.ellipse(p.x + p.w / 2, gy + 4, p.w / 2, 9, 0, 0, Math.PI * 2);
    ctx.fillStyle = col(C.puddle);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(p.x + p.w * 0.38, gy + 2, p.w * 0.16, 2.5, 0, 0, Math.PI * 2);
    ctx.fillStyle = col(C.puddleShine);
    ctx.fill();
  }

  /* ---------- Notas musicais (o coro; somem com Mulheres cinza) ---------- */
  function updateNotes(notes, dt, spawnX, spawnY, enabled, state) {
    var N = CONFIG.notes;
    for (var i = notes.length - 1; i >= 0; i--) {
      var n = notes[i];
      n.life -= dt;
      n.x -= 60 * dt;
      n.y -= 40 * dt;
      if (n.life <= 0) notes.splice(i, 1);
    }
    if (!enabled) return;
    state.timer -= dt;
    if (state.timer <= 0) {
      state.timer = N.interval;
      state.count = (state.count || 0) + 1;
      notes.push({
        x: spawnX, y: spawnY, life: N.life,
        color: N.colors[state.count % N.colors.length],
        double: state.count % 3 === 0
      });
    }
  }

  function drawNotes(ctx, notes) {
    var N = CONFIG.notes;
    for (var i = 0; i < notes.length; i++) {
      var n = notes[i];
      ctx.globalAlpha = Math.min(1, n.life / N.life * 1.5);
      var c = col(n.color);
      ctx.beginPath();
      ctx.ellipse(n.x, n.y, 5, 4, -0.4, 0, Math.PI * 2);
      ctx.fillStyle = c;
      ctx.fill();
      Render.limb(ctx, n.x + 4, n.y, n.x + 4, n.y - 16, 2, c);
      if (n.double) {
        ctx.beginPath();
        ctx.ellipse(n.x + 12, n.y - 3, 5, 4, -0.4, 0, Math.PI * 2);
        ctx.fill();
        Render.limb(ctx, n.x + 16, n.y - 3, n.x + 16, n.y - 19, 2, c);
        Render.limb(ctx, n.x + 4, n.y - 16, n.x + 16, n.y - 19, 3, c);
      } else {
        Render.limb(ctx, n.x + 4, n.y - 16, n.x + 10, n.y - 11, 2, c);
      }
    }
    ctx.globalAlpha = 1;
  }

  /* ---------- Vinheta (Segurança cinza) ---------- */
  function drawVignette(ctx, alpha) {
    var cx = CONFIG.width / 2, cy = CONFIG.height / 2;
    var g = ctx.createRadialGradient(cx, cy, 150, cx, cy, 560);
    g.addColorStop(0, 'rgba(18,16,20,0)');
    g.addColorStop(1, 'rgba(18,16,20,' + alpha + ')');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, CONFIG.width, CONFIG.height);
  }

  /* ---------- Placar (distância e pontos) e energia ---------- */
  function drawStats(ctx, meters, points, blur) {
    var x = CONFIG.width - 20;
    ctx.fillStyle = C.ink;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'top';
    ctx.font = '700 22px ' + FONT;
    text(ctx, meters + ' m', x, 14, blur);
    ctx.font = '700 18px ' + FONT;
    var label = points + ' ' + CONFIG.texts.points;
    text(ctx, label, x, 42, blur);
    var lw = ctx.measureText(label).width;
    drawCoin(ctx, { x: x - lw - 14, y: 52 }, 0);
  }

  function drawEnergy(ctx, energy, blur) {
    var w = 150, h = 14;
    var x = CONFIG.width - 20 - w, y = 74;
    ctx.fillStyle = C.ink;
    ctx.font = '700 14px ' + FONT;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    text(ctx, CONFIG.texts.energy, x - 8, y + h / 2 + 1, blur);
    Render.roundRect(ctx, x, y, w, h, h / 2);
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = C.ink;
    ctx.stroke();
    if (energy > 0) {
      Render.roundRect(ctx, x + 2, y + 2, Math.max(h - 4, (w - 4) * energy), h - 4, (h - 4) / 2);
      ctx.fillStyle = C.energy;
      ctx.fill();
    }
  }

  return {
    text: text,
    drawSigns: drawSigns,
    drawCoin: drawCoin,
    drawPops: drawPops,
    drawPuddle: drawPuddle,
    updateNotes: updateNotes,
    drawNotes: drawNotes,
    drawVignette: drawVignette,
    drawStats: drawStats,
    drawEnergy: drawEnergy
  };
})();
