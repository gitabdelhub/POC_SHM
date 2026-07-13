const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const oldMap = /<svg width="100%" height="100%" viewBox="0 0 800 500"[\s\S]*?<\/svg>/;

const newMap = '<svg width="100%" height="100%" viewBox="0 0 400 600" preserveAspectRatio="xMidYMid meet" style="position:absolute; top:0; left:0; opacity:0.15; padding: 20px;">' +
'                                <!-- Complete Morocco outline (simplified) -->' +
'                                <path d="M 240 20 L 260 20 L 280 40 L 270 80 L 250 120 L 220 160 L 190 220 L 170 300 L 140 380 L 100 460 L 60 540 L 40 560 L 30 550 L 60 490 L 80 430 L 110 380 L 110 330 L 150 260 L 160 200 L 190 120 L 210 60 Z" fill="var(--primary-teal)" />' +
'                            </svg>';

html = html.replace(oldMap, newMap);

// Update bubble positions
html = html.replace('left:40%; width:40px; height:40px;', 'left:45%; width:40px; height:40px;'); // Casa
html = html.replace('left:50%; width:30px; height:30px;', 'left:55%; width:30px; height:30px;'); // Rabat
html = html.replace('left:35%; width:25px; height:25px;', 'left:38%; width:25px; height:25px;'); // Kech
html = html.replace('left:55%; width:20px; height:20px;', 'left:60%; width:20px; height:20px;'); // TNG
html = html.replace('top:70%; left:25%;', 'top:60%; left:28%;'); // AGA

const newBubbles = '<div style="position:absolute; top:75%; left:20%; width:15px; height:15px; background:rgba(46, 71, 65, 0.6); border:2px solid var(--primary-teal); border-radius:50%; display:flex; align-items:center; justify-content:center; color:white; font-size:6px; font-weight:bold; cursor:pointer;" title="Laâyoune: 1.1 Md" onclick="showToast(\'Région Laâyoune: 1.1 Md MAD\', \'info\')">LAA</div>' +
'<div style="position:absolute; top:85%; left:12%; width:10px; height:10px; background:rgba(46, 71, 65, 0.6); border:2px solid var(--primary-teal); border-radius:50%; display:flex; align-items:center; justify-content:center; color:white; font-size:4px; font-weight:bold; cursor:pointer;" title="Dakhla: 0.5 Md" onclick="showToast(\'Région Dakhla: 0.5 Md MAD\', \'info\')">DAK</div>';

html = html.replace("AGA</div>", "AGA</div>" + newBubbles);

fs.writeFileSync('index.html', html);
