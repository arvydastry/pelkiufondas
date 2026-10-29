/* Projektai – Leaflet žemėlapis (OpenStreetMap plytelės), sinchronizuotas su main.js filtrų grupe:
   main.js filtruoja korteles (data-tags, paieška, skaitiklis) ir siunčia įvykį pf:filtered; čia rodomi tik
   matomų kortelių žymekliai. WordPress'e: įrašų tipas „Projektai“ su laukais lat/lng, statusas, tema →
   Leaflet Map įskiepis (arba Salient Interactive Map) + Post Loop Builder filtrai.
   Koordinatės apytikslės (rajono / vietovės centras); nacionaliniai ir tarptautiniai projektai – prie būstinės Vilniuje. */
(() => {
  'use strict';

  const PROJECTS = [
    { id: 'guodziu-durpyno-atkurimas', title: 'Guodžių durpyno atkūrimas ir apsauga', lat: 56.12, lng: 24.95, status: 'vykdomas', theme: 'atkurimas', place: 'Guodžių durpių gavybos karjeras, Biržų r.', years: '2026–2029', extra: '~100 ha' },
    { id: 'life-super-eu', title: 'Daugiau atkurtų pelkių Europoje (LIFE SUPER EU)', lat: 54.687, lng: 25.28, status: 'vykdomas', theme: 'klimatas', place: '7 ES šalys (koordinuoja Vokietija)', years: '2025–2030', extra: '1 285 ha', hq: true },
    { id: 'wetbeings-aukstumala', title: 'WETBEINGS. Aukštumala – gyvasis pelkių pasaulis', lat: 55.37, lng: 21.38, status: 'vykdomas', theme: 'svietimas', place: 'Aukštumalos aukštapelkė, Šilutės r.', years: '2025–2027' },
    { id: 'paluwise', title: 'PaluWise: pelkininkystės plėtra ES link', lat: 54.687, lng: 25.28, status: 'vykdomas', theme: 'pelkininkyste', place: 'ES šalys; Lietuvoje – biomasės pilotai', years: '2024–2028', hq: true },
    { id: 'life-foresthabitatlt', title: 'LIFE ForestHabitatLT: artimesnė gamtai miškininkystė', lat: 55.6, lng: 23.25, status: 'vykdomas', theme: 'biologine-ivairove', place: 'Šimonių giria, Buktos miškas, Praviršulio tyrelis, Dabravolės durpynas', years: '2024–2030' },
    { id: 'paazuolynes-durpynas', title: 'Paąžuolynės durpyno hidrologinio režimo atkūrimas', lat: 55.12, lng: 24.35, status: 'vykdomas', theme: 'atkurimas', place: 'Paąžuolynės durpynas, Jonavos r.', years: '2024–2026' },
    { id: 'durpiu-karjeru-atkurimas', title: 'Išeksploatuotų durpynų atkūrimas derinant pelkininkystę (Ežerėlio durpynas)', lat: 54.87, lng: 23.63, status: 'testinis', theme: 'pelkininkyste', place: 'Ežerėlio durpynas, Kauno r.', years: 'nuo 2020 m.' },
    { id: 'savepeatlands', title: 'SavePeatLands: durpynų atkūrimo skatinimas LT–PL pasienyje', lat: 54.56, lng: 23.35, status: 'igyvendintas', theme: 'svietimas', place: 'Lietuvos ir Lenkijos pasienio regionas', years: '2024–2025' },
    { id: 'pelkes-klimatui', title: 'PELKĖS KLIMATUI: pelkių atkūrimo skatinimas ir ŠESD mažinimas', lat: 54.687, lng: 25.28, status: 'igyvendintas', theme: 'politika', place: 'Visa Lietuva (advokacija, edukacija, konferencija LR Seime)', years: '2024–2025', hq: true },
    { id: 'tartoko-pelke', title: 'Tartoko pelkės hidrologinio režimo atkūrimas', lat: 54.65, lng: 23.97, status: 'igyvendintas', theme: 'atkurimas', place: 'Tartoko pelkė, Nemuno kilpų regioninis parkas, Prienų r.', years: '2022–2024', extra: '38 ha' },
    { id: 'nvo-pajegumai-co2-kompensavimas', title: 'Aplinkosauginių NVO pajėgumų didinimas CO₂ kompensavimo procesuose', lat: 54.687, lng: 25.28, status: 'igyvendintas', theme: 'klimatas', place: 'Visa Lietuva', years: '2022–2023', hq: true },
    { id: 'euki-pelkininkyste', title: 'EUKI – pelkininkystės plėtra žemės ūkyje Baltijos šalyse', lat: 54.687, lng: 25.28, status: 'igyvendintas', theme: 'pelkininkyste', place: 'Lietuva, Latvija, Estija', years: '2021–2024', hq: true },
    { id: 'aukstumalos-atkurimas-2021', title: 'Aukštumalos aukštapelkės pietvakarinės dalies atkūrimas (2021 m.)', lat: 55.37, lng: 21.38, status: 'igyvendintas', theme: 'atkurimas', place: 'Aukštumalos telmologinis draustinis, Šilutės r.', years: '2021', extra: '242 užtūros' },
    { id: 'issaugok-praeiti-ateiciai-lli-476', title: 'Išsaugok praeitį ateičiai (LLI-476)', lat: 55.73, lng: 26.25, status: 'igyvendintas', theme: 'biologine-ivairove', place: 'Zarasų kraštas ir Latgala (Latvija)', years: '2020–2022' },
    { id: 'baisogala-zemapelke', title: 'Parodomasis žemapelkės atkūrimas Baisogaloje', lat: 55.62, lng: 23.75, status: 'igyvendintas', theme: 'pelkininkyste', place: 'Kemerų k., Baisogalos apylinkės, Radviliškio r.', years: '2020–2021', extra: '~6 ha' }
  ];

  const STATUS = {
    vykdomas: { label: 'Vykdomas', marker: '', tag: 'tag--live' },
    igyvendintas: { label: 'Įgyvendintas', marker: 'map-marker--done', tag: 'tag--done' },
    testinis: { label: 'Tęstinis', marker: 'map-marker--sun', tag: 'tag--soon' }
  };
  const THEME = {
    atkurimas: 'Atkūrimas',
    pelkininkyste: 'Pelkininkystė',
    'biologine-ivairove': 'Biologinė įvairovė',
    klimatas: 'Klimatas',
    svietimas: 'Švietimas',
    politika: 'Politika'
  };
  const LT_BOUNDS = [[53.85, 20.85], [56.5, 26.9]];
  const FORMS = ['projektas', 'projektai', 'projektų'];

  /* Keli projektai turi tas pačias (apytiksles) koordinates – išdėstome juos ratu, kad visi žymekliai būtų pasiekiami */
  const spread = (list) => {
    const groups = {};
    list.forEach((p) => {
      const key = p.lat + ',' + p.lng;
      (groups[key] = groups[key] || []).push(p);
    });
    Object.keys(groups).forEach((key) => {
      const g = groups[key];
      if (g.length < 2) return;
      const r = 0.055;
      g.forEach((p, i) => {
        const a = (Math.PI * 2 * i) / g.length - Math.PI / 2;
        p.mlat = p.lat + r * Math.sin(a);
        p.mlng = p.lng + r * 1.7 * Math.cos(a);
      });
    });
    list.forEach((p) => {
      if (p.mlat === undefined) { p.mlat = p.lat; p.mlng = p.lng; }
    });
  };

  const run = () => {
    const PF = window.PF;
    const L = window.L;
    const mapEl = document.getElementById('map');
    if (!PF || !L || !mapEl) return;
    const { $, $$, esc, plural, reduceMotion } = PF;

    const group = mapEl.closest('[data-filter-group]');
    const countEl = $('[data-map-count]');
    spread(PROJECTS);

    const map = L.map(mapEl, {
      scrollWheelZoom: false,
      zoomAnimation: !reduceMotion,
      fadeAnimation: !reduceMotion,
      markerZoomAnimation: !reduceMotion,
      zoomSnap: 0.5
    });
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> autoriai'
    }).addTo(map);
    map.fitBounds(LT_BOUNDS, { animate: false });

    /* Slinkimo ratukas keičia mastelį tik kai žemėlapis aktyvuotas (nestabdo puslapio slinkimo) */
    map.on('click focus', () => map.scrollWheelZoom.enable());
    map.on('mouseout blur', () => map.scrollWheelZoom.disable());

    const popupHtml = (p) => {
      const s = STATUS[p.status] || STATUS.vykdomas;
      const hq = p.hq ? '<span><i class="ph ph-info" aria-hidden="true"></i>Nacionalinis / tarptautinis projektas – žymimas prie fondo būstinės Vilniuje</span>' : '';
      const extra = p.extra ? '<span><i class="ph ph-ruler" aria-hidden="true"></i>' + esc(p.extra) + '</span>' : '';
      return '<div class="pj-popup">' +
        '<span class="tag ' + s.tag + '">' + s.label + '</span>' +
        '<strong>' + esc(p.title) + '</strong>' +
        '<span class="pj-popup__meta">' +
          '<span><i class="ph ph-map-pin" aria-hidden="true"></i>' + esc(p.place) + '</span>' +
          '<span><i class="ph ph-calendar-blank" aria-hidden="true"></i>' + esc(p.years) + ' · ' + esc(THEME[p.theme] || p.theme) + '</span>' +
          extra + hq +
        '</span>' +
        '<span class="pj-popup__links">' +
          '<a class="link-arrow" href="projektas.html">Skaityti daugiau <i class="ph ph-arrow-right" aria-hidden="true"></i></a>' +
          '<a class="link-u" href="#p-' + esc(p.id) + '" data-goto="p-' + esc(p.id) + '">Kortelė sąraše</a>' +
        '</span>' +
      '</div>';
    };

    const layer = L.layerGroup().addTo(map);
    const markers = PROJECTS.map((p) => {
      const s = STATUS[p.status] || STATUS.vykdomas;
      const marker = L.marker([p.mlat, p.mlng], {
        icon: L.divIcon({ className: '', html: '<span class="map-marker ' + s.marker + '"></span>', iconSize: [30, 30], iconAnchor: [15, 30], popupAnchor: [0, -30] }),
        title: p.title + ' – ' + s.label,
        riseOnHover: true
      });
      marker.bindPopup(popupHtml(p), { maxWidth: 320 });
      return { p, marker };
    });

    const cardOf = (p) => document.getElementById('p-' + p.id);

    /* Žymekliai = matomos kortelės (po main.js filtrų) */
    const sync = () => {
      const pts = [];
      markers.forEach(({ p, marker }) => {
        const card = cardOf(p);
        const show = !card || !card.hidden;
        if (show) {
          if (!layer.hasLayer(marker)) layer.addLayer(marker);
          pts.push(marker.getLatLng());
        } else if (layer.hasLayer(marker)) {
          marker.closePopup();
          layer.removeLayer(marker);
        }
      });
      if (countEl) countEl.textContent = pts.length + ' ' + plural(pts.length, FORMS);
      if (pts.length) {
        map.fitBounds(L.latLngBounds(pts).pad(0.3), { maxZoom: 9, padding: [24, 24], animate: !reduceMotion });
      } else {
        map.fitBounds(LT_BOUNDS, { animate: !reduceMotion });
      }
    };
    if (group) group.addEventListener('pf:filtered', sync);
    sync();

    /* Popup nuoroda „Kortelė sąraše“ – trumpam išryškina kortelę */
    map.on('popupopen', (e) => {
      const el = e.popup.getElement();
      const go = el && $('[data-goto]', el);
      if (!go) return;
      go.addEventListener('click', () => {
        const card = document.getElementById(go.dataset.goto);
        if (!card) return;
        $$('.pj-card--hot').forEach((c) => c.classList.remove('pj-card--hot'));
        card.classList.add('pj-card--hot');
        setTimeout(() => card.classList.remove('pj-card--hot'), 2600);
      });
    });

    /* Kortelė ↔ žymeklis: užvedus ar fokusavus kortelę, jos žymeklis išryškinamas */
    markers.forEach(({ p, marker }) => {
      const card = cardOf(p);
      if (!card) return;
      const hot = (on) => {
        const el = marker.getElement();
        const dot = el && $('.map-marker', el);
        if (dot) dot.classList.toggle('is-hot', on);
        marker.setZIndexOffset(on ? 1000 : 0);
      };
      card.addEventListener('mouseenter', () => hot(true));
      card.addEventListener('mouseleave', () => hot(false));
      card.addEventListener('focusin', () => hot(true));
      card.addEventListener('focusout', () => hot(false));
    });

    /* Dydžio perskaičiavimas po šriftų įkrovimo / langui keičiantis */
    window.addEventListener('load', () => map.invalidateSize());
    if ('ResizeObserver' in window) {
      new ResizeObserver(PF.debounce(() => map.invalidateSize(), 120)).observe(mapEl);
    }
  };

  if (window.PF) run();
  else document.addEventListener('pf:ready', run, { once: true });
})();
