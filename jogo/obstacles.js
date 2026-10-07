/* =========================================================
   Cora contra O Desbotador — desenho dos nove obstáculos
   Cada obstáculo representa uma ideia (corte, censura, boato…),
   nunca uma pessoa. Desenho vetorial, cores passam por Render.col().
   ========================================================= */

var Obstacles = (function () {
  'use strict';

  var C = CONFIG.colors;
  var col = Render.col;
  var FONT = '"Atkinson Hyperlegible", system-ui, sans-serif';

  function outline(ctx, width) {
    ctx.lineWidth = width || 3;
    ctx.strokeStyle = col(C.obstacleDark);
    ctx.stroke();
  }

  function rope(ctx, x, bottom) {
    Render.limb(ctx, x, -4, x, bottom, 4, col(C.rope));
  }

  function smallScissors(ctx, x, y, size, open) {
    ctx.save();
    ctx.translate(x, y);
    ctx.strokeStyle = col(C.obstacleDark);
    ctx.lineWidth = Math.max(2, size * 0.14);
    ctx.lineCap = 'round';
    for (var s = -1; s <= 1; s += 2) {
      ctx.save();
      ctx.rotate(s * open);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(size, 0);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(-size * 0.3, 0, size * 0.22, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
    ctx.restore();
  }

  /* ---------- Pular ---------- */

  // Muro cinza: muro baixo com grade em cima
  function muro(ctx, o) {
    var wallH = o.h * 0.58;
    var wallY = o.y + o.h - wallH;
    // Grade
    ctx.strokeStyle = col(C.obstacleDark);
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (var x = o.x + 6; x <= o.x + o.w - 4; x += 9) {
      ctx.moveTo(x, wallY);
      ctx.lineTo(x, o.y + 3);
    }
    ctx.moveTo(o.x + 3, o.y + 4);
    ctx.lineTo(o.x + o.w - 3, o.y + 4);
    ctx.stroke();
    // Muro de tijolos
    Render.roundRect(ctx, o.x, wallY, o.w, wallH, 4);
    ctx.fillStyle = col(C.obstacle);
    ctx.fill();
    outline(ctx);
    ctx.beginPath();
    ctx.moveTo(o.x + 2, wallY + wallH / 2);
    ctx.lineTo(o.x + o.w - 2, wallY + wallH / 2);
    ctx.moveTo(o.x + o.w / 2, wallY);
    ctx.lineTo(o.x + o.w / 2, wallY + wallH / 2);
    ctx.moveTo(o.x + o.w / 4, wallY + wallH / 2);
    ctx.lineTo(o.x + o.w / 4, wallY + wallH);
    ctx.moveTo(o.x + o.w * 0.75, wallY + wallH / 2);
    ctx.lineTo(o.x + o.w * 0.75, wallY + wallH);
    outline(ctx, 2);
  }

  // Tesoura de corte: tesoura grande cortando uma cruz de saúde
  function tesoura(ctx, o, t) {
    var cx = o.x + o.w * 0.4, cy = o.y + o.h * 0.55;
    var arm = o.h * 0.42;
    ctx.fillStyle = col('#16A34A');
    ctx.fillRect(cx - arm * 0.3, cy - arm, arm * 0.6, arm * 2);
    ctx.fillRect(cx - arm, cy - arm * 0.3, arm * 2, arm * 0.6);
    // Corte na cruz
    ctx.strokeStyle = col(C.paper);
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cx - arm, cy + 2);
    ctx.lineTo(cx + arm, cy - 2);
    ctx.stroke();
    smallScissors(ctx, o.x + o.w * 0.35, cy, o.w * 0.62, 0.2 + Math.abs(Math.sin(t * 5)) * 0.25);
  }

  // Preço subindo: etiqueta que cresce conforme se aproxima
  function preco(ctx, o) {
    var notch = 10;
    ctx.beginPath();
    ctx.moveTo(o.x + notch, o.y);
    ctx.lineTo(o.x + o.w, o.y);
    ctx.lineTo(o.x + o.w, o.y + o.h);
    ctx.lineTo(o.x + notch, o.y + o.h);
    ctx.lineTo(o.x, o.y + o.h - notch);
    ctx.lineTo(o.x, o.y + notch);
    ctx.closePath();
    ctx.fillStyle = col(C.coin);
    ctx.fill();
    outline(ctx);
    Render.circle(ctx, o.x + 9, o.y + 10, 3.5, col(C.obstacleDark));
    // "R$" e seta para cima
    ctx.fillStyle = col(C.ink);
    ctx.font = '700 15px ' + FONT;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('R$', o.x + o.w / 2 + 4, o.y + o.h - 12);
    var ax = o.x + o.w / 2 + 4, ay = o.y + 16;
    if (o.h > 44) {
      ctx.beginPath();
      ctx.moveTo(ax, ay - 6);
      ctx.lineTo(ax + 7, ay + 3);
      ctx.lineTo(ax - 7, ay + 3);
      ctx.closePath();
      ctx.fill();
      ctx.fillRect(ax - 2, ay + 3, 4, 8);
    }
  }

  // Prato vazio: prato gigante em pé, sem comida
  function prato(ctx, o) {
    var r = Math.min(o.w, o.h) / 2;
    var cx = o.x + o.w / 2, cy = o.y + o.h - r;
    Render.circle(ctx, cx, cy, r, col(C.paper));
    outline(ctx);
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.62, 0, Math.PI * 2);
    ctx.lineWidth = 2;
    ctx.strokeStyle = col(C.metal);
    ctx.stroke();
    // Garfo e faca dos lados
    Render.limb(ctx, o.x - 4, cy - r * 0.8, o.x - 4, cy + r, 3, col(C.obstacleDark));
    Render.limb(ctx, o.x + o.w + 4, cy - r * 0.8, o.x + o.w + 4, cy + r, 4, col(C.obstacleDark));
  }

  // Livro riscado: livro com rabiscos e uma tesoura em cima
  function livro(ctx, o, t) {
    Render.roundRect(ctx, o.x, o.y + 6, o.w, o.h - 6, 4);
    ctx.fillStyle = col('#7DD3FC');
    ctx.fill();
    outline(ctx);
    ctx.fillStyle = col(C.paper);
    ctx.fillRect(o.x + o.w - 8, o.y + 9, 5, o.h - 12);
    // Rabiscos
    ctx.beginPath();
    ctx.moveTo(o.x + 5, o.y + 16);
    for (var i = 0; i < 6; i++) {
      ctx.lineTo(o.x + 8 + i * 6, o.y + (i % 2 ? 34 : 14));
    }
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = col(C.ink);
    ctx.stroke();
    smallScissors(ctx, o.x + o.w * 0.3, o.y + 4, 20, 0.25 + Math.abs(Math.sin(t * 4)) * 0.2);
  }

  // Fogo: chama baixa que tremula
  function fogo(ctx, o, t) {
    // Lenha
    Render.limb(ctx, o.x + 4, o.y + o.h - 3, o.x + o.w - 4, o.y + o.h - 8, 6, col(C.signPost));
    Render.limb(ctx, o.x + 4, o.y + o.h - 8, o.x + o.w - 4, o.y + o.h - 3, 6, col(C.signPost));
    var flames = [[0.3, 0.75], [0.55, 1], [0.78, 0.7]];
    for (var i = 0; i < flames.length; i++) {
      var fx = o.x + o.w * flames[i][0];
      var fh = (o.h - 6) * flames[i][1] * (0.88 + Math.sin(t * 12 + i * 2) * 0.12);
      var base = o.y + o.h - 6;
      drawFlame(ctx, fx, base, 9, fh, col(C.flame));
      drawFlame(ctx, fx, base, 4.5, fh * 0.55, col(C.flameCore));
    }
  }

  function drawFlame(ctx, x, base, halfW, h, color) {
    ctx.beginPath();
    ctx.moveTo(x, base - h);
    ctx.quadraticCurveTo(x + halfW * 1.4, base - h * 0.35, x, base);
    ctx.quadraticCurveTo(x - halfW * 1.4, base - h * 0.35, x, base - h);
    ctx.fillStyle = color;
    ctx.fill();
  }

  /* ---------- Abaixar ---------- */

  // Relógio sem parar: pêndulo alto que balança
  function relogio(ctx, o, t) {
    var r = o.w / 2;
    var bottom = o.y + o.h;
    var swing = Math.sin(t * 3) * 0.05;
    var pivotX = o.x + o.w / 2;
    var len = bottom - r;
    var bx = pivotX + Math.sin(swing) * len;
    var by = Math.cos(swing) * len;
    Render.limb(ctx, pivotX, -4, bx, by, 5, col(C.rope));
    Render.circle(ctx, bx, by, r, col('#F97316'));
    outline(ctx);
    Render.circle(ctx, bx, by, r * 0.72, col(C.paper));
    // Ponteiros girando sem parar
    var a = t * 6;
    Render.limb(ctx, bx, by, bx + Math.cos(a) * r * 0.55, by + Math.sin(a) * r * 0.55, 3, col(C.ink));
    Render.limb(ctx, bx, by, bx + Math.cos(a / 12) * r * 0.38, by + Math.sin(a / 12) * r * 0.38, 3, col(C.ink));
  }

  // Barra de censura: barra preta alta, pendurada sobre a "boca" do cenário
  function censura(ctx, o) {
    var barH = 44;
    var top = o.y + o.h - barH;
    rope(ctx, o.x + 12, top + 2);
    rope(ctx, o.x + o.w - 12, top + 2);
    Render.roundRect(ctx, o.x, top, o.w, barH, 4);
    ctx.fillStyle = col(C.censor);
    ctx.fill();
    ctx.fillStyle = col(C.paper);
    ctx.font = '700 13px ' + FONT;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('CENSURA', o.x + o.w / 2, top + barH / 2 + 1);
  }

  // Boato: balão de fofoca voando
  function boato(ctx, o, t) {
    var bob = Math.sin(t * 4 + o.x * 0.01) * 3;
    var y = o.y + bob;
    Render.roundRect(ctx, o.x, y, o.w, o.h - 12, 16);
    ctx.fillStyle = col(C.fogLight);
    ctx.fill();
    outline(ctx);
    ctx.beginPath();
    ctx.moveTo(o.x + o.w * 0.65, y + o.h - 14);
    ctx.lineTo(o.x + o.w * 0.8, y + o.h);
    ctx.lineTo(o.x + o.w * 0.45, y + o.h - 14);
    ctx.closePath();
    ctx.fillStyle = col(C.fogLight);
    ctx.fill();
    // Asinhas
    ctx.beginPath();
    ctx.ellipse(o.x + o.w - 4, y + 6, 12, 6, -0.6 + Math.sin(t * 18) * 0.3, 0, Math.PI * 2);
    ctx.fillStyle = col(C.paper);
    ctx.fill();
    outline(ctx, 2);
    ctx.fillStyle = col(C.ink);
    ctx.font = '700 16px ' + FONT;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('blá?!', o.x + o.w / 2, y + (o.h - 12) / 2 + 1);
  }

  var DRAW = {
    muro: muro, tesoura: tesoura, preco: preco, prato: prato, livro: livro,
    fogo: fogo, relogio: relogio, censura: censura, boato: boato
  };

  // alpha: usado pela Segurança cinza (aparece em cima da hora) e pelos falsos (Transparência)
  function draw(ctx, o, t, alpha) {
    var fn = DRAW[o.type.id];
    if (!fn || alpha <= 0) return;
    ctx.save();
    ctx.globalAlpha = alpha;
    if (o.fake) ctx.translate(Math.sin(t * 25 + o.x) * 1.5, 0); // falso tremeluz de leve
    fn(ctx, o, t);
    ctx.restore();
  }

  return { draw: draw };
})();
