/* Kontaktai: Leaflet žemėlapis (Salient Interactive Map atitikmuo). */
(() => {
  'use strict';
  const init = () => {
    const el = document.getElementById('map');
    if (!el || !window.L) return;
    const map = L.map(el, { scrollWheelZoom: false }).setView([54.6868, 25.2797], 15);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; OpenStreetMap' }).addTo(map);
    const icon = L.divIcon({ className: '', html: '<span class="map-marker"></span>', iconSize: [30, 30], iconAnchor: [15, 30], popupAnchor: [0, -28] });
    L.marker([54.6868, 25.2797], { icon }).addTo(map).bindPopup('<strong>Pelkių fondas</strong>Gedimino pr. 1, 4 a. (NVO „Avilys“), Vilnius<br><a href="https://www.google.com/maps/dir/?api=1&destination=54.6868,25.2797" target="_blank" rel="noopener">Maršrutas</a>').openPopup();
  };
  if (document.readyState === 'complete') init(); else window.addEventListener('load', init);
})();
