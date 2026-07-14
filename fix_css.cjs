const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const targetCSS = `.fullscreen-active {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            z-index: 9999 !important;
            border-radius: 0 !important;
            margin: 0 !important;
            max-height: none !important;
            display: flex !important;
            flex-direction: column !important;
            overflow: auto !important;
        }`;

const replaceCSS = `.fullscreen-active {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            z-index: 9999 !important;
            border-radius: 0 !important;
            margin: 0 !important;
            max-height: none !important;
            display: flex !important;
            flex-direction: column !important;
            overflow: auto !important;
            background: white !important;
        }`;

if(html.includes(targetCSS)) {
    html = html.replace(targetCSS, replaceCSS);
    fs.writeFileSync('index.html', html, 'utf8');
    console.log("CSS replaced.");
} else {
    console.log("CSS not found.");
}
