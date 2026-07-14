const fs = require('fs');
const d3 = require('d3-geo');

const world = JSON.parse(fs.readFileSync('world.geojson', 'utf8'));
const features = world.features.filter(f => f.properties['ISO3166-1-Alpha-3'] === 'MAR' || f.properties['ISO3166-1-Alpha-3'] === 'ESH');

console.log('Found features:', features.length);

const projection = d3.geoMercator().fitSize([400, 600], {type: "FeatureCollection", features: features});
const pathGenerator = d3.geoPath().projection(projection);

let svgPath = '';
features.forEach(f => {
    svgPath += pathGenerator(f) + ' ';
});

fs.writeFileSync('mar_svg.txt', svgPath);
// Let's also get coordinates for the cities
const cities = {
    'TNG': [-5.833954, 35.759465], // Tanger
    'RAB': [-6.849813, 34.020882], // Rabat
    'CASA': [-7.589843, 33.573110], // Casablanca
    'KCH': [-8.0083, 31.6295], // Marrakech
    'AGA': [-9.5981, 30.4202], // Agadir
    'LAA': [-13.1991, 27.1253], // Laayoune
    'DAK': [-15.9390, 23.6848] // Dakhla
};

let bubbles = '';
for (const [code, coords] of Object.entries(cities)) {
    const [x, y] = projection(coords);
    bubbles += `${code}: ${x.toFixed(2)}, ${y.toFixed(2)}\n`;
}
fs.writeFileSync('cities.txt', bubbles);

