const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

html = html.replace(
    'src="logo_saham.png"',
    'src="/logo_saham.png"'
);

fs.writeFileSync('index.html', html);
