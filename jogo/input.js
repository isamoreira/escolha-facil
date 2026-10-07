/* =========================================================
   Cora contra O Desbotador — entrada (teclado e toque)
   Teclado: Espaço ou ↑ pula; ↓ abaixa.
   Toque/mouse: metade de cima pula; segurar a metade de baixo abaixa.
   ========================================================= */

var Input = (function () {
  'use strict';

  var state = {
    jumpHeld: false,
    duckHeld: false,
    onPress: null   // chamado a cada novo aperto (começar, pular, reiniciar)
  };

  var canvas = null;
  var keysDown = {};
  var pointers = {}; // pointerId -> 'jump' | 'duck'

  var JUMP_KEYS = { Space: true, ArrowUp: true, KeyW: true };
  var DUCK_KEYS = { ArrowDown: true, KeyS: true };

  // Só captura o teclado quando o foco está no jogo (ou em lugar nenhum) e o jogo está visível,
  // para não roubar o Espaço de quem está lendo a página ou usando um link.
  function shouldCapture() {
    var active = document.activeElement;
    if (active && active !== document.body && active !== canvas) return false;
    var r = canvas.getBoundingClientRect();
    return r.bottom > 0 && r.top < window.innerHeight;
  }

  function recompute() {
    var jump = keysDown.jump || false;
    var duck = keysDown.duck || false;
    for (var id in pointers) {
      if (pointers[id] === 'jump') jump = true;
      if (pointers[id] === 'duck') duck = true;
    }
    state.jumpHeld = jump;
    state.duckHeld = duck;
  }

  function press(action) {
    if (typeof state.onPress === 'function') state.onPress(action);
  }

  function onKeyDown(e) {
    var action = JUMP_KEYS[e.code] ? 'jump' : DUCK_KEYS[e.code] ? 'duck' : null;
    if (!action || !shouldCapture()) return;
    e.preventDefault();
    if (e.repeat) return;
    keysDown[action] = true;
    recompute();
    press(action);
  }

  function onKeyUp(e) {
    var action = JUMP_KEYS[e.code] ? 'jump' : DUCK_KEYS[e.code] ? 'duck' : null;
    if (!action) return;
    keysDown[action] = false;
    recompute();
  }

  function onPointerDown(e) {
    e.preventDefault();
    canvas.focus({ preventScroll: true });
    var r = canvas.getBoundingClientRect();
    var action = (e.clientY - r.top) < r.height / 2 ? 'jump' : 'duck';
    pointers[e.pointerId] = action;
    try { canvas.setPointerCapture(e.pointerId); } catch (err) { /* sem captura, segue igual */ }
    recompute();
    press(action);
  }

  function onPointerUp(e) {
    delete pointers[e.pointerId];
    recompute();
  }

  // Ao perder o foco da janela, solta tudo (evita tecla "presa")
  function releaseAll() {
    keysDown = {};
    pointers = {};
    recompute();
  }

  function init(canvasEl) {
    canvas = canvasEl;
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', releaseAll);
    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointerup', onPointerUp);
    canvas.addEventListener('pointercancel', onPointerUp);
    canvas.addEventListener('contextmenu', function (e) { e.preventDefault(); });
  }

  state.init = init;
  return state;
})();
