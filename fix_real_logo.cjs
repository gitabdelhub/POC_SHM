const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const badLogin = `<div class="landing-logo" style="display:flex; align-items:center; gap:12px;">
                    <div style="display:flex; flex-direction:column; align-items:flex-end;">
                        <span style="font-family:'Montserrat', sans-serif; font-size:18px; font-weight:800; color:#2F4F4F; letter-spacing:1px; line-height:1.2;">SAHAM BANK</span>
                        <span style="font-family:Arial, sans-serif; font-size:16px; font-weight:700; color:#2F4F4F; line-height:1;">سهام بنك</span>
                    </div>
                    <svg viewBox="0 0 100 100" width="44" height="44" style="overflow:visible;">
                        <path d="M30,70 C 50,90 90,60 70,30 C 50,0 10,30 30,50 C 50,70 90,40 70,10" fill="none" stroke="#D32F2F" stroke-width="4" stroke-linecap="round"/>
                        <path d="M20,60 C 40,80 80,50 60,20" fill="none" stroke="#D32F2F" stroke-width="4" stroke-linecap="round"/>
                        <circle cx="65" cy="25" r="4" fill="#D32F2F"/>
                    </svg>
                </div>`;

const goodLogin = `<div class="landing-logo" style="display:flex; align-items:center;">
                    <img src="logo_saham.png" alt="Saham Bank" style="height: 48px; object-fit: contain;">
                </div>`;
html = html.replace(badLogin, goodLogin);

const badSidebar = `<div class="sidebar-header">
                <svg viewBox="0 0 100 100" width="32" height="32" style="flex-shrink:0; overflow:visible;">
                    <path d="M30,70 C 50,90 90,60 70,30 C 50,0 10,30 30,50 C 50,70 90,40 70,10" fill="none" stroke="#D32F2F" stroke-width="5" stroke-linecap="round"/>
                    <path d="M20,60 C 40,80 80,50 60,20" fill="none" stroke="#D32F2F" stroke-width="5" stroke-linecap="round"/>
                    <circle cx="65" cy="25" r="4" fill="#D32F2F"/>
                </svg>
                <div class="brand-text" style="display:flex; flex-direction:column; line-height:1.1; margin-left:12px;">
                    <span style="font-family:'Montserrat', sans-serif; font-size:14px; font-weight:800; color:#2F4F4F; letter-spacing:0.5px;">SAHAM BANK</span>
                    <span style="font-family:Arial, sans-serif; font-size:12px; font-weight:700; color:#2F4F4F;">سهام بنك</span>
                </div>
            </div>`;

const goodSidebar = `<div class="sidebar-header" style="padding: 16px 24px;">
                <img src="logo_saham.png" alt="Saham Bank" style="height: 32px; flex-shrink:0; object-fit: contain; margin-left:-4px;">
                <div class="brand-text" style="font-size: 16px; margin-left: 12px; display:flex; flex-direction:column; justify-content:center; padding-top:4px;">
                    Analytics
                </div>
            </div>`;
html = html.replace(badSidebar, goodSidebar);

fs.writeFileSync('index.html', html);
console.log('Fixed real logos!');
