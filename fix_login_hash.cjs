const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const regex = /if \(role === 'Admin'\) \{[\s\S]*?\} else \{/;
const newLogic = `if (role === 'Admin') {
                location.hash = 'admin-add-dash';
            } else {`;

html = html.replace(regex, newLogic);
fs.writeFileSync('index.html', html);
