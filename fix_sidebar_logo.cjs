const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// 1. Fix sidebar logo
const oldSidebarHeader = /<div class="sidebar-header" style="padding: 16px 24px;">[\s\S]*?<\/div>/;
const newSidebarHeader = `<div class="sidebar-header" style="padding: 24px; justify-content: center; height:80px;">
                <img src="/logo_saham.png" alt="Saham Bank" style="height: 40px; width: auto; object-fit: contain;">
            </div>`;
html = html.replace(oldSidebarHeader, newSidebarHeader);

// 2. Fix the Sauvegarder Configuration button color
html = html.replace('<button class="btn btn-primary" style="margin-top:24px;" onclick="showToast(\'Configuration enregistrée\')">Sauvegarder Configuration</button>', '<button class="btn btn-primary" style="margin-top:24px; background:var(--primary-teal); border:none;" onclick="showToast(\'Configuration enregistrée\')">Sauvegarder Configuration</button>');

fs.writeFileSync('index.html', html);
