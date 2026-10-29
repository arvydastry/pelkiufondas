/* Paslaugos – puslapio scenarijus (vanilla, IIFE). Naudoja window.PF iš assets/js/main.js.
   1) Nuorodos [data-tema] (auditorijų ir paslaugų kortelės) užpildo formos „Tema“ lauką ir perkelia į formą;
   2) URL parametras ?tema=… (pvz., iš kitų puslapių) iš anksto parenka temą;
   3) po temos pasirinkimo rodoma trumpa užuomina, ką verta parašyti žinutėje. */
(function () {
  'use strict';

  var HINTS = {
    savivaldybes: 'Nurodykite savivaldybę ar teritoriją ir ko tikitės: žalinimo ar gamtotvarkos plano, inventorizacijos, mokymų specialistams.',
    ukininkai: 'Parašykite, kur yra sklypas, koks jo plotas ir ar jis nusausintas – patarsime, nuo ko pradėti pelkės atkūrimą ar pelkininkystę.',
    verslas: 'Verslui pirmoji konsultacija dėl CO₂ pėdsako mažinimo atkuriant pelkes – nemokama. Nurodykite įmonę ir tikslą.',
    mokyklos: 'Nurodykite mokyklą ar bendruomenę, dalyvių amžių ir norimą formatą: pamoka, išvyka į pelkę ar seminaras.',
    konsultacija: 'Trumpai aprašykite situaciją: pelkės ar durpyno atkūrimas, varliagyvių apsauga, miškininkystė, žalinimo planas ar CO₂ pėdsakas.',
    tyrimai: 'Nurodykite teritoriją, plotą ir reikalingą dokumentą: tyrimas, poveikio vertinimas, gamtotvarkos planas ar želdynų inventorizacija.',
    svietimas: 'Nurodykite renginio tipą, datą ir dalyvių skaičių – pasiūlysime programą.',
    kita: ''
  };

  function start() {
    var PF = window.PF;
    var $ = PF ? PF.$ : function (s, c) { return (c || document).querySelector(s); };
    var $$ = PF ? PF.$$ : function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

    var select = $('#tema');
    var form = $('#paslaugu-forma');
    var hint = $('#tema-hint');
    if (!select || !form) return;

    var setTema = function (value, announce) {
      var exists = Array.prototype.some.call(select.options, function (o) { return o.value === value; });
      if (!exists) return false;
      select.value = value;
      var field = select.closest('.field');
      if (field) field.classList.remove('is-invalid');
      if (hint) hint.textContent = HINTS[value] || '';
      if (announce && PF && PF.toast) {
        var label = select.options[select.selectedIndex].text;
        PF.toast('Tema parinkta: ' + label);
      }
      return true;
    };

    /* 1) Nuorodos su data-tema */
    $$('a[data-tema]').forEach(function (a) {
      a.addEventListener('click', function () {
        var ok = setTema(a.getAttribute('data-tema'), true);
        if (!ok) return;
        /* Po perėjimo prie formos – fokusas į pirmą lauką (be papildomo šokinėjimo) */
        window.setTimeout(function () {
          var first = $('#sv-vardas');
          if (first) first.focus({ preventScroll: true });
        }, 450);
      });
    });

    /* 2) ?tema= iš URL (pvz., veikla.html → paslaugos.html?tema=svietimas#susisiekime) */
    try {
      var preset = new URLSearchParams(window.location.search).get('tema');
      if (preset) setTema(preset, false);
    } catch (e) { /* senos naršyklės – ignoruojame */ }

    /* 3) Užuomina pagal pasirinktą temą */
    select.addEventListener('change', function () {
      if (hint) hint.textContent = HINTS[select.value] || '';
    });

    /* Po sėkmingo išsiuntimo main.js formą išvalo – išvalome ir užuominą */
    form.addEventListener('reset', function () {
      if (hint) hint.textContent = '';
    });
  }

  if (window.PF && document.readyState !== 'loading') start();
  else document.addEventListener('pf:ready', start, { once: true });
})();
