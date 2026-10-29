/* Veiklos ataskaitos – dokumentų katalogo filtrai: metai × tipas × kalba × paieška.
   Maketo logika; WordPress'e tą patį daro Document Library Lite (taksonomijos: metai, tipas, kalba)
   arba Salient Post Loop Builder su filtrų juosta. Naudoja window.PF pagalbines funkcijas (main.js). */
(() => {
  'use strict';

  const run = () => {
    const PF = window.PF;
    if (!PF) return;
    const { $, $$, normalize, plural, debounce } = PF;

    const panel = $('[data-rf]');
    if (!panel) return;

    const docs = $$('.doc[data-tags]', panel);
    const years = $$('[data-rf-year]', panel);
    const pills = $$('.pill[data-rf-group]', panel);
    const search = $('[data-rf-search]', panel);
    const countEl = $('[data-rf-count]', panel);
    const empty = $('[data-rf-empty]', panel);
    const clears = $$('[data-rf-clear]', panel);

    const FORMS = ['dokumentas', 'dokumentai', 'dokumentų'];
    const GROUPS = ['y', 't', 'l'];
    const PREFIX = { y: 'y-', t: 't-', l: 'lang-' };
    const state = { y: 'all', t: 'all', l: 'all', q: '' };

    const tagsOf = (el) => (el.dataset.tags || '').split(/\s+/).filter(Boolean);
    const okGroup = (tags, g, v) => v === 'all' || tags.includes(PREFIX[g] + v);
    const okQuery = (el) => !state.q || normalize(el.textContent + ' ' + (el.dataset.keywords || '')).includes(state.q);
    const isFiltering = () => GROUPS.some((g) => state[g] !== 'all') || !!state.q;
    const matches = (el, override) => {
      const tags = tagsOf(el);
      return GROUPS.every((g) => okGroup(tags, g, override && override.g === g ? override.v : state[g])) && okQuery(el);
    };

    const setExpanded = (year, open) => {
      const btn = $('.toggle__btn', year);
      if (btn) btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    };

    const apply = (reason) => {
      let visible = 0;
      docs.forEach((d) => {
        const show = matches(d);
        d.hidden = !show;
        if (show) visible++;
      });

      years.forEach((y) => {
        const n = $$('.doc[data-tags]', y).filter((d) => !d.hidden).length;
        y.hidden = n === 0;
        const c = $('[data-rf-year-count]', y);
        if (c) c.textContent = n + ' ' + plural(n, FORMS);
        /* filtruojant – išskleisti blokus, kuriuose yra rezultatų */
        if (n > 0 && reason === 'user' && isFiltering()) setExpanded(y, true);
      });

      /* skaitikliai ant mygtukų: kiek būtų rezultatų pasirinkus šį filtrą (kiti filtrai ir paieška galioja) */
      pills.forEach((p) => {
        const c = $('.pill__count', p);
        if (!c) return;
        const k = docs.filter((d) => matches(d, { g: p.dataset.rfGroup, v: p.dataset.rf })).length;
        c.textContent = k;
      });

      if (countEl) {
        countEl.innerHTML = '<b>' + visible + '</b> ' + plural(visible, FORMS) + (isFiltering() ? ' pagal pasirinktus filtrus' : ' iš viso');
      }
      if (empty) empty.hidden = visible > 0;
      clears.forEach((b) => { b.hidden = !isFiltering(); });
      panel.classList.toggle('is-filtering', isFiltering());
      panel.dispatchEvent(new CustomEvent('pf:filtered', { detail: { year: state.y, type: state.t, lang: state.l, q: state.q, visible } }));
    };

    const setGroup = (g, v) => {
      state[g] = v;
      pills.filter((p) => p.dataset.rfGroup === g).forEach((p) => p.setAttribute('aria-pressed', p.dataset.rf === v ? 'true' : 'false'));
    };

    pills.forEach((p) => p.addEventListener('click', () => {
      setGroup(p.dataset.rfGroup, p.dataset.rf);
      apply('user');
    }));

    if (search) {
      search.addEventListener('input', debounce(() => {
        state.q = normalize(search.value.trim());
        apply('user');
      }, 90));
      const form = search.closest('form');
      if (form) form.addEventListener('submit', (e) => e.preventDefault());
    }

    const clearAll = () => {
      GROUPS.forEach((g) => setGroup(g, 'all'));
      state.q = '';
      if (search) search.value = '';
      apply('clear');
      /* grąžinti pradinį vaizdą: atidaryti tik naujausi metai */
      years.forEach((y, i) => setExpanded(y, i === 0));
      if (search) search.focus();
    };
    clears.forEach((b) => b.addEventListener('click', clearAll));

    /* Išskleisti / suskleisti visus metų blokus */
    $$('[data-rf-expand]', panel).forEach((b) => b.addEventListener('click', () => {
      const open = b.dataset.rfExpand === '1';
      years.forEach((y) => setExpanded(y, open));
    }));

    /* Pradinė būsena iš URL: ?metai=2023&tipas=veiklos&kalba=en&q=auditas ir #m-2021 */
    const params = new URLSearchParams(location.search);
    const MAP = { metai: 'y', tipas: 't', kalba: 'l' };
    Object.keys(MAP).forEach((key) => {
      const v = params.get(key);
      if (v && pills.some((p) => p.dataset.rfGroup === MAP[key] && p.dataset.rf === v)) setGroup(MAP[key], v);
    });
    const q = params.get('q');
    if (q && search) { search.value = q; state.q = normalize(q.trim()); }
    if (location.hash) {
      const target = years.find((y) => '#' + y.id === location.hash);
      if (target) setExpanded(target, true);
    }

    apply(isFiltering() ? 'user' : 'init');
  };

  if (window.PF) run();
  else document.addEventListener('pf:ready', run, { once: true });
})();
