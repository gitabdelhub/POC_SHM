const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const regex = /\s*<!-- Interactive Bubble Map for DG\/DR -->[\s\S]*?` : ''}/;
html = html.replace(regex, '');

fs.writeFileSync('index.html', html);
