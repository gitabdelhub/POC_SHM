const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

const oldCss = `        .fullscreen-active .btn-fullscreen {
            position: absolute !important;
            top: 20px !important;
            right: 20px !important;
            z-index: 99999 !important;
            background: white !important;
            border: 1px solid var(--sec-bg) !important;
            border-radius: 50% !important;
            width: 40px !important;
            height: 40px !important;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1) !important;
        }`;

const newCss = `        .fullscreen-active .btn-fullscreen {
            position: fixed !important;
            top: 24px !important;
            right: 24px !important;
            z-index: 999999 !important;
            background: white !important;
            border: 1px solid var(--sec-bg) !important;
            border-radius: 50% !important;
            width: 44px !important;
            height: 44px !important;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1) !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
        }`;

if (html.includes(oldCss)) {
    html = html.replace(oldCss, newCss);
    fs.writeFileSync('index.html', html, 'utf8');
    console.log("Button patched to fixed!");
} else {
    console.error("Could not find old CSS");
}
