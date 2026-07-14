const fs = require('fs');
const d3 = require('d3-geo');

const map = JSON.parse(fs.readFileSync('mar.geojson', 'utf8'));

const projection = d3.geoMercator().fitSize([400, 600], map);
const pathGenerator = d3.geoPath().projection(projection);

const svgPath = pathGenerator(map.features[0]);
fs.writeFileSync('mar_svg_merged.txt', svgPath);

const cities = {
    'TNG': [-5.833954, 35.759465],
    'RAB': [-6.849813, 34.020882],
    'CASA': [-7.589843, 33.573110],
    'KCH': [-8.0083, 31.6295],
    'AGA': [-9.5981, 30.4202],
    'LAA': [-13.1991, 27.1253],
    'DAK': [-15.9390, 23.6848]
};

let bubbles = '';
for (const [code, coords] of Object.entries(cities)) {
    const [x, y] = projection(coords);
    bubbles += `${code}: ${x.toFixed(1)}, ${y.toFixed(1)}\n`;
}
fs.writeFileSync('cities_merged.txt', bubbles);
console.log("Done");
