const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// Replace the incorrect }, 1000); inside exportQueriesCSV
html = html.replace(/showToast\('Fichier queries_log\.csv téléchargé', 'success'\);\s*\}, 1000\);\s*\}/, 
    "showToast('Fichier queries_log.csv téléchargé', 'success');\n        }");

fs.writeFileSync('index.html', html);
