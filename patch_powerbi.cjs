const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf-8');

const moisSearch = `<select onchange="showToast('Filtre appliqué. Mise à jour du rapport...', 'info')" style="width:100%; padding:12px; border-radius:8px; border:1px solid var(--sec-bg); background:white; color:var(--dark-teal); font-weight:500; font-family:'Manrope', sans-serif; cursor:pointer; outline:none;"><option>Tout</option></select>`;
const moisReplace = `<select onchange="showToast('Filtre appliqué. Mise à jour du rapport...', 'info')" style="width:100%; padding:12px; border-radius:8px; border:1px solid var(--sec-bg); background:white; color:var(--dark-teal); font-weight:500; font-family:'Manrope', sans-serif; cursor:pointer; outline:none;"><option>Tout</option><option>Janvier</option><option>Février</option><option>Mars</option><option>Avril</option><option>Mai</option><option>Juin</option></select>`;

const reseauReplace = `<select onchange="showToast('Filtre appliqué. Mise à jour du rapport...', 'info')" style="width:100%; padding:12px; border-radius:8px; border:1px solid var(--sec-bg); background:white; color:var(--dark-teal); font-weight:500; font-family:'Manrope', sans-serif; cursor:pointer; outline:none;"><option>Tout</option><option>Retail</option><option>Corporate</option><option>PME</option></select>`;

const drReplace = `<select onchange="showToast('Filtre appliqué. Mise à jour du rapport...', 'info')" style="width:100%; padding:12px; border-radius:8px; border:1px solid var(--sec-bg); background:white; color:var(--dark-teal); font-weight:500; font-family:'Manrope', sans-serif; cursor:pointer; outline:none;"><option>Tout</option><option>DR Centre</option><option>DR Nord</option><option>DR Sud</option><option>DR Oriental</option></select>`;

const agenceReplace = `<select onchange="showToast('Filtre appliqué. Mise à jour du rapport...', 'info')" style="width:100%; padding:12px; border-radius:8px; border:1px solid var(--sec-bg); background:white; color:var(--dark-teal); font-weight:500; font-family:'Manrope', sans-serif; cursor:pointer; outline:none;"><option>Tout</option><option>Casablanca Anfa</option><option>Rabat Agdal</option><option>Marrakech Guéliz</option><option>Tanger Centre</option></select>`;

const marcheReplace = `<select onchange="showToast('Filtre appliqué. Mise à jour du rapport...', 'info')" style="width:100%; padding:12px; border-radius:8px; border:1px solid var(--sec-bg); background:white; color:var(--dark-teal); font-weight:500; font-family:'Manrope', sans-serif; cursor:pointer; outline:none;"><option>Tout</option><option>Immobilier</option><option>Crédit Consommation</option><option>Financement Investissement</option><option>Leasing</option></select>`;

const portefeuilleReplace = `<select onchange="showToast('Filtre appliqué. Mise à jour du rapport...', 'info')" style="width:100%; padding:12px; border-radius:8px; border:1px solid var(--sec-bg); background:white; color:var(--dark-teal); font-weight:500; font-family:'Manrope', sans-serif; cursor:pointer; outline:none;"><option>Tout</option><option>Portefeuille Actif</option><option>Clients NPL (Non-Performing)</option><option>Comptes Inactifs</option></select>`;

// They are all identical structurally so I replace one by one.
let parts = html.split(moisSearch);
if (parts.length >= 7) {
    html = parts[0] + moisReplace + parts[1] + reseauReplace + parts[2] + drReplace + parts[3] + agenceReplace + parts[4] + marcheReplace + parts[5] + portefeuilleReplace + parts[6];
}

fs.writeFileSync('index.html', html);
console.log('PowerBI selects updated.');
