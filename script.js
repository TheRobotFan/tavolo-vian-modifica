/* script.js — Logica di "All In Vian". I testi vivono in data.js. */

'use strict';

// Simboli dei semi (nomi in data.js -> carattere)
const SEMI = { spades: '♠', hearts: '♥', diamonds: '♦', clubs: '♣' };

// Passaggio apertura -> tavolo (percorso relativo: funziona anche sotto sottopercorso)

function enterSite() {
  const ridotto = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const destinazione = './home' + (true ? '.html' : ''); // in locale serve .html
  if (ridotto) { window.location.href = destinazione; return; }
  // Transizioni casuali: sipario (dritto/specchio, normale/lento) o affondo
  const dado = Math.random();
  const tipo = dado < 0.55 ? 'sipario' : 'affondo';
  const specchio = tipo === 'sipario' && Math.random() < 0.5;
  const lento = tipo === 'sipario' && Math.random() < 0.35;
  document.body.classList.add('uscita', 'tipo-' + tipo);
  if (specchio) document.body.classList.add('specchio');
  const tenda = document.querySelector('.transizione .tenda');
  if (tenda && lento) tenda.style.setProperty('--t-chiudi', '1.35s');
  try {
    sessionStorage.setItem('aiv-avanti', tipo === 'sipario' ? (specchio ? '1' : '0') : tipo);
  } catch (e) {}
  window.setTimeout(() => { window.location.href = destinazione; }, lento ? 1350 : tipo === 'affondo' ? 1200 : 1050);
}

(function () {
  // Navigazione interna con sipario (vale anche in locale, aggiungendo .html)
  document.addEventListener('click', (e) => {
    const link = e.target && e.target.closest ? e.target.closest('a[href^="./"]') : null;
    if (!link || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    if (!document.querySelector('.transizione')) return; // senza sipario: navigazione normale
    let href = link.getAttribute('href');
    if (true) {
      // in locale le cartelle non aprono index.html: va esplicito
      if (/\/(\?.*)?$/.test(href)) {
        const q = href.indexOf('?');
        href = (q === -1 ? href : href.slice(0, q)) + 'index.html' + (q === -1 ? '' : href.slice(q));
      } else if (!/\.[a-z0-9]+(\?.*)?$/i.test(href)) {
        const q = href.indexOf('?'); // in locale l'estensione va prima dei parametri
        href = q === -1 ? href + '.html' : href.slice(0, q) + '.html' + href.slice(q);
      }
    }
    e.preventDefault();
    if (ridotto || document.body.classList.contains('uscita')) {
      if (!document.body.classList.contains('uscita')) window.location.href = href;
      return;
    }
    let specchio = Math.random() < 0.5;
    let tipo = 'sipario'; // verde di default (tavolo, sconti, principale)
    try {
      const percorso = new URL(href, location.href).pathname;
      if (/candidat/i.test(percorso) || /candidat/i.test(location.pathname)) tipo = 'strisce'; // strisce in entrata E uscita candidati
      if (versoIndice(percorso)) sessionStorage.setItem('aiv-tenda', 'sx');
      try { sessionStorage.setItem('aiv-t', JSON.stringify({ tipo, specchio })); } catch (err2) {}
    } catch (err) {}
    function versoIndice(p) { return /\/$|\/index(\.html)?$/.test(p); }
    if (specchio) document.body.classList.add('specchio');
    if (tipo !== 'sipario') document.body.classList.add('tipo-' + tipo);
    document.body.classList.add('uscita');
    void document.body.offsetWidth; // forza il reflow: la tenda parte PRIMA di ogni repaint
    // strisce: copertura 1.05s + breve respiro, sipario verde invariato
    window.setTimeout(() => { window.location.href = href; }, tipo === 'strisce' ? 1500 : 1050);
  });
  document.documentElement.classList.add('js'); // le animazioni di reveal valgono solo con JS attivo
  const ridotto = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Avvio app: solo QR (indirizzo riservato), niente parola ---------- */
  const avvio = document.getElementById('avvio');
  let avviato = false;
  function mostraTavolo() {
    if (avviato) return;
    avviato = true;
    document.body.classList.add('pronto');
    setTimeout(() => { const a = document.getElementById('avvio'); if (a) a.remove(); }, 700);
  }
  if (document.documentElement.classList.contains('ritorno')) {
    mostraTavolo(); // ritorno dal tavolo: niente splash, solo sipario
  } else if (avvio && !ridotto) {
    avvio.hidden = false;
    window.addEventListener('load', () => setTimeout(mostraTavolo, 1250));
    setTimeout(mostraTavolo, 4000); // sicurezza: mai bloccato
  } else {
    mostraTavolo(); // movimento ridotto o niente splash: subito pronto
  }
  const tocco = window.matchMedia('(pointer: coarse)').matches;

  /* ---------- Arrivo da tendina (già coperta da markup) ---------- */
  if (document.body.classList.contains('arrivo')) {
    const pulisciTenda = () => {
      document.body.classList.remove('arrivo');
      document.documentElement.classList.remove('avanti-specchio', 'arrivo-affondo', 'arrivo-strisce', 'specchio-x');
    };
    if (ridotto) {
      document.body.classList.remove('arrivo'); // niente sipario: mostra subito
    } else {
    const tenda = document.querySelector('.transizione .tenda');
    if (tenda) tenda.addEventListener('animationend', (e) => { if (e.target === tenda) pulisciTenda(); });
    const copertura = document.querySelector('.transizione .copertura');
    if (copertura) copertura.addEventListener('animationend', pulisciTenda, { once: true });
    setTimeout(pulisciTenda, 3000); // sicurezza
    }
  }

  /* ---------- Ritorno al principale: gestito dal navigatore unificato sopra ---------- */
  if (document.documentElement.classList.contains('ritorno')) { // pulizia dopo l'apertura
    const tendaDx = document.querySelector('.transizione .tenda');
    const pulisci = () => document.documentElement.classList.remove('ritorno');
    if (tendaDx) tendaDx.addEventListener('animationend', pulisci, { once: true });
    else pulisci();
    setTimeout(pulisci, 2000); // sicurezza
  }

  /* ---------- URL delle pagine: .html solo in locale (file://) ---------- */
  const estensione = (true) ? '.html' : '';
  function urlPagina(nome, params) {
    let u = './' + nome + estensione;
    const q = params ? new URLSearchParams(params).toString() : '';
    return q ? u + '?' + q : u;
  }

  /* ---------- Tavolo: carte + modale ---------- */
  // Punti: prima quelli salvati dall'admin su questo dispositivo, poi data.js
  function esc(testo) {
    return String(testo == null ? '' : testo).replace(/[&<>"']/g, (c) => (
      { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }
  function caricaPunti() {
    try {
      const salvati = JSON.parse(localStorage.getItem('aiv-punti') || 'null');
      if (Array.isArray(salvati) && salvati.length && salvati.every((p) => p && p.title)) return salvati;
    } catch (e) {}
    return (typeof PUNTI !== 'undefined') ? PUNTI : [];
  }
  function attesaMassima(secondi) {
    return new Promise((_, rifiuta) => setTimeout(() => rifiuta(new Error('timeout')), secondi * 1000));
  }
  async function caricaPuntiRemoti() { // null se offline / non configurato / tabella vuota
    try {
      if (!window.supabaseClient) return null;
      const risposta = await Promise.race([
        window.supabaseClient.from('punti').select('*').order('ordine', { ascending: true }).order('id', { ascending: true }),
        attesaMassima(6)
      ]);
      if (!risposta || risposta.error || !Array.isArray(risposta.data) || !risposta.data.length) return null;
      return risposta.data.map((r) => ({
        id: r.id, shortLabel: r.short_label || '', title: r.title || '',
        text: r.text || '', suit: r.suit || 'spades', tag: r.tag || '', motivo: r.motivo || ''
      }));
    } catch (e) { return null; }
  }
  const grid = document.querySelector('#point-grid');
  const modal = document.querySelector('#detail-modal');
  if (grid && modal) {
    let DATI = caricaPunti(); // subito i locali (istantaneo), poi eventuale aggiornamento live
    if (!DATI.length) return;
    let current = 0;
    let lastFocus = null;
    const title = modal.querySelector('#detail-title');
    const text = modal.querySelector('#detail-text');
    const label = modal.querySelector('#detail-label');
    const suit = modal.querySelector('#detail-suit');
    const count = modal.querySelector('#detail-count');
    const motivo = modal.querySelector('#detail-motivo');
    const tag = modal.querySelector('#detail-tag');
    const closeBtn = modal.querySelector('.close-modal');
    const prevBtn = modal.querySelector('#prev-point');
    const nextBtn = modal.querySelector('#next-point');

    if (motivo) motivo.addEventListener('error', () => { motivo.closest('.modal-medaglione').classList.add('vuoto'); motivo.remove(); });

    function disegna() {
      MOD.liste.punti = DATI;
      grid.innerHTML = DATI.map((p, i) => {
      const simbolo = SEMI[p.suit] || '♠';
      const figura = p.motivo ? `<img class="card-motivo" src="${esc(p.motivo)}" alt="" loading="lazy" decoding="async" onerror="this.remove()">` : `<span class="card-motivo-testo" aria-hidden="true">${simbolo}</span>`;
      const sigla = (p.shortLabel || '').replace(/[^0-9]/g, '').slice(-2) || String(i + 1).padStart(2, '0');
      return `<article class="point-card seme-${esc(p.suit) || 'spades'}" tabindex="0" role="button" data-index="${i}" aria-label="Apri ${esc(p.title)}">
        <span class="card-index" data-mod="punti.${i}.shortLabel">${esc(p.shortLabel)}</span>
        <span class="card-suit" aria-hidden="true">${simbolo}</span>
        <span class="card-angolo" aria-hidden="true">${sigla}<br>${simbolo}</span>
        <div class="card-figura" aria-hidden="true">${figura}</div>
        <div class="card-copy"><span data-mod="punti.${i}.tag">${esc(p.tag) || ''}</span><h2 data-mod="punti.${i}.title">${esc(p.title)}</h2><p>Scopri il punto <b aria-hidden="true">↗</b></p></div>
      </article>`;
      }).join('');
    }
    disegna();

    function show(i) {
      current = (i + DATI.length) % DATI.length;
      const p = DATI[current];
      lastFocus = document.activeElement;
      label.textContent = p.shortLabel;
      suit.textContent = SEMI[p.suit] || '♠';
      suit.className = 'modal-suit seme-' + (p.suit || 'spades');
      title.textContent = p.title;
      text.textContent = p.text;
      if (text) text.setAttribute('data-mod', 'punti.' + current + '.text');
      if (tag) tag.textContent = p.tag || '';
      count.textContent = String(current + 1).padStart(2, '0') + ' / ' + String(DATI.length).padStart(2, '0');
      const medaglione = modal.querySelector('.modal-medaglione');
      if (motivo && medaglione) {
        medaglione.classList.remove('vuoto');
        if (p.motivo) { motivo.src = p.motivo; }
        else { medaglione.classList.add('vuoto'); motivo.removeAttribute('src'); }
      }
      if (!modal.open) modal.showModal();
      closeBtn.focus();
    }

    function close() {
      modal.close();
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }

    grid.addEventListener('click', (e) => {
      const card = e.target.closest('.point-card');
      if (card) show(Number(card.dataset.index));
    });
    grid.addEventListener('keydown', (e) => {
      if ((e.key === 'Enter' || e.key === ' ') && e.target.classList.contains('point-card')) {
        e.preventDefault();
        show(Number(e.target.dataset.index));
      }
    });
    closeBtn.addEventListener('click', close);
    prevBtn.addEventListener('click', () => show(current - 1));
    nextBtn.addEventListener('click', () => show(current + 1));
    document.addEventListener('keydown', (e) => {
      if (!modal.open) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') show(current - 1);
      if (e.key === 'ArrowRight') show(current + 1);
    });
    modal.addEventListener('click', (e) => { if (e.target === modal) close(); });

    if (!tocco && !ridotto && window.matchMedia('(pointer: fine)').matches) {
      let attiva = null; // tilt 3D leggero che segue il mouse (solo transform)
      const azzera = (carta) => {
        if (!carta) return;
        carta.style.setProperty('--rx', '0deg');
        carta.style.setProperty('--ry', '0deg');
      };
      grid.addEventListener('pointermove', (e) => {
        const carta = e.target.closest('.point-card');
        if (attiva && attiva !== carta) azzera(attiva);
        attiva = carta;
        if (!carta) return;
        const r = carta.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        carta.style.setProperty('--ry', (x * 9).toFixed(2) + 'deg');
        carta.style.setProperty('--rx', (-y * 9).toFixed(2) + 'deg');
      });
      grid.addEventListener('pointerleave', () => { azzera(attiva); attiva = null; });
    }

    if (window.supabaseClient) { // dati live: se arrivano e cambiano, ridisegna (offline resta il locale)
      caricaPuntiRemoti().then((remoti) => {
        if (remoti && JSON.stringify(remoti) !== JSON.stringify(DATI)) {
          DATI = remoti;
          if (current >= DATI.length) current = 0;
          disegna();
        }
      });
    }
  }

  /* ---------- Reveal on scroll (tutte le pagine) ---------- */
  let osservatoreRivelazione = null;
  function rivela(elementi) {
    if (ridotto || !('IntersectionObserver' in window)) return;
    if (!osservatoreRivelazione) {
      osservatoreRivelazione = new IntersectionObserver((voci) => {
        voci.forEach((v) => {
          if (!v.isIntersecting) return;
          v.target.classList.add('visibile');
          osservatoreRivelazione.unobserve(v.target);
          setTimeout(() => v.target.classList.remove('rivelato', 'visibile'), 850);
        });
      }, { threshold: 0.12 });
    }
    elementi.forEach((el) => { el.classList.add('rivelato'); osservatoreRivelazione.observe(el); });
  }
  rivela(Array.from(document.querySelectorAll('.point-grid .point-card, .intro')));

  /* ---------- Scheletri eleganti durante il caricamento ---------- */
  function scheletri(cont, n, classe) {
    if (!cont || cont.dataset.scheletri) return;
    cont.dataset.scheletri = '1';
    cont.innerHTML = Array.from({ length: n })
      .map(() => '<div class="scheletro ' + (classe || '') + '" aria-hidden="true"></div>').join('');
  }

  /* ---------- Registro dei contenuti editabili (per la modifica in linea) ---------- */
  const MOD = { liste: {}, render: {}, dati: {} };

  /* ---------- Timeline "La partita" ---------- */
  function formatta(testo) { // escape + *parola* -> <em>parola</em>
    return esc(String(testo || '')).replace(/\*([^*]+)\*/g, '<em>$1</em>');
  }
  function disegnaTappe(voci) {
    const linea = document.getElementById('partita-linea');
    if (!linea) return;
    MOD.liste.tappe = voci;
    if (!Array.isArray(voci) || !voci.length) { linea.innerHTML = ''; return; }
    linea.innerHTML = voci.map((t, i) => `
      <li class="tappa${t.stato === 'futuro' ? ' tappa-futura' : ''}">
        <span class="tappa-nodo" aria-hidden="true"></span>
        <div class="tappa-testo">
          <p class="tappa-data" data-mod="tappe.${i}.data">${esc(t.data)}</p>
          <h3 data-mod="tappe.${i}.titolo">${esc(t.titolo)}</h3>
          <p data-mod="tappe.${i}.testo">${esc(t.testo)}</p>
        </div>
      </li>`).join('');
  }
  MOD.render.tappe = () => { if (MOD.liste.tappe) disegnaTappe(MOD.liste.tappe); };
  if (typeof TAPPE !== 'undefined') disegnaTappe(TAPPE);

  /* ---------- Cursore-seme (solo mouse, disattivato se movimento ridotto) ---------- */
  (function cursoreSeme() {
    if (ridotto || !window.matchMedia('(pointer: fine)').matches) return;
    const el = document.createElement('div');
    el.className = 'cursore-seme';
    el.setAttribute('aria-hidden', 'true');
    el.innerHTML = '<img src="./img/seme-picche.svg" alt="" width="22" height="22" decoding="async">';
    document.body.appendChild(el);
    let x = -60, y = -60, tx = x, ty = y, acceso = false;
    window.addEventListener('pointermove', (e) => {
      tx = e.clientX + 15; ty = e.clientY + 15;
      if (!acceso) { acceso = true; el.style.opacity = '.9'; }
      const sopra = e.target && e.target.closest &&
        e.target.closest('a, button, input, textarea, .carta-sconto, .faq-carta, .point-card, .sale-carta, .carta-candidato');
      el.classList.toggle('grande', !!sopra);
    }, { passive: true });
    (function muovi() {
      x += (tx - x) * .18; y += (ty - y) * .18;
      el.style.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px)';
      window.requestAnimationFrame(muovi);
    })();
  })();

  function iniziali(nome) {
    return String(nome || '?').trim().split(/\s+/).slice(0, 2).map((p) => p[0] || '').join('').toUpperCase() || '?';
  }
  async function caricaTabella(nome, ordine) {
    try {
      if (!window.supabaseClient) return null;
      const risposta = await Promise.race([
        window.supabaseClient.from(nome).select('*').order(ordine || 'ordine', { ascending: true }).order('id', { ascending: true }),
        attesaMassima(6)
      ]);
      if (!risposta || risposta.error || !Array.isArray(risposta.data) || !risposta.data.length) return null;
      return risposta.data;
    } catch (e) { return null; }
  }
  function collegaModale(lista, aScheda) { // stessa finestra per candidati e sconti
    const modal = document.getElementById('detail-modal');
    if (!modal || !lista.length) return;
    let corrente = 0, ultimoFuoco = null;
    const titolo = modal.querySelector('#detail-title');
    const testo = modal.querySelector('#detail-text');
    const etichetta = modal.querySelector('#detail-label');
    const seme = modal.querySelector('#detail-suit');
    const conteggio = modal.querySelector('#detail-count');
    const figura = modal.querySelector('#detail-motivo');
    const tag = modal.querySelector('#detail-tag');
    const medaglione = modal.querySelector('.modal-medaglione');
    const chiudiBtn = modal.querySelector('.close-modal');
    function mostra(i) {
      corrente = (i + lista.length) % lista.length;
      const s = aScheda(lista[corrente]);
      ultimoFuoco = document.activeElement;
      etichetta.textContent = s.label;
      titolo.textContent = s.title;
      testo.textContent = s.text;
      if (tag) tag.textContent = s.tag || '';
      if (seme) { seme.textContent = s.suit || ''; seme.hidden = !s.suit; }
      conteggio.textContent = String(corrente + 1).padStart(2, '0') + ' / ' + String(lista.length).padStart(2, '0');
      if (medaglione) medaglione.classList.toggle('foto', !!s.foto);
      if (figura) {
        if (s.figura) { figura.hidden = false; figura.src = s.figura; figura.alt = s.title; }
        else { figura.removeAttribute('src'); figura.hidden = true; }
      }
      if (!modal.open) modal.showModal();
      chiudiBtn.focus();
    }
    function chiudi() { modal.close(); if (ultimoFuoco && ultimoFuoco.focus) ultimoFuoco.focus(); }
    document.getElementById('detail-modal').addEventListener('click', (e) => {
      const carta = e.target.closest('[data-apri]');
      if (carta) mostra(Number(carta.dataset.apri));
    });
    document.addEventListener('keydown', (e) => {
      const carta = e.target && e.target.closest ? e.target.closest('[data-apri]') : null;
      if (carta && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); mostra(Number(carta.dataset.apri)); return; }
      if (!modal.open) return;
      if (e.key === 'Escape') chiudi();
      if (e.key === 'ArrowLeft') mostra(corrente - 1);
      if (e.key === 'ArrowRight') mostra(corrente + 1);
    });
    modal.querySelector('.close-modal').addEventListener('click', chiudi);
    modal.querySelector('#prev-point').addEventListener('click', () => mostra(corrente - 1));
    modal.querySelector('#next-point').addEventListener('click', () => mostra(corrente + 1));
    modal.addEventListener('click', (e) => { if (e.target === modal) chiudi(); });
  }

  /* ---------- Candidati ---------- */
  const grigliaCandidati = document.getElementById('griglia-candidati');
  if (grigliaCandidati) {
    scheletri(grigliaCandidati, 6, 'scheletro-cand');
    caricaTabella('candidati').then((righe) => {
      if (!righe) {
        grigliaCandidati.innerHTML = '<p class="stato-vuoto">I candidati arrivano a breve: torna a trovarci.</p>';
        return;
      }
      const lista = righe.map((r) => ({
        id: r.id, nome: r.nome || '', ruolo: r.ruolo || '', motto: r.motto || '',
        bio: r.bio || '', foto: r.foto || '', ordine: r.ordine
      }));
      MOD.liste.candidati = lista;
      grigliaCandidati.innerHTML = lista.map((c, i) => `
        <a class="carta-candidato" href="${urlPagina('candidato', { id: c.id })}" aria-label="Apri la scheda di ${esc(c.nome)}">
          <p class="cand-numero">CANDIDATO ${String(i + 1).padStart(2, '0')}</p>
          ${emblema(c, i)}
          <p class="ruolo" data-mod="candidati.${i}.ruolo">${esc(c.ruolo)}</p>
          <h2 data-mod="candidati.${i}.nome">${esc(c.nome)}</h2>
          <p class="motto" data-mod="candidati.${i}.motto">${esc(c.motto)}</p>
          <span class="apri">Leggi la storia &#8599;</span>
        </a>`).join('');
      rivela(Array.from(grigliaCandidati.children));
    });
  }

  function emblema(c, i) {
    const num = String(i + 1);
    if (i === 1) return `
          <div class="biliardo" aria-hidden="true">
            <span class="biliardo-scritta">${num}</span>
          </div>`;
    if (i === 2) return `
          <div class="fiches" aria-hidden="true">
            <span class="fiches-num">${num}</span>
          </div>`;
    if (i === 3) {
      // dado 3D: cubo a sei facce che ruota lentamente
      const pipsPerFaccia = { 1: [5], 2: [1, 9], 3: [3, 5, 7], 4: [1, 3, 7, 9], 5: [1, 3, 5, 7, 9], 6: [1, 3, 4, 6, 7, 9] };
      const facce = [1, 2, 3, 4, 5, 6].map((n) => {
        let celle = '';
        for (let c = 1; c <= 9; c++) celle += '<i class="' + (pipsPerFaccia[n].indexOf(c) !== -1 ? 'pip' : '') + '"></i>';
        return '<div class="faccia-dado">' + celle + '</div>';
      }).join('');
      return `
          <div class="dado3d" aria-hidden="true"><div class="dado3d-cubo">${facce}</div></div>`;
    }
    if (i === 4) return `
          <div class="carta-poker" aria-hidden="true">
            <span class="carta-corner tl">&#9824;</span>
            <span class="carta-centro">${esc(iniziali(c.nome))}<i class="carta-seme">&#9824;</i></span>
            <span class="carta-corner br">&#9824;</span>
          </div>`;
    if (i === 5) return `
          <div class="diana" aria-hidden="true"><span class="diana-bersaglio"></span></div>`;
    return `
          <div class="roulette-vera" aria-hidden="true">
            <div class="ruota-tasche"></div><span class="pallina"></span>
            <div class="roulette-foto">${esc(iniziali(c.nome))}${c.foto ? `<img src="${esc(c.foto)}" alt="" loading="lazy" decoding="async" onerror="this.remove()">` : ''}</div>
            <span class="roulette-numero">N. ${num.padStart(2, '0')}</span>
          </div>`;
  }

  /* ---------- Scheda candidato ---------- */
  const schedaCandidato = document.getElementById('scheda-candidato');
  if (schedaCandidato) {
    const idRichiesto = new URLSearchParams(location.search).get('id');
    caricaTabella('candidati').then((righe) => {
      const lista = righe || [];
      const indice = lista.findIndex((r) => String(r.id) === String(idRichiesto));
      if (indice === -1) {
        schedaCandidato.innerHTML = '<p class="stato-vuoto">Candidato non trovato.</p><p class="scheda-indietro"><a href="./candidati">← Tutti i candidati</a></p>';
        return;
      }
      const n = String(indice + 1).padStart(2, '0');
      const totale = String(lista.length).padStart(2, '0');
      function disegnaScheda(i) {
        const c = lista[(i + lista.length) % lista.length];
        const k = String(((i % lista.length) + lista.length) % lista.length + 1).padStart(2, '0');
        const pos = ((i % lista.length) + lista.length) % lista.length;
        const marca = (id, campo) => { const el = document.getElementById(id); if (el) el.setAttribute('data-mod', 'candidati.' + pos + '.' + campo); };
        document.getElementById('cand-numero').textContent = 'CANDIDATO ' + k;
        document.getElementById('cand-emblema').innerHTML = emblema(lista[pos], pos, true);
        marca('cand-ruolo', 'ruolo'); document.getElementById('cand-ruolo').textContent = c.ruolo || '';
        marca('cand-nome', 'nome'); document.getElementById('cand-nome').textContent = c.nome || '';
        marca('cand-motto', 'motto'); document.getElementById('cand-motto').textContent = c.motto || '';
        marca('cand-bio', 'bio'); document.getElementById('cand-bio').textContent = c.bio || '';
        MOD.liste.candidati = lista.map((r) => ({ id: r.id, nome: r.nome || '', ruolo: r.ruolo || '', motto: r.motto || '', bio: r.bio || '', foto: r.foto || '', ordine: r.ordine }));
        document.getElementById('cand-conta').textContent = k + ' / ' + totale;
        document.title = c.nome + ' · All In Vian';
        return (i + lista.length) % lista.length;
      }
      let corrente = disegnaScheda(indice);
      const vai = (delta) => {
        // scambio immediato, senza transizione: la scheda cambia al volo
        corrente = disegnaScheda(corrente + delta);
        // aggiorna l'URL senza ricaricare (su file:// può essere bloccato: non fa nulla)
        try { history.replaceState(null, '', urlPagina('candidato', { id: lista[corrente].id })); } catch (err) {}
      };
      document.getElementById('cand-prev').addEventListener('click', () => vai(-1));
      document.getElementById('cand-next').addEventListener('click', () => vai(1));
    });
  }

  /* ---------- Sconti ---------- */
  const listaSconti = document.getElementById('lista-sconti');
  if (listaSconti) {
    scheletri(listaSconti, 4, 'scheletro-buono');
    caricaTabella('sconti').then((righe) => {
      // veri sconti da Supabase; se la tabella è vuota o offline, i mock locali di data.js
      const dati = (righe && righe.length) ? righe : (typeof SCONTI_MOCK !== 'undefined' ? SCONTI_MOCK : null);
      if (!dati) {
        listaSconti.innerHTML = '<p class="stato-vuoto">Le convenzioni arrivano a breve: torna a trovarci.</p>';
        return;
      }
      const lista = dati.map((r) => ({
        locale: r.locale || '', categoria: r.categoria || '', sconto: r.sconto || '',
        dettagli: r.dettagli || '', validoFino: r.valido_fino || ''
      }));
      // il mazzo delle trattative: ogni sconto è una carta distribuita sul feltro
      const SEMI_MAZZO = ['picche', 'cuori', 'quadri', 'fiori'];
      const ROTAZIONI = [-3.2, 2.4, -1.6, 3.4, -2.8, 1.4, -3.6, 2.2];
      listaSconti.innerHTML = lista.map((s, i) => {
        const seme = SEMI_MAZZO[i % 4];
        const canto = `<span class="cs-canto" aria-hidden="true"><b>${esc(s.sconto)}</b><img src="./img/seme-${seme}.svg" alt="" width="12" height="12" loading="lazy" decoding="async"></span>`;
        return `
        <article class="carta-sconto" tabindex="0" role="button" data-apri="${i}" style="--rot:${ROTAZIONI[i % 8]}deg;--i:${i}" aria-label="Dettagli sconto ${esc(s.locale)}">
          ${canto}
          <img class="cs-acqua" src="./img/seme-${seme}.svg" alt="" width="90" height="90" loading="lazy" decoding="async" aria-hidden="true">
          <h2 class="cs-nome">${esc(s.locale)}</h2>
          <span class="cs-tag">${esc(s.categoria)}</span>
          ${s.validoFino ? `<p class="cs-scadenza">fino al ${esc(s.validoFino)}</p>` : ''}
          <span class="cs-canto cs-canto-bassa" aria-hidden="true"><b>${esc(s.sconto)}</b><img src="./img/seme-${seme}.svg" alt="" width="12" height="12" loading="lazy" decoding="async"></span>
        </article>`;
      }).join('');
      collegaModale(lista, (s) => ({
        label: s.categoria, title: s.locale + (s.sconto ? ' — ' + s.sconto : ''),
        text: [s.dettagli, s.validoFino ? 'Valido fino al ' + s.validoFino + '.' : ''].filter(Boolean).join('\n\n'),
        tag: 'CONVENZIONE', suit: '♦', figura: './img/sacco-fiches.svg', foto: false
      }));
    });
  }

  /* ---------- Parallasse leggera in apertura (solo mouse) ---------- */
  const palco = document.getElementById('palco');
  const interno = document.getElementById('mazzo-interno');
  if (palco && interno && !ridotto && !tocco) {
    const livelli = () => Array.from(palco.querySelectorAll('[data-profondita]'));
    palco.addEventListener('pointermove', (e) => {
      const r = palco.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      livelli().forEach((el) => {
        const p = parseFloat(el.dataset.profondita || '10');
        el.style.translate = `${(-x * p).toFixed(1)}px ${(-y * p).toFixed(1)}px`;
      });
      interno.style.translate = `${(x * 8).toFixed(1)}px ${(y * 8).toFixed(1)}px`;
    });
    palco.addEventListener('pointerleave', () => {
      livelli().forEach((el) => { el.style.translate = '0px 0px'; });
      interno.style.translate = '0 0';
    });
  }

  /* ---------- Pulizia will-change dopo l'entrata ---------- */
  window.addEventListener('load', () => {
    setTimeout(() => {
      document.querySelectorAll('.filigrana, .mazzo-interno, .primo-piano .p').forEach((el) => {
        el.style.willChange = 'auto';
      });
    }, 2600);
  });

  /* ---------- Countdown alla votazione (orologio di torneo) ---------- */
  const boxCountdown = document.getElementById('countdown');
  if (boxCountdown && typeof DATA_VOTAZIONE !== 'undefined') {
    const meta = new Date(DATA_VOTAZIONE).getTime();
    if (!isNaN(meta)) {
      boxCountdown.hidden = false;
      const otGg = document.getElementById('ot-gg'), otHh = document.getElementById('ot-hh');
      const otMm = document.getElementById('ot-mm'), otSs = document.getElementById('ot-ss');
      const otNota = document.getElementById('ot-nota');
      const cifre = boxCountdown.querySelector('.ot-cifre');
      let fermato = false;
      const due = (n) => String(n).padStart(2, '0');
      function aggiornaCountdown() {
        const d = meta - Date.now();
        if (d <= 0) {
          if (!fermato) {
            fermato = true;
            if (cifre) cifre.hidden = true;
            otNota.textContent = 'Votazioni concluse: grazie a chi c’è stato. Il tavolo resta.';
          }
          return;
        }
        const s = Math.floor(d / 1000);
        otGg.textContent = due(Math.floor(s / 86400));
        otHh.textContent = due(Math.floor((s % 86400) / 3600));
        otMm.textContent = due(Math.floor((s % 3600) / 60));
        otSs.textContent = due(s % 60);
      }
      try {
        otNota.textContent = new Date(DATA_VOTAZIONE).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' }) + ' · ore 8:00';
      } catch (e) {}
      aggiornaCountdown();
      window.setInterval(aggiornaCountdown, 1000);
    }
  }

  /* ---------- Tracciamento sale (niente popup: il chip in nav porta al gioco) ---------- */
  (function tracciaSale() {
    const p = (location.pathname.split('/').pop() || '').toLowerCase();
    let k = null;
    if (/^home(\.html)?$/.test(p)) k = 'tavolo';
    else if (/^candidat/.test(p)) k = 'candidati';
    else if (/^sconti/.test(p)) k = 'sconti';
    else if (/^crea-carta/.test(p)) k = 'carta';
    else if (/^proposte/.test(p)) k = 'proposte';
    else if (/^foto/.test(p)) k = 'foto';
    else if (/^faq/.test(p)) k = 'faq';
    else if (/^ventuno/.test(p)) k = 'ventuno';
    if (!k) return;
    let visitate = [];
    try { visitate = JSON.parse(localStorage.getItem('aiv-sale') || '[]'); } catch (e) {}
    if (visitate.indexOf(k) === -1) {
      visitate.push(k);
      try { localStorage.setItem('aiv-sale', JSON.stringify(visitate)); } catch (e) {}
    }
  })();

  /* ---------- Crea la tua carta ---------- */
  const ccNome = document.getElementById('cc-nome');
  if (ccNome) {
    const ccClasse = document.getElementById('cc-classe');
    const cpNome = document.getElementById('cp-nome');
    const cpIniz = document.getElementById('cp-iniziali');
    const cpInizB = document.getElementById('cp-iniziali-b');
    const cpAcqua = document.getElementById('cp-acqua');
    const cpAlto = document.getElementById('cp-seme-alto');
    const cpBasso = document.getElementById('cp-seme-basso');
    const cpTag = document.querySelector('.cp-tag');
    let seme = '♠';
    const inizialiDi = (nome) => String(nome || '').trim().split(/\s+/).slice(0, 2).map((w) => w[0] || '').join('').toUpperCase() || '??';
    function aggiornaAnteprima() {
      const nome = ccNome.value.trim();
      cpNome.textContent = nome || 'Il tuo nome';
      const ini = inizialiDi(nome);
      cpIniz.textContent = ini; cpInizB.textContent = ini;
      cpAcqua.textContent = seme; cpAlto.textContent = seme; cpBasso.textContent = seme;
      cpTag.textContent = (ccClasse.value.trim() || 'ALL IN VIAN').toUpperCase();
    }
    ccNome.addEventListener('input', aggiornaAnteprima);
    ccClasse.addEventListener('input', aggiornaAnteprima);
    document.querySelectorAll('.pulsante-seme').forEach((btn) => {
      btn.addEventListener('click', () => {
        seme = btn.dataset.seme || '♠';
        document.querySelectorAll('.pulsante-seme').forEach((b) => {
          b.classList.toggle('attivo', b === btn);
          b.setAttribute('aria-pressed', b === btn ? 'true' : 'false');
        });
        aggiornaAnteprima();
      });
    });
    function disegnaCartaCanvas() {
      const W = 500, H = 714;
      const cv = document.createElement('canvas');
      cv.width = W; cv.height = H;
      const x = cv.getContext('2d');
      const raggio = 36;
      x.beginPath();
      x.moveTo(raggio, 0);
      x.arcTo(W, 0, W, H, raggio); x.arcTo(W, H, 0, H, raggio);
      x.arcTo(0, H, 0, 0, raggio); x.arcTo(0, 0, W, 0, raggio);
      x.closePath();
      const g = x.createRadialGradient(W * .3, H * -.1, 40, W * .5, H * .5, H * .9);
      g.addColorStop(0, '#fffdf6'); g.addColorStop(.55, '#f5ecd6'); g.addColorStop(1, '#eadfc0');
      x.fillStyle = g; x.fill();
      x.strokeStyle = 'rgba(138,95,23,.5)'; x.lineWidth = 3; x.stroke();
      x.beginPath(); x.rect(16, 16, W - 32, H - 32);
      x.strokeStyle = 'rgba(138,95,23,.28)'; x.lineWidth = 2; x.stroke();
      x.save(); x.globalAlpha = .07; x.fillStyle = '#15616D';
      x.font = '700 300px Georgia, serif'; x.textAlign = 'center'; x.textBaseline = 'middle';
      x.fillText(seme, W / 2, H / 2 - 20);
      x.restore();
      const nome = ccNome.value.trim();
      const ini = inizialiDi(nome);
      x.fillStyle = '#15616D'; x.textAlign = 'center'; x.textBaseline = 'middle';
      x.font = "700 30px 'DM Mono', monospace"; x.fillText(ini, 62, 52);
      x.font = '700 34px Georgia, serif'; x.fillText(seme, 62, 94);
      x.save(); x.translate(W - 62, H - 52); x.rotate(Math.PI);
      x.fillStyle = '#15616D';
      x.font = "700 30px 'DM Mono', monospace"; x.fillText(ini, 0, 0);
      x.font = '700 34px Georgia, serif'; x.fillText(seme, 0, 42);
      x.restore();
      const nomeTesto = nome || 'Il tuo nome';
      let ns = 64;
      x.font = "700 " + ns + "px 'Playfair Display', Georgia, serif";
      while (x.measureText(nomeTesto).width > W - 90 && ns > 26) {
        ns -= 4;
        x.font = "700 " + ns + "px 'Playfair Display', Georgia, serif";
      }
      x.fillStyle = '#15616D';
      x.fillText(nomeTesto, W / 2, H / 2 + 8);
      const tagTesto = (ccClasse.value.trim() || 'ALL IN VIAN').toUpperCase();
      x.font = "500 22px 'DM Mono', monospace";
      const pw = x.measureText(tagTesto).width + 44, ph = 46;
      const px = (W - pw) / 2, py = H / 2 + 72;
      x.fillStyle = '#15616D';
      x.beginPath();
      x.moveTo(px + 23, py);
      x.arcTo(px + pw, py, px + pw, py + ph, 23); x.arcTo(px + pw, py + ph, px, py + ph, 23);
      x.arcTo(px, py + ph, px, py, 23); x.arcTo(px, py, px + pw, py, 23);
      x.closePath(); x.fill();
      x.fillStyle = '#FFECD1'; x.fillText(tagTesto, W / 2, py + ph / 2 + 1);
      return cv;
    }
    let cartaBlob = null;
    document.getElementById('cc-scarica').addEventListener('click', () => {
      const cv = disegnaCartaCanvas();
      cv.toBlob((b) => { cartaBlob = b; }, 'image/png');
      const a = document.createElement('a');
      a.download = 'carta-all-in-vian.png';
      a.href = cv.toDataURL('image/png');
      a.click();
      const riga = document.getElementById('cc-condividi');
      if (riga) riga.hidden = false;
    });
    const bCondividi = document.getElementById('cc-condividi-btn');
    if (bCondividi) bCondividi.addEventListener('click', () => {
      const pubblica = (blob) => {
        const file = new File([blob], 'carta-all-in-vian.png', { type: 'image/png' });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          navigator.share({ files: [file], title: 'All In Vian', text: 'Ho creato la mia carta sul mazzo All In Vian.' }).catch(() => {});
        } else {
          window.open('https://wa.me/?text=' + encodeURIComponent('Ho creato la mia carta All In Vian 🃏 ' + location.href), '_blank');
        }
      };
      if (cartaBlob) pubblica(cartaBlob);
      else disegnaCartaCanvas().toBlob(pubblica, 'image/png');
    });
    aggiornaAnteprima();
  }

  /* ---------- Tavolo delle proposte ---------- */
  const prForm = document.getElementById('proposta-form');
  if (prForm) {
    const esito = document.getElementById('proposta-esito');
    prForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const nome = prForm.nome.value.trim();
      const classe = prForm.classe.value.trim();
      const testo = prForm.testo.value.trim();
      if (!nome || !testo) {
        esito.textContent = 'Nome e proposta sono obbligatori.';
        esito.className = 'form-esito errore';
        return;
      }
      esito.textContent = 'Invio in corso…';
      esito.className = 'form-esito';
      const riga = { nome: nome, classe: classe || null, testo: testo };
      const ok = () => { esito.textContent = 'Grazie! La tua proposta è in tavola.'; esito.className = 'form-esito ok'; prForm.reset(); };
      const ko = () => { esito.textContent = 'Invio non riuscito: controlla la connessione e riprova. Il testo è ancora qui.'; esito.className = 'form-esito errore'; };
      if (window.supabaseClient) {
        window.supabaseClient.from('proposte').insert(riga).then((r) => { if (r && !r.error) ok(); else ko(); }).catch(ko);
      } else ko();
    });
    const boxArrivate = document.getElementById('proposte-arrivate');
    const ulArrivate = document.getElementById('proposte-lista');
    function disegnaProposte(righe) {
      if (!righe || !righe.length) return;
      boxArrivate.hidden = false;
      ulArrivate.innerHTML = righe.map((p) => `
        <li class="proposta-elemento">
          <p class="proposta-testo">${esc(p.testo)}</p>
          <p class="proposta-autore">${esc(p.nome)}${p.classe ? ' · ' + esc(p.classe) : ''}${p.creato ? ' · ' + esc(p.creato) : ''}</p>
        </li>`).join('');
    }
    if (window.supabaseClient) {
      window.supabaseClient.from('proposte')
        .select('nome, classe, testo, created_at').eq('approvato', true)
        .order('created_at', { ascending: false }).limit(20)
        .then((r) => {
          if (r && !r.error && Array.isArray(r.data) && r.data.length) {
            disegnaProposte(r.data.map((p) => ({
              nome: p.nome, classe: p.classe, testo: p.testo,
              creato: p.created_at ? new Date(p.created_at).toLocaleDateString('it-IT') : ''
            })));
          } else if (typeof PROPOSTE_MOCK !== 'undefined') disegnaProposte(PROPOSTE_MOCK);
        }).catch(() => { if (typeof PROPOSTE_MOCK !== 'undefined') disegnaProposte(PROPOSTE_MOCK); });
    } else if (typeof PROPOSTE_MOCK !== 'undefined') disegnaProposte(PROPOSTE_MOCK);
  }

  /* ---------- Foto di tavolo (polaroid sul feltro) ---------- */
  const rotFoto = [-2.6, 1.8, -1.2, 2.8, -2.2, 1.4];
  function disegnaFoto(voci) {
    const muro = document.getElementById('muro-foto');
    if (!muro) return;
    MOD.liste.foto = voci;
    if (!Array.isArray(voci) || !voci.length) { muro.innerHTML = ''; return; }
    muro.innerHTML = voci.map((f, i) => `
      <figure class="polaroid" style="--rot:${rotFoto[i % 6]}deg">
        <span class="nastro" aria-hidden="true"></span>
        <img src="${esc(f.src)}" alt="${esc(f.didascalia)}" loading="lazy" decoding="async">
        <figcaption data-mod="foto.${i}.didascalia">${esc(f.didascalia)}${f.data ? '<small>' + esc(f.data) + '</small>' : ''}</figcaption>
      </figure>`).join('');
  }
  MOD.render.foto = () => { if (MOD.liste.foto) disegnaFoto(MOD.liste.foto); };
  if (typeof FOTO !== 'undefined') disegnaFoto(FOTO);

  /* ---------- FAQ: carta che si gira ---------- */
  const SEMI_FAQ = { spades: '♠', hearts: '♥', diamonds: '♦', clubs: '♣' };
  function agganciaFaq(scope) {
    (scope || document).querySelectorAll('.faq-carta').forEach((cartaFaq) => {
      if (cartaFaq.dataset.agganciata) return;
      cartaFaq.dataset.agganciata = '1';
      const gira = () => {
        const aperta = cartaFaq.classList.toggle('girata');
        cartaFaq.setAttribute('aria-expanded', aperta ? 'true' : 'false');
      };
      cartaFaq.addEventListener('click', gira);
      cartaFaq.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); gira(); }
      });
    });
  }
  function disegnaFaq(voci) {
    const mazzo = document.querySelector('.faq-mazzo');
    if (!mazzo) return;
    MOD.liste.faq = voci;
    if (!Array.isArray(voci) || !voci.length) { mazzo.innerHTML = ''; return; }
    mazzo.innerHTML = voci.map((f, i) => `
      <article class="faq-carta" tabindex="0" role="button" aria-expanded="false">
        <div class="faq-interno">
          <div class="faq-fronte"><span class="faq-seme" aria-hidden="true">${SEMI_FAQ[f.seme] || '♠'}</span><h2 data-mod="faq.${i}.domanda">${esc(f.domanda)}</h2><p class="faq-indizio">gira la carta</p></div>
          <div class="faq-retro"><p data-mod="faq.${i}.risposta">${esc(f.risposta)}</p></div>
        </div>
      </article>`).join('');
    agganciaFaq(mazzo);
  }
  MOD.render.faq = () => { if (MOD.liste.faq) disegnaFaq(MOD.liste.faq); };
  if (typeof FAQ_VOCI !== 'undefined') disegnaFaq(FAQ_VOCI);
  agganciaFaq();

  /* ---------- Sezioni libere della home ---------- */
  function disegnaSezioni(voci) {
    const sezioni = document.getElementById('sezioni-home');
    const griglia = document.getElementById('sezioni-grid');
    if (!sezioni || !griglia) return;
    MOD.liste.sezioni = voci;
    if (!Array.isArray(voci) || !voci.length) { griglia.innerHTML = ''; return; }
    griglia.innerHTML = voci.map((s, i) => `
      <article class="sezione-carta">
        <span class="sezione-seme" aria-hidden="true">${SEMI[s.seme] || '♠'}</span>
        <h3 data-mod="sezioni.${i}.titolo">${esc(s.titolo)}</h3>
        <p data-mod="sezioni.${i}.testo">${esc(s.testo)}</p>
      </article>`).join('');
  }
  MOD.render.sezioni = () => { if (MOD.liste.sezioni) disegnaSezioni(MOD.liste.sezioni); };

  /* Campi di testo editabili in linea: marca gli elementi giusti con data-mod.
     Fa parte della modifica in linea (attiva col pulsante «✎ Modifica»). */
  const PAGINA_CORRENTE = (location.pathname.split('/').pop() || '').toLowerCase().replace(/\.html$/, '') || 'index';
  MOD.pagina = PAGINA_CORRENTE;
  (function assegnaModIntro() {
    const mappa = [
      ['.intro h1', 'testi.' + PAGINA_CORRENTE + '.titolo'],
      ['.intro > p:not([class])', 'testi.' + PAGINA_CORRENTE + '.intro'],
      ['.sale > .sale-titolo', 'testi.home.titoloSale'],
      ['.partita > .sale-titolo', 'testi.home.titoloPartita'],
      ['#titolo-sezioni', 'testi.home.titoloSezioni']
    ];
    mappa.forEach((coppia) => {
      const el = document.querySelector(coppia[0]);
      if (el) el.setAttribute('data-mod', coppia[1]);
    });
  })();

  /* ---------- Contenuti online (Supabase): testi, sezioni, faq, foto, tappe ----------
     Stessa fonte per il sito segreto e per la versione aperta: chiunque modifichi
     in linea (pulsante «✎ Modifica») aggiorna il database, e qui compare subito. */
  (async function applicaContenuti() {
    try {
      if (!window.supabaseClient) return;
      const risposta = await Promise.race([
        window.supabaseClient.from('contenuti').select('id,valore').in('id', ['testi', 'sezioni', 'faq', 'foto', 'tappe']),
        attesaMassima(6)
      ]);
      if (!risposta || risposta.error || !Array.isArray(risposta.data)) return;
      const dati = {};
      risposta.data.forEach((r) => { dati[r.id] = r.valore; });
      MOD.dati.testi = (dati.testi && typeof dati.testi === 'object') ? dati.testi : {};

      // 1) testi della pagina corrente: per ogni campo salvato, trova l'elemento col data-mod giusto
      const testi = MOD.dati.testi[PAGINA_CORRENTE];
      if (testi) {
        const CORSIVI = { titolo: 1, titoloSale: 1, titoloPartita: 1, titoloSezioni: 1, titoloElenco: 1 };
        Object.keys(testi).forEach((campo) => {
          const el = document.querySelector('[data-mod="testi.' + PAGINA_CORRENTE + '.' + campo + '"]');
          if (el && testi[campo]) {
            if (CORSIVI[campo]) el.innerHTML = formatta(testi[campo]);
            else el.textContent = testi[campo];
          }
        });
      }

      // 2) sezioni libere della home
      const sezioni = document.getElementById('sezioni-home');
      if (sezioni) {
        if (Array.isArray(dati.sezioni) && dati.sezioni.length) {
          disegnaSezioni(dati.sezioni);
          sezioni.hidden = false;
          rivela([sezioni]);
        }
      }

      // 3) elenchi: se il database ha voci, sostituiscono quelle locali
      if (Array.isArray(dati.faq) && dati.faq.length) disegnaFaq(dati.faq);
      if (Array.isArray(dati.foto) && dati.foto.length) disegnaFoto(dati.foto);
      if (Array.isArray(dati.tappe) && dati.tappe.length) disegnaTappe(dati.tappe);
    } catch (e) { /* offline o tabella ancora assente: restano i dati locali */ }
  })();

  /* ---------- Modifica in linea (solo versione aperta: la attiva window.__AIV_MODIFICA) ----------
     Tocca un testo o una sezione e lo modifichi direttamente sulla pagina.
     I contenuti restano sul database, quindi li vedono tutti. */
  if (window.__AIV_MODIFICA && window.supabaseClient) {
    const CONTENUTI_LISTA = ['sezioni', 'tappe', 'faq', 'foto'];
    const sbMod = window.supabaseClient;

    // contenitori editabili -> chiave della lista (per + e ✕)
    const CONTENITORI = [
      { sel: '#sezioni-grid', lista: 'sezioni' },
      { sel: '#partita-linea', lista: 'tappe' },
      { sel: '.faq-mazzo', lista: 'faq' },
      { sel: '#muro-foto', lista: 'foto' }
    ];

    function attivaModifica(on) {
      document.body.classList.toggle('modifica-attiva', on);
      const b = document.getElementById('bottone-modifica');
      if (b) b.setAttribute('aria-pressed', on ? 'true' : 'false');

      document.querySelectorAll('[data-mod]').forEach((el) => {
        el.contentEditable = on ? 'true' : 'false';
        el.classList.toggle('mod-editabile', on);
        if (!on) el.removeAttribute('data-mod-sporco');
      });

      // nei controlli + / ✕
      document.querySelectorAll('.mod-controllo, .mod-aggiungi').forEach((el) => el.remove());
      const sezioniHome = document.getElementById('sezioni-home');
      if (sezioniHome) sezioniHome.hidden = on ? false : (MOD.liste.sezioni && MOD.liste.sezioni.length ? false : true);

      if (on) {
        CONTENITORI.forEach((c) => {
          const cont = document.querySelector(c.sel);
          if (!cont) return;
          // ✕ su ogni voce
          Array.prototype.forEach.call(cont.children, (voce, i) => {
            const x = document.createElement('button');
            x.type = 'button';
            x.className = 'mod-controllo';
            x.setAttribute('aria-label', 'Togli questa voce');
            x.textContent = '✕';
            x.addEventListener('click', (e) => { e.stopPropagation(); togliVoce(c.lista, i); });
            voce.appendChild(x);
          });
          // + per aggiungere
          const add = document.createElement('button');
          add.type = 'button';
          add.className = 'mod-aggiungi';
          add.textContent = '+ Aggiungi';
          add.addEventListener('click', () => aggiungiVoce(c.lista));
          cont.appendChild(add);
        });
        segnalaModifica('Modifica attiva: tocca un testo per cambiarlo, ✕ per togliere, «+ Aggiungi» per aggiungere.');
      } else {
        segnalaModifica('');
      }
    }

    function segnalaModifica(msg) {
      let f = document.getElementById('modifica-fuso');
      if (!msg) { if (f) f.remove(); return; }
      if (!f) {
        f = document.createElement('p');
        f.id = 'modifica-fuso';
        f.className = 'mod-fuso';
        document.body.appendChild(f);
      }
      f.textContent = msg;
    }

    // salvataggio di un campo toccato
    function salvaCampo(chiave, testo) {
      const parti = chiave.split('.');
      const tipo = parti[0];
      if (tipo === 'testi') {
        MOD.dati.testi[parti[1]] = MOD.dati.testi[parti[1]] || {};
        MOD.dati.testi[parti[1]][parti[2]] = testo;
        salvaContenutiMod('testi', MOD.dati.testi);
      } else if (CONTENUTI_LISTA.indexOf(tipo) !== -1) {
        const i = Number(parti[1]);
        const voce = MOD.liste[tipo] && MOD.liste[tipo][i];
        if (!voce) return;
        voce[parti[2]] = testo;
        salvaContenutiMod(tipo, MOD.liste[tipo].map((v) => pulisciVoce(v, tipo)));
      } else if (tipo === 'punti' || tipo === 'candidati') {
        const i = Number(parti[1]);
        const riga = MOD.liste[tipo] && MOD.liste[tipo][i];
        if (!riga) return;
        riga[parti[2]] = testo;
        salvaRigaMod(tipo, riga);
      }
    }

    function pulisciVoce(v, tipo) {
      const o = {};
      const campi = { sezioni: ['seme', 'titolo', 'testo'], tappe: ['data', 'titolo', 'testo', 'stato'], faq: ['seme', 'domanda', 'risposta'], foto: ['src', 'didascalia', 'data'] }[tipo] || [];
      campi.forEach((c) => { o[c] = v[c] || ''; });
      return o;
    }

    function salvaContenutiMod(id, valore) {
      sbMod.from('contenuti').upsert({ id: id, valore: valore, aggiornato: new Date().toISOString() })
        .then((r) => { if (r && r.error) segnalaModifica('Salvataggio non riuscito: ' + r.error.message); else segnalaModifica('✓ Salvato: tutti vedono la modifica.'); })
        .catch((e) => segnalaModifica('Errore di rete: ' + e.message));
    }
    function salvaRigaMod(tabella, riga) {
      const o = {};
      if (riga.id) o.id = riga.id;
      if (tabella === 'punti') {
        o.ordine = riga.ordine == null ? null : riga.ordine;
        o.short_label = riga.shortLabel || null;
        o.title = riga.title || null;
        o.text = riga.text || null;
        o.suit = riga.suit || null;
        o.tag = riga.tag || null;
        o.motivo = riga.motivo || null;
      } else {
        ['ordine', 'nome', 'ruolo', 'motto', 'bio', 'foto'].forEach((c) => { o[c] = riga[c] === '' || riga[c] === undefined ? null : riga[c]; });
      }
      sbMod.from(tabella).upsert(o).then((r) => {
        if (r && r.error) segnalaModifica('Salvataggio non riuscito: ' + r.error.message);
        else segnalaModifica('✓ Salvato: tutti vedono la modifica.');
      }).catch((e) => segnalaModifica('Errore di rete: ' + e.message));
    }

    // aggiungi / toglie voci dagli elenchi
    function vuotoDi(tipo) {
      return { sezioni: { seme: 'spades', titolo: 'Nuova sezione', testo: 'Scrivi qui il testo.' },
        tappe: { data: 'oggi', titolo: 'Nuova tappa', testo: 'Scrivi qui il testo.', stato: 'fatto' },
        faq: { seme: 'spades', domanda: 'Nuova domanda?', risposta: 'Scrivi qui la risposta.' },
        foto: { src: './img/carte/dorso.png', didascalia: 'Nuova foto', data: '' } }[tipo];
    }
    function aggiungiVoce(tipo) {
      MOD.liste[tipo] = MOD.liste[tipo] || [];
      MOD.liste[tipo].push(vuotoDi(tipo));
      if (MOD.render[tipo]) MOD.render[tipo]();
      salvaContenutiMod(tipo, MOD.liste[tipo].map((v) => pulisciVoce(v, tipo)));
      attivaModifica(true); // ridisegna i controlli sulla nuova voce
      segnalaModifica('✓ Voce aggiunta. Toccane il testo per scriverlo.');
    }
    function togliVoce(tipo, i) {
      if (!MOD.liste[tipo]) return;
      MOD.liste[tipo].splice(i, 1);
      if (MOD.render[tipo]) MOD.render[tipo]();
      salvaContenutiMod(tipo, MOD.liste[tipo].map((v) => pulisciVoce(v, tipo)));
      attivaModifica(true);
      segnalaModifica('✓ Voce tolta.');
    }

    // salva quando finisci di scrivere in un campo
    document.addEventListener('blur', (e) => {
      const el = e.target;
      if (!el || !el.getAttribute) return;
      const chiave = el.getAttribute('data-mod');
      if (!chiave || !document.body.classList.contains('modifica-attiva')) return;
      const testo = el.textContent.trim();
      salvaCampo(chiave, testo);
    }, true);

    // evita di aprire le schede/punti quando si scrive
    document.addEventListener('click', (e) => {
      if (!document.body.classList.contains('modifica-attiva')) return;
      const el = e.target.closest && e.target.closest('[data-mod]');
      if (el && el.isContentEditable) { e.stopPropagation(); e.preventDefault(); }
    }, true);

    // bottone fluttuante
    const b = document.createElement('button');
    b.type = 'button';
    b.id = 'bottone-modifica';
    b.className = 'modifica-flutt';
    b.setAttribute('aria-pressed', 'false');
    b.innerHTML = '&#9998; <span>Modifica</span>';
    b.addEventListener('click', () => attivaModifica(!document.body.classList.contains('modifica-attiva')));
    document.body.appendChild(b);

    // la tastiera (Esc) spegne la modifica
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && document.body.classList.contains('modifica-attiva')) attivaModifica(false);
    });
  }

  /* ---------- Sala privata: 21 con le picche (blackjack a regole di casinò) ---------- */
  const vZonaGiocatore = document.getElementById('v-zone-giocatore');
  if (vZonaGiocatore) {
    const SEMI_V = ['♠', '♥', '♦', '♣'];
    const RANK_V = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    const elBanco = document.getElementById('v-mano-banco');
    const pBanco = document.getElementById('v-punti-banco');
    const esitoV = document.getElementById('v-esito');
    const elFiche = document.getElementById('v-fiche');
    const elVinte = document.getElementById('v-vinte');
    const elPerse = document.getElementById('v-perse');
    const elPareggi = document.getElementById('v-pareggi');
    const elMazzoConta = document.getElementById('v-scarpa-conta');
    const elCronologia = document.getElementById('v-cronologia');
    const comandiPunta = document.getElementById('v-comandi-punta');
    const comandiGioco = document.getElementById('v-comandi-gioco');
    const bGioca = document.getElementById('v-gioca');
    const bPesca = document.getElementById('v-pesca');
    const bDoppia = document.getElementById('v-doppia');
    const bDividi = document.getElementById('v-dividi');
    const bPassa = document.getElementById('v-passa');
    let ficheV = 200, faseV = 'punta', puntataSel = 10;
    let mazzoV = [], bancoV = [], maniV = [], attivaV = 0, primoMazzo = true;
    let statV = { vinte: 0, perse: 0, pareggi: 0 }, storiaV = [];
    /* suoni da tavolo (WebAudio, nessun asset) */
    let audioOn = true, ctxAudio = null;
    function beep(tipo) {
      if (!audioOn) return;
      try {
        ctxAudio = ctxAudio || new (window.AudioContext || window.webkitAudioContext)();
        const t = ctxAudio.currentTime;
        if (tipo === 'carta') {
          const buf = ctxAudio.createBuffer(1, 1600, ctxAudio.sampleRate);
          const dat = buf.getChannelData(0);
          for (let i = 0; i < dat.length; i++) dat[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / dat.length, 3);
          const src = ctxAudio.createBufferSource(); src.buffer = buf;
          const f = ctxAudio.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 2400; f.Q.value = .8;
          const g = ctxAudio.createGain(); g.gain.value = .15;
          src.connect(f); f.connect(g); g.connect(ctxAudio.destination); src.start(t);
        } else if (tipo === 'ficha') {
          const o = ctxAudio.createOscillator(); const g = ctxAudio.createGain();
          o.type = 'triangle'; o.frequency.setValueAtTime(660, t); o.frequency.exponentialRampToValueAtTime(320, t + .08);
          g.gain.setValueAtTime(.11, t); g.gain.exponentialRampToValueAtTime(.001, t + .12);
          o.connect(g); g.connect(ctxAudio.destination); o.start(t); o.stop(t + .14);
        } else if (tipo === 'vinta') {
          [523, 659, 784].forEach((fq, i) => {
            const o = ctxAudio.createOscillator(); const g = ctxAudio.createGain();
            o.type = 'sine'; o.frequency.value = fq;
            g.gain.setValueAtTime(.0001, t + i * .09);
            g.gain.exponentialRampToValueAtTime(.11, t + i * .09 + .02);
            g.gain.exponentialRampToValueAtTime(.0001, t + i * .09 + .3);
            o.connect(g); g.connect(ctxAudio.destination); o.start(t + i * .09); o.stop(t + i * .09 + .32);
          });
        } else if (tipo === 'persa') {
          const o = ctxAudio.createOscillator(); const g = ctxAudio.createGain();
          o.type = 'sine'; o.frequency.setValueAtTime(180, t); o.frequency.exponentialRampToValueAtTime(90, t + .3);
          g.gain.setValueAtTime(.09, t); g.gain.exponentialRampToValueAtTime(.001, t + .35);
          o.connect(g); g.connect(ctxAudio.destination); o.start(t); o.stop(t + .36);
        }
      } catch (e) {}
    }
    const bSuono = document.getElementById('v-suono');
    if (bSuono) bSuono.addEventListener('click', () => {
      audioOn = !audioOn;
      bSuono.classList.toggle('attivo', audioOn);
      bSuono.setAttribute('aria-pressed', audioOn ? 'true' : 'false');
    });
    function nuovoMazzoV() {
      mazzoV = [];
      SEMI_V.forEach((s) => RANK_V.forEach((r) => mazzoV.push({ s: s, r: r })));
      for (let i = mazzoV.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const t = mazzoV[i]; mazzoV[i] = mazzoV[j]; mazzoV[j] = t;
      }
      if (!primoMazzo) {
        esitoV.textContent = 'Mazzo rimescolato:52 nuove carte.';
        const sc = document.getElementById('v-scarpa');
        if (sc) { sc.classList.add('rimescola'); window.setTimeout(() => sc.classList.remove('rimescola'), 700); }
      }
      primoMazzo = false;
    }
    function pescaV() { if (mazzoV.length < 15) nuovoMazzoV(); return mazzoV.pop(); }
    function punteggioV(mano) {
      let tot = 0, assi = 0;
      mano.forEach((c) => {
        if (c.r === 'A') { tot += 11; assi++; }
        else if (c.r === 'J' || c.r === 'Q' || c.r === 'K') tot += 10;
        else tot += parseInt(c.r, 10);
      });
      let morbido = false;
      while (tot > 21 && assi > 0) { tot -= 10; assi--; }
      if (assi > 0 && tot <= 21) morbido = true;
      return { tot: tot, morbido: morbido };
    }
    function srcCartaV(c) {
      const rank = c.r === 'A' ? 'ace' : c.r === 'J' ? 'jack' : c.r === 'Q' ? 'queen' : c.r === 'K' ? 'king' : c.r;
      const suit = c.s === '♠' ? 'spades' : c.s === '♥' ? 'hearts' : c.s === '♦' ? 'diamonds' : 'clubs';
      return './img/carte/' + rank + '_of_' + suit + '.png';
    }
    function puntaHtmlV(c, coperta) {
      if (coperta) {
        return '<span class="v-carta v-carta-coperta"><img src="./img/carte/dorso.png" alt="" width="222" height="323" decoding="async"></span>';
      }
      return '<span class="v-carta" data-r="' + c.r + '" data-s="' + c.s + '"><img src="' + srcCartaV(c) +
        '" alt="' + c.r + c.s + '" width="222" height="323" decoding="async" ' +
        'onerror="var p=this.parentNode;this.remove();p.classList.add(\'v-carta-testo\')"></span>';
    }
    function etichettaPunteggio(mano) {
      const p = punteggioV(mano);
      return String(p.tot) + (p.morbido ? ' morbido' : '');
    }
    function ficheHtmlV(puntata) {
      const cls = puntata >= 25 ? 'ficha-25' : puntata >= 10 ? 'ficha-10' : 'ficha-5';
      return '<span class="v-pila-fiche" aria-hidden="true">' +
        '<i class="ficha ' + cls + ' f-b"></i><i class="ficha ' + cls + ' f-m"></i>' +
        '<span class="ficha ' + cls + ' f-t"><em>' + puntata + '</em></span></span>';
    }
    function disegnaV(bancoCoperto) {
      elBanco.innerHTML = bancoV.map((c, i) => puntaHtmlV(c, bancoCoperto && i === 0)).join('');
      pBanco.textContent = bancoCoperto
        ? (punteggioV(bancoV.slice(1)).tot + ' + ?')
        : etichettaPunteggio(bancoV);
      vZonaGiocatore.innerHTML = maniV.map((m, i) => `
        <div class="v-manina${i === attivaV && faseV === 'gioca' ? ' attiva' : ''}${m.chiusa ? ' chiusa' : ''}${m.esito ? ' v-' + m.esito : ''}">
          ${ficheHtmlV(m.puntata)}
          <div class="v-riga-carta">
            <p class="v-etichetta">${maniV.length > 1 ? 'Mano ' + (i + 1) : 'La tua mano'} <span class="v-punteggio">${m.carte.length ? etichettaPunteggio(m.carte) : ''}</span>${m.blackjack ? ' <span class="v-bj">★ blackjack</span>' : ''}</p>
            <div class="v-mano">${m.carte.map((c) => puntaHtmlV(c, false)).join('')}</div>
          </div>
        </div>`).join('');
      elFiche.textContent = String(ficheV);
      elVinte.textContent = String(statV.vinte);
      elPerse.textContent = String(statV.perse);
      elPareggi.textContent = String(statV.pareggi);
      if (elMazzoConta) elMazzoConta.textContent = String(mazzoV.length);
      comandiPunta.hidden = faseV !== 'punta';
      comandiGioco.hidden = faseV !== 'gioca';
      const m = maniV[attivaV];
      const soloDue = m && m.carte.length === 2;
      bPesca.disabled = faseV !== 'gioca';
      bPassa.disabled = faseV !== 'gioca';
      bDoppia.disabled = !(faseV === 'gioca' && soloDue && ficheV >= m.puntata);
      bDividi.disabled = !(faseV === 'gioca' && soloDue && maniV.length < 2 &&
        m.carte[0].r === m.carte[1].r && ficheV >= m.puntata);
      document.querySelectorAll('.v-fiche-btn').forEach((b) => {
        b.classList.toggle('attiva', parseInt(b.dataset.punta, 10) === puntataSel);
        b.disabled = faseV !== 'punta' || ficheV < parseInt(b.dataset.punta, 10);
      });
      elCronologia.innerHTML = storiaV.slice(-10).map((r) =>
        '<span class="v-risultato v-risultato-' + r.tipo + '" title="' + r.testo + '">' + r.simbolo + '</span>').join('');
    }
    function esito(msg) { esitoV.textContent = msg; }
    function distribuisciV() {
      if (ficheV < puntataSel) return;
      ficheV -= puntataSel;
      if (mazzoV.length < 15) nuovoMazzoV();
      beep('ficha');
      beep('carta');
      window.setTimeout(() => beep('carta'), 130);
      window.setTimeout(() => beep('carta'), 260);
      window.setTimeout(() => beep('carta'), 390);
      bancoV = [pescaV(), pescaV()];
      maniV = [{ carte: [pescaV(), pescaV()], puntata: puntataSel, chiusa: false, blackjack: false }];
      attivaV = 0;
      faseV = 'gioca';
      const p = punteggioV(maniV[0].carte);
      if (p.tot === 21) {
        maniV[0].blackjack = true;
        maniV[0].chiusa = true;
        esito('Blackjack naturale! Il banco gioca.');
        disegnaV(true);
        window.setTimeout(giocaBancoV, 650);
        return;
      }
      esito('La mano è tua: pesca, raddoppia, dividi o passa.');
      disegnaV(true);
    }
    function pescaManoV() {
      if (faseV !== 'gioca') return;
      const m = maniV[attivaV];
      m.carte.push(pescaV());
      beep('carta');
      const p = punteggioV(m.carte);
      if (p.tot > 21) {
        esito('Busto con ' + p.tot + ' sulla mano ' + (attivaV + 1) + '.');
        m.chiusa = true;
        avanzaOMano();
      } else if (p.tot === 21) {
        esito('21! La mano è chiusa.');
        m.chiusa = true;
        avanzaOMano();
      } else disegnaV(true);
    }
    function raddoppiaV() {
      if (faseV !== 'gioca') return;
      const m = maniV[attivaV];
      if (m.carte.length !== 2 || ficheV < m.puntata) return;
      ficheV -= m.puntata;
      m.puntata *= 2;
      m.carte.push(pescaV());
      beep('ficha');
      window.setTimeout(() => beep('carta'), 120);
      const p = punteggioV(m.carte);
      esito(p.tot > 21 ? 'Raddoppiato e busto con ' + p.tot + '.' : 'Raddoppiato: mano chiusa su ' + p.tot + '.');
      m.chiusa = true;
      disegnaV(true);
      avanzaOMano();
    }
    function dividiV() {
      if (faseV !== 'gioca') return;
      const m = maniV[attivaV];
      if (m.carte.length !== 2 || m.carte[0].r !== m.carte[1].r || ficheV < m.puntata || maniV.length > 1) return;
      ficheV -= m.puntata;
      const seconda = { carte: [m.carte.pop()], puntata: m.puntata, chiusa: false, blackjack: false };
      m.carte.push(pescaV());
      seconda.carte.push(pescaV());
      maniV.splice(attivaV + 1, 0, seconda);
      beep('ficha');
      window.setTimeout(() => beep('carta'), 120);
      window.setTimeout(() => beep('carta'), 260);
      esito('Mano divisa: gioca la prima, poi la seconda.');
      disegnaV(true);
    }
    function passaV() {
      if (faseV !== 'gioca') return;
      maniV[attivaV].chiusa = true;
      avanzaOMano();
    }
    function avanzaOMano() {
      const prossima = maniV.findIndex((m) => !m.chiusa);
      if (prossima === -1) { disegnaV(true); window.setTimeout(giocaBancoV, 500); }
      else { attivaV = prossima; disegnaV(true); }
    }
    function giocaBancoV() {
      faseV = 'banco'; // niente comandi durante il giro del banco
      disegnaV(true);
      const mostraCarta = () => {
        elBanco.innerHTML = bancoV.map((c) => puntaHtmlV(c, false)).join('');
      };
      mostraCarta();
      pBanco.textContent = etichettaPunteggio(bancoV);
      const pBancoTot = () => punteggioV(bancoV).tot;
      const disegnaConBanco = () => {
        elBanco.innerHTML = bancoV.map((c) => puntaHtmlV(c, false)).join('');
        pBanco.textContent = etichettaPunteggio(bancoV);
      };
      const aspetta = (ms) => new Promise((r) => window.setTimeout(r, ms));
      const giro = async () => {
        while (pBancoTot() < 17) {
          bancoV.push(pescaV());
          beep('carta');
          disegnaConBanco();
          await aspetta(480);
        }
        // chiusura
        const vb = pBancoTot();
        let msg = [], haVinto = false, haPerso = false;
        maniV.forEach((m) => {
          const p = punteggioV(m.carte);
          let esitoMano;
          if (m.blackjack) {
            ficheV += Math.round(m.puntata * 2.5);
            statV.vinte++; haVinto = true; m.esito = 'bj';
            esitoMano = { tipo: 'bj', simbolo: '★', testo: 'Blackjack! +' + Math.round(m.puntata * 1.5) };
            msg.push('Blackjack (' + p.tot + '): +' + Math.round(m.puntata * 1.5) + ' fiches.');
          } else if (p.tot > 21) {
            statV.perse++; haPerso = true; m.esito = 'persa';
            esitoMano = { tipo: 'persa', simbolo: '✕', testo: 'Busto con ' + p.tot };
            msg.push('Mano con ' + p.tot + ': busto.');
          } else if (vb > 21) {
            ficheV += m.puntata * 2;
            statV.vinte++; haVinto = true; m.esito = 'vinta';
            esitoMano = { tipo: 'vinta', simbolo: '✓', testo: 'Banco sballato: +' + m.puntata };
            msg.push('Banco sballato con ' + vb + ': +' + m.puntata + ' fiches.');
          } else if (p.tot > vb) {
            ficheV += m.puntata * 2;
            statV.vinte++; haVinto = true; m.esito = 'vinta';
            esitoMano = { tipo: 'vinta', simbolo: '✓', testo: p.tot + ' a ' + vb + ': +' + m.puntata };
            msg.push('Vinci ' + p.tot + ' a ' + vb + ': +' + m.puntata + ' fiches.');
          } else if (p.tot < vb) {
            statV.perse++; haPerso = true; m.esito = 'persa';
            esitoMano = { tipo: 'persa', simbolo: '✕', testo: p.tot + ' a ' + vb };
            msg.push('Perdi ' + p.tot + ' a ' + vb + '.');
          } else {
            ficheV += m.puntata;
            statV.pareggi++; m.esito = 'pareggio';
            esitoMano = { tipo: 'pareggio', simbolo: '=', testo: 'Pareggio ' + p.tot };
            msg.push('Pareggio (' + p.tot + '): puntata restituita.');
          }
          storiaV.push(esitoMano);
        });
        faseV = 'punta';
        esito(msg.join('  '));
        disegnaV(false);
        if (haVinto) beep('vinta'); else if (haPerso) beep('persa');
        if (ficheV < 5) { faseV = 'finita'; esito('Fiches esaurite: la casa vince sempre. Ricarica per una nuova sessione.'); disegnaV(false); }
      };
      giro();
    }
    document.querySelectorAll('.v-fiche-btn').forEach((b) => {
      b.addEventListener('click', () => {
        puntataSel = parseInt(b.dataset.punta, 10) || 10;
        disegnaV(true);
      });
    });
    bGioca.addEventListener('click', () => { if (faseV === 'punta') distribuisciV(); });
    bPesca.addEventListener('click', pescaManoV);
    bDoppia.addEventListener('click', raddoppiaV);
    bDividi.addEventListener('click', dividiV);
    bPassa.addEventListener('click', passaV);
    /* banner di benvenuto (una tantum, non un popup: una striscia in pagina) */
    const banner = document.getElementById('v-banner');
    if (banner) {
      let visto = false;
      try { visto = localStorage.getItem('aiv-ventuno') === '1'; } catch (e) {}
      if (!visto) {
        let sale = [];
        try { sale = JSON.parse(localStorage.getItem('aiv-sale') || '[]'); } catch (e) {}
        const completo = ['tavolo', 'candidati', 'sconti', 'carta', 'proposte', 'foto', 'faq'].every((s) => sale.indexOf(s) !== -1);
        document.getElementById('v-banner-titolo').textContent = completo ? 'Mazzo completo' : 'Sala privata';
        document.getElementById('v-banner-testo').textContent = completo
          ? 'Hai visitato tutte le sale del sito: questa ti spetta. Buona mano.'
          : 'Nessuno ti ha invitato: per questo è speciale. Gioca la tua mano.';
        banner.hidden = false;
        try { localStorage.setItem('aiv-ventuno', '1'); } catch (e) {}
        banner.querySelector('.v-banner-chiudi').addEventListener('click', () => { banner.hidden = true; });
      }
    }
    nuovoMazzoV();
    disegnaV(true);
  }
})();
