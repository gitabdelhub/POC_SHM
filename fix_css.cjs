const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

html = html.replace('height: 100% !important;', '');

fs.writeFileSync('index.html', html, 'utf8');
console.log("CSS fixed");
