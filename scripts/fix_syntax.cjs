const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

html = html.replace(/        \}\s*\}\);\s*\}\s*window\.switchTab/g, '        }\n\n        window.switchTab');

fs.writeFileSync('index.html', html);
