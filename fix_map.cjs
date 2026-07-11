const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// 1. Rename Administrateur SI to Administrateur IT
html = html.replace(/<h3>Administrateur SI<\/h3>/g, '<h3>Administrateur IT</h3>');

// 2. Change map condition to only DG
html = html.split("${(APP.userRole === 'DG' || APP.userRole === 'DR') ? `").join("${(APP.userRole === 'DG') ? `");

// 3. Make map more complete (better path)
const oldMap = /<svg width="100%" height="100%" viewBox="0 0 800 400" preserveAspectRatio="xMidYMid slice" style="position:absolute; top:0; left:0; opacity:0.1;">\s*<path d="M100,50 Q400,10 700,50 T750,350 Q400,380 50,350 Z" fill="var\(--primary-teal\)" \/>\s*<\/svg>/;

const newMap = '<svg width="100%" height="100%" viewBox="0 0 800 500" preserveAspectRatio="xMidYMid meet" style="position:absolute; top:0; left:0; opacity:0.15; padding: 20px;">' +
'                                <path d="M 450 20 C 470 20 490 10 510 30 C 530 50 560 80 550 120 C 540 160 510 220 460 280 C 420 330 380 390 330 450 C 300 490 260 480 250 440 C 240 400 280 320 320 250 C 350 200 380 120 410 70 C 430 40 440 20 450 20 Z" fill="var(--primary-teal)" />' +
'                            </svg>';

html = html.replace(oldMap, newMap);

fs.writeFileSync('index.html', html);
