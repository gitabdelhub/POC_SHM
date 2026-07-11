const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

html = html.replace(
    '<img src="/logo_saham.png" alt="Saham Bank" style="height: 40px; width: auto; object-fit: contain;">',
    '<img src="logo_saham.png" alt="Saham Bank" class="sb-logo" style="max-height: 40px; width: auto; display: block; margin: 10px auto;">'
);

html = html.replace(
    'PNB Commercial • Agences CAM 2025',
    'PNB Commercial • Réseau Saham Bank'
);

html = html.replace(
    'Vision consolidée du Produit Net Bancaire commercial, marges et commissions par réseau, direction régionale, groupe et portefeuille.',
    'Vision consolidée du Produit Net Bancaire commercial, marges et commissions par réseau, direction régionale et agence.'
);

html = html.replace(
    'Tenant CAM •',
    'Tenant Saham Bank •'
);

fs.writeFileSync('index.html', html);
