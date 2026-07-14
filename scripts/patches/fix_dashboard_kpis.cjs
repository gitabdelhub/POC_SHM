const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const regex = /function renderDashboard\(container\) \{[\s\S]*?(?=<!-- Main Charts Row -->)/;

const newRender = `function renderDashboard(container) {
            const profileData = {
                'DG': { title: 'Vue Macro Groupe', pnb: '1.42 Md', credits: '45.8 Md', depots: '52.4 Md', npl: '0.85', trendPNB: '+5.4%', trendCred: '+2.1%', trendDep: '+3.8%' },
                'DR': { title: 'Vue Régionale (Rabat Agdal)', pnb: '345 M', credits: '12.1 Md', depots: '15.2 Md', npl: '0.92', trendPNB: '+3.2%', trendCred: '+1.5%', trendDep: '+2.1%' },
                'CA': { title: 'Vue Portefeuille Clientèle', pnb: '85 M', credits: '2.4 Md', depots: '3.1 Md', npl: '1.02', trendPNB: '+1.4%', trendCred: '+0.8%', trendDep: '+1.2%' },
                'AR': { title: 'Vue Agence', pnb: '65 M', credits: '1.8 Md', depots: '2.5 Md', npl: '0.98', trendPNB: '+1.1%', trendCred: '+0.5%', trendDep: '+0.9%' },
                'Admin': { title: 'Vue Complète Système', pnb: '1.42 Md', credits: '45.8 Md', depots: '52.4 Md', npl: '0.85', trendPNB: '+5.4%', trendCred: '+2.1%', trendDep: '+3.8%' }
            };
            const data = profileData[APP.userRole] || profileData['DG'];
            const formatVal = (str) => {
                const parts = str.split(' ');
                return \`\${parts[0]} <span style="font-size:16px; font-weight:600; color:var(--slate-500);">\${parts[1] || ''} MAD</span>\`;
            };

            container.innerHTML = \`
                <div class="fade-in">
                    <div style="display:flex; align-items:center; gap:12px; margin-bottom:24px;">
                        <span style="background:var(--light-bg); color:var(--primary-teal); padding:4px 12px; border-radius:20px; font-size:11px; font-weight:700; letter-spacing:1px; text-transform:uppercase;">\${data.title}</span>
                        <h2 style="font-family:'Montserrat', sans-serif; font-size:24px; color:var(--dark-teal); font-weight:800; margin:0;">Performances Financières & Commerciales</h2>
                    </div>

                    <!-- KPI Row -->
                    <div style="display:grid; grid-template-columns: repeat(4, 1fr); gap:16px; margin-bottom:24px;">
                        <div style="background:white; border-radius:12px; border:1px solid var(--sec-bg); padding:20px; box-shadow:0 2px 8px rgba(0,0,0,0.02);">
                            <h3 style="font-family:'Montserrat', sans-serif; font-size:12px; color:var(--slate-500); text-transform:uppercase; letter-spacing:0.5px; margin-bottom:8px; display:flex; justify-content:space-between; align-items:center;">
                                Produit Net Bancaire <div style="width:24px; height:24px; border-radius:50%; background:#f0fdf4; color:#16a34a; display:flex; align-items:center; justify-content:center; font-size:12px;">▲</div>
                            </h3>
                            <div style="font-size:32px; font-weight:800; color:var(--dark-teal); margin-bottom:12px; font-family:'Manrope', sans-serif;">\${formatVal(data.pnb)}</div>
                            <div style="font-size:12px; color:var(--slate-500); display:flex; align-items:center; gap:6px;">
                                <span style="background:#f0fdf4; color:#16a34a; padding:2px 6px; border-radius:4px; font-weight:600; font-size:10px;">\${data.trendPNB}</span> vs année précédente
                            </div>
                        </div>

                        <div style="background:white; border-radius:12px; border:1px solid var(--sec-bg); padding:20px; box-shadow:0 2px 8px rgba(0,0,0,0.02);">
                            <h3 style="font-family:'Montserrat', sans-serif; font-size:12px; color:var(--slate-500); text-transform:uppercase; letter-spacing:0.5px; margin-bottom:8px; display:flex; justify-content:space-between; align-items:center;">
                                Encours Crédits <div style="width:24px; height:24px; border-radius:50%; background:#f0fdf4; color:#16a34a; display:flex; align-items:center; justify-content:center; font-size:12px;">▲</div>
                            </h3>
                            <div style="font-size:32px; font-weight:800; color:var(--dark-teal); margin-bottom:12px; font-family:'Manrope', sans-serif;">\${formatVal(data.credits)}</div>
                            <div style="font-size:12px; color:var(--slate-500); display:flex; align-items:center; gap:6px;">
                                <span style="background:#f0fdf4; color:#16a34a; padding:2px 6px; border-radius:4px; font-weight:600; font-size:10px;">\${data.trendCred}</span> vs objectif annuel
                            </div>
                        </div>

                        <div style="background:white; border-radius:12px; border:1px solid var(--sec-bg); padding:20px; box-shadow:0 2px 8px rgba(0,0,0,0.02);">
                            <h3 style="font-family:'Montserrat', sans-serif; font-size:12px; color:var(--slate-500); text-transform:uppercase; letter-spacing:0.5px; margin-bottom:8px; display:flex; justify-content:space-between; align-items:center;">
                                Encours Dépôts <div style="width:24px; height:24px; border-radius:50%; background:#f0fdf4; color:#16a34a; display:flex; align-items:center; justify-content:center; font-size:12px;">▲</div>
                            </h3>
                            <div style="font-size:32px; font-weight:800; color:var(--dark-teal); margin-bottom:12px; font-family:'Manrope', sans-serif;">\${formatVal(data.depots)}</div>
                            <div style="font-size:12px; color:var(--slate-500); display:flex; align-items:center; gap:6px;">
                                <span style="background:#f0fdf4; color:#16a34a; padding:2px 6px; border-radius:4px; font-weight:600; font-size:10px;">\${data.trendDep}</span> collecte nette
                            </div>
                        </div>

                        <div style="background:white; border-radius:12px; border:1px solid var(--sec-bg); padding:20px; box-shadow:0 2px 8px rgba(0,0,0,0.02);">
                            <h3 style="font-family:'Montserrat', sans-serif; font-size:12px; color:var(--slate-500); text-transform:uppercase; letter-spacing:0.5px; margin-bottom:8px; display:flex; justify-content:space-between; align-items:center;">
                                Coût du Risque <div style="width:24px; height:24px; border-radius:50%; background:#f0fdf4; color:#16a34a; display:flex; align-items:center; justify-content:center; font-size:12px;">▼</div>
                            </h3>
                            <div style="font-size:32px; font-weight:800; color:var(--dark-teal); margin-bottom:12px; font-family:'Manrope', sans-serif;">\${data.npl}<span style="font-size:24px;">%</span></div>
                            <div style="font-size:12px; color:var(--slate-500); display:flex; align-items:center; gap:6px;">
                                <span style="background:#f0fdf4; color:#16a34a; padding:2px 6px; border-radius:4px; font-weight:600; font-size:10px;">-12 pts</span> amélioration qualité
                            </div>
                        </div>
                    </div>
                    `;

html = html.replace(regex, newRender);
fs.writeFileSync('index.html', html);
