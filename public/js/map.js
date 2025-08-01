const lat = parseFloat(document.getElementById("map").dataset.lat);
const lon = parseFloat(document.getElementById("map").dataset.lon);

const map = L.map("map").setView([lat, lon], 7);


// L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
//   maxZoom: 19,
//   attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
// }).addTo(map);

L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>',
    maxZoom: 20
}).addTo(map);




L.marker([lat, lon]).addTo(map).bindPopup("Listing Location").openPopup();
