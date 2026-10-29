/* CO₂ emisijų mažinimas (verslui) – skaičiuoklė.
   Maketo logika: pasirinktas atkuriamos pelkės plotas (1–100 ha) × vidutinis fondo projektų rodiklis
   (≈ 5,3 t CO₂/ha per metus = 580 t CO₂ ÷ ~110 ha) → t CO₂ per metus ir per 25 metus.
   WordPress'e: nedidelis pritaikytas JS blokas (Salient Raw JS / WPCode) arba „Calculated Fields Form“ įskiepis;
   rodiklį administratorius keičia viename nustatyme. Naudoja window.PF pagalbines funkcijas (main.js). */
(() => {
  'use strict';

  const run = () => {
    const PF = window.PF;
    if (!PF) return;
    const { $, $$, nf } = PF;

    const calc = $('[data-calc]');
    if (!calc) return;

    const RATE = parseFloat(calc.dataset.calcRate || '5.3');   /* t CO₂ / ha per metus */
    const YEARS = parseInt(calc.dataset.calcYears || '25', 10); /* laikotarpis, metais */
    const MIN = 1;
    const MAX = 100;

    const range = $('#calc-ha', calc);
    const outHa = $('[data-calc-ha]', calc);
    const outYear = $('[data-calc-year]', calc);
    const outTotal = $('[data-calc-total]', calc);
    const outYears = $$('[data-calc-years]', calc);
    const presets = $$('[data-calc-set]', calc);
    if (!range) return;

    const clamp = (v) => Math.min(MAX, Math.max(MIN, Math.round(v) || MIN));
    const tons = (t) => nf(t, t < 10 ? 1 : 0);

    const render = () => {
      const ha = clamp(parseFloat(range.value));
      const perYear = ha * RATE;
      const total = perYear * YEARS;

      if (outHa) outHa.textContent = nf(ha);
      if (outYear) outYear.textContent = tons(perYear);
      if (outTotal) outTotal.textContent = tons(total);
      outYears.forEach((el) => { el.textContent = nf(YEARS); });

      range.value = String(ha);
      range.setAttribute('aria-valuetext', nf(ha) + ' ha – apie ' + tons(perYear) + ' t CO₂ per metus');
      range.style.setProperty('--p', (((ha - MIN) / (MAX - MIN)) * 100).toFixed(1) + '%');
      presets.forEach((b) => b.setAttribute('aria-pressed', parseInt(b.dataset.calcSet, 10) === ha ? 'true' : 'false'));
    };

    range.addEventListener('input', render);
    range.addEventListener('change', render);
    presets.forEach((b) => b.addEventListener('click', () => {
      range.value = b.dataset.calcSet;
      render();
      range.focus({ preventScroll: true });
    }));

    /* „Aptarti šį plotą“ – pasirinktas plotas perkeliamas į konsultacijos formas (sekcijoje ir modale).
       Modalą atidaro main.js (data-modal-open); čia tik užpildomi laukai. */
    $$('[data-calc-apply]').forEach((b) => b.addEventListener('click', () => {
      const ha = clamp(parseFloat(range.value));
      $$('[data-calc-field]').forEach((inp) => { inp.value = String(ha); });
    }));

    /* Pradinė reikšmė iš URL: co2.html?ha=40 */
    const q = new URLSearchParams(location.search).get('ha');
    if (q && !Number.isNaN(parseFloat(q))) range.value = String(clamp(parseFloat(q)));

    render();
  };

  if (window.PF) run();
  else document.addEventListener('pf:ready', run, { once: true });
})();
