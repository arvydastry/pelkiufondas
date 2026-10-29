/* Terminų žodynas – puslapio scenarijus.
   Filtrus, paiešką ir skaitiklį tvarko assets/js/main.js (data-filter-group).
   Čia: „Išskleisti visus / Suskleisti visus“, raidžių skirtukų slėpimas, automatinis išskleidimas
   ieškant, paieškos išvalymas, nuorodos į terminą kopijavimas ir URL #terminas atidarymas.
   WordPress'e: tas pats lengvas JS prie Salient Toggle Panels (arba FacetWP + Toggle). */
(() => {
  'use strict';

  const run = () => {
    const PF = window.PF;
    if (!PF) return;
    const { $, $$ } = PF;
    const list = $('[data-glossary]');
    if (!list) return;
    const group = list.closest('[data-filter-group]') || document;
    const terms = $$('.gl-term', list);
    const letters = $$('.gl-letter', list);
    const expandBtn = $('[data-expand-all]');
    const search = $('[data-filter-search]', group);
    const clearBtn = $('.gl-search__clear', group);

    const btnOf = (t) => $('.toggle__btn', t);
    const isOpen = (t) => { const b = btnOf(t); return !!b && b.getAttribute('aria-expanded') === 'true'; };
    const setOpen = (t, open) => {
      const b = btnOf(t);
      if (!b) return;
      b.setAttribute('aria-expanded', open ? 'true' : 'false');
      t.classList.toggle('is-open', open);
    };
    const visible = () => terms.filter((t) => !t.hidden);
    const tagsOf = (t) => (t.dataset.tags || '').split(/\s+/);

    /* ---------- „Išskleisti visus / Suskleisti visus“ ---------- */
    const ICON_OUT = '<i class="ph ph-arrows-out-line-vertical" aria-hidden="true"></i> Išskleisti visus';
    const ICON_IN = '<i class="ph ph-arrows-in-line-vertical" aria-hidden="true"></i> Suskleisti visus';
    const updateExpandBtn = () => {
      if (!expandBtn) return;
      const v = visible();
      const allOpen = v.length > 0 && v.every(isOpen);
      expandBtn.setAttribute('aria-pressed', allOpen ? 'true' : 'false');
      expandBtn.innerHTML = allOpen ? ICON_IN : ICON_OUT;
    };
    if (expandBtn) {
      expandBtn.addEventListener('click', () => {
        const v = visible();
        const allOpen = v.length > 0 && v.every(isOpen);
        v.forEach((t) => setOpen(t, !allOpen));
        updateExpandBtn();
      });
    }

    /* Būsenos klasė (is-open) sinchronizuojama su main.js nustatomu aria-expanded */
    terms.forEach((t) => {
      t.classList.toggle('is-open', isOpen(t));
      const b = btnOf(t);
      b && b.addEventListener('click', () => { t.classList.toggle('is-open', isOpen(t)); updateExpandBtn(); });
    });

    /* ---------- Raidžių skirtukai ir automatinis išskleidimas ieškant ---------- */
    const onFiltered = (e) => {
      letters.forEach((h) => {
        const key = 'l-' + (h.dataset.letter || '');
        h.hidden = !terms.some((t) => !t.hidden && tagsOf(t).includes(key));
      });
      const q = e && e.detail ? String(e.detail.q || '') : '';
      if (q.length >= 2) visible().forEach((t) => setOpen(t, true));
      updateExpandBtn();
    };
    group.addEventListener('pf:filtered', onFiltered);
    onFiltered();

    /* ---------- Paieškos išvalymas ---------- */
    const syncClear = () => { if (clearBtn) clearBtn.hidden = !(search && search.value.trim()); };
    if (search) {
      search.addEventListener('input', () => {
        syncClear();
        /* Pradėjus rašyti, aktyvus raidės filtras nuimamas (tema lieka) – kad paieška nebūtų „tuščia“ dėl raidės */
        const letterOn = $$('.gl-letters .pill[aria-pressed="true"]', group).length > 0;
        if (letterOn && search.value.trim()) { const all = $('[data-filter="all"]', group); all && all.click(); }
      });
    }
    if (clearBtn && search) {
      clearBtn.addEventListener('click', () => {
        search.value = '';
        search.dispatchEvent(new Event('input', { bubbles: true }));
        search.focus();
      });
    }
    syncClear();

    /* ---------- Nuorodos į terminą kopijavimas (main.js apdoroja data-copy) ---------- */
    const base = location.href.split('#')[0];
    $$('[data-copy^="#"]', list).forEach((b) => { b.dataset.copy = base + b.dataset.copy; });

    /* ---------- URL #terminas → atidaryti ir parodyti ---------- */
    const slug = (s) => PF.normalize(s).replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    const findByHash = (hash) => {
      let id = '';
      try { id = decodeURIComponent((hash || '').replace(/^#/, '')); } catch (err) { id = (hash || '').replace(/^#/, ''); }
      if (!id) return null;
      const el = document.getElementById(id);
      if (el && el.classList.contains('gl-term')) return el;
      const s = slug(id);
      if (!s) return null;
      return terms.find((t) => t.id === s) || terms.find((t) => { const n = $('.gl-term__name', t); return !!n && slug(n.textContent).indexOf(s) === 0; }) || null;
    };
    const openFromHash = () => {
      const t = findByHash(location.hash);
      if (!t) return;
      if (t.hidden) { const clr = $('[data-filter-clear]', group); clr && clr.click(); }
      setOpen(t, true);
      updateExpandBtn();
      terms.forEach((x) => x.classList.remove('is-target'));
      t.classList.add('is-target');
      window.requestAnimationFrame(() => {
        t.scrollIntoView({ behavior: PF.reduceMotion ? 'auto' : 'smooth', block: 'start' });
        const b = btnOf(t);
        if (b) { try { b.focus({ preventScroll: true }); } catch (err) { b.focus(); } }
      });
    };
    window.addEventListener('hashchange', openFromHash);
    openFromHash();
  };

  if (window.PF) run();
  else document.addEventListener('pf:ready', run, { once: true });
})();
