const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');
const missing = fs.readFileSync('missing_functions.js', 'utf8');

html = html.replace('function renderAdmin(container)', missing + '\n        function renderAdmin(container)');
fs.writeFileSync('index.html', html);
console.log('Restored');
