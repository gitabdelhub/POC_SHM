const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const cssToInsert = `
        .fullscreen-active .btn-fullscreen {
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
        }
`;

html = html.replace('</style>', cssToInsert + '</style>');
fs.writeFileSync('index.html', html, 'utf8');
console.log("Button CSS patched");
