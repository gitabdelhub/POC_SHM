const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const newDetailedSection = `
                    <!-- Detailed KPIs -->
                    <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:16px; margin-bottom:24px;">
                        <!-- Sector Distribution -->
                        <div style="background:white; border-radius:12px; border:1px solid var(--sec-bg); padding:20px; box-shadow:0 2px 8px rgba(0,0,0,0.02);">
                            <h3 style="font-family:'Montserrat', sans-serif; font-size:14px; font-weight:700; color:var(--dark-teal); margin-top:0; margin-bottom:16px;">Répartition par Secteur</h3>
                            
                            <div style="margin-bottom:12px;">
                                <div style="display:flex; justify-content:space-between; font-size:12px; margin-bottom:4px; font-weight:600; color:var(--text-main);">
                                    <span>Immobilier</span>
                                    <span>45%</span>
                                </div>
                                <div style="width:100%; height:6px; background:var(--light-bg); border-radius:3px; overflow:hidden;">
                                    <div style="width:45%; height:100%; background:var(--primary-teal); border-radius:3px;"></div>
                                </div>
                            </div>
                            
                            <div style="margin-bottom:12px;">
                                <div style="display:flex; justify-content:space-between; font-size:12px; margin-bottom:4px; font-weight:600; color:var(--text-main);">
                                    <span>Industrie & Commerce</span>
                                    <span>30%</span>
                                </div>
                                <div style="width:100%; height:6px; background:var(--light-bg); border-radius:3px; overflow:hidden;">
                                    <div style="width:30%; height:100%; background:var(--primary-orange); border-radius:3px;"></div>
                                </div>
                            </div>

                            <div style="margin-bottom:12px;">
                                <div style="display:flex; justify-content:space-between; font-size:12px; margin-bottom:4px; font-weight:600; color:var(--text-main);">
                                    <span>Agriculture</span>
                                    <span>15%</span>
                                </div>
                                <div style="width:100%; height:6px; background:var(--light-bg); border-radius:3px; overflow:hidden;">
                                    <div style="width:15%; height:100%; background:#10b981; border-radius:3px;"></div>
                                </div>
                            </div>
                            
                            <div>
                                <div style="display:flex; justify-content:space-between; font-size:12px; margin-bottom:4px; font-weight:600; color:var(--text-main);">
                                    <span>Particuliers</span>
                                    <span>10%</span>
                                </div>
                                <div style="width:100%; height:6px; background:var(--light-bg); border-radius:3px; overflow:hidden;">
                                    <div style="width:10%; height:100%; background:var(--slate-500); border-radius:3px;"></div>
                                </div>
                            </div>
                        </div>

                        <!-- Liquidity & Risk -->
                        <div style="background:white; border-radius:12px; border:1px solid var(--sec-bg); padding:20px; box-shadow:0 2px 8px rgba(0,0,0,0.02);">
                            <h3 style="font-family:'Montserrat', sans-serif; font-size:14px; font-weight:700; color:var(--dark-teal); margin-top:0; margin-bottom:16px;">Liquidité & Rentabilité</h3>
                            
                            <div style="display:flex; justify-content:space-between; align-items:center; padding-bottom:12px; border-bottom:1px solid var(--sec-bg); margin-bottom:12px;">
                                <span style="font-size:13px; color:var(--slate-500); font-weight:500;">Ratio Crédits/Dépôts</span>
                                <span style="font-size:14px; font-weight:700; color:var(--dark-teal);">87.4%</span>
                            </div>
                            <div style="display:flex; justify-content:space-between; align-items:center; padding-bottom:12px; border-bottom:1px solid var(--sec-bg); margin-bottom:12px;">
                                <span style="font-size:13px; color:var(--slate-500); font-weight:500;">Marge Nette d'Intérêt (NIM)</span>
                                <span style="font-size:14px; font-weight:700; color:var(--primary-teal);">3.12%</span>
                            </div>
                            <div style="display:flex; justify-content:space-between; align-items:center; padding-bottom:12px; border-bottom:1px solid var(--sec-bg); margin-bottom:12px;">
                                <span style="font-size:13px; color:var(--slate-500); font-weight:500;">Coût du Risque (CoR)</span>
                                <span style="font-size:14px; font-weight:700; color:var(--primary-orange);">0.85%</span>
                            </div>
                            <div style="display:flex; justify-content:space-between; align-items:center;">
                                <span style="font-size:13px; color:var(--slate-500); font-weight:500;">ROE (Retour sur Fonds Propres)</span>
                                <span style="font-size:14px; font-weight:700; color:#10b981;">14.2%</span>
                            </div>
                        </div>

                        <!-- Top Performers -->
                        <div style="background:white; border-radius:12px; border:1px solid var(--sec-bg); padding:20px; box-shadow:0 2px 8px rgba(0,0,0,0.02);">
                            <h3 style="font-family:'Montserrat', sans-serif; font-size:14px; font-weight:700; color:var(--dark-teal); margin-top:0; margin-bottom:16px;">Top Agences (Croissance PNB)</h3>
                            <ul style="list-style:none; padding:0; margin:0;">
                                <li style="display:flex; align-items:center; justify-content:space-between; padding-bottom:10px; margin-bottom:10px; border-bottom:1px solid var(--sec-bg);">
                                    <div style="display:flex; align-items:center; gap:8px;">
                                        <div style="width:24px; height:24px; border-radius:50%; background:var(--light-bg); color:var(--primary-teal); font-weight:700; font-size:10px; display:flex; align-items:center; justify-content:center;">1</div>
                                        <span style="font-size:13px; font-weight:600; color:var(--dark-teal);">Casa Anfa</span>
                                    </div>
                                    <span style="font-size:13px; font-weight:700; color:#10b981;">+12.4%</span>
                                </li>
                                <li style="display:flex; align-items:center; justify-content:space-between; padding-bottom:10px; margin-bottom:10px; border-bottom:1px solid var(--sec-bg);">
                                    <div style="display:flex; align-items:center; gap:8px;">
                                        <div style="width:24px; height:24px; border-radius:50%; background:var(--light-bg); color:var(--primary-teal); font-weight:700; font-size:10px; display:flex; align-items:center; justify-content:center;">2</div>
                                        <span style="font-size:13px; font-weight:600; color:var(--dark-teal);">Rabat Agdal</span>
                                    </div>
                                    <span style="font-size:13px; font-weight:700; color:#10b981;">+9.8%</span>
                                </li>
                                <li style="display:flex; align-items:center; justify-content:space-between; padding-bottom:10px; margin-bottom:10px; border-bottom:1px solid var(--sec-bg);">
                                    <div style="display:flex; align-items:center; gap:8px;">
                                        <div style="width:24px; height:24px; border-radius:50%; background:var(--light-bg); color:var(--primary-teal); font-weight:700; font-size:10px; display:flex; align-items:center; justify-content:center;">3</div>
                                        <span style="font-size:13px; font-weight:600; color:var(--dark-teal);">Tanger Centre</span>
                                    </div>
                                    <span style="font-size:13px; font-weight:700; color:#10b981;">+8.5%</span>
                                </li>
                                <li style="display:flex; align-items:center; justify-content:space-between;">
                                    <div style="display:flex; align-items:center; gap:8px;">
                                        <div style="width:24px; height:24px; border-radius:50%; background:var(--light-bg); color:var(--primary-teal); font-weight:700; font-size:10px; display:flex; align-items:center; justify-content:center;">4</div>
                                        <span style="font-size:13px; font-weight:600; color:var(--dark-teal);">Marrakech Guéliz</span>
                                    </div>
                                    <span style="font-size:13px; font-weight:700; color:#10b981;">+7.2%</span>
                                </li>
                            </ul>
                        </div>
                    </div>
`;

html = html.replace('<!-- Main Charts Row -->', newDetailedSection + '\n                    <!-- Main Charts Row -->');

fs.writeFileSync('index.html', html);
