const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const pathData = fs.readFileSync('mar_svg.txt', 'utf8').trim();

// The regex might not match correctly because I replaced it in the last step.
// Let's use string replace.
const findStr = '<div style="position: relative; height: 100%; aspect-ratio: 400/600; padding: 20px;">';
const replStr = '<div style="position: relative; height: 100%; aspect-ratio: 400/600; padding: 0;">';
html = html.replace(findStr, replStr);

fs.writeFileSync('index.html', html);
