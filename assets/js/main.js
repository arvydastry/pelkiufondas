/* VšĮ „Pelkių fondas“ – maketo interaktyvumas.
   Atkartoja Salient elgseną: antraštės sumažėjimas ir skaidrumas virš video, išskleidžiami meniu,
   mobilus (off-canvas) meniu, Page Submenu (prilipęs vidinis meniu), Column animation / Split Line
   Heading / Mask Reveal, Parallax, Milestone skaičiai, Toggles, Tabs, galerijos peržiūra, video fonai.
   Papildomai (maketui): svetainės paieška, pranešimai, slapukų juosta, filtrai, demo formos.
   Puslapių scenarijai (assets/js/pages/*.js) naudoja window.PF pagalbines funkcijas. */
(() => {
  'use strict';

  const doc = document;
  const root = doc.documentElement;
  const body = doc.body;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const saveData = !!(navigator.connection && navigator.connection.saveData);
  const $ = (s, c = doc) => c.querySelector(s);
  const $$ = (s, c = doc) => Array.from(c.querySelectorAll(s));

  /* ---------- Būsena (tik šioje naršyklėje) ---------- */
  const store = {
    get(key, fallback) { try { const v = localStorage.getItem(key); return v === null ? fallback : JSON.parse(v); } catch (e) { return fallback; } },
    set(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* privatus langas */ } }
  };

  /* ---------- Pagalbinės ---------- */
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const plural = (n, forms) => {
    const n10 = n % 10, n100 = n % 100;
    if (n10 === 1 && n100 !== 11) return forms[0];
    if (n10 >= 2 && n10 <= 9 && (n100 < 11 || n100 > 19)) return forms[1];
    return forms[2];
  };
  const nf = (n, d = 0) => new Intl.NumberFormat('lt-LT', { minimumFractionDigits: d, maximumFractionDigits: d }).format(n);
  const debounce = (fn, ms = 120) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };
  const normalize = (s) => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[ąĄ]/g, 'a').replace(/[čČ]/g, 'c').replace(/[ęėĘĖ]/g, 'e').replace(/[įĮ]/g, 'i').replace(/[šŠ]/g, 's').replace(/[ųūŲŪ]/g, 'u').replace(/[žŽ]/g, 'z');

  /* ---------- Pranešimų juostelė ---------- */
  let toastEl, toastTimer;
  const toast = (msg, ms = 3200) => {
    if (!toastEl) { toastEl = doc.createElement('div'); toastEl.className = 'toast'; toastEl.setAttribute('role', 'status'); toastEl.setAttribute('aria-live', 'polite'); body.appendChild(toastEl); }
    toastEl.textContent = msg;
    toastEl.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('is-visible'), ms);
  };

  /* ---------- Maketo juosta: naujų funkcijų žymekliai ---------- */
  const initMockbar = () => {
    const bar = $('.mockbar');
    const setH = () => { root.style.setProperty('--mockbar-h', (bar ? bar.offsetHeight : 0) + 'px'); };
    setH(); window.addEventListener('resize', debounce(setH, 100));
    const t = $('#toggle-newfn');
    const hidden = store.get('pf.hideNewFn', false);
    root.classList.toggle('hide-new-fn', hidden);
    if (t) {
      t.checked = !hidden;
      t.addEventListener('change', () => { root.classList.toggle('hide-new-fn', !t.checked); store.set('pf.hideNewFn', !t.checked); });
    }
    const here = location.pathname.split('/').pop() || 'index.html';
    $$('.mockbar__pages a').forEach((a) => { if ((a.getAttribute('href') || '').split('#')[0] === here) a.setAttribute('aria-current', 'page'); });
  };

  /* ---------- Antraštė: sumažėjimas, dabartinis puslapis, išskleidžiami meniu ---------- */
  const initHeader = () => {
    const onScroll = () => body.classList.toggle('is-scrolled', window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    const key = body.dataset.nav;
    if (key) $$('.nav__item[data-nav-key], .nav > a[data-nav-key]').forEach((el) => {
      if (el.dataset.navKey !== key) return;
      el.classList.add('is-current');
      if (el.matches('a')) el.setAttribute('aria-current', 'page');
    });

    $$('.nav__item[data-drop]').forEach((item) => {
      const btn = $('.nav__link', item);
      let timer;
      const open = () => { closeAll(item); item.classList.add('is-open'); btn.setAttribute('aria-expanded', 'true'); };
      const close = () => { item.classList.remove('is-open'); btn.setAttribute('aria-expanded', 'false'); };
      item.addEventListener('mouseenter', () => { clearTimeout(timer); timer = setTimeout(open, 60); });
      item.addEventListener('mouseleave', () => { clearTimeout(timer); timer = setTimeout(close, 160); });
      btn.addEventListener('click', (e) => { e.preventDefault(); item.classList.contains('is-open') ? close() : open(); });
      item.addEventListener('keydown', (e) => { if (e.key === 'Escape') { close(); btn.focus(); } });
      item.addEventListener('focusout', (e) => { if (!item.contains(e.relatedTarget)) close(); });
    });
    const closeAll = (except) => $$('.nav__item.is-open').forEach((i) => { if (i !== except) { i.classList.remove('is-open'); $('.nav__link', i).setAttribute('aria-expanded', 'false'); } });
    doc.addEventListener('click', (e) => { if (!e.target.closest('.nav__item')) closeAll(); });

    /* Mobilus meniu */
    const menu = $('#mobile-menu');
    const burger = $('.burger');
    if (menu && burger) {
      const closeBtn = $('.mobile-menu__close', menu);
      const open = () => { menu.classList.add('is-open'); body.classList.add('no-scroll'); burger.setAttribute('aria-expanded', 'true'); (closeBtn || menu).focus(); };
      const close = () => { menu.classList.remove('is-open'); body.classList.remove('no-scroll'); burger.setAttribute('aria-expanded', 'false'); burger.focus(); };
      burger.addEventListener('click', open);
      closeBtn && closeBtn.addEventListener('click', close);
      menu.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
      $$('a[href^="#"]', menu).forEach((a) => a.addEventListener('click', close));
    }

    /* Kalbos perjungimas: makete tik LT */
    $$('.lang a[data-lang]').forEach((a) => a.addEventListener('click', (e) => {
      e.preventDefault();
      toast('EN versija: WordPress’e kalbos perjungiamos su WPML arba Polylang. Makete rodoma tik LT.');
    }));
  };

  /* ---------- Svetainės paieška (nauja funkcija) ---------- */
  const SEARCH_INDEX = [
    { t: 'Pradinis', s: 'Pelkėms reikia vandens – veiklos kryptys, naujienos, prisidėk', h: 'index.html', i: 'ph-house' },
    { t: 'Pelkės: kas yra pelkės ir durpynai', s: 'Apibrėžimai, pelkių tipai, EB svarbos buveinės, reikšmė, grėsmės, būklė', h: 'pelkes.html', i: 'ph-leaf' },
    { t: 'Pelkių tipai: žemapelkės, tarpinės, aukštapelkės', s: 'Pelkės › tipai', h: 'pelkes.html#tipai', i: 'ph-leaf' },
    { t: 'Grėsmės pelkėms', s: 'Sausinimas, žemės ūkis, miškininkystė, durpių kasyba, klimato kaita', h: 'pelkes.html#gresmes', i: 'ph-warning' },
    { t: 'Terminų žodynas', s: 'Šlapynės, pelkės, durpės, durpynai, durpojai, pelkininkystė…', h: 'terminu-zodynas.html', i: 'ph-book-open' },
    { t: 'Galerija', s: 'Pelkių ir mūsų darbų nuotraukos', h: 'galerija.html', i: 'ph-images' },
    { t: 'Apie mus', s: 'Misija, vizija, komanda, ambasadoriai, partneriai, įstatai', h: 'apie-mus.html', i: 'ph-users-three' },
    { t: 'Komanda', s: 'Nerijus Zableckis, Jūratė Sendžikaitė, Leonas Jarašius, Kristina Dapkūnienė, Morgana Danielė, Darius Kavšinas', h: 'apie-mus.html#komanda', i: 'ph-users-three' },
    { t: 'Veiklos ataskaitos', s: 'Metinės veiklos ir finansinės ataskaitos nuo 2020 m. (LT / EN)', h: 'veiklos-ataskaitos.html', i: 'ph-file-text' },
    { t: 'Veikla', s: 'Biologinės įvairovės apsauga, pelkių atkūrimas, CO2 mažinimas, pelkininkystė', h: 'veikla.html', i: 'ph-compass' },
    { t: 'CO2 emisijų mažinimas verslui', s: 'Atkurkite pelkes ir sumažinkite įmonės anglies pėdsaką', h: 'co2.html', i: 'ph-cloud' },
    { t: 'Projektai', s: 'Guodžių durpynas, Aukštumala, SavePeatlands, LIFE ForestHabitatLT, EUKI…', h: 'projektai.html', i: 'ph-map-pin' },
    { t: 'Paslaugos', s: 'Ekspertų konsultacijos, inventorizacijos ir tyrimai, švietimas', h: 'paslaugos.html', i: 'ph-briefcase' },
    { t: 'Publikacijos', s: 'Moksliniai straipsniai, knygos, lankstinukai, biuleteniai', h: 'publikacijos.html', i: 'ph-books' },
    { t: 'Videoteka', s: 'Filmai apie pelkes, pelkininkystę, talkas', h: 'videoteka.html', i: 'ph-play-circle' },
    { t: 'Naujienos', s: 'Fondo naujienos, renginiai, pranešimai spaudai', h: 'naujienos.html', i: 'ph-newspaper' },
    { t: 'Kontaktai', s: 'Gedimino pr. 1, Vilnius · +370 656 20426 · info@pelkiufondas.lt', h: 'kontaktai.html', i: 'ph-phone' },
    { t: 'Prisidėk: paremk', s: 'Parama internetu, pavedimu, 1,2 % GPM', h: 'prisidek.html#paremk', i: 'ph-heart' },
    { t: 'Prisidėk: savanoriauk', s: 'Talkos, renginiai, savanorių registracija', h: 'prisidek.html#savanoriauk', i: 'ph-hand-heart' },
    { t: 'Naujienlaiškis', s: 'Prenumeruok mėnesines pelkių naujienas', h: 'prisidek.html#naujienlaiskis', i: 'ph-envelope' },
    { t: 'Pelkininkystė', s: 'Klimatui palankus ūkininkavimas šlapiuose durpiniuose dirvožemiuose', h: 'veikla.html#pelkininkyste', i: 'ph-plant' },
    { t: 'Aukštumalos aukštapelkė', s: 'Projektai › Aukštumalos pietvakarinės dalies atkūrimas', h: 'projektai.html', i: 'ph-map-pin' },
    { t: 'Guodžių durpyno atkūrimas', s: 'Projektai › Biržų r., ~100 ha apleistas durpių karjeras', h: 'projektas.html', i: 'ph-map-pin' },
    { t: 'Privatumo politika', s: 'Asmens duomenų tvarkymas, slapukai', h: 'kontaktai.html#privatumas', i: 'ph-shield-check' },
  ];
  const initSearch = () => {
    const overlay = doc.createElement('div');
    overlay.className = 'search-overlay';
    overlay.innerHTML = `<div class="search-box" role="dialog" aria-modal="true" aria-label="Paieška svetainėje">
        <div class="search-box__field"><i class="ph ph-magnifying-glass" aria-hidden="true"></i>
          <input type="search" placeholder="Ieškoti: pelkininkystė, Aukštumala, parama…" aria-label="Paieškos žodis" autocomplete="off">
          <kbd>Esc</kbd></div>
        <div class="search-box__results"><p class="search-box__hint">Įveskite bent 2 raides. WordPress’e paieška apims puslapius, naujienas, projektus, publikacijas ir žodyno terminus (Salient Header → Search + WP paieška arba Relevanssi).</p></div>
      </div>`;
    body.appendChild(overlay);
    const input = $('input', overlay);
    const results = $('.search-box__results', overlay);
    const open = () => { overlay.classList.add('is-open'); body.classList.add('no-scroll'); setTimeout(() => input.focus(), 50); };
    const close = () => { overlay.classList.remove('is-open'); body.classList.remove('no-scroll'); };
    $$('[data-search-open]').forEach((b) => b.addEventListener('click', (e) => { e.preventDefault(); open(); }));
    overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
    doc.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && overlay.classList.contains('is-open')) close();
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); overlay.classList.contains('is-open') ? close() : open(); }
    });
    const mark = (text, q) => { const n = normalize(text); const i = n.indexOf(q); if (i < 0) return esc(text); return esc(text.slice(0, i)) + '<mark>' + esc(text.slice(i, i + q.length)) + '</mark>' + esc(text.slice(i + q.length)); };
    input.addEventListener('input', () => {
      const q = normalize(input.value.trim());
      if (q.length < 2) { results.innerHTML = '<p class="search-box__hint">Įveskite bent 2 raides.</p>'; return; }
      const hits = SEARCH_INDEX.filter((x) => normalize(x.t + ' ' + x.s).includes(q)).slice(0, 9);
      results.innerHTML = hits.length
        ? hits.map((x) => `<a class="search-hit" href="${x.h}"><span class="search-hit__icon"><i class="ph ${x.i}"></i></span><span><strong>${mark(x.t, q)}</strong><span>${mark(x.s, q)}</span></span></a>`).join('')
        : `<p class="search-box__hint">Pagal „${esc(input.value)}“ nieko nerasta. Pabandykite kitą žodį, pvz., „durpynas“ arba „parama“.</p>`;
    });
  };

  /* ---------- Page Submenu: prilipęs vidinis meniu su aktyvia sekcija ---------- */
  const initSubnav = () => {
    const nav = $('.subnav');
    if (!nav) return;
    const links = $$('a[href^="#"]', nav);
    const targets = links.map((a) => $(a.getAttribute('href'))).filter(Boolean);
    if (!targets.length) return;
    const strip = nav.querySelector('.container');
    const setActive = (id) => links.forEach((a) => {
      const on = a.getAttribute('href') === '#' + id;
      const was = a.classList.contains('is-active');
      a.classList.toggle('is-active', on);
      /* tik horizontalus slinkimas juostoje (scrollIntoView pastumtų ir patį puslapį) */
      if (on && !was && strip.scrollWidth > strip.clientWidth) strip.scrollTo({ left: a.offsetLeft - strip.clientWidth / 2 + a.offsetWidth / 2, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
    const offset = () => nav.getBoundingClientRect().bottom + 8;
    const update = () => {
      let current = targets[0];
      for (const t of targets) { if (t.getBoundingClientRect().top <= offset()) current = t; }
      if (window.innerHeight + window.scrollY >= doc.body.scrollHeight - 2) current = targets[targets.length - 1];
      setActive(current.id);
    };
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', debounce(update));
    update();
  };

  /* ---------- Įėjimo animacijos ---------- */
  const inviewObserver = ('IntersectionObserver' in window) ? new IntersectionObserver((entries) => {
    entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('is-inview'); inviewObserver.unobserve(en.target); } });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }) : null;
  /* data-mask: clip-path paslėptas elementas Chrome IO nesikerta su rodiniu, todėl stebimas jo tėvas */
  const maskTargets = new WeakMap();
  const maskObserver = ('IntersectionObserver' in window) ? new IntersectionObserver((entries) => {
    entries.forEach((en) => { if (en.isIntersecting) { (maskTargets.get(en.target) || []).forEach((el) => el.classList.add('is-inview')); maskObserver.unobserve(en.target); } });
  }, { rootMargin: '0px 0px -6% 0px', threshold: 0 }) : null;
  const observeReveal = (scope = doc) => {
    const els = $$('[data-reveal], [data-reveal-group], .scribble', scope);
    const masks = $$('[data-mask]', scope);
    if (!inviewObserver || reduceMotion) { els.concat(masks).forEach((el) => el.classList.add('is-inview')); return; }
    els.forEach((el) => inviewObserver.observe(el));
    masks.forEach((el) => {
      const host = el.parentElement || el;
      const list = maskTargets.get(host) || []; list.push(el); maskTargets.set(host, list);
      maskObserver.observe(host);
    });
  };

  /* ---------- Split Line Heading ---------- */
  const splitLines = (el) => {
    if (!el.dataset.splitSrc) el.dataset.splitSrc = el.innerHTML;
    el.innerHTML = el.dataset.splitSrc;
    const items = [];
    const wrap = (wrappers, word) => {
      let node = doc.createElement('span'); node.className = 'w'; node.textContent = word;
      for (let i = wrappers.length - 1; i >= 0; i--) { const c = wrappers[i].cloneNode(false); c.appendChild(node); node = c; }
      return node;
    };
    const walk = (node, wrappers) => {
      Array.from(node.childNodes).forEach((ch) => {
        if (ch.nodeType === 3) { ch.textContent.split(/\s+/).filter(Boolean).forEach((w) => items.push(wrap(wrappers, w))); }
        else if (ch.nodeType === 1) {
          if (ch.tagName === 'BR') { items.push('BR'); return; }
          if (ch.querySelector('svg') || ch.classList.contains('nosplit') || ch.tagName === 'SVG') { items.push(ch); return; }
          walk(ch, wrappers.concat(ch));
        }
      });
    };
    walk(el, []);
    el.innerHTML = '';
    items.forEach((it, i) => { if (it === 'BR') { el.appendChild(doc.createElement('br')); return; } el.appendChild(it); if (i < items.length - 1) el.appendChild(doc.createTextNode(' ')); });
    const lines = []; let lastTop = null;
    items.forEach((it) => {
      if (it === 'BR') { lastTop = null; return; }
      const top = Math.round(it.getBoundingClientRect().top);
      if (lastTop === null || Math.abs(top - lastTop) > 4) { lines.push([]); lastTop = top; }
      lines[lines.length - 1].push(it);
    });
    el.innerHTML = '';
    lines.forEach((line, i) => {
      const outer = doc.createElement('span'); outer.className = 'line';
      const inner = doc.createElement('span'); inner.style.setProperty('--i', i);
      line.forEach((it, j) => { inner.appendChild(it); if (j < line.length - 1) inner.appendChild(doc.createTextNode(' ')); });
      outer.appendChild(inner); el.appendChild(outer);
    });
  };
  const initSplit = () => {
    const els = $$('[data-split]');
    if (!els.length) return;
    if (reduceMotion || !inviewObserver) { els.forEach((el) => el.classList.add('is-inview')); return; }
    const run = () => { els.forEach(splitLines); els.forEach((el) => { if (!el.classList.contains('is-inview')) inviewObserver.observe(el); }); };
    (doc.fonts && doc.fonts.ready ? doc.fonts.ready : Promise.resolve()).then(run);
    let lastW = window.innerWidth;
    window.addEventListener('resize', debounce(() => {
      if (window.innerWidth === lastW) return;   /* mobiliuose aukštis keičiasi slenkant – nepersiskaidyti */
      lastW = window.innerWidth;
      els.forEach((el) => {
        const was = el.classList.contains('is-inview');
        if (was) el.classList.add('no-anim');
        splitLines(el);
        if (was) { el.classList.add('is-inview'); requestAnimationFrame(() => requestAnimationFrame(() => el.classList.remove('no-anim'))); }
      });
    }, 200));
  };

  /* ---------- Paralaksas (Salient: Parallax Scroll) ---------- */
  const initParallax = () => {
    const els = $$('.px[data-px]');
    if (!els.length || reduceMotion || window.innerWidth < 900) return;
    let ticking = false;
    const update = () => {
      const vh = window.innerHeight;
      els.forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.bottom < -200 || r.top > vh + 200) return;
        const p = (r.top + r.height / 2 - vh / 2) / vh;
        el.style.transform = `translate3d(0, ${(-p * parseFloat(el.dataset.px) * 100).toFixed(1)}px, 0)`;
      });
      ticking = false;
    };
    window.addEventListener('scroll', () => { if (!ticking) { requestAnimationFrame(update); ticking = true; } }, { passive: true });
    update();
  };

  /* ---------- Milestone skaičiai ---------- */
  const initCounters = () => {
    const els = $$('[data-count-to]');
    if (!els.length) return;
    const run = (el) => {
      const to = parseFloat(el.dataset.countTo), dec = parseInt(el.dataset.decimals || '0', 10), suffix = el.dataset.suffix || '', prefix = el.dataset.prefix || '';
      const dur = 1600, t0 = performance.now();
      const step = (t) => { const k = Math.min(1, (t - t0) / dur); const e = 1 - Math.pow(1 - k, 3); el.textContent = prefix + nf(to * e, dec) + suffix; if (k < 1) requestAnimationFrame(step); };
      requestAnimationFrame(step);
    };
    if (reduceMotion || !('IntersectionObserver' in window)) { els.forEach((el) => { el.textContent = (el.dataset.prefix || '') + nf(parseFloat(el.dataset.countTo), parseInt(el.dataset.decimals || '0', 10)) + (el.dataset.suffix || ''); }); return; }
    const io = new IntersectionObserver((entries) => entries.forEach((en) => { if (en.isIntersecting) { run(en.target); io.unobserve(en.target); } }), { threshold: 0.4 });
    els.forEach((el) => io.observe(el));
  };

  /* ---------- Video fonai ir video kortelės (Pexels; tausojantis krovimas) ---------- */
  const videoOff = () => reduceMotion || saveData || store.get('pf.videoOff', false);
  const initVideo = () => {
    const vids = $$('video[data-src]');
    if (!vids.length) return;
    const small = window.innerWidth < 720;
    const load = (v) => {
      if (v.dataset.loaded) return;
      v.dataset.loaded = '1';
      const src = (small && v.dataset.srcSd) ? v.dataset.srcSd : v.dataset.src;
      v.src = src; v.muted = true; v.loop = true; v.playsInline = true; v.preload = 'auto';
      v.addEventListener('playing', () => v.classList.add('is-ready'), { once: true });
      v.load();
      v.play().catch(() => {});
    };
    const io = ('IntersectionObserver' in window) ? new IntersectionObserver((entries) => entries.forEach((en) => {
      const v = en.target;
      if (en.isIntersecting) { if (!videoOff()) { load(v); v.play().catch(() => {}); } }
      else if (v.dataset.loaded) v.pause();
    }), { rootMargin: '240px 0px' }) : null;
    vids.forEach((v) => { if (io) io.observe(v); else if (!videoOff()) load(v); });

    $$('.video-toggle').forEach((btn) => {
      const set = () => { const off = videoOff(); btn.innerHTML = off ? '<i class="ph ph-play" aria-hidden="true"></i> Paleisti video' : '<i class="ph ph-pause" aria-hidden="true"></i> Sustabdyti video'; btn.setAttribute('aria-pressed', off ? 'true' : 'false'); };
      set();
      btn.addEventListener('click', () => {
        const off = !store.get('pf.videoOff', false);
        store.set('pf.videoOff', off);
        vids.forEach((v) => { if (off) v.pause(); else { load(v); v.play().catch(() => {}); } });
        $$('.video-toggle').forEach((b) => { const o = videoOff(); b.innerHTML = o ? '<i class="ph ph-play" aria-hidden="true"></i> Paleisti video' : '<i class="ph ph-pause" aria-hidden="true"></i> Sustabdyti video'; b.setAttribute('aria-pressed', o ? 'true' : 'false'); });
      });
    });

    /* Video įrašai (Videoteka): paspaudus – įkeliamas YouTube/Vimeo įrėmis arba paleidžiamas failas */
    $$('.video-embed').forEach((box) => {
      const play = $('.video-embed__play', box);
      if (!play) return;
      play.addEventListener('click', () => {
        if (box.dataset.yt) { const f = doc.createElement('iframe'); f.src = `https://www.youtube-nocookie.com/embed/${box.dataset.yt}?autoplay=1&rel=0`; f.allow = 'autoplay; encrypted-media; picture-in-picture'; f.allowFullscreen = true; f.title = box.dataset.title || 'Vaizdo įrašas'; box.innerHTML = ''; box.appendChild(f); return; }
        if (box.dataset.video) { const v = doc.createElement('video'); v.src = box.dataset.video; v.controls = true; v.autoplay = true; v.playsInline = true; v.poster = box.dataset.poster || ''; box.innerHTML = ''; box.appendChild(v); return; }
        toast('Makete video įrašas neįkeltas. WordPress’e čia bus YouTube / Vimeo arba įkeltas failas (Salient Video Lightbox).');
      });
    });
  };

  /* ---------- Toggles ir Tabs ---------- */
  const initToggles = () => {
    $$('.toggle__btn').forEach((btn) => {
      btn.setAttribute('aria-expanded', btn.getAttribute('aria-expanded') === 'true' ? 'true' : 'false');
      btn.addEventListener('click', () => {
        const open = btn.getAttribute('aria-expanded') === 'true';
        const group = btn.closest('[data-accordion]');
        if (group) $$('.toggle__btn', group).forEach((b) => b.setAttribute('aria-expanded', 'false'));
        btn.setAttribute('aria-expanded', open ? 'false' : 'true');
      });
    });
    $$('.tabs').forEach((tabs) => {
      const tabBtns = $$('[role="tab"]', tabs);
      const panels = tabBtns.map((b) => $('#' + b.getAttribute('aria-controls'))).filter(Boolean);
      const select = (i) => {
        tabBtns.forEach((b, j) => { b.setAttribute('aria-selected', i === j ? 'true' : 'false'); b.tabIndex = i === j ? 0 : -1; });
        panels.forEach((p, j) => { p.hidden = i !== j; });
        observeReveal(panels[i]);
      };
      tabBtns.forEach((b, i) => {
        b.addEventListener('click', () => select(i));
        b.addEventListener('keydown', (e) => {
          if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); const n = (i + (e.key === 'ArrowRight' ? 1 : -1) + tabBtns.length) % tabBtns.length; tabBtns[n].focus(); select(n); }
        });
      });
      select(Math.max(0, tabBtns.findIndex((b) => b.getAttribute('aria-selected') === 'true')));
    });
  };

  /* ---------- Nuotraukų peržiūra (lightbox) ---------- */
  const lightbox = (() => {
    let el, img, cap, items = [], idx = 0;
    const build = () => {
      el = doc.createElement('div'); el.className = 'lightbox'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true'); el.setAttribute('aria-label', 'Nuotraukos peržiūra');
      el.innerHTML = `<button class="lightbox__btn lightbox__close" type="button" aria-label="Uždaryti"><i class="ph ph-x"></i></button>
        <button class="lightbox__btn lightbox__prev" type="button" aria-label="Ankstesnė"><i class="ph ph-caret-left"></i></button>
        <img alt=""><div class="lightbox__cap"></div>
        <button class="lightbox__btn lightbox__next" type="button" aria-label="Kita"><i class="ph ph-caret-right"></i></button>`;
      body.appendChild(el);
      img = $('img', el); cap = $('.lightbox__cap', el);
      $('.lightbox__close', el).addEventListener('click', close);
      $('.lightbox__prev', el).addEventListener('click', () => show(idx - 1));
      $('.lightbox__next', el).addEventListener('click', () => show(idx + 1));
      el.addEventListener('click', (e) => { if (e.target === el) close(); });
      doc.addEventListener('keydown', (e) => { if (!el.classList.contains('is-open')) return; if (e.key === 'Escape') close(); if (e.key === 'ArrowRight') show(idx + 1); if (e.key === 'ArrowLeft') show(idx - 1); });
    };
    const show = (i) => { idx = (i + items.length) % items.length; img.src = items[idx].src; img.alt = items[idx].alt || ''; cap.textContent = items[idx].cap || ''; $('.lightbox__prev', el).hidden = $('.lightbox__next', el).hidden = items.length < 2; };
    const open = (list, i = 0) => { if (!el) build(); items = list; show(i); el.classList.add('is-open'); body.classList.add('no-scroll'); };
    const close = () => { el.classList.remove('is-open'); body.classList.remove('no-scroll'); };
    const bind = (scope = doc) => {
      const groups = {};
      $$('[data-lightbox]', scope).forEach((t) => { (groups[t.dataset.lightbox] = groups[t.dataset.lightbox] || []).push(t); });
      Object.values(groups).forEach((list) => list.forEach((t, i) => {
        if (t.dataset.lbBound) return; t.dataset.lbBound = '1';
        t.addEventListener('click', (e) => {
          e.preventDefault();
          const visible = list.filter((x) => !x.hidden && x.offsetParent !== null);   /* po filtravimo – tik matomos */
          open(visible.map((x) => ({ src: x.dataset.src || x.getAttribute('href') || ($('img', x) || {}).src, alt: ($('img', x) || {}).alt, cap: x.dataset.cap })), Math.max(0, visible.indexOf(t)));
        });
      }));
    };
    return { open, close, bind };
  })();

  /* ---------- Modalai ---------- */
  const modal = {
    open(id) { const m = $(id); if (!m) return; m.classList.add('is-open'); body.classList.add('no-scroll'); const f = $('input, button, [href]', $('.modal__box', m) || m); f && setTimeout(() => f.focus(), 60); },
    close(m) { m.classList.remove('is-open'); body.classList.remove('no-scroll'); }
  };
  const initModals = () => {
    $$('[data-modal-open]').forEach((b) => b.addEventListener('click', (e) => { e.preventDefault(); modal.open(b.dataset.modalOpen); }));
    $$('.modal').forEach((m) => {
      $$('[data-modal-close]', m).forEach((b) => b.addEventListener('click', () => modal.close(m)));
      m.addEventListener('click', (e) => { if (e.target === m) modal.close(m); });
    });
    doc.addEventListener('keydown', (e) => { if (e.key === 'Escape') $$('.modal.is-open').forEach((m) => modal.close(m)); });
  };

  /* ---------- Formos (maketas duomenų nesiunčia) ---------- */
  const initForms = () => {
    $$('form[data-demo]').forEach((form) => {
      form.noValidate = true;
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        let ok = true;
        $$('[required]', form).forEach((inp) => {
          const field = inp.closest('.field') || inp.closest('.check');
          const valid = inp.type === 'checkbox' ? inp.checked : inp.type === 'email' ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inp.value.trim()) : inp.value.trim().length > 0;
          field && field.classList.toggle('is-invalid', !valid);
          if (!valid) ok = false;
        });
        if (!ok) { const first = $('.is-invalid input, .is-invalid textarea, .is-invalid select', form); first && first.focus(); return; }
        const msg = $('.form__msg', form) || $('.form__msg', form.parentElement);
        if (msg) { msg.classList.add('is-visible'); msg.innerHTML = '<i class="ph ph-check-circle"></i> ' + (form.dataset.demo || 'Ačiū! Jūsų žinutę gavome ir netrukus susisieksime.'); }
        toast('Maketas: forma duomenų nesiunčia. WordPress’e tai bus WPForms / Fluent Forms forma su el. pašto pranešimu.');
        if (form.dataset.reset !== 'no') form.reset();
      });
      $$('[required]', form).forEach((inp) => inp.addEventListener('input', () => { const f = inp.closest('.field'); f && f.classList.remove('is-invalid'); }));
    });
    $$('[data-copy]').forEach((b) => b.addEventListener('click', async () => {
      try { await navigator.clipboard.writeText(b.dataset.copy); toast('Nukopijuota: ' + b.dataset.copy); } catch (e) { toast('Nepavyko nukopijuoti automatiškai – pažymėkite tekstą ranka.'); }
    }));
  };

  /* ---------- Filtrai ir paieška sąrašuose (naujienos, projektai, publikacijos, žodynas, galerija) ---------- */
  const initFilters = () => {
    $$('[data-filter-group]').forEach((group) => {
      const items = $$('[data-tags]', group);
      const pills = $$('[data-filter]', group);
      const search = $('[data-filter-search]', group);
      const empty = $('[data-filter-empty]', group);
      const countEl = $('[data-filter-count]', group);
      let active = 'all';
      const dims = {};   /* data-filter-dim="statusas" → nepriklausomos filtrų grupės, jungiamos IR */
      const apply = () => {
        const q = search ? normalize(search.value.trim()) : '';
        let n = 0;
        items.forEach((it) => {
          const tags = (it.dataset.tags || '').split(/\s+/);
          const okTag = (active === 'all' || tags.includes(active)) && Object.values(dims).every((v) => v === 'all' || tags.includes(v));
          const okQ = !q || normalize(it.textContent + ' ' + (it.dataset.keywords || '')).includes(q);
          const show = okTag && okQ;
          it.hidden = !show;
          if (show) n++;
        });
        if (empty) empty.hidden = n > 0;
        if (countEl) countEl.textContent = `${n} ${plural(n, countEl.dataset.forms ? countEl.dataset.forms.split('|') : ['įrašas', 'įrašai', 'įrašų'])}`;
        pills.forEach((p) => { const c = $('.pill__count', p); if (c) { const k = p.dataset.filter; c.textContent = k === 'all' ? items.length : items.filter((it) => (it.dataset.tags || '').split(/\s+/).includes(k)).length; } });
        group.dispatchEvent(new CustomEvent('pf:filtered', { detail: { active, q, visible: n } }));
      };
      pills.forEach((p) => p.addEventListener('click', () => {
        const dim = p.dataset.filterDim;
        if (dim) { dims[dim] = p.dataset.filter; pills.filter((x) => x.dataset.filterDim === dim).forEach((x) => x.setAttribute('aria-pressed', x === p ? 'true' : 'false')); }
        else { active = p.dataset.filter; pills.filter((x) => !x.dataset.filterDim).forEach((x) => x.setAttribute('aria-pressed', x === p ? 'true' : 'false')); }
        apply();
      }));
      pills.forEach((p) => { if (p.dataset.filterDim && !(p.dataset.filterDim in dims)) dims[p.dataset.filterDim] = 'all'; });
      search && search.addEventListener('input', debounce(apply, 80));
      $$('[data-filter-clear]', group).forEach((b) => b.addEventListener('click', () => { active = 'all'; Object.keys(dims).forEach((k) => { dims[k] = 'all'; }); if (search) search.value = ''; pills.forEach((x) => x.setAttribute('aria-pressed', x.dataset.filter === 'all' ? 'true' : 'false')); apply(); }));
      const preset = new URLSearchParams(location.search).get('f');
      if (preset && pills.some((p) => p.dataset.filter === preset)) active = preset;
      pills.forEach((x) => x.setAttribute('aria-pressed', x.dataset.filter === active ? 'true' : 'false'));
      apply();
    });
  };

  /* ---------- Slapukų juosta (WP: Complianz / CookieYes) ---------- */
  const initCookie = () => {
    if (store.get('pf.cookie', null) !== null) return;
    const el = doc.createElement('div');
    el.className = 'cookie'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-label', 'Slapukų nustatymai');
    el.innerHTML = `<h4>Slapukai</h4><p>Naudojame būtinuosius slapukus, o statistikos (analitikos) ir video (YouTube) slapukus – tik su jūsų sutikimu. <a class="link-u" href="kontaktai.html#privatumas">Privatumo politika</a></p>
      <div class="cookie__actions"><button class="btn btn--sm" type="button" data-c="all">Sutinku su visais</button><button class="btn btn--sm btn--ghost" type="button" data-c="min">Tik būtinieji</button></div>`;
    body.appendChild(el);
    setTimeout(() => el.classList.add('is-visible'), 1200);
    $$('[data-c]', el).forEach((b) => b.addEventListener('click', () => { store.set('pf.cookie', b.dataset.c); el.classList.remove('is-visible'); setTimeout(() => el.remove(), 400); }));
  };

  /* ---------- Metai poraštėje, išorinės nuorodos ---------- */
  const initMisc = () => {
    $$('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });
    $$('a[href^="http"]').forEach((a) => { if (!a.host.includes(location.host)) { a.target = '_blank'; a.rel = 'noopener'; } });
    $$('[data-progress]').forEach((p) => {
      const fill = $('.progress__fill', p);
      const run = () => { fill.style.width = Math.min(100, parseFloat(p.dataset.progress)) + '%'; };
      if (inviewObserver && !reduceMotion) { const io = new IntersectionObserver((en) => { if (en[0].isIntersecting) { run(); io.disconnect(); } }, { threshold: .4 }); io.observe(p); } else run();
    });
  };

  /* ---------- Paleidimas ---------- */
  window.PF = { $, $$, esc, plural, nf, normalize, debounce, toast, store, lightbox, modal, observeReveal, reduceMotion };
  const init = () => {
    initMockbar(); initHeader(); initSearch(); initSubnav(); observeReveal(); initSplit(); initParallax(); initCounters(); initVideo(); initToggles(); lightbox.bind(); initModals(); initForms(); initFilters(); initCookie(); initMisc();
    doc.dispatchEvent(new CustomEvent('pf:ready'));
  };
  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', init); else init();
})();
