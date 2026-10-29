/* Galerija – puslapio scenarijus (vanilla, IIFE). Naudoja window.PF iš assets/js/main.js.
   1) Peržiūra (lightbox) atidaroma tik iš MATOMŲ (filtruotų) nuotraukų – main.js grupuoja visas;
   2) pasirinktas filtras įrašomas į URL (?f=tema), kad nuoroda būtų dalinama (main.js ją perskaito);
   3) ekrano skaitytuvui pranešama, kiek nuotraukų rodoma (role=status jau HTML'e). */
(function () {
  'use strict';

  function start() {
    var PF = window.PF;
    if (!PF || !PF.lightbox) return;
    var group = document.querySelector('#galerija [data-filter-group]');
    var gallery = document.querySelector('#galerija .gallery');
    if (!group || !gallery) return;

    var items = Array.prototype.slice.call(gallery.querySelectorAll('.gallery__item[data-lightbox]'));
    var toEntry = function (el) {
      var img = el.querySelector('img');
      return { src: el.getAttribute('data-src') || (img ? img.currentSrc || img.src : ''), alt: img ? img.alt : '', cap: el.getAttribute('data-cap') || '' };
    };

    /* Capture fazė: perimame paspaudimą prieš main.js klausytoją ant paties mygtuko,
       kad peržiūroje liktų tik šiuo metu matomos nuotraukos (filtras + eilės tvarka). */
    gallery.addEventListener('click', function (e) {
      var btn = e.target.closest ? e.target.closest('.gallery__item[data-lightbox]') : null;
      if (!btn || !gallery.contains(btn)) return;
      e.stopPropagation();
      e.preventDefault();
      var visible = items.filter(function (it) { return !it.hidden; });
      if (!visible.length) return;
      var idx = visible.indexOf(btn);
      PF.lightbox.open(visible.map(toEntry), idx < 0 ? 0 : idx);
    }, true);

    /* Filtro būsena URL'e: ?f=pelkes … (be perkrovimo). */
    group.addEventListener('pf:filtered', function (e) {
      var active = e.detail && e.detail.active;
      try {
        var url = new URL(window.location.href);
        if (!active || active === 'all') url.searchParams.delete('f'); else url.searchParams.set('f', active);
        window.history.replaceState(null, '', url.toString());
      } catch (err) { /* senos naršyklės – tyliai */ }
    });
  }

  if (window.PF) start();
  else document.addEventListener('pf:ready', start, { once: true });
})();
