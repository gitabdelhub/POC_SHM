const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const qualiteAndCommissions = `
        function renderQualite(container) {
            container.innerHTML = \`
                <div class="fade-in">
                    <div style="display:flex; align-items:center; gap:12px; margin-bottom:24px;">
                        <span style="background:var(--light-bg); color:var(--primary-teal); padding:4px 12px; border-radius:20px; font-size:11px; font-weight:700; letter-spacing:1px; text-transform:uppercase;">Services & Qualité</span>
                        <h2 style="font-family:'Montserrat', sans-serif; font-size:24px; color:var(--dark-teal); font-weight:800; margin:0;">Qualité de Service Clientèle</h2>
                    </div>
                    
                    <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:24px; margin-bottom:24px;">
                        <div class="card" style="padding:24px;">
                            <h3 style="font-size:14px; color:var(--slate-500); margin-bottom:12px;">Réclamations Ouvertes</h3>
                            <div style="font-size:36px; font-weight:800; color:#d33b21;">124</div>
                            <div style="font-size:12px; color:var(--slate-500); margin-top:8px;">-15% vs mois dernier</div>
                        </div>
                        <div class="card" style="padding:24px;">
                            <h3 style="font-size:14px; color:var(--slate-500); margin-bottom:12px;">Délai de Résolution (Jours)</h3>
                            <div style="font-size:36px; font-weight:800; color:#0e6944;">2.4</div>
                            <div style="font-size:12px; color:var(--slate-500); margin-top:8px;">Objectif: < 3 jours</div>
                        </div>
                        <div class="card" style="padding:24px;">
                            <h3 style="font-size:14px; color:var(--slate-500); margin-bottom:12px;">NPS (Net Promoter Score)</h3>
                            <div style="font-size:36px; font-weight:800; color:#0e6944;">64</div>
                            <div style="font-size:12px; color:var(--slate-500); margin-top:8px;">+4 points T3</div>
                        </div>
                    </div>

                    <div class="card" style="padding:24px;">
                        <h3 style="font-family:'Montserrat', sans-serif; font-size:16px; font-weight:700; color:var(--dark-teal); margin-bottom:16px;">Top Agences (Satisfaction Client)</h3>
                        <div class="table-responsive">
                            <table>
                                <thead>
                                    <tr><th>Code Agence</th><th>Région</th><th>NPS</th><th>Réclamations Traitées</th><th>Délai Moyen</th></tr>
                                </thead>
                                <tbody>
                                    <tr><td>AG-104</td><td>Casablanca Centre</td><td>72 <span style="color:#0e6944;">▲</span></td><td>45</td><td>1.2 Jours</td></tr>
                                    <tr><td>AG-201</td><td>Rabat Agdal</td><td>68 <span style="color:#0e6944;">▲</span></td><td>32</td><td>1.8 Jours</td></tr>
                                    <tr><td>AG-305</td><td>Marrakech Guéliz</td><td>61 <span style="color:#d33b21;">▼</span></td><td>58</td><td>3.1 Jours</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            \`;
        }

        function renderCommissions(container) {
            container.innerHTML = \`
                <div class="fade-in">
                    <div style="display:flex; align-items:center; gap:12px; margin-bottom:24px;">
                        <span style="background:var(--light-bg); color:var(--primary-teal); padding:4px 12px; border-radius:20px; font-size:11px; font-weight:700; letter-spacing:1px; text-transform:uppercase;">Rentabilité</span>
                        <h2 style="font-family:'Montserrat', sans-serif; font-size:24px; color:var(--dark-teal); font-weight:800; margin:0;">Suivi des Commissions</h2>
                    </div>
                    <div style="background:white; border-radius:12px; border:1px solid var(--sec-bg); padding:24px; box-shadow:0 2px 8px rgba(0,0,0,0.02); text-align:center;">
                        <svg width="64" height="64" fill="none" stroke="var(--slate-300)" stroke-width="1.5" viewBox="0 0 24 24" style="margin-bottom:16px;">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <h3 style="font-family:'Montserrat', sans-serif; font-size:18px; color:var(--dark-teal); margin-bottom:8px;">Tableau de bord des commissions</h3>
                        <p style="color:var(--slate-500); font-size:14px; max-width:400px; margin:0 auto;">Le reporting détaillé des commissions par ligne de métier sera disponible dans la prochaine release.</p>
                    </div>
                </div>
            \`;
        }
`;

html = html.replace("case 'qualite': renderDashboard(content); break;", "case 'qualite': renderQualite(content); break;");
html = html.replace("case 'commissions':", "");
html = html.replace("case 'rentabilite': renderPowerbi(content); break;", "case 'commissions': renderCommissions(content); break;");

if (!html.includes('function renderQualite')) {
    html = html.replace('function renderPowerbi(container) {', qualiteAndCommissions + '\n        function renderPowerbi(container) {');
}

fs.writeFileSync('index.html', html);
console.log('Fixed qualite and commissions');
