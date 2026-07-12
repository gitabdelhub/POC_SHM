const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const regex = /MOCK\.dossiers\.map\(d =>/;

html = html.replace(regex, "MOCK.dossiers.filter(d => (APP.userRole === 'DG' || APP.userRole === 'Admin') ? true : (APP.userRole === 'DR' ? d.client.length % 2 === 0 : d.client.length % 2 !== 0)).map(d =>");
fs.writeFileSync('index.html', html);
