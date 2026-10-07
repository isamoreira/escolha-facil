/* =========================================================
   Cora contra O Desbotador — desenho
   Tudo é desenhado por código, em coordenadas lógicas (960×360).
   Cores passam por col(), que aplica o desbotamento atual.
   ========================================================= */

var Render = (function () {
  'use strict';

  var C = CONFIG.colors;
  var fade = 0; // 0 = todo colorido, 1 = todo cinza (usado a partir da Fase 2)

  /* ---------- Cor e desbotamento ---------- */
  var rgbCache = {};

  function parseHex(hex) {
    var cached = rgbCache[hex];
    if (cached) return cached;
    var h = hex.replace('#', '');
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    var n = parseInt(h, 16);
    var rgb = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
    rgbCache[hex] = rgb;
    return rgb;
  }

  // Interpola a cor em direção ao seu cinza (luminância). Substitui ctx.filter, que falha no Safari.
  function tint(hex, amount) {
    var a = Math.max(0, Math.min(1, amount || 0));
    if (a === 0) return hex;
    var c = parseHex(hex);
    var gray = 0.299 * c[0] + 0.587 * c[1] + 0.114 * c[2];
    return 'rgb(' + Math.round(c[0] + (gray - c[0]) * a) + ',' +
      Math.round(c[1] + (gray - c[1]) * a) + ',' +
      Math.round(c[2] + (gray - c[2]) * a) + ')';
  }

  function col(hex) { return tint(hex, fade); }

  /* ---------- Formas básicas ---------- */
  function roundRect(ctx, x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function circle(ctx, x, y, r, color) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
  }

  function limb(ctx, x1, y1, x2, y2, width, color) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineWidth = width;
    ctx.lineCap = 'round';
    ctx.strokeStyle = color;
    ctx.stroke();
  }

  /* ---------- Cenário ---------- */
  function drawSky(ctx) {
    var g = ctx.createLinearGradient(0, 0, 0, CONFIG.groundY);
    g.addColorStop(0, col(C.skyTop));
    g.addColorStop(1, col(C.skyBottom));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, CONFIG.width, CONFIG.groundY);

    // Sol com raios curtos
    var sx = 820, sy = 70;
    ctx.save();
    ctx.translate(sx, sy);
    ctx.strokeStyle = col(C.sun);
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    for (var i = 0; i < 10; i++) {
      ctx.rotate(Math.PI / 5);
      ctx.beginPath();
      ctx.moveTo(42, 0);
      ctx.lineTo(54, 0);
      ctx.stroke();
    }
    ctx.restore();
    circle(ctx, sx, sy, 32, col(C.sun));
  }

  function drawCloud(ctx, x, y, s) {
    var c = col(C.cloud);
    circle(ctx, x, y, 18 * s, c);
    circle(ctx, x + 20 * s, y - 10 * s, 22 * s, c);
    circle(ctx, x + 44 * s, y, 18 * s, c);
    roundRect(ctx, x - 6 * s, y, 66 * s, 18 * s, 9 * s);
    ctx.fillStyle = c;
    ctx.fill();
  }

  function drawClouds(ctx, scroll) {
    var span = CONFIG.width + 200;
    var clouds = [[80, 70, 1], [420, 50, 0.8], [700, 110, 0.7]];
    for (var i = 0; i < clouds.length; i++) {
      var x = ((clouds[i][0] - scroll * 0.05) % span + span) % span - 100;
      drawCloud(ctx, x, clouds[i][1], clouds[i][2]);
    }
  }

  // Morros com ondas suaves que rolam em paralaxe
  function drawHills(ctx, scroll, factor, baseY, amp, color) {
    var off = scroll * factor;
    ctx.beginPath();
    ctx.moveTo(0, CONFIG.groundY);
    for (var x = 0; x <= CONFIG.width; x += 16) {
      var t = x + off;
      var y = baseY - Math.sin(t * 0.008) * amp - Math.sin(t * 0.019 + 1.3) * amp * 0.45;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(CONFIG.width, CONFIG.groundY);
    ctx.closePath();
    ctx.fillStyle = col(color);
    ctx.fill();
  }

  function drawGround(ctx, scroll) {
    var gy = CONFIG.groundY;
    ctx.fillStyle = col(C.soil);
    ctx.fillRect(0, gy, CONFIG.width, CONFIG.height - gy);
    ctx.fillStyle = col(C.grass);
    ctx.fillRect(0, gy - 2, CONFIG.width, 12);

    // Marcas no chão para dar sensação de velocidade
    var step = 48;
    var off = scroll % step;
    ctx.fillStyle = col(C.soilMark);
    for (var x = -off; x < CONFIG.width + step; x += step) {
      roundRect(ctx, x, gy + 24, 18, 5, 2.5);
      ctx.fill();
      roundRect(ctx, x + 26, gy + 42, 10, 5, 2.5);
      ctx.fill();
    }
  }

  function drawBackground(ctx, scroll) {
    drawSky(ctx);
    drawClouds(ctx, scroll);
    drawHills(ctx, scroll, 0.15, 240, 26, C.hillFar);
    drawHills(ctx, scroll, 0.35, 272, 16, C.hillNear);
    drawGround(ctx, scroll);
  }

  /* ---------- Cora ---------- */
  // beads: estado das miçangas do jogo ([{ def, lost }]); as perdidas ficam cinza no colar
  function drawNecklace(ctx, cx, cy, radius, beads) {
    for (var i = 0; i < beads.length; i++) {
      // Arco de -60° a +60° sob o pescoço
      var a = Math.PI / 2 + (i - (beads.length - 1) / 2) * 0.22;
      var bx = cx + Math.cos(a) * radius;
      var by = cy + Math.sin(a) * radius * 0.55;
      circle(ctx, bx, by, beads[i].lost ? 2 : 2.6, beads[i].lost ? C.beadLost : col(beads[i].def.cor));
      ctx.lineWidth = 0.8;
      ctx.strokeStyle = col(C.ink);
      ctx.stroke();
    }
  }

  function drawHead(ctx, hx, hy) {
    // Cabelo volumoso atrás da cabeça
    var hair = col(C.hair);
    circle(ctx, hx - 8, hy - 8, 13, hair);
    circle(ctx, hx + 4, hy - 13, 12, hair);
    circle(ctx, hx - 14, hy + 3, 10, hair);
    // Rosto
    circle(ctx, hx + 2, hy, 13, col(C.skin));
    // Faixa de cabelo com flores
    ctx.beginPath();
    ctx.arc(hx + 1, hy - 1, 14, Math.PI * 1.08, Math.PI * 1.62);
    ctx.lineWidth = 4;
    ctx.strokeStyle = col(C.flowerC);
    ctx.stroke();
    circle(ctx, hx - 9, hy - 14, 4.5, col(C.flowerA));
    circle(ctx, hx - 9, hy - 14, 1.8, col(C.flowerB));
    circle(ctx, hx + 1, hy - 18, 3.5, col(C.flowerB));
    // Olho, bochecha e sorriso
    circle(ctx, hx + 8, hy - 2, 1.9, col(C.ink));
    circle(ctx, hx + 7, hy + 5, 3, col(C.cheek));
    ctx.beginPath();
    ctx.arc(hx + 9, hy + 3, 4, 0.2, Math.PI * 0.7);
    ctx.lineWidth = 1.8;
    ctx.strokeStyle = col(C.ink);
    ctx.stroke();
    // Brinco
    circle(ctx, hx - 2, hy + 9, 2.4, col(C.flowerB));
  }

  function drawPlayerStanding(ctx, cx, by, runPhase, airborne, beads) {
    var swing = airborne ? 0 : Math.sin(runPhase);
    var hipY = by - 28;

    // Pernas (no ar ficam dobradas)
    var legColor = col(C.legs);
    if (airborne) {
      limb(ctx, cx - 4, hipY, cx - 12, by - 10, 7, legColor);
      limb(ctx, cx + 4, hipY, cx + 12, by - 14, 7, legColor);
    } else {
      limb(ctx, cx - 3, hipY, cx - 3 + swing * 12, by - 3, 7, legColor);
      limb(ctx, cx + 3, hipY, cx + 3 - swing * 12, by - 3, 7, legColor);
    }

    // Braço de trás
    limb(ctx, cx - 2, by - 56, cx - 10 - swing * 8, by - 38, 6, col(C.skinShade));

    // Vestido
    ctx.beginPath();
    ctx.moveTo(cx - 10, by - 60);
    ctx.lineTo(cx + 10, by - 60);
    ctx.lineTo(cx + 19, by - 24);
    ctx.lineTo(cx - 19, by - 24);
    ctx.closePath();
    ctx.fillStyle = col(C.dress);
    ctx.fill();
    ctx.fillStyle = col(C.dressBand);
    ctx.fillRect(cx - 17, by - 32, 34, 5);

    drawNecklace(ctx, cx, by - 61, 10, beads);

    // Braço da frente
    limb(ctx, cx + 2, by - 56, cx + 10 + swing * 8, by - 38, 6, col(C.skin));

    drawHead(ctx, cx, by - 70);
  }

  function drawPlayerDucking(ctx, cx, by, runPhase) {
    var swing = Math.sin(runPhase * 1.3);
    var legColor = col(C.legs);
    limb(ctx, cx - 14, by - 18, cx - 18 + swing * 8, by - 3, 7, legColor);
    limb(ctx, cx - 8, by - 18, cx - 4 - swing * 8, by - 3, 7, legColor);

    // Corpo inclinado para frente
    roundRect(ctx, cx - 26, by - 34, 42, 20, 9);
    ctx.fillStyle = col(C.dress);
    ctx.fill();
    ctx.fillStyle = col(C.dressBand);
    ctx.fillRect(cx - 20, by - 22, 30, 4);

    limb(ctx, cx + 8, by - 26, cx + 20, by - 14, 6, col(C.skin));
    drawHead(ctx, cx + 20, by - 30);
  }

  function drawPlayer(ctx, player, beads) {
    var P = CONFIG.player;
    var by = CONFIG.groundY + player.y;
    var ducking = player.onGround && player.ducking;
    var cx = P.x + (ducking ? P.duckWidth : P.width) / 2;

    // Sombra no chão (diminui conforme sobe)
    var lift = Math.min(1, -player.y / 160);
    ctx.beginPath();
    ctx.ellipse(P.x + P.width / 2, CONFIG.groundY + 3, 20 * (1 - lift * 0.5), 4, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(18,16,20,' + (0.18 * (1 - lift * 0.6)) + ')';
    ctx.fill();

    if (ducking) drawPlayerDucking(ctx, cx, by, player.runPhase);
    else drawPlayerStanding(ctx, cx, by, player.runPhase, !player.onGround, beads);
  }

  /* ---------- HUD e telas ---------- */
  function drawPanel(ctx, title, lines) {
    var w = 560, h = 64 + lines.length * 30;
    var x = (CONFIG.width - w) / 2, y = (CONFIG.groundY - h) / 2 + 6;
    roundRect(ctx, x, y, w, h, 18);
    ctx.fillStyle = 'rgba(255,255,255,0.94)';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = C.ink;
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillStyle = C.accent;
    ctx.font = '700 28px "Atkinson Hyperlegible", system-ui, sans-serif';
    ctx.fillText(title, CONFIG.width / 2, y + 18);
    ctx.fillStyle = C.ink;
    ctx.font = '400 20px "Atkinson Hyperlegible", system-ui, sans-serif';
    for (var i = 0; i < lines.length; i++) {
      ctx.fillText(lines[i], CONFIG.width / 2, y + 60 + i * 30);
    }
  }

  function drawDebug(ctx, boxes, fps) {
    ctx.lineWidth = 2;
    for (var i = 0; i < boxes.length; i++) {
      ctx.strokeStyle = boxes[i].color;
      ctx.strokeRect(boxes[i].x, boxes[i].y, boxes[i].w, boxes[i].h);
    }
    ctx.font = '700 16px system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'bottom';
    ctx.fillStyle = C.ink;
    ctx.fillText(Math.round(fps) + ' fps', 12, CONFIG.height - 10);
  }

  return {
    tint: tint,
    col: col,
    roundRect: roundRect,
    circle: circle,
    limb: limb,
    setFade: function (amount) { fade = amount; },
    drawBackground: drawBackground,
    drawPlayer: drawPlayer,
    drawPanel: drawPanel,
    drawDebug: drawDebug
  };
})();
