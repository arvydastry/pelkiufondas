/* Prisidėk: paramos formos sumos ir mygtuko tekstas (maketas; WP – GiveWP / WooCommerce). */
(() => {
  'use strict';
  const form = document.getElementById('donate');
  if (!form) return;
  const btn = document.getElementById('donate-btn');
  const custom = document.getElementById('custom-wrap');
  const customInput = document.getElementById('d-kita');
  const monthly = () => document.getElementById('t-month').getAttribute('aria-selected') === 'true';
  const amount = () => { const v = form.querySelector('input[name="suma"]:checked'); return v && v.value === 'kita' ? (parseInt(customInput.value, 10) || 0) : (v ? parseInt(v.value, 10) : 0); };
  const update = () => {
    const kita = form.querySelector('input[name="suma"]:checked')?.value === 'kita';
    custom.hidden = !kita;
    const a = amount();
    btn.innerHTML = (a ? `Paremti ${a} €${monthly() ? ' kas mėnesį' : ''}` : 'Įrašykite sumą') + ' <span class="btn__icon"><i class="ph ph-heart"></i><i class="ph ph-heart"></i></span>';
  };
  form.addEventListener('change', update);
  customInput.addEventListener('input', update);
  form.querySelectorAll('[role="tab"]').forEach((t) => t.addEventListener('click', () => setTimeout(update, 0)));
  update();
})();
