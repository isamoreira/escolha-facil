(function () {
  'use strict';
  var root = document.documentElement;
  var aviso = document.getElementById('aviso');

  /* ---------- Preferências (tamanho e contraste) ---------- */
  function lerPrefs() {
    try { return JSON.parse(localStorage.getItem('ef-prefs') || '{}'); } catch (e) { return {}; }
  }
  function salvarPrefs(p) {
    try { localStorage.setItem('ef-prefs', JSON.stringify(p)); } catch (e) {}
  }
  var prefs = lerPrefs();
  var tamanho = Number(prefs.size || 0);

  function avisar(txt) {
    if (!aviso) return;
    aviso.textContent = '';
    setTimeout(function () { aviso.textContent = txt; }, 50);
  }

  function aplicarTamanho() {
    if (tamanho > 0) root.dataset.size = String(tamanho); else delete root.dataset.size;
    prefs.size = tamanho; salvarPrefs(prefs);
  }

  var btnContraste = document.querySelector('[data-acao="contraste"]');
  function aplicarContraste(on) {
    if (on) root.dataset.contrast = 'alto'; else delete root.dataset.contrast;
    btnContraste.setAttribute('aria-pressed', on ? 'true' : 'false');
    prefs.contrast = on ? 'alto' : ''; salvarPrefs(prefs);
  }
  aplicarContraste(root.dataset.contrast === 'alto');

  /* ---------- Ouvir a página ---------- */
  var btnOuvir = document.querySelector('[data-acao="ouvir"]');
  var temVoz = 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
  if (!temVoz) btnOuvir.hidden = true;

  var lendo = false;
  function vozPtBr() {
    var vozes = window.speechSynthesis.getVoices();
    for (var i = 0; i < vozes.length; i++) if (/pt[-_]BR/i.test(vozes[i].lang)) return vozes[i];
    for (var j = 0; j < vozes.length; j++) if (/^pt/i.test(vozes[j].lang)) return vozes[j];
    return null;
  }
  function trechos() {
    var lista = [];
    var blocos = document.querySelectorAll('[data-ler-bloco]');
    if (blocos.length) {
      blocos.forEach(function (b) { lista.push({ el: b, txt: b.textContent.replace(/\s+/g, ' ').trim() }); });
      return lista;
    }
    var ab = document.querySelector('.hero'); if (ab) lista.push({ el: ab, txt: 'Escolher é fácil. Leia as perguntas. Se a sua resposta for sim, você já sabe em quem votar. Toda resposta tem fonte.' });
    document.querySelectorAll('.card').forEach(function (c) {
      var q = c.querySelector('.card__q').textContent.trim();
      var mais = Array.prototype.map.call(c.querySelectorAll('.card__mais p:not(.fonte)'), function (p) { return p.textContent.trim(); }).join(' ');
      var st = c.querySelector('.status'); lista.push({ el: c, txt: (st ? st.textContent + '. ' : '') + q + ' Vote treze. ' + mais });
    });
    var con = document.querySelector('.conclusao');
    if (con) lista.push({ el: con, txt: con.textContent });
    var pas = document.querySelector('.passos');
    if (pas) lista.push({ el: document.querySelector('.votar'), txt: 'Como votar no dia 25. ' + pas.textContent.replace(/\s+/g, ' ').replace(/\b1\b e depois \b3\b/, 'um e depois três') });
    return lista;
  }
  function limparDestaque() {
    document.querySelectorAll('.lendo').forEach(function (e) { e.classList.remove('lendo'); });
  }
  function pararLeitura() {
    lendo = false;
    window.speechSynthesis.cancel();
    limparDestaque();
    btnOuvir.setAttribute('aria-pressed', 'false');
    btnOuvir.querySelector('span').textContent = 'Ouvir a página';
  }
  function lerPagina() {
    var fila = trechos();
    var voz = vozPtBr();
    var i = 0;
    lendo = true;
    btnOuvir.setAttribute('aria-pressed', 'true');
    btnOuvir.querySelector('span').textContent = 'Parar a leitura';
    function proximo() {
      limparDestaque();
      if (!lendo || i >= fila.length) { pararLeitura(); return; }
      var t = fila[i++];
      if (t.el) {
        t.el.classList.add('lendo');
        var reduzir = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        t.el.scrollIntoView({ block: 'center', behavior: reduzir ? 'auto' : 'smooth' });
      }
      var u = new SpeechSynthesisUtterance(t.txt);
      u.lang = 'pt-BR';
      if (voz) u.voice = voz;
      u.rate = 0.95;
      u.onend = proximo;
      u.onerror = pararLeitura;
      window.speechSynthesis.speak(u);
    }
    proximo();
  }
  if (temVoz) {
    window.speechSynthesis.getVoices();
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && lendo) pararLeitura(); });
  }

  /* ---------- Painel de acessibilidade ---------- */
  var abrir = document.querySelector('.a11y__abrir');
  var painel = document.getElementById('a11y-painel');
  function fecharPainel(devolverFoco) {
    if (!painel || painel.hidden) return;
    painel.hidden = true; abrir.setAttribute('aria-expanded', 'false');
    if (devolverFoco) abrir.focus();
  }
  if (abrir && painel) {
    abrir.addEventListener('click', function () {
      var vaiAbrir = painel.hidden;
      painel.hidden = !vaiAbrir; abrir.setAttribute('aria-expanded', vaiAbrir ? 'true' : 'false');
      if (vaiAbrir) { var p1 = painel.querySelector('button'); if (p1) p1.focus(); }
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !painel.hidden) fecharPainel(true); });
    document.addEventListener('click', function (e) { if (!e.target.closest('.a11y')) fecharPainel(false); });
  }

  /* ---------- Botões de acessibilidade ---------- */
  document.querySelectorAll('.acess__btn').forEach(function (b) {
    b.addEventListener('click', function () {
      var acao = b.dataset.acao;
      if (acao === 'maior' && tamanho < 3) { tamanho++; aplicarTamanho(); }
      else if (acao === 'menor' && tamanho > 0) { tamanho--; aplicarTamanho(); }
      else if (acao === 'contraste') { aplicarContraste(root.dataset.contrast !== 'alto'); }
      else if (acao === 'ouvir') { lendo ? pararLeitura() : lerPagina(); }
    });
  });

  /* ---------- Compartilhar ---------- */
  var scriptEl = document.querySelector('script[src$="assets/app.js"]');
  var raizSite = scriptEl ? new URL('..', scriptEl.src).href : location.href.split('#')[0];
  var url = raizSite;
  var zap = document.getElementById('zap');
  if (zap) zap.href = 'https://wa.me/?text=' + encodeURIComponent('Escolher é fácil. Veja: ' + url);

  var copiar = document.getElementById('copiar');
  if (copiar) copiar.addEventListener('click', function () {
    function ok() { avisar('Link copiado. Agora é só colar na conversa.'); }
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(url).then(ok, function () { avisar('Não deu para copiar. O link é: ' + url); });
    } else {
      avisar('O link é: ' + url);
    }
  });

  /* ---------- Compartilhar uma pergunta ----------
     1) No celular: envia a imagem do card + texto (menu de compartilhar do aparelho, com WhatsApp).
     2) Se não der: abre o WhatsApp com o texto e o link da pergunta (a prévia mostra o card). */
  function abrirZap(texto) {
    window.open('https://wa.me/?text=' + encodeURIComponent(texto), '_blank', 'noopener');
  }
  document.querySelectorAll('.card__share').forEach(function (b) {
    b.addEventListener('click', function () {
      var link = raizSite + 't/' + b.dataset.slug + '/';
      var texto = b.dataset.texto + '\nEntenda: ' + link;
      var aviso = b.closest('article').querySelector('.card__aviso');
      function diga(t) { if (aviso) { aviso.textContent = ''; setTimeout(function () { aviso.textContent = t; }, 50); } }
      var podeArquivo = navigator.canShare && window.fetch && window.File;
      if (!podeArquivo) { abrirZap(texto); return; }
      b.disabled = true;
      fetch(b.dataset.img).then(function (r) { return r.blob(); }).then(function (blob) {
        var arq = new File([blob], 'escolha-facil-' + b.dataset.slug + '.png', { type: 'image/png' });
        if (!navigator.canShare({ files: [arq] })) throw new Error('sem arquivo');
        return navigator.share({ files: [arq], text: texto });
      }).then(function () {
        diga('Pronto! Obrigado por compartilhar.');
      }).catch(function (err) {
        if (err && err.name === 'AbortError') return; /* a pessoa cancelou */
        abrirZap(texto);
      }).then(function () { b.disabled = false; });
    });
  });

  /* ---------- Copiar chave Pix ---------- */
  document.querySelectorAll('.pix__copiar').forEach(function (b) {
    b.addEventListener('click', function () {
      var chave = b.dataset.chave;
      var av = document.getElementById('pix-aviso');
      function diga(t) { if (av) { av.textContent = ''; setTimeout(function () { av.textContent = t; }, 50); } }
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(chave).then(function () { diga('Chave copiada. Agora é só colar no app do seu banco.'); },
          function () { diga('Não deu para copiar. A chave é: ' + chave); });
      } else { diga('A chave é: ' + chave); }
    });
  });

  /* ---------- VLibras ---------- */
  window.addEventListener('load', function () {
    try { if (window.VLibras) new window.VLibras.Widget('https://vlibras.gov.br/app'); } catch (e) {}
  });
})();
