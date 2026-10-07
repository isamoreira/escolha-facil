/* =========================================================
   Cora contra O Desbotador — o Desbotador
   Névoa cinza que vem pela esquerda. Representa ideias
   (censura, cortes, boatos), por isso carrega barra de censura,
   tesoura e balão de boato. Não tem rosto de pessoa.
   ========================================================= */

var Desbotador = (function () {
  'use strict';

  var C = CONFIG.colors;
  var D = CONFIG.desbotador;

  // Borda direita da névoa para um número de miçangas perdidas (0 fora da tela, 8 quase encosta)
  function targetEdge(lostCount) {
    var closest = CONFIG.player.x - D.closestGap;
    var t = Math.min(1, lostCount / (CONFIG.beads.length - 1));
    return D.offscreenX + (closest - D.offscreenX) * t;
  }

  // Aproxima suavemente a posição atual da posição alvo
  function follow(current, target, dt) {
    return current + (target - current) * Math.min(1, dt * D.followSpeed);
  }

  /* ---------- Desenho ---------- */
  function drawSmudge(ctx, edge) {
    var g = ctx.createLinearGradient(edge, 0, edge + D.smudgeWidth, 0);
    g.addColorStop(0, 'rgba(120,116,126,0.38)');
    g.addColorStop(1, 'rgba(120,116,126,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, edge + D.smudgeWidth, CONFIG.height);
  }

  function drawFog(ctx, edge, t) {
    var h = CONFIG.height;
    // Corpo sólido atrás da borda
    if (edge > 30) {
      ctx.fillStyle = C.fogDark;
      ctx.fillRect(0, 0, edge - 30, h);
    }
    // Camada de trás (mais escura) e da frente (mais clara), com ondulação
    var layers = [[C.fogDark, -6, 38, 1.0], [C.fog, -22, 32, 1.6]];
    for (var l = 0; l < layers.length; l++) {
      ctx.fillStyle = layers[l][0];
      for (var y = -10; y <= h + 20; y += 28) {
        var wobble = Math.sin(t * layers[l][3] + y * 0.06) * 8;
        ctx.beginPath();
        ctx.arc(edge + layers[l][1] + wobble, y, layers[l][2] + Math.sin(y * 0.3) * 4, 0, Math.PI * 2);
        ctx.fill();
      }
      if (edge + layers[l][1] - 20 > 0) ctx.fillRect(0, 0, edge + layers[l][1] - 20, h);
    }
    // Fiapos claros
    ctx.fillStyle = C.fogLight;
    for (var k = 0; k < 4; k++) {
      var fy = 60 + k * 70 + Math.sin(t * 1.3 + k) * 10;
      Render.roundRect(ctx, edge - 90 + Math.sin(t + k * 2) * 12, fy, 70, 10, 5);
      ctx.fill();
    }
  }

  function drawCensorBar(ctx, x, y) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(-0.18);
    Render.roundRect(ctx, -34, -9, 68, 18, 3);
    ctx.fillStyle = C.censor;
    ctx.fill();
    ctx.restore();
  }

  function drawScissors(ctx, x, y, t) {
    var open = 0.25 + Math.abs(Math.sin(t * 4)) * 0.3; // tesoura abrindo e fechando
    ctx.save();
    ctx.translate(x, y);
    ctx.strokeStyle = C.censor;
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    for (var s = -1; s <= 1; s += 2) {
      ctx.save();
      ctx.rotate(s * open);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(30, 0);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(-9, 0, 7, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
    ctx.restore();
  }

  function drawRumorBalloon(ctx, x, y) {
    ctx.save();
    Render.roundRect(ctx, x - 30, y - 18, 60, 34, 14);
    ctx.fillStyle = C.fogLight;
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = C.censor;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x - 12, y + 16);
    ctx.lineTo(x - 20, y + 28);
    ctx.lineTo(x - 2, y + 16);
    ctx.fillStyle = C.fogLight;
    ctx.fill();
    ctx.fillStyle = C.censor;
    ctx.font = '700 16px "Atkinson Hyperlegible", system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('blá?!', x, y);
    ctx.restore();
  }

  // Olhos emburrados, de desenho animado
  function drawEyes(ctx, x, y) {
    for (var i = 0; i < 2; i++) {
      var ex = x + i * 22;
      Render.circle(ctx, ex, y, 8, '#F2F1F4');
      Render.circle(ctx, ex + 3, y + 1, 3.5, C.censor);
      Render.limb(ctx, ex - 8, y - 12 + i * 2, ex + 7, y - 9 - i * 2, 3, C.censor);
    }
  }

  function draw(ctx, edge, t) {
    if (edge < D.offscreenX + 2) return;
    drawSmudge(ctx, edge);
    drawFog(ctx, edge, t);
    var bob = Math.sin(t * 2) * 4;
    drawEyes(ctx, edge - 62, 96 + bob);
    drawCensorBar(ctx, edge - 58, 140 + bob);
    drawRumorBalloon(ctx, edge - 74, 198 - bob);
    drawScissors(ctx, edge - 44, 262 - bob, t);
  }

  return { targetEdge: targetEdge, follow: follow, draw: draw };
})();
