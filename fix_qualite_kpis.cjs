const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const regex = /<div style="font-size:36px; font-weight:800; color:#d33b21;">124<\/div>[\s\S]*?<div style="font-size:36px; font-weight:800; color:#0e6944;">2.4<\/div>[\s\S]*?<div style="font-size:36px; font-weight:800; color:#0e6944;">64<\/div>/;

const newKpis = `
<div style="font-size:36px; font-weight:800; color:#d33b21;">\${APP.userRole === 'DR' ? '42' : APP.userRole === 'CA' ? '12' : '124'}</div>
                            <div style="font-size:12px; color:var(--slate-500); margin-top:8px;">-15% vs mois dernier</div>
                        </div>
                        <div class="card" style="padding:24px;">
                            <h3 style="font-size:14px; color:var(--slate-500); margin-bottom:12px;">Délai de Résolution (Jours)</h3>
                            <div style="font-size:36px; font-weight:800; color:#0e6944;">\${APP.userRole === 'DR' ? '1.8' : APP.userRole === 'CA' ? '1.2' : '2.4'}</div>
                            <div style="font-size:12px; color:var(--slate-500); margin-top:8px;">Objectif: < 3 jours</div>
                        </div>
                        <div class="card" style="padding:24px;">
                            <h3 style="font-size:14px; color:var(--slate-500); margin-bottom:12px;">NPS (Net Promoter Score)</h3>
                            <div style="font-size:36px; font-weight:800; color:#0e6944;">\${APP.userRole === 'DR' ? '68' : APP.userRole === 'CA' ? '71' : '64'}</div>
`;
html = html.replace(regex, newKpis);
fs.writeFileSync('index.html', html);
