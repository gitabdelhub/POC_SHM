const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const oldLogout = /function logout\(\) \{[\s\S]*?\}/;
const newLogout = `function logout() {
            showToast("Système de profils désactivé pour le moment.", "info");
        }`;

html = html.replace(oldLogout, newLogout);

// Also remove `login()` function to avoid any reference issues
html = html.replace(/function login\(role\) \{[\s\S]*?APP\.modules\.forEach\(m => m\.roles = m\.roles \|\| \['DG', 'DR', 'CA', 'AR', 'Admin'\]\);\n\s*\}/, '');

fs.writeFileSync('index.html', html);
