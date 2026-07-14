const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const badLoginLogo = `<div class="landing-logo">
                    <div class="landing-logo-circle">S</div>
                    SAHAM BANK
                </div>`;

const goodLoginLogo = `<div class="landing-logo" style="display:flex; align-items:center;">
                    <img src="logo_saham.png" alt="Saham Bank" style="height: 48px; object-fit: contain;">
                </div>`;

html = html.replace(badLoginLogo, goodLoginLogo);

const badSidebarLogo = `<div class="sidebar-header">
                <div style="width:32px;height:32px;background:var(--primary-orange);color:white;border-radius:8px;display:flex;align-items:center;justify-content:center;font-weight:bold;flex-shrink:0;">S</div>
                <div class="brand-text">Saham Analytics</div>
            </div>`;

const goodSidebarLogo = `<div class="sidebar-header" style="padding: 16px 24px;">
                <img src="logo_saham.png" alt="Saham Bank" style="height: 32px; flex-shrink:0; object-fit: contain;">
                <div class="brand-text" style="font-size: 16px; margin-left: 12px; display:flex; flex-direction:column; justify-content:center; padding-top:4px;">
                    Analytics
                </div>
            </div>`;

html = html.replace(badSidebarLogo, goodSidebarLogo);

fs.writeFileSync('index.html', html);
console.log('Logos replaced!');
