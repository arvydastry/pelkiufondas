# VšĮ „Pelkių fondas“ svetainės dizaino maketas

Naujo [pelkiufondas.lt](https://www.pelkiufondas.lt/) dizaino maketas pasiūlymui. Svetainė bus programuojama su
**WordPress + Salient** (ThemeNectar 18.4, WPBakery), todėl makete naudojami tik tokie išdėstymai ir efektai,
kuriuos Salient atkartoja savo elementais; prie kiekvienos sekcijos HTML komentare nurodytas Salient atitikmuo
(pvz. `<!-- Salient: Row su video fonu + Page Submenu -->`).

Kliento užduotis: išlaikyti esamą struktūrą (Pradinis · Pelkės · Apie mus · Veikla · Naujienos · Kontaktai · Prisidėk),
suprogramuoti esamą funkcionalumą ir pridėti apie 10 % naujų funkcijų. Informaciją klientas perkels pats.

## Kas makete

| Failas | Skiltis | Kas tai |
|---|---|---|
| `index.html` | Pradinis | Video hero, skaičiai, 4 veiklos kryptys (video kortelės), kas yra pelkė, projektai, citata, naujienos, kaip prisidėti, renginiai, partneriai, naujienlaiškis |
| `pelkes.html` | Pelkės | Apibrėžimai, pelkių tipai (lentelė), EB buveinės, reikšmė, grėsmės, būklė, atkūrimas, žodyno ir galerijos ištraukos |
| `terminu-zodynas.html` | Pelkės | Interaktyvus terminų žodynas su paieška ir A–Ž filtru |
| `galerija.html` | Pelkės | Nuotraukų galerija su filtrais ir peržiūra |
| `apie-mus.html` | Apie mus | Įžanga, misija ir vizija, etapai, įkvėpėjas, komanda, ambasadoriai, taryba, partneriai, dokumentai |
| `veiklos-ataskaitos.html` | Apie mus | Metinės veiklos, finansinės ir audito ataskaitos 2020–2025 su filtrais |
| `veikla.html` | Veikla | 4 veiklos kryptys su pilnu turiniu, susiję projektai, paslaugų ir projektų ištraukos, forma |
| `co2.html` | Veikla | CO₂ emisijų mažinimas verslui: nauda, skaičiuoklė, procesas, standartai, konsultacijos forma |
| `projektai.html` | Veikla | 15 projektų su žemėlapiu ir filtrais pagal statusą bei temą |
| `projektas.html` | Veikla | Vieno projekto šablonas (Guodžių durpyno atkūrimas) |
| `paslaugos.html` | Veikla | Konsultacijos, inventorizacijos ir tyrimai, švietimas |
| `publikacijos.html` | Veikla | 44 publikacijos pagal tipą su paieška |
| `videoteka.html` | Veikla | Fondo filmai ir reportažai |
| `naujienos.html` | Naujienos | Naujienų sąrašas su kategorijomis, paieška, puslapiavimu |
| `naujiena.html` | Naujienos | Vieno įrašo šablonas su susijusiais įrašais ir dalinimusi |
| `kontaktai.html` | Kontaktai | Rekvizitai, žemėlapis, forma, komandos kontaktai, privatumo politika |
| `prisidek.html` | Prisidėk | Parama internetu ir pavedimu, 1,2 % GPM, savanorystė, renginiai, verslui, naujienlaiškis |
| `partials/` | – | Bendri fragmentai (antraštė, poraštė, naujienlaiškis) ir komponentų žinynas `SNIPPETS.md` |
| `assets/css/style.css` | – | Dizaino sistema (spalvos, šriftai, komponentai) |
| `assets/js/main.js` | – | Salient elgsenos atkartojimas: meniu, animacijos, video, filtrai, paieška, formos |
| `assets/css/pages/`, `assets/js/pages/` | – | Puslapiams specifiniai stiliai ir scenarijai (žodynas, žemėlapiai, skaičiuoklė, parama) |
| `assets/fonts/` | – | Fraunces ir Manrope (OFL) su visomis lietuviškomis raidėmis |
| `scripts/check-html.py` | – | Puslapių tikrinimas (fragmentai, nuorodos, alt, video, antraštės) |
| `scripts/assemble.py`, `scripts/pages/` | – | Puslapio surinkimas iš `partials/` + turinio failo (`python3 scripts/assemble.py scripts/pages/kontaktai.html`) |

## Peržiūra

Atidarykite `index.html` naršyklėje arba paleiskite vietinį serverį:

```bash
python3 -m http.server 8791
```

ir eikite į http://localhost:8791. Video ir nuotraukos kraunamos iš Pexels, žemėlapiai – iš OpenStreetMap.

## Ką verta žinoti peržiūrint

- **Tamsi juosta viršuje** skirta tik maketui, į WordPress nekeliama. Joje – nuorodos į skiltis, jungiklis
  „rodyti naujas funkcijas“.
- **Žymekliai „Nauja“** rodo, ko dabartinė svetainė neturi (apie 10 % funkcijų): parama internetu, 1,2 % GPM vedlys,
  projektų žemėlapis su filtrais, interaktyvus terminų žodynas, renginių kalendorius su registracija, publikacijų ir
  ataskaitų filtrai, naujienų kategorijos ir susiję įrašai, svetainės paieška. Užvedus pelę ant žymeklio matosi,
  kaip funkcija bus padaryta WordPress'e.
- **Video** – Pexels (nemokama licencija), parinkti pagal Baltijos pelkių vaizdą; svetainėje galima naudoti juos pat
  arba fondo filmuotą medžiagą. Hero video galima sustabdyti; esant „mažiau judesio“ nustatymui video nekraunami.
- **Turinys** – iš dabartinės svetainės (ištaisytos klaidos), komandos narių nuotraukos pakeistos inicialais.
  Renginiai, paramos progreso juosta ir dalis projektų metų yra pavyzdiniai ir taip pažymėti.
- **Formos** duomenų nesiunčia, tik parodo, kaip veiks. Mokėjimai taip pat tik demonstraciniai.
- Projektų „Skaityti daugiau“ veda į vieną šabloną (`projektas.html`), naujienos – į `naujiena.html`.

## Laukiantys patikslinimai su klientu

Projektų metai ir statusai, nuotraukų autoriai ir fondo archyvas,
patariamosios tarybos nariai, EN versijos apimtis, aukojimo būdas (Paysera / Montonio ar Stripe), YouTube kanalas
videotekai, renginių sąrašas.
