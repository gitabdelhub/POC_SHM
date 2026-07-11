const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// The Power BI page renderPowerbi uses #0e6944, #f4fbf7, #d1e8db
// Let's replace them in the renderPowerbi block

let startIndex = html.indexOf('function renderPowerbi');
let endIndex = html.indexOf('function renderPortefeuille');
if (startIndex !== -1 && endIndex !== -1) {
    let powerBiBlock = html.substring(startIndex, endIndex);
    
    // Replacing old colors with Saham Bank colors
    powerBiBlock = powerBiBlock.replace(/#0e6944/g, 'var(--primary-teal)');
    powerBiBlock = powerBiBlock.replace(/#f4fbf7/g, 'var(--light-bg)');
    powerBiBlock = powerBiBlock.replace(/#d1e8db/g, 'var(--sec-bg)');
    powerBiBlock = powerBiBlock.replace(/rgba\(14,105,68,0\.2\)/g, 'rgba(46,71,65,0.2)');
    powerBiBlock = powerBiBlock.replace(/rgba\(14, 105, 68, 0\.1\)/g, 'rgba(46,71,65,0.1)');
    
    html = html.substring(0, startIndex) + powerBiBlock + html.substring(endIndex);
    fs.writeFileSync('index.html', html);
}
