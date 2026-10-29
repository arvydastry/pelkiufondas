# Komponentų žinynas (assets/css/style.css + assets/js/main.js)

Visi puslapiai naudoja tą pačią struktūrą. Kiekvieno puslapio skeletas:

```html
<!doctype html>
<html lang="lt">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Puslapio pavadinimas | Pelkių fondas</title>
  <meta name="description" content="…">
  …įklijuoti partials/head.html…
  <link rel="stylesheet" href="assets/css/pages/PUSLAPIS.css">   <!-- tik jei reikia puslapio stilių -->
</head>
<body class="has-transparent-header" data-nav="pelkes">   <!-- has-transparent-header tik kai pirmas blokas yra video/tamsi antraštė; data-nav: pradinis | pelkes | apie-mus | veikla | naujienos | kontaktai (prisidek – be data-nav) -->
  …įklijuoti partials/header.html…
  <main id="turinys">
    …turinys…
    …(kur tinka) partials/newsletter.html…
  </main>
  …įklijuoti partials/footer.html… (jame jau yra <script src="assets/js/main.js" defer>)
  <script src="assets/js/pages/PUSLAPIS.js" defer></script>   <!-- tik jei reikia -->
</body>
</html>
```

Puslapių failai ir meniu raktai: index.html (pradinis), pelkes.html / terminu-zodynas.html / galerija.html (pelkes), apie-mus.html / veiklos-ataskaitos.html (apie-mus), veikla.html / co2.html / projektai.html / projektas.html / paslaugos.html / publikacijos.html / videoteka.html (veikla), naujienos.html / naujiena.html (naujienos), kontaktai.html (kontaktai), prisidek.html.

## Video (Pexels) – taisyklės
- Fono video: `<div class="video-bg"><img src="POSTER" alt=""><video data-src="MP4_HD" data-src-sd="MP4_SD" muted loop playsinline poster="POSTER"></video></div>` – main.js įkelia video tik priartėjus, sustabdo išslinkus, nekrauna esant `prefers-reduced-motion` ar Save-Data. Overlay variantai: `.video-bg--soft` (tamsesnis kairėje – tekstui), `.video-bg--flat`, `.video-bg--light`. Prie fono pridėti `<span class="video-credit">Video: Pexels / Autorius</span>` ir (hero) `<button class="video-toggle" type="button"></button>`.
- Video kortelė: `<a class="video-card" href="…"><img src="POSTER" alt=""><video data-src="MP4_SD" muted loop playsinline></video><span class="video-card__play"><i class="ph ph-play"></i></span><div class="video-card__body"><h3>…</h3><p>…</p></div></a>` (modifikatoriai `--tall`, `--wide`). Kortelėse naudoti SD (≤1280 px) mp4.
- Įterptas video įrašas (Videoteka): `<div class="video-embed" data-yt="YOUTUBE_ID" data-title="…"><img class="video-embed__poster" src="…" alt=""><button class="video-embed__play" type="button" aria-label="Paleisti"><span><i class="ph ph-play"></i></span></button></div>` – be data-yt rodo pranešimą (maketas).
- Viename puslapyje: 1 hero/antraštės video + 1–2 video juostos + video kortelės. Ne daugiau ~6 autoplay video puslapyje.

## Antraštės blokai
- Pradinio hero: `<section class="hero">` + `.video-bg` + `.container > .hero__grid` (tekstas + `.hero-card`), `.hero__actions`, `.hero__scroll`. Body klasė `has-transparent-header`.
- Vidinio puslapio antraštė su video/foto: `<section class="page-header">` (+ `--tall` / `--short`) + `.video-bg` + `.container`: `<ol class="breadcrumb">`, `<p class="kicker">`, `<h1>`, `<p class="lead">`, `.page-header__actions`. Body `has-transparent-header`.
- Paprasta antraštė (be video): `<section class="page-header page-header--plain">` – body BE `has-transparent-header`.
- Vidinis prilipęs meniu (Salient Page Submenu): `<nav class="subnav" aria-label="Puslapio skyriai"><div class="container"><span class="subnav__label">Šiame puslapyje</span><a href="#id">…</a>…<a class="btn btn--sun btn--sm subnav__cta" href="prisidek.html">Paremk</a></div></nav>` – aktyvi sekcija žymima automatiškai; sekcijos turi turėti id. Variantas `.subnav--dark`.

## Sekcijos ir tinkleliai
`<section class="section [section--s|--white|--paper|--green|--peat|--dark|--ink]" id="…"><div class="container [container--wide|--narrow]">`. Sekcijos antraštė: `<div class="section-head [--center|--row]"><p class="kicker">…</p><h2 data-split>… <em>akcentas</em></h2><p class="lead">…</p></div>`. Tinkleliai: `.grid.grid--2/3/4/auto`, `.split` (tekstas + medija; `--media-first`), `.stack`, `.cluster`, `.sticky-col`.

## Animacijos (Salient Column animation / Split Line Heading / Mask Reveal / Parallax)
`data-reveal` (variantai `fade|left|right|scale`, vėlinimas `style="--d:200ms"`), `data-reveal-group` ant tėvo (vaikai pasirodo paeiliui), `data-split` ant h1/h2 (eilutės išnyra iš apačios), `data-mask` ant paveikslo konteinerio, `.px` + `data-px="0.15"` paralaksui, `[data-count-to="110" data-decimals="1" data-suffix=" ha"]` skaičiams.

## Komponentai
- Mygtukai: `.btn` (žalias), `.btn--sun` (geltonas – pagrindinis CTA), `.btn--ink`, `.btn--white`, `.btn--ghost`, `.btn--ghost-light` (ant tamsaus), dydžiai `--sm|--lg|--block`; su rodykle: `<span class="btn__icon"><i class="ph ph-arrow-right"></i><i class="ph ph-arrow-right"></i></span>`. Nuorodos: `.link-arrow` (+`<i class="ph ph-arrow-right">`), `.link-u`.
- Žymos: `.tag` (+`--sun|--peat|--moss|--water|--ink|--outline|--live|--done|--soon`). Filtrų mygtukai: `.pill-group > .pill[data-filter]` su `.pill__count`.
- Kortelė: `.card > .card__media (img + .tag + .card__date) + .card__body (.card__meta, h3 > a, p, .card__foot) + .card__go`; variantai `--h` (horizontali), `--flat`, `--paper`, `--green`, `--dark`, `--sun`.
- Ikoninė kortelė: `.icon-card > .icon-card__icon(i) + h3 + p + .link-arrow`; `--row`, `--plain`, `--sun`.
- Asmuo: `.person > .person__photo(img) + h3 + .person__role + p + .person__links`; `--compact`.
- Dokumentas (PDF): `<a class="doc" href="#"><span class="doc__icon"><i class="ph ph-file-pdf"></i></span><span class="doc__text"><strong>…</strong><span>PDF · 2,4 MB · 2025</span></span><span class="doc__meta"><span class="tag">LT</span></span><span class="doc__dl"><i class="ph ph-download-simple"></i></span></a>`.
- Skaičiai: `.stats(.stats--3/--2) > .stat > .stat__num(span[data-count-to] + small) + .stat__label`; tamsi juosta: `.band` + `.video-bg` + `.container`.
- Sąrašai: `.check-list` (+`--sun`, `--x`), `.icon-list`, `.numbered`, `.steps > .step` (+`.steps--3`).
- Skirtukai: `.tabs > .tabs__list[role=tablist] > .tabs__tab[role=tab][aria-controls][aria-selected]` + `.tabs__panel[role=tabpanel][id]`; `.tabs--line`.
- Akordeonas: `<div data-accordion><div class="toggle"><button class="toggle__btn" aria-expanded="false">Klausimas <i class="ph ph-plus"></i></button><div class="toggle__panel"><div>…</div></div></div></div>`; `.toggle--card`.
- Citata `.quote > p + cite`, įspėjimas `.callout(.callout--green|--peat) > i + p`, `.highlight`, bėganti eilutė `.marquee > .marquee__track > .marquee__item` (turinį dubliuoti 2×), partnerių logotipai `.logos > .logos__item`.
- Formos: `<form class="form form--2" data-demo="Žinutė po sėkmės" novalidate>` + `.field > label + input/select/textarea + .field__error` (+ `.full`), `.check`, `.radio-cards > label.radio-card > input + tekstas`, `.form__msg`, `.form__note`, `.input-group`, `.copy-field + .copy-btn[data-copy]`.
- CTA: `.cta(.cta--sun|.cta--video) > .cta__shape + .cta__grid > div + .cta__actions`.
- Naujienlaiškis: partials/newsletter.html (arba `.newsletter` blokas).
- Galerija: `.gallery > button.gallery__item[data-lightbox="grupė" data-src="DIDELĖ" data-cap="…"] > img + .gallery__cap` (`--tall`, `--wide`); peržiūra atsidaro automatiškai.
- Modalas: `<button data-modal-open="#id">` + `<div class="modal" id="id"><div class="modal__box"><div class="modal__head"><h3>…</h3><button class="modal__close" data-modal-close><i class="ph ph-x"></i></button></div>…</div></div>`.
- Lentelė: `.table-wrap > table.table`. Progresas: `<div class="progress" data-progress="64"><div class="progress__bar"><div class="progress__fill"></div></div><div class="progress__meta">…</div></div>`.
- Žemėlapis: `<div class="map" id="map"></div>` + Leaflet iš cdn.jsdelivr.net/npm/leaflet@1.9.4 (css + js) puslapio skripte; žymekliai `L.divIcon({className:'', html:'<span class="map-marker"></span>'})`.
- Filtrai (be JS rašymo): konteineris `data-filter-group`; mygtukai `.pill[data-filter="all|zyma"]`; paieška `input[data-filter-search]`; elementai su `data-tags="zyma1 zyma2"` (ir `data-keywords`); tuščias rezultatas `[data-filter-empty]`; skaitiklis `[data-filter-count data-forms="įrašas|įrašai|įrašų"]`; URL `?f=zyma` iš anksto pasirenka filtrą.
- Figūros: `.figure(.figure--tall|--wide|--square) > img + .figure__cap`, `.media-stack > .media-stack__main + .media-stack__float + .media-stack__badge`.
- Naujos funkcijos žymeklis: ant sekcijos/kortelės pridėti klasę `new-fn` ir viduje `<span class="new-fn__badge" data-tip="Kas čia nauja ir kaip bus padaryta WordPress'e" tabindex="0">Nauja</span>` (`new-fn--inline` – antraštės viduje). Maketo juostos jungiklis juos paslepia.

## window.PF (puslapių skriptams)
`PF.$`, `PF.$$`, `PF.esc`, `PF.plural(n,[v,d,dg])`, `PF.nf(n,dec)`, `PF.normalize(s)` (be diakritikų paieškai), `PF.debounce`, `PF.toast(msg)`, `PF.store.get/set`, `PF.lightbox.open(items,i)` / `PF.lightbox.bind(scope)`, `PF.modal.open('#id')`, `PF.observeReveal(scope)` (po dinaminio renderinimo), įvykis `pf:ready`.
Piktogramos: Phosphor (`<i class="ph ph-leaf">`, užpildytos `ph-fill`). Salient'e – Font Awesome / Linea / Iconsmind atitikmenys.

## Papildomi komponentai (iš koncepcijų panelės; naudoti poliravimo etape)
- Kadro užrašas ant hero/page-header video: `<span class="video-caption">Aukštapelkė rudenį <span>· Baltijos regionas</span></span>` (dedamas .hero / .page-header viduje, šalia .video-credit).
- „Trumpai“ santrauka ilgo puslapio viršuje: `<div class="brief-box" data-reveal><span class="brief-box__label"><i class="ph ph-list-checks"></i> Trumpai</span><ul><li>…</li><li>…</li><li>…</li></ul></div>` (3–4 punktai; `--dark` tamsiame fone).
- Faktų šaltinis: po `.stat__label` – `<span class="stat__src">Šaltinis: 2025 m. veiklos ataskaita</span>`; tekste – `<span class="src">…</span>`.
- Numeruotas kicker (atlaso stilius): `<p class="kicker" data-nr="01.3">Pelkių tipai</p>`.
- Žymeklis „Patobulinta“ (esama funkcija, padaryta geriau): `<span class="new-fn__badge new-fn__badge--improved" data-tip="…">Patobulinta</span>` (tėvui irgi klasė new-fn).
- Vandens lygio progresas: `.progress.progress--water` (kiti elementai kaip .progress).
- Veiksmo eilutė sekcijos pabaigoje: `<div class="action-row"><span class="action-row__text"><span class="sun-dot"><i class="ph ph-hand-heart"></i></span>Norite prisidėti prie šio darbo?</span><a class="btn btn--sun btn--sm" href="prisidek.html#savanoriauk">Savanoriauk</a></div>`.
- Tekstas ant video „popieriaus“ skydelyje: `<div class="paper-panel">…kicker, h1, lead…</div>` (.page-header .container viduje).

## Patikslinimai (po statybos)
- `[hidden]` dabar visada slepia (style.css), filtrai veikia visiems komponentams.
- Kelių dimensijų filtrai: pill'ams pridėti `data-filter-dim="statusas"` / `data-filter-dim="tema"` – grupės jungiamos IR; pill'ai be dim – kaip anksčiau (vienas aktyvus).
- Toggle mygtuką galima dėti į h3/h4 (`.toggle > h3 > .toggle__btn`) – veikia per `:has()`.
- `.callout` – visada `div` su vidiniu `<p>`. `.steps` gali būti `<ol>`; žingsnių antraštė – h3 arba h4.
- Tamsiuose fonuose (`.band`, `.cta`, `.section--dark`) `h2 em` ir `.kicker` automatiškai geltoni.
