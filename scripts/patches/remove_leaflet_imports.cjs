const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

const target1 = `    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />\n`;
const target2 = `    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>\n`;

html = html.replace(target1, '');
html = html.replace(target2, '');

fs.writeFileSync('index.html', html, 'utf8');
console.log("Leaflet imports removed.");
