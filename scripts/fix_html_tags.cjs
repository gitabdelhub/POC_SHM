const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

html = html.replace(/<div class="sidebar-header" style="padding: 24px; justify-content: center; height:80px;">\n                <img src="\/logo_saham.png" alt="Saham Bank" style="height: 40px; width: auto; object-fit: contain;">\n            <\/div>\n            <\/div>/g, 
`<div class="sidebar-header" style="padding: 24px; justify-content: center; height:80px;">
                <img src="/logo_saham.png" alt="Saham Bank" style="height: 40px; width: auto; object-fit: contain;">
            </div>`);

fs.writeFileSync('index.html', html);
