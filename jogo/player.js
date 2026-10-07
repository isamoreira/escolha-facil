/* =========================================================
   Cora contra O Desbotador — física da Cora
   Pulo com buffer e altura variável, abaixar, queda rápida.
   ========================================================= */

var Player = (function () {
  'use strict';

  function create() {
    return { y: 0, vy: 0, onGround: true, ducking: false, runPhase: 0, jumpBuffer: 0 };
  }

  function requestJump(p) {
    p.jumpBuffer = CONFIG.physics.jumpBufferTime;
  }

  // jumpMultiplier < 1 quando a Saúde está cinza (Cora cansada, pulo mais baixo)
  function update(p, dt, input, jumpMultiplier, worldSpeed) {
    var P = CONFIG.physics;
    p.ducking = input.duckHeld;

    // Pulo (com buffer: apertar logo antes de pousar ainda vale)
    if (p.jumpBuffer > 0) {
      p.jumpBuffer -= dt;
      if (p.onGround) {
        p.vy = -P.jumpVelocity * jumpMultiplier;
        p.onGround = false;
        p.jumpBuffer = 0;
      }
    }

    if (!p.onGround) {
      // Soltar o botão cedo deixa o pulo mais curto
      var cut = P.jumpCutVelocity * jumpMultiplier;
      if (!input.jumpHeld && p.vy < -cut) p.vy = -cut;
      var gravity = P.gravity * (input.duckHeld ? P.fastFallMultiplier : 1);
      p.vy += gravity * dt;
      p.y += p.vy * dt;
      if (p.y >= 0) {
        p.y = 0;
        p.vy = 0;
        p.onGround = true;
      }
    }

    // Fase da animação de corrida acompanha a velocidade
    p.runPhase += dt * worldSpeed / 28;
  }

  function box(p) {
    var C = CONFIG.player;
    var duck = p.onGround && p.ducking;
    var w = duck ? C.duckWidth : C.width;
    var h = duck ? C.duckHeight : C.height;
    var i = C.hitboxInset;
    return { x: C.x + i, y: CONFIG.groundY + p.y - h + i, w: w - i * 2, h: h - i };
  }

  return { create: create, requestJump: requestJump, update: update, box: box };
})();
