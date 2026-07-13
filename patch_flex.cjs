const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const oldStr = `        .fullscreen-active .chart-content {
            flex: 1 !important;
            min-height: 0 !important;
            
        }`;

const newStr = `        .fullscreen-active .chart-content {
            flex: 1 !important;
            height: auto !important;
            min-height: 0 !important;
        }`;

if (html.includes(oldStr)) {
    html = html.replace(oldStr, newStr);
    fs.writeFileSync('index.html', html, 'utf8');
    console.log("Flex patched");
} else {
    console.log("Not found");
}
