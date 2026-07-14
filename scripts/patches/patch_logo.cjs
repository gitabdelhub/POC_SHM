const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf-8');

html = html.replace(
    '<img src="/logo_saham.png" alt="Saham Bank" class="sb-logo" style="max-height: 40px; width: auto; display: block; margin: 10px auto;">',
    '<img src="/logo_saham.png" alt="Saham Bank" class="sb-logo" style="max-height: 40px; width: auto; display: block; margin: 10px auto; cursor: pointer;" onclick="navigateHome()">'
);

// We should also add navigateHome to JS
const jsTarget = 'function toggleSidebar() {';
const navigateHomeFunc = `
        function navigateHome() {
            if (APP.userRole === 'Admin') {
                location.hash = 'admin';
            } else {
                location.hash = 'dashboard';
            }
        }
        
        function toggleSidebar() {
`.trim();

html = html.replace(jsTarget, navigateHomeFunc);

fs.writeFileSync('index.html', html);
console.log('Logo and navigateHome updated.');
