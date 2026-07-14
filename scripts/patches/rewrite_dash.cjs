const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const startDash = 'function renderDashboard(container) {';
const endDash = 'function renderPowerbi(container) {';

const beforeDash = html.substring(0, html.indexOf(startDash));
const afterDash = html.substring(html.indexOf(endDash));

const newDash = `function renderDashboard(container) {
            container.innerHTML = \`
                <div class="fade-in">
                    <div style="display:flex; align-items:center; gap:12px; margin-bottom:24px;">
                        <span style="background:var(--light-bg); color:var(--primary-teal); padding:4px 12px; border-radius:20px; font-size:11px; font-weight:700; letter-spacing:1px; text-transform:uppercase;">Vue d'Ensemble</span>
                        <h2 style="font-family:'Montserrat', sans-serif; font-size:24px; color:var(--dark-teal); font-weight:800; margin:0;">Performances Financières & Commerciales</h2>
                    </div>

                    <!-- KPI Row -->
                    <div style="display:grid; grid-template-columns: repeat(4, 1fr); gap:16px; margin-bottom:24px;">
                        <div style="background:white; border-radius:12px; border:1px solid var(--sec-bg); padding:20px; box-shadow:0 2px 8px rgba(0,0,0,0.02);">
                            <h3 style="font-family:'Montserrat', sans-serif; font-size:12px; color:var(--slate-500); text-transform:uppercase; letter-spacing:0.5px; margin-bottom:8px; display:flex; justify-content:space-between; align-items:center;">
                                Produit Net Bancaire <div style="width:24px; height:24px; border-radius:50%; background:#f0fdf4; color:#16a34a; display:flex; align-items:center; justify-content:center; font-size:12px;">▲</div>
                            </h3>
                            <div style="font-size:32px; font-weight:800; color:var(--dark-teal); margin-bottom:12px; font-family:'Manrope', sans-serif;">1.42 <span style="font-size:16px; font-weight:600; color:var(--slate-500);">Md MAD</span></div>
                            <div style="font-size:12px; color:var(--slate-500); display:flex; align-items:center; gap:6px;">
                                <span style="background:#f0fdf4; color:#16a34a; padding:2px 6px; border-radius:4px; font-weight:600; font-size:10px;">+5.4%</span> vs année précédente
                            </div>
                        </div>
                        <div style="background:white; border-radius:12px; border:1px solid var(--sec-bg); padding:20px; box-shadow:0 2px 8px rgba(0,0,0,0.02);">
                            <h3 style="font-family:'Montserrat', sans-serif; font-size:12px; color:var(--slate-500); text-transform:uppercase; letter-spacing:0.5px; margin-bottom:8px; display:flex; justify-content:space-between; align-items:center;">
                                Encours Crédits <div style="width:24px; height:24px; border-radius:50%; background:#f0fdf4; color:#16a34a; display:flex; align-items:center; justify-content:center; font-size:12px;">▲</div>
                            </h3>
                            <div style="font-size:32px; font-weight:800; color:var(--dark-teal); margin-bottom:12px; font-family:'Manrope', sans-serif;">45.8 <span style="font-size:16px; font-weight:600; color:var(--slate-500);">Md MAD</span></div>
                            <div style="font-size:12px; color:var(--slate-500); display:flex; align-items:center; gap:6px;">
                                <span style="background:#f0fdf4; color:#16a34a; padding:2px 6px; border-radius:4px; font-weight:600; font-size:10px;">+2.1%</span> vs objectif annuel
                            </div>
                        </div>
                        <div style="background:white; border-radius:12px; border:1px solid var(--sec-bg); padding:20px; box-shadow:0 2px 8px rgba(0,0,0,0.02);">
                            <h3 style="font-family:'Montserrat', sans-serif; font-size:12px; color:var(--slate-500); text-transform:uppercase; letter-spacing:0.5px; margin-bottom:8px; display:flex; justify-content:space-between; align-items:center;">
                                Encours Dépôts <div style="width:24px; height:24px; border-radius:50%; background:#f0fdf4; color:#16a34a; display:flex; align-items:center; justify-content:center; font-size:12px;">▲</div>
                            </h3>
                            <div style="font-size:32px; font-weight:800; color:var(--dark-teal); margin-bottom:12px; font-family:'Manrope', sans-serif;">52.4 <span style="font-size:16px; font-weight:600; color:var(--slate-500);">Md MAD</span></div>
                            <div style="font-size:12px; color:var(--slate-500); display:flex; align-items:center; gap:6px;">
                                <span style="background:#f0fdf4; color:#16a34a; padding:2px 6px; border-radius:4px; font-weight:600; font-size:10px;">+3.8%</span> collecte nette
                            </div>
                        </div>
                        <div style="background:white; border-radius:12px; border:1px solid var(--sec-bg); padding:20px; box-shadow:0 2px 8px rgba(0,0,0,0.02);">
                            <h3 style="font-family:'Montserrat', sans-serif; font-size:12px; color:var(--slate-500); text-transform:uppercase; letter-spacing:0.5px; margin-bottom:8px; display:flex; justify-content:space-between; align-items:center;">
                                Coût du Risque <div style="width:24px; height:24px; border-radius:50%; background:#f0fdf4; color:#16a34a; display:flex; align-items:center; justify-content:center; font-size:12px;">▼</div>
                            </h3>
                            <div style="font-size:32px; font-weight:800; color:var(--dark-teal); margin-bottom:12px; font-family:'Manrope', sans-serif;">0.85<span style="font-size:24px;">%</span></div>
                            <div style="font-size:12px; color:var(--slate-500); display:flex; align-items:center; gap:6px;">
                                <span style="background:#f0fdf4; color:#16a34a; padding:2px 6px; border-radius:4px; font-weight:600; font-size:10px;">-12 pts</span> amélioration qualité
                            </div>
                        </div>
                    </div>

                    <!-- Main Charts Row -->
                    <div style="display:flex; gap:24px; margin-bottom:24px;">
                        
                        <!-- Bar Chart -->
                        <div style="flex:2; background:white; border-radius:12px; border:1px solid var(--sec-bg); box-shadow:0 2px 8px rgba(0,0,0,0.02); overflow:hidden; display:flex; flex-direction:column;">
                            <div style="padding:20px 24px; border-bottom:1px solid var(--sec-bg); display:flex; justify-content:space-between; align-items:center;">
                                <h3 style="font-family:'Montserrat', sans-serif; font-size:16px; font-weight:700; color:var(--dark-teal); margin:0;">Évolution du Produit Net Bancaire (M MAD)</h3>
                                <select style="padding:6px 12px; border:1px solid var(--sec-bg); border-radius:6px; font-size:12px; background:var(--light-bg);"><option>Année 2025</option><option>Année 2026</option></select>
                            </div>
                            <div style="flex:1; padding:24px; position:relative; display:flex; align-items:flex-end; gap:16px; justify-content:space-between; height:250px;">
                                <div style="position:absolute; left:24px; right:24px; top:24px; bottom:24px; border-bottom:1px solid #e2e8f0; display:flex; flex-direction:column; justify-content:space-between;">
                                    <div style="border-bottom:1px dashed #e2e8f0; width:100%;"></div>
                                    <div style="border-bottom:1px dashed #e2e8f0; width:100%;"></div>
                                    <div style="border-bottom:1px dashed #e2e8f0; width:100%;"></div>
                                    <div style="border-bottom:1px dashed #e2e8f0; width:100%;"></div>
                                </div>
                                \${[112, 125, 138, 141, 156, 184, 142, 135, 151, 165, 178, 221].map((val, i) => \`
                                <div style="position:relative; flex:1; display:flex; flex-direction:column; align-items:center; justify-content:flex-end; height:100%; z-index:1;">
                                    <div style="width:60%; background:\${i === 11 ? '#d33b21' : '#0e6944'}; height:\${(val/250)*100}%; border-radius:4px 4px 0 0; transition:height 1s ease-out; opacity:0.9;"></div>
                                    <span style="font-size:10px; color:var(--slate-500); margin-top:8px;">\${['Jan','Fév','Mar','Avr','Mai','Juin','Juil','Aoû','Sep','Oct','Nov','Déc'][i]}</span>
                                </div>
                                \`).join('')}
                            </div>
                        </div>

                        <!-- Donut Chart -->
                        <div style="flex:1; background:white; border-radius:12px; border:1px solid var(--sec-bg); box-shadow:0 2px 8px rgba(0,0,0,0.02); overflow:hidden;">
                            <div style="padding:20px 24px; border-bottom:1px solid var(--sec-bg);">
                                <h3 style="font-family:'Montserrat', sans-serif; font-size:16px; font-weight:700; color:var(--dark-teal); margin:0;">Répartition des Crédits</h3>
                            </div>
                            <div style="display:flex; flex-direction:column; align-items:center; padding:24px;">
                                <div style="position:relative; width:180px; height:180px; margin-bottom:24px;">
                                    <svg width="180" height="180" viewBox="0 0 100 100" style="transform: rotate(-90deg);">
                                        <circle cx="50" cy="50" r="35" fill="transparent" stroke="#0e6944" stroke-width="20" stroke-dasharray="140 220" stroke-dashoffset="0"></circle>
                                        <circle cx="50" cy="50" r="35" fill="transparent" stroke="#1d2b27" stroke-width="20" stroke-dasharray="45 220" stroke-dashoffset="-140"></circle>
                                        <circle cx="50" cy="50" r="35" fill="transparent" stroke="#d33b21" stroke-width="20" stroke-dasharray="25 220" stroke-dashoffset="-185"></circle>
                                        <circle cx="50" cy="50" r="35" fill="transparent" stroke="#e9eceb" stroke-width="20" stroke-dasharray="10 220" stroke-dashoffset="-210"></circle>
                                    </svg>
                                    <div style="position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center;">
                                        <span style="font-size:24px; font-weight:800; color:var(--dark-teal); font-family:'Manrope', sans-serif;">45.8</span>
                                        <span style="font-size:10px; color:var(--slate-500); text-transform:uppercase; font-weight:600;">Md MAD</span>
                                    </div>
                                </div>
                                <div style="width:100%; display:flex; flex-direction:column; gap:12px;">
                                    <div style="display:flex; justify-content:space-between; align-items:center; font-size:12px; color:var(--slate-700);">
                                        <div style="display:flex; align-items:center; gap:8px;"><div style="width:12px; height:12px; background:#0e6944; border-radius:2px;"></div> Retail (Immo & Conso)</div>
                                        <span style="font-weight:700;">64%</span>
                                    </div>
                                    <div style="display:flex; justify-content:space-between; align-items:center; font-size:12px; color:var(--slate-700);">
                                        <div style="display:flex; align-items:center; gap:8px;"><div style="width:12px; height:12px; background:#1d2b27; border-radius:2px;"></div> Entreprises & PME</div>
                                        <span style="font-weight:700;">20%</span>
                                    </div>
                                    <div style="display:flex; justify-content:space-between; align-items:center; font-size:12px; color:var(--slate-700);">
                                        <div style="display:flex; align-items:center; gap:8px;"><div style="width:12px; height:12px; background:#d33b21; border-radius:2px;"></div> Corporate & IB</div>
                                        <span style="font-weight:700;">12%</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            \`;
        }
`;

html = beforeDash + newDash + afterDash;
fs.writeFileSync('index.html', html);
console.log('Fixed renderDashboard to be serious banking');
