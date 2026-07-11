const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const ciblageFunc = `
        function renderCiblage(container) {
            container.innerHTML = \`
                <div class="fade-in">
                    <div style="display:flex; align-items:center; gap:12px; margin-bottom:24px;">
                        <span style="background:var(--light-bg); color:var(--primary-teal); padding:4px 12px; border-radius:20px; font-size:11px; font-weight:700; letter-spacing:1px; text-transform:uppercase;">Marketing & Ventes</span>
                        <h2 style="font-family:'Montserrat', sans-serif; font-size:24px; color:var(--dark-teal); font-weight:800; margin:0;">Ciblage & Campagnes</h2>
                    </div>
                    <div style="background:white; border-radius:12px; border:1px solid var(--sec-bg); padding:24px; box-shadow:0 2px 8px rgba(0,0,0,0.02); text-align:center;">
                        <svg width="64" height="64" fill="none" stroke="var(--slate-300)" stroke-width="1.5" viewBox="0 0 24 24" style="margin-bottom:16px;">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                        </svg>
                        <h3 style="font-family:'Montserrat', sans-serif; font-size:18px; color:var(--dark-teal); margin-bottom:8px;">Outil de ciblage en construction</h3>
                        <p style="color:var(--slate-500); font-size:14px; max-width:400px; margin:0 auto;">Le module de ciblage client et de génération de leads commerciaux sera bientôt disponible dans cette vue.</p>
                        <button style="margin-top:24px; background:var(--primary-teal); color:white; border:none; padding:10px 24px; border-radius:8px; font-weight:600; cursor:pointer; box-shadow:0 2px 4px rgba(0,0,0,0.1);" onclick="showToast('Bientôt disponible')">Être notifié</button>
                    </div>
                </div>
            \`;
        }
`;

if (!html.includes('function renderCiblage')) {
    html = html.replace('function renderPowerbi(container) {', ciblageFunc + '\n        function renderPowerbi(container) {');
    fs.writeFileSync('index.html', html);
    console.log('Added renderCiblage');
}
