const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// Find the map over agences_perf or similar inside renderQualite
const regex = /MOCK\.agences_perf\.map/;

html = html.replace(regex, "MOCK.agences_perf.filter((a, i) => (APP.userRole === 'DG' || APP.userRole === 'Admin') ? true : (APP.userRole === 'DR' ? i % 2 === 0 : i % 3 === 0)).map");
fs.writeFileSync('index.html', html);
