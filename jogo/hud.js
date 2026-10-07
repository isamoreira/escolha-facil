/* =========================================================
   Cora contra O Desbotador — HUD
   Colar com as nove miçangas (cor + ícone) e aviso de miçanga perdida.
   Miçanga perdida: cinza, opaca, rachada e com o ícone apagado —
   a informação nunca depende só da cor.
   ========================================================= */

var Hud = (function () {
  'use strict';

  var C = CONFIG.colors;
  var FONT = '"Atkinson Hyperlegible", system-ui, sans-serif';

  var BEAD_R = 13;
  var BEAD_STEP = 32;
  var PAD = 10;

  /* ---------- Contraste do ícone ---------- */
  function luminance(hex) {
    var h = hex.replace('#', '');
    var n = parseInt(h, 16);
    return (0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255;
  }

  function iconColorFor(hex) {
    return luminance(hex) > 0.5 ? C.ink : '#FFFFFF';
  }

  /* ---------- Ícones (centrados em 0,0, cabem em ~16 px) ---------- */
  var ICONS = {
    escudo: function (ctx) {
      ctx.beginPath();
      ctx.moveTo(0, -7);
      ctx.lineTo(6, -4.5);
      ctx.quadraticCurveTo(6, 4, 0, 8);
      ctx.quadraticCurveTo(-6, 4, -6, -4.5);
      ctx.closePath();
      ctx.fill();
    },
    cruz: function (ctx) {
      ctx.fillRect(-2.2, -7, 4.4, 14);
      ctx.fillRect(-7, -2.2, 14, 4.4);
    },
    moeda: function (ctx) {
      ctx.beginPath();
      ctx.arc(0, 0, 6.5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillRect(-1, -4, 2, 8);
    },
    relogio: function (ctx) {
      ctx.beginPath();
      ctx.arc(0, 0, 6.5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, 0); ctx.lineTo(0, -4.5);
      ctx.moveTo(0, 0); ctx.lineTo(3.5, 1.5);
      ctx.stroke();
    },
    voz: function (ctx) {
      // Microfone
      Render.roundRect(ctx, -2.8, -7.5, 5.6, 9.5, 2.8);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(0, -1, 5, 0.15 * Math.PI, 0.85 * Math.PI);
      ctx.moveTo(0, 4); ctx.lineTo(0, 7.5);
      ctx.stroke();
    },
    prato: function (ctx) {
      ctx.beginPath();
      ctx.arc(0, 0, 7, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, 0, 3.5, 0, Math.PI * 2);
      ctx.stroke();
    },
    livro: function (ctx) {
      ctx.beginPath();
      ctx.moveTo(0, -4); ctx.lineTo(-7, -6); ctx.lineTo(-7, 5); ctx.lineTo(0, 7);
      ctx.lineTo(7, 5); ctx.lineTo(7, -6); ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(0, -4); ctx.lineTo(0, 7);
      ctx.save();
      ctx.strokeStyle = 'rgba(0,0,0,0.35)';
      ctx.stroke();
      ctx.restore();
    },
    lupa: function (ctx) {
      ctx.beginPath();
      ctx.arc(-1.5, -1.5, 4.8, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(2, 2); ctx.lineTo(6.5, 6.5);
      ctx.stroke();
    },
    gota: function (ctx) {
      ctx.beginPath();
      ctx.moveTo(0, -8);
      ctx.bezierCurveTo(5, -2, 6.5, 1, 6.5, 2.5);
      ctx.arc(0, 2.5, 6.5, 0, Math.PI);
      ctx.bezierCurveTo(-6.5, 1, -5, -2, 0, -8);
      ctx.closePath();
      ctx.fill();
    }
  };

  function drawIcon(ctx, name, x, y, color, scale) {
    var fn = ICONS[name];
    if (!fn) return;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale || 1, scale || 1);
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.8;
    ctx.lineCap = 'round';
    fn(ctx);
    ctx.restore();
  }

  /* ---------- Miçanga ---------- */
  function drawBead(ctx, x, y, r, def, lost) {
    ctx.save();
    if (lost) {
      // Cinza, opaca, contorno tracejado, rachadura e ícone apagado
      ctx.globalAlpha = 0.85;
      Render.circle(ctx, x, y, r, C.beadLost);
      ctx.setLineDash([3, 3]);
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = C.ink;
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.globalAlpha = 0.35;
      drawIcon(ctx, def.icone, x, y, C.ink, r / 11);
      ctx.globalAlpha = 1;
      ctx.beginPath();
      ctx.moveTo(x - 2, y - r);
      ctx.lineTo(x + 3, y - 4);
      ctx.lineTo(x - 3, y + 2);
      ctx.lineTo(x + 2, y + r);
      ctx.lineWidth = 2;
      ctx.strokeStyle = C.ink;
      ctx.stroke();
    } else {
      Render.circle(ctx, x, y, r, def.cor);
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = C.ink;
      ctx.stroke();
      drawIcon(ctx, def.icone, x, y, iconColorFor(def.cor), r / 11);
      // Brilho
      ctx.globalAlpha = 0.55;
      Render.circle(ctx, x - r * 0.45, y - r * 0.5, r * 0.22, '#FFFFFF');
    }
    ctx.restore();
  }

  /* ---------- Colar no topo ---------- */
  function drawNecklace(ctx, beads) {
    var w = PAD * 2 + BEAD_STEP * (beads.length - 1) + BEAD_R * 2;
    var h = BEAD_R * 2 + 16;
    Render.roundRect(ctx, 12, 10, w, h, h / 2);
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = C.ink;
    ctx.stroke();

    // Fio do colar
    var y = 10 + h / 2;
    ctx.beginPath();
    ctx.moveTo(12 + PAD + BEAD_R, y);
    ctx.lineTo(12 + w - PAD - BEAD_R, y);
    ctx.lineWidth = 2;
    ctx.strokeStyle = C.rope;
    ctx.stroke();

    for (var i = 0; i < beads.length; i++) {
      drawBead(ctx, 12 + PAD + BEAD_R + i * BEAD_STEP, y, BEAD_R, beads[i].def, beads[i].lost);
    }
  }

  /* ---------- Aviso de miçanga perdida ---------- */
  function drawLossToast(ctx, def, alpha) {
    var text = CONFIG.texts.lostBead + ' ' + def.nome;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.font = '700 18px ' + FONT;
    var w = ctx.measureText(text).width + 64;
    var x = 12, y = 60, h = 36;
    Render.roundRect(ctx, x, y, w, h, h / 2);
    ctx.fillStyle = C.ink;
    ctx.fill();
    drawBead(ctx, x + 20, y + h / 2, 11, def, true);
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x + 40, y + h / 2 + 1);
    ctx.restore();
  }

  return {
    drawNecklace: drawNecklace,
    drawLossToast: drawLossToast,
    drawBead: drawBead,
    drawIcon: drawIcon
  };
})();
