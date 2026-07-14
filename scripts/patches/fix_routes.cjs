const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

html = html.replace("case 'admin': renderAdmin(content); break;", "case 'admin': renderAdmin(content); break;\n                case 'qualite': renderDashboard(content); break; // Fallback or distinct view\n                case 'rentabilite': renderPowerbi(content); break; // Fallback or distinct view");

fs.writeFileSync('index.html', html);
console.log('Fixed routes');
