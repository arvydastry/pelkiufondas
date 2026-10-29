/* Salient įgyvendinimo gidas – kodo kopijavimas ir „Išskleisti visus / Suskleisti“ puslapių sąrašui.
   Dokumentas į WordPress nekeliamas. Naudoja window.PF (main.js). */
(() => {
  'use strict';

  const run = () => {
    const PF = window.PF;
    if (!PF) return;
    const { $$, toast } = PF;

    /* Kodo blokų kopijavimas */
    $$('.sg-copy').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const code = btn.parentElement.querySelector('code');
        if (!code) return;
        const text = code.innerText;
        const done = () => {
          btn.textContent = 'Nukopijuota';
          btn.classList.add('is-done');
          toast('Kodas nukopijuotas');
          setTimeout(() => { btn.textContent = 'Kopijuoti'; btn.classList.remove('is-done'); }, 1600);
        };
        try {
          if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(text);
          } else {
            const ta = document.createElement('textarea');
            ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'absolute'; ta.style.left = '-9999px';
            document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove();
          }
          done();
        } catch (e) {
          toast('Nepavyko nukopijuoti – pažymėkite tekstą rankiniu būdu');
        }
      });
    });

    /* Išskleisti / suskleisti visus puslapių blokus (3 skyrius) */
    $$('[data-sg-expand]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const open = btn.dataset.sgExpand === 'open';
        $$('.sg-pages .toggle__btn').forEach((t) => t.setAttribute('aria-expanded', open ? 'true' : 'false'));
      });
    });

    /* Atidaryti puslapio bloką, jei atėjome su inkaru #p-puslapis */
    const openFromHash = () => {
      const id = location.hash && location.hash.slice(1);
      if (!id || !id.startsWith('p-')) return;
      const box = document.getElementById(id);
      const t = box && box.querySelector('.toggle__btn');
      if (t) t.setAttribute('aria-expanded', 'true');
    };
    openFromHash();
    window.addEventListener('hashchange', openFromHash);
  };

  if (window.PF) run(); else document.addEventListener('pf:ready', run, { once: true });
})();
