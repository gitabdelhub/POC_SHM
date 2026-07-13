const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// 1. Add onclick to Recharger and Exporter
html = html.replace(
    '<button style="display:flex; gap:8px; align-items:center; background:white; border:1px solid #e2e8f0; border-radius:8px; padding:10px 20px; font-weight:600; color:var(--dark-teal); box-shadow:0 1px 2px rgba(0,0,0,0.05); cursor:pointer;">',
    '<button onclick="showToast(\'Rechargement des données Power BI...\', \'info\')" style="display:flex; gap:8px; align-items:center; background:white; border:1px solid #e2e8f0; border-radius:8px; padding:10px 20px; font-weight:600; color:var(--dark-teal); box-shadow:0 1px 2px rgba(0,0,0,0.05); cursor:pointer;">'
);

html = html.replace(
    '<button style="display:flex; gap:8px; align-items:center; background:var(--primary-teal); border:1px solid var(--primary-teal); border-radius:8px; padding:10px 20px; font-weight:600; color:white; box-shadow:0 1px 2px rgba(46,71,65,0.2); cursor:pointer;">',
    '<button onclick="showToast(\'Export du rapport en PDF initié\')" style="display:flex; gap:8px; align-items:center; background:var(--primary-teal); border:1px solid var(--primary-teal); border-radius:8px; padding:10px 20px; font-weight:600; color:white; box-shadow:0 1px 2px rgba(46,71,65,0.2); cursor:pointer;">'
);

// 2. Add onchange to select inputs
html = html.replace(/<select style="width:100%; padding:12px; border-radius:8px; border:1px solid var\(--sec-bg\); background:white; color:var\(--dark-teal\); font-weight:500; font-family:'Manrope', sans-serif; cursor:pointer; outline:none;"/g, '<select onchange="showToast(\'Filtre appliqué. Mise à jour du rapport...\', \'info\')" style="width:100%; padding:12px; border-radius:8px; border:1px solid var(--sec-bg); background:white; color:var(--dark-teal); font-weight:500; font-family:\'Manrope\', sans-serif; cursor:pointer; outline:none;"');

fs.writeFileSync('index.html', html);
