const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const targetStr = `                    if (!window._moroccoMap) {
                        const map = L.map('leafletMap').setView([31.7917, -7.0926], 5);
                        window._moroccoMap = map;`;

const newStr = `                    if (window._moroccoMap) {
                        window._moroccoMap.remove();
                        window._moroccoMap = null;
                    }
                    if (!window._moroccoMap) {
                        const map = L.map('leafletMap').setView([31.7917, -7.0926], 5);
                        window._moroccoMap = map;`;

if (html.includes(targetStr)) {
    html = html.replace(targetStr, newStr);
    fs.writeFileSync('index.html', html, 'utf8');
    console.log("Map re-init fixed!");
} else {
    console.log("Could not find target string.");
}
