/* Publikacijos – katalogo filtrai: tipas × kalba × paieška, grupės pagal tipą, skaitiklis.
   Maketo logika; WordPress'e tą patį daro Document Library Lite (taksonomijos: tipas, kalba, projektas)
   arba Salient Post Loop Builder su filtrų juosta. Naudoja window.PF pagalbines funkcijas (main.js). */
(() => {
  'use strict';

  const run = () => {
    const PF = window.PF;
    if (!PF) return;
    const { $, $$, normalize, plural, debounce } = PF;

    const panel = $('[data-pb]');
    if (!panel) return;

    const docs = $$('.doc[data-tags]', panel);
    const groups = $$('[data-pb-type]', panel);
    const blocks = $$('[data-pb-block]', panel);
    const pills = $$('.pill[data-pb-group]', panel);
    const search = $('[data-pb-search]', panel);
    const countEl = $('[data-pb-count]', panel);
    const empty = $('[data-pb-empty]', panel);
    const clears = $$('[data-pb-clear]', panel);

    const FORMS = ['publikacija', 'publikacijos', 'publikacijų'];
    const GROUPS = ['t', 'l'];
    const PREFIX = { t: 't-', l: 'lang-' };
    const state = { t: 'all', l: 'all', q: '' };

    const tagsOf = (el) => (el.dataset.tags || '').split(/\s+/).filter(Boolean);
    const okGroup = (tags, g, v) => v === 'all' || tags.includes(PREFIX[g] + v);
    const okQuery = (el) => !state.q || normalize(el.textContent + ' ' + (el.dataset.keywords || '')).includes(state.q);
    const isFiltering = () => GROUPS.some((g) => state[g] !== 'all') || !!state.q;
    const matches = (el, override) => {
      const tags = tagsOf(el);
      return GROUPS.every((g) => okGroup(tags, g, override && override.g === g ? override.v : state[g])) && okQuery(el);
    };

    const apply = () => {
      let visible = 0;
      docs.forEach((d) => {
        const show = matches(d);
        d.hidden = !show;
        if (show) visible++;
      });

      /* poskyriai (pvz., moksliniai / spaudos straipsniai) be rezultatų – slepiami */
      blocks.forEach((b) => {
        const n = $$('.doc[data-tags]', b).filter((d) => !d.hidden).length;
        b.hidden = n === 0;
      });

      /* tipų grupės: slepiamos be rezultatų, skaitiklis antraštėje */
      groups.forEach((g) => {
        const n = $$('.doc[data-tags]', g).filter((d) => !d.hidden).length;
        g.hidden = n === 0;
        const c = $('[data-pb-type-count]', g);
        if (c) c.textContent = n + ' ' + plural(n, FORMS);
      });

      /* skaitikliai ant mygtukų: kiek būtų rezultatų pasirinkus šį filtrą (kiti filtrai ir paieška galioja) */
      pills.forEach((p) => {
        const c = $('.pill__count', p);
        if (!c) return;
        const k = docs.filter((d) => matches(d, { g: p.dataset.pbGroup, v: p.dataset.pb })).length;
        c.textContent = k;
      });

      if (countEl) {
        countEl.innerHTML = '<b>' + visible + '</b> ' + plural(visible, FORMS) + (isFiltering() ? ' pagal pasirinktus filtrus' : ' iš viso');
      }
      if (empty) empty.hidden = visible > 0;
      clears.forEach((b) => { b.hidden = !isFiltering(); });
      panel.classList.toggle('is-filtering', isFiltering());
      panel.dispatchEvent(new CustomEvent('pf:filtered', { detail: { type: state.t, lang: state.l, q: state.q, visible } }));
    };

    const setGroup = (g, v) => {
      state[g] = v;
      pills.filter((p) => p.dataset.pbGroup === g).forEach((p) => p.setAttribute('aria-pressed', p.dataset.pb === v ? 'true' : 'false'));
    };

    pills.forEach((p) => p.addEventListener('click', () => {
      setGroup(p.dataset.pbGroup, p.dataset.pb);
      apply();
    }));

    if (search) {
      search.addEventListener('input', debounce(() => {
        state.q = normalize(search.value.trim());
        apply();
      }, 90));
      const form = search.closest('form');
      if (form) form.addEventListener('submit', (e) => e.preventDefault());
    }

    const clearAll = () => {
      GROUPS.forEach((g) => setGroup(g, 'all'));
      state.q = '';
      if (search) search.value = '';
      apply();
      if (search) search.focus();
    };
    clears.forEach((b) => b.addEventListener('click', clearAll));

    /* Pradinė būsena iš URL: ?tipas=knyga&kalba=en&q=metanas (arba ?f=knyga – bendra maketo konvencija) */
    const params = new URLSearchParams(location.search);
    const MAP = { tipas: 't', f: 't', kalba: 'l' };
    Object.keys(MAP).forEach((key) => {
      const v = params.get(key);
      if (v && pills.some((p) => p.dataset.pbGroup === MAP[key] && p.dataset.pb === v)) setGroup(MAP[key], v);
    });
    const q = params.get('q');
    if (q && search) { search.value = q; state.q = normalize(q.trim()); }

    apply();
  };

  if (window.PF) run();
  else document.addEventListener('pf:ready', run, { once: true });
})();
