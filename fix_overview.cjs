const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// Replace renderOverview
const startMarker = 'function renderOverview(container) {';
const endMarker = 'function renderCiblage(container) {';
const beforePart = html.substring(0, html.indexOf(startMarker));
const afterPart = html.substring(html.indexOf(endMarker));

const newOverview = `function renderOverview(container) {
            container.innerHTML = \`
                <div class="fade-in">
                    <div style="display:flex; align-items:center; gap:12px; margin-bottom:24px;">
                        <span style="background:var(--light-bg); color:var(--primary-teal); padding:4px 12px; border-radius:20px; font-size:11px; font-weight:700; letter-spacing:1px; text-transform:uppercase;">Stratégie</span>
                        <h2 style="font-family:'Montserrat', sans-serif; font-size:24px; color:var(--dark-teal); font-weight:800; margin:0;">Intelligence Opérationnelle et Marché</h2>
                    </div>

                    <!-- KPI Row -->
                    <div class="grid" style="margin-bottom:24px;">
                        <div class="card">
                            <h3 class="font-brand" style="font-size:12px; color:var(--slate-500); text-transform:uppercase; letter-spacing:0.5px; margin-bottom:8px;">Agences Actives</h3>
                            <div style="font-size:32px; font-weight:800; color:var(--dark-teal); margin-bottom:12px;">320</div>
                            <div style="font-size:12px; color:var(--slate-500); display:flex; align-items:center; gap:6px;">
                                <span style="background:var(--light-bg); color:var(--primary-teal); padding:2px 6px; border-radius:4px; font-weight:600;">94.5% active</span> couverture nationale
                            </div>
                        </div>
                        <div class="card">
                            <h3 class="font-brand" style="font-size:12px; color:var(--slate-500); text-transform:uppercase; letter-spacing:0.5px; margin-bottom:8px;">Segment Principal</h3>
                            <div style="font-size:32px; font-weight:800; color:var(--dark-teal); margin-bottom:12px;">Retail</div>
                            <div style="font-size:12px; color:var(--slate-500); display:flex; align-items:center; gap:6px;">
                                <span style="background:var(--light-bg); color:var(--primary-teal); padding:2px 6px; border-radius:4px; font-weight:600;">43.9% parts</span> leader des segments
                            </div>
                        </div>
                        <div class="card">
                            <h3 class="font-brand" style="font-size:12px; color:var(--slate-500); text-transform:uppercase; letter-spacing:0.5px; margin-bottom:8px;">Meilleur PNB Agence</h3>
                            <div style="font-size:32px; font-weight:800; color:var(--dark-teal); margin-bottom:12px;">3,769 K MAD</div>
                            <div style="font-size:12px; color:var(--slate-500); display:flex; align-items:center; gap:6px;">
                                <span style="background:#e8f4ed; color:#0e6944; padding:2px 6px; border-radius:4px; font-weight:600;">+0.2% vs #2</span> Casablanca Anfa
                            </div>
                        </div>
                        <div class="card">
                            <h3 class="font-brand" style="font-size:12px; color:var(--slate-500); text-transform:uppercase; letter-spacing:0.5px; margin-bottom:8px;">Sessions Digitales</h3>
                            <div style="font-size:32px; font-weight:800; color:var(--dark-teal); margin-bottom:12px;">43.9%</div>
                            <div style="font-size:12px; color:var(--slate-500); display:flex; align-items:center; gap:6px;">
                                <span style="background:rgba(211,59,33,0.1); color:var(--primary-orange); padding:2px 6px; border-radius:4px; font-weight:600;">+12.2 pt</span> vs mois précédent
                            </div>
                        </div>
                    </div>

                    <!-- Main Charts Row -->
                    <div style="display:grid; grid-template-columns: 1fr 1fr; gap:24px; margin-bottom:24px;">
                        
                        <!-- Scatter Plot Sim -->
                        <div class="chart-container" style="margin-bottom:0;">
                            <h3 class="chart-title" style="font-size:16px;">Revenus par Agence vs Risque de Churn</h3>
                            <div style="width:100%; height:300px; position:relative; border-left:1px solid var(--sec-bg); border-bottom:1px solid var(--sec-bg);">
                                <!-- Y Axis Label -->
                                <div style="position:absolute; left:-40px; top:50%; transform:translateY(-50%) rotate(-90deg); font-size:11px; color:var(--slate-500);">Taux de Churn (%)</div>
                                <!-- X Axis Label -->
                                <div style="position:absolute; bottom:-30px; left:50%; transform:translateX(-50%); font-size:11px; color:var(--slate-500);">PNB (K MAD)</div>
                                
                                <!-- Scatter points -->
                                <div style="position:absolute; left:20%; bottom:15%; width:40px; height:40px; background:rgba(74, 222, 128, 0.6); border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:10px;">Rabat</div>
                                <div style="position:absolute; left:50%; bottom:25%; width:60px; height:60px; background:rgba(74, 222, 128, 0.6); border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:10px;">Casa</div>
                                <div style="position:absolute; left:75%; bottom:10%; width:70px; height:70px; background:rgba(74, 222, 128, 0.6); border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:10px;">Tanger</div>
                                <div style="position:absolute; left:30%; bottom:50%; width:30px; height:30px; background:rgba(248, 113, 113, 0.6); border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:10px;">Fès</div>
                            </div>
                        </div>

                        <!-- Donut Charts Sim -->
                        <div class="chart-container" style="margin-bottom:0;">
                            <h3 class="chart-title" style="font-size:16px;">Distribution des Segments et Produits</h3>
                            <div style="display:flex; height:300px; justify-content:space-around; align-items:center;">
                                
                                <div style="text-align:center;">
                                    <div style="font-size:12px; color:var(--slate-500); margin-bottom:16px;">Segments Clients</div>
                                    <svg width="140" height="140" viewBox="0 0 100 100">
                                        <circle cx="50" cy="50" r="40" fill="transparent" stroke="var(--primary-teal)" stroke-width="20" stroke-dasharray="113 138" stroke-dashoffset="0"></circle>
                                        <circle cx="50" cy="50" r="40" fill="transparent" stroke="#2563EB" stroke-width="20" stroke-dasharray="75 176" stroke-dashoffset="-113"></circle>
                                        <circle cx="50" cy="50" r="40" fill="transparent" stroke="#94A3B8" stroke-width="20" stroke-dasharray="63 188" stroke-dashoffset="-188"></circle>
                                        <text x="50" y="55" text-anchor="middle" font-size="16" font-weight="bold" fill="var(--slate-700)">45%</text>
                                    </svg>
                                </div>

                                <div style="text-align:center;">
                                    <div style="font-size:12px; color:var(--slate-500); margin-bottom:16px;">Familles de Produits</div>
                                    <svg width="140" height="140" viewBox="0 0 100 100">
                                        <circle cx="50" cy="50" r="40" fill="transparent" stroke="#0F766E" stroke-width="20" stroke-dasharray="88 163" stroke-dashoffset="0"></circle>
                                        <circle cx="50" cy="50" r="40" fill="transparent" stroke="#0EA5E9" stroke-width="20" stroke-dasharray="50 201" stroke-dashoffset="-88"></circle>
                                        <circle cx="50" cy="50" r="40" fill="transparent" stroke="#64748B" stroke-width="20" stroke-dasharray="113 138" stroke-dashoffset="-138"></circle>
                                        <text x="50" y="55" text-anchor="middle" font-size="16" font-weight="bold" fill="var(--slate-700)">35%</text>
                                    </svg>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            \`;
        }

`;

html = beforePart + newOverview + afterPart;
fs.writeFileSync('index.html', html);
console.log('Fixed renderOverview');
