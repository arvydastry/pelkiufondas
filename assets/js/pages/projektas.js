/* Projektas (vieno projekto šablonas) – puslapio scenarijus (vanilla, IIFE).
   1) Mažas Leaflet žemėlapis su vienu žymekliu (WP: Salient Interactive Map / Leaflet Map įskiepis);
   2) „Prieš / po“ palyginimas: du <img> + <input type="range">, clip-path (WP: Salient Image Comparison);
   3) Dalinimosi mygtukai su dabartine puslapio nuoroda (WP: Salient Social sharing + „kopijuoti nuorodą“).
   Naudoja window.PF pagalbines funkcijas iš assets/js/main.js. */
(function () {
  'use strict';

  function initMap(PF) {
    var el = document.getElementById('map');
    if (!el) return;
    var fallback = el.querySelector('.map__fallback');
    if (!window.L) {
      if (fallback) fallback.textContent = 'Žemėlapis nepasiekiamas (reikia interneto ryšio iki OpenStreetMap).';
      return;
    }
    var lat = parseFloat(el.dataset.lat || '56.12');
    var lng = parseFloat(el.dataset.lng || '24.95');
    var title = el.dataset.title || 'Projekto teritorija';
    var place = el.dataset.place || '';
    if (fallback) fallback.remove();

    var map = window.L.map(el, { scrollWheelZoom: false, zoomControl: true, attributionControl: true }).setView([lat, lng], 10);
    window.L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> bendraautoriai'
    }).addTo(map);

    var icon = window.L.divIcon({ className: '', html: '<span class="map-marker" aria-hidden="true"></span>', iconSize: [30, 30], iconAnchor: [15, 30], popupAnchor: [0, -28] });
    var marker = window.L.marker([lat, lng], { icon: icon, title: title, alt: title }).addTo(map);
    marker.bindPopup('<strong>' + PF.esc(title) + '</strong>' + (place ? PF.esc(place) + '<br>' : '') + '<a href="projektai.html">Visi projektai žemėlapyje</a>');
    marker.openPopup();

    /* Klaviatūra: sufokusavus žemėlapį – ratuko mastelis leidžiamas, išėjus – vėl išjungtas */
    el.addEventListener('focusin', function () { map.scrollWheelZoom.enable(); });
    el.addEventListener('focusout', function () { map.scrollWheelZoom.disable(); });
    setTimeout(function () { map.invalidateSize(); }, 300);
  }

  function initCompare() {
    var boxes = document.querySelectorAll('[data-compare]');
    Array.prototype.forEach.call(boxes, function (box) {
      var range = box.querySelector('.compare__range');
      if (!range) return;
      var set = function (v) {
        var n = Math.max(0, Math.min(100, parseFloat(v) || 0));
        box.style.setProperty('--pos', n + '%');
        range.setAttribute('aria-valuetext', 'Rodoma „po“ ' + Math.round(n) + ' % kadro');
      };
      range.addEventListener('input', function () { set(range.value); });
      range.addEventListener('change', function () { set(range.value); });
      /* Paspaudus ant kadro – slankiklis peršoka į tą vietą (patogu jutikliniame ekrane) */
      box.addEventListener('pointerdown', function (e) {
        if (e.target !== range) return;
        var r = box.getBoundingClientRect();
        if (!r.width) return;
        var v = ((e.clientX - r.left) / r.width) * 100;
        range.value = String(Math.round(v));
        set(v);
      });
      set(range.value);
    });
  }

  function initShare(PF) {
    var wrap = document.querySelector('[data-share]');
    if (!wrap) return;
    var url = window.location.href.split('#')[0];
    var title = document.title;
    var fb = wrap.querySelector('[data-share-fb]');
    var li = wrap.querySelector('[data-share-li]');
    var mail = wrap.querySelector('[data-share-mail]');
    var copy = wrap.querySelector('[data-copy]');
    var native = wrap.querySelector('[data-share-native]');
    if (fb) fb.href = 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(url);
    if (li) li.href = 'https://www.linkedin.com/sharing/share-offsite/?url=' + encodeURIComponent(url);
    if (mail) mail.href = 'mailto:?subject=' + encodeURIComponent(title) + '&body=' + encodeURIComponent(title + '\n' + url);
    if (copy) copy.setAttribute('data-copy', url);
    if (native) {
      if (navigator.share) {
        native.hidden = false;
        native.addEventListener('click', function () {
          navigator.share({ title: title, url: url }).catch(function () { /* atšaukta – tyliai */ });
        });
      } else {
        native.hidden = true;
      }
    }
    /* Makete socialinių tinklų nuorodos atidaromos naujame lange (main.js tai daro visoms išorinėms nuorodoms) */
    if (PF && PF.toast) {
      wrap.addEventListener('click', function (e) {
        var a = e.target.closest ? e.target.closest('a[data-share-fb], a[data-share-li]') : null;
        if (a) PF.toast('Maketas: dalinimasis atidaro socialinio tinklo langą su šio puslapio nuoroda.');
      });
    }
  }

  function start() {
    var PF = window.PF || { esc: function (s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); } };
    initMap(PF);
    initCompare();
    initShare(PF);
  }

  if (window.PF) start();
  else document.addEventListener('pf:ready', start, { once: true });
})();
