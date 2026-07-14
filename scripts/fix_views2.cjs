const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// Replace renderDashboard
const startDash = 'function renderDashboard(container) {';
const endDash = 'function renderCiblage(container) {';

const beforeDash = html.substring(0, html.indexOf(startDash));
const afterDash = html.substring(html.indexOf(endDash));

const newDash = `function renderDashboard(container) {
            container.innerHTML = \`
                <div class="fade-in">
                    <div style="display:flex; align-items:center; gap:12px; margin-bottom:24px;">
                        <span style="background:var(--light-bg); color:var(--primary-teal); padding:4px 12px; border-radius:20px; font-size:11px; font-weight:700; letter-spacing:1px; text-transform:uppercase;">Stratégie</span>
                        <h2 style="font-family:'Montserrat', sans-serif; font-size:24px; color:var(--dark-teal); font-weight:800; margin:0;">Intelligence Opérationnelle et Marché</h2>
                    </div>

                    <!-- KPI Row -->
                    <div style="display:grid; grid-template-columns: repeat(4, 1fr); gap:16px; margin-bottom:24px;">
                        <div style="background:white; border-radius:12px; border:1px solid var(--sec-bg); padding:20px; box-shadow:0 2px 8px rgba(0,0,0,0.02);">
                            <h3 style="font-family:'Montserrat', sans-serif; font-size:12px; color:var(--slate-500); text-transform:uppercase; letter-spacing:0.5px; margin-bottom:8px; display:flex; justify-content:space-between; align-items:center;">
                                Agences Actives <div style="width:24px; height:24px; border-radius:50%; border:1px solid #e2e8f0;"></div>
                            </h3>
                            <div style="font-size:32px; font-weight:800; color:var(--dark-teal); margin-bottom:12px; font-family:'Manrope', sans-serif;">16</div>
                            <div style="font-size:12px; color:var(--slate-500); display:flex; align-items:center; gap:6px;">
                                <span style="background:#eef2ff; color:#4f46e5; padding:2px 6px; border-radius:4px; font-weight:600; font-size:10px;">47.5% active</span> market footprint
                            </div>
                        </div>
                        <div style="background:white; border-radius:12px; border:1px solid var(--sec-bg); padding:20px; box-shadow:0 2px 8px rgba(0,0,0,0.02);">
                            <h3 style="font-family:'Montserrat', sans-serif; font-size:12px; color:var(--slate-500); text-transform:uppercase; letter-spacing:0.5px; margin-bottom:8px; display:flex; justify-content:space-between; align-items:center;">
                                Top Device <div style="width:24px; height:24px; border-radius:50%; border:1px solid #e2e8f0;"></div>
                            </h3>
                            <div style="font-size:32px; font-weight:800; color:var(--dark-teal); margin-bottom:12px; font-family:'Manrope', sans-serif;">Mobile</div>
                            <div style="font-size:12px; color:var(--slate-500); display:flex; align-items:center; gap:6px;">
                                <span style="background:#eff6ff; color:#2563eb; padding:2px 6px; border-radius:4px; font-weight:600; font-size:10px;">43.9% share</span> usage share leader
                            </div>
                        </div>
                        <div style="background:white; border-radius:12px; border:1px solid var(--sec-bg); padding:20px; box-shadow:0 2px 8px rgba(0,0,0,0.02);">
                            <h3 style="font-family:'Montserrat', sans-serif; font-size:12px; color:var(--slate-500); text-transform:uppercase; letter-spacing:0.5px; margin-bottom:8px; display:flex; justify-content:space-between; align-items:center;">
                                Best Market MRR <span style="font-size:10px; background:#f1f5f9; padding:2px 6px; border-radius:4px;">MAD</span>
                            </h3>
                            <div style="font-size:32px; font-weight:800; color:var(--dark-teal); margin-bottom:12px; font-family:'Manrope', sans-serif;">3,769 K</div>
                            <div style="font-size:12px; color:var(--slate-500); display:flex; align-items:center; gap:6px;">
                                <span style="background:#f0fdf4; color:#16a34a; padding:2px 6px; border-radius:4px; font-weight:600; font-size:10px;">+0.2% vs #2</span> lead market: MA
                            </div>
                        </div>
                        <div style="background:white; border-radius:12px; border:1px solid var(--sec-bg); padding:20px; box-shadow:0 2px 8px rgba(0,0,0,0.02);">
                            <h3 style="font-family:'Montserrat', sans-serif; font-size:12px; color:var(--slate-500); text-transform:uppercase; letter-spacing:0.5px; margin-bottom:8px; display:flex; justify-content:space-between; align-items:center;">
                                Mobile Sessions <div style="width:24px; height:24px; border-radius:50%; border:1px solid #e2e8f0;"></div>
                            </h3>
                            <div style="font-size:32px; font-weight:800; color:var(--dark-teal); margin-bottom:12px; font-family:'Manrope', sans-serif;">43.9%</div>
                            <div style="font-size:12px; color:var(--slate-500); display:flex; align-items:center; gap:6px;">
                                <span style="background:#fef2f2; color:#dc2626; padding:2px 6px; border-radius:4px; font-weight:600; font-size:10px;">-12.2 pt vs non-mobile</span> platform distribution
                            </div>
                        </div>
                    </div>

                    <!-- Main Charts Row -->
                    <div style="display:flex; flex-direction:column; gap:24px; margin-bottom:24px;">
                        
                        <!-- Map Sim -->
                        <div style="background:white; border-radius:12px; border:1px solid var(--sec-bg); box-shadow:0 2px 8px rgba(0,0,0,0.02); overflow:hidden;">
                            <div style="padding:20px 24px; border-bottom:1px solid var(--sec-bg);">
                                <h3 style="font-family:'Montserrat', sans-serif; font-size:16px; font-weight:700; color:var(--dark-teal); margin:0;">Country revenue map</h3>
                            </div>
                            <div style="position:relative; width:100%; height:400px; display:flex; align-items:center; justify-content:center; background:#f8fafc; overflow:hidden;">
                                <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80" style="width:100%; height:100%; object-fit:cover; opacity:0.1; position:absolute;" alt="map" />
                                <div style="position:absolute; inset:0; background:radial-gradient(circle at center, transparent 0%, #f8fafc 80%);"></div>
                                <div style="position:relative; width:80%; height:80%;">
                                    <svg viewBox="0 0 1000 500" style="width:100%; height:100%; filter:drop-shadow(0 4px 12px rgba(0,0,0,0.1));">
                                        <!-- Simplified Africa Outline -->
                                        <path d="M 400 150 C 480 140 520 180 550 250 C 580 350 500 450 480 480 C 450 450 480 350 420 300 C 350 300 300 250 350 180 Z" fill="#e2e8f0" stroke="#fff" stroke-width="2"/>
                                        <path d="M 450 130 C 500 130 520 100 550 120 C 650 150 700 80 800 100 C 900 120 900 250 850 300 C 750 300 650 250 550 220 Z" fill="#e2e8f0" stroke="#fff" stroke-width="2"/>
                                        <!-- Morocco Highlight -->
                                        <path d="M 360 170 C 400 160 410 190 380 220 C 350 220 340 190 360 170 Z" fill="#2563eb" stroke="#1e40af" stroke-width="1"/>
                                        <circle cx="375" cy="195" r="4" fill="white" />
                                        <!-- Other Highlights -->
                                        <path d="M 460 110 C 480 100 490 120 470 140 C 450 130 450 120 460 110 Z" fill="#3b82f6" stroke="#2563eb" stroke-width="1"/>
                                        <path d="M 500 140 C 520 130 530 160 510 170 C 490 160 490 150 500 140 Z" fill="#60a5fa" stroke="#3b82f6" stroke-width="1"/>
                                    </svg>
                                </div>
                                <div style="position:absolute; right:24px; bottom:24px; display:flex; flex-direction:column; gap:4px; font-size:10px; color:var(--slate-500); align-items:center;">
                                    <span style="font-weight:600; color:var(--dark-teal);">MRR (MAD)</span>
                                    <div style="height:120px; width:12px; background:linear-gradient(to top, #eff6ff, #2563eb); border-radius:6px; margin:8px 0;"></div>
                                    <div style="display:flex; flex-direction:column; justify-content:space-between; height:120px; position:absolute; right:-20px; top:28px;">
                                        <span>250</span><span>200</span><span>150</span><span>100</span><span>50</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Bottom Charts row -->
                        <div style="display:flex; gap:24px;">
                            <!-- Scatter Plot Sim -->
                            <div style="flex:1; background:white; border-radius:12px; border:1px solid var(--sec-bg); box-shadow:0 2px 8px rgba(0,0,0,0.02); overflow:hidden;">
                                <div style="padding:20px 24px; border-bottom:1px solid var(--sec-bg);">
                                    <h3 style="font-family:'Montserrat', sans-serif; font-size:16px; font-weight:700; color:var(--dark-teal); margin:0;">Country revenue vs churn risk</h3>
                                </div>
                                <div style="padding:24px; width:100%; height:300px; position:relative; box-sizing:border-box;">
                                    <div style="position:absolute; left:40px; right:24px; top:24px; bottom:40px; border-left:1px solid #e2e8f0; border-bottom:1px solid #e2e8f0;">
                                        <!-- Y Axis Label -->
                                        <div style="position:absolute; left:-35px; top:50%; transform:translateY(-50%) rotate(-90deg); font-size:11px; color:var(--slate-500);">Churn rate (%)</div>
                                        <!-- X Axis Label -->
                                        <div style="position:absolute; bottom:-30px; left:50%; transform:translateX(-50%); font-size:11px; color:var(--slate-500);">MRR (K MAD)</div>
                                        
                                        <!-- Grid lines -->
                                        <div style="position:absolute; left:0; right:0; top:20%; border-bottom:1px dashed #f1f5f9;"></div>
                                        <div style="position:absolute; left:0; right:0; top:40%; border-bottom:1px dashed #f1f5f9;"></div>
                                        <div style="position:absolute; left:0; right:0; top:60%; border-bottom:1px dashed #f1f5f9;"></div>
                                        <div style="position:absolute; left:0; right:0; top:80%; border-bottom:1px solid #cbd5e1;"></div>
                                        <div style="position:absolute; left:25%; top:0; bottom:0; border-left:1px solid #cbd5e1;"></div>
                                        
                                        <!-- Scatter points -->
                                        <div style="position:absolute; left:10%; bottom:80%; width:24px; height:24px; background:rgba(239, 68, 68, 0.7); border-radius:50%; display:flex; align-items:center; justify-content:center;">
                                            <span style="position:absolute; top:-20px; font-size:10px; color:var(--slate-500);">Spain</span>
                                        </div>
                                        <div style="position:absolute; left:60%; bottom:25%; width:50px; height:50px; background:rgba(34, 197, 94, 0.7); border-radius:50%; display:flex; align-items:center; justify-content:center;">
                                            <span style="position:absolute; top:-20px; font-size:10px; color:var(--slate-500);">Algeria</span>
                                        </div>
                                        <div style="position:absolute; left:85%; bottom:35%; width:70px; height:70px; background:rgba(34, 197, 94, 0.7); border-radius:50%; display:flex; align-items:center; justify-content:center;">
                                            <span style="position:absolute; top:-20px; font-size:10px; color:var(--slate-500);">Morocco</span>
                                        </div>
                                        <div style="position:absolute; left:30%; bottom:40%; width:30px; height:30px; background:rgba(132, 204, 22, 0.7); border-radius:50%; display:flex; align-items:center; justify-content:center;">
                                            <span style="position:absolute; top:-20px; font-size:10px; color:var(--slate-500);">US</span>
                                        </div>
                                        <div style="position:absolute; left:22%; bottom:18%; width:40px; height:40px; background:rgba(34, 197, 94, 0.7); border-radius:50%; display:flex; align-items:center; justify-content:center;">
                                            <span style="position:absolute; top:-20px; font-size:10px; color:var(--slate-500);">France</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Donut Charts Sim -->
                            <div style="flex:1; background:white; border-radius:12px; border:1px solid var(--sec-bg); box-shadow:0 2px 8px rgba(0,0,0,0.02); overflow:hidden;">
                                <div style="padding:20px 24px; border-bottom:1px solid var(--sec-bg);">
                                    <h3 style="font-family:'Montserrat', sans-serif; font-size:16px; font-weight:700; color:var(--dark-teal); margin:0;">Device and OS session distribution</h3>
                                </div>
                                <div style="display:flex; height:300px; justify-content:space-around; align-items:center; padding:24px; box-sizing:border-box;">
                                    
                                    <div style="text-align:center;">
                                        <div style="font-size:12px; color:var(--slate-700); font-weight:600; margin-bottom:16px;">Sessions by device category</div>
                                        <div style="position:relative; width:160px; height:160px;">
                                            <svg width="160" height="160" viewBox="0 0 100 100" style="transform: rotate(-90deg);">
                                                <!-- Desktop -->
                                                <circle cx="50" cy="50" r="35" fill="transparent" stroke="#1e3a8a" stroke-width="30" stroke-dasharray="100 120" stroke-dashoffset="0"></circle>
                                                <!-- Mobile -->
                                                <circle cx="50" cy="50" r="35" fill="transparent" stroke="#3b82f6" stroke-width="30" stroke-dasharray="60 160" stroke-dashoffset="-100"></circle>
                                                <!-- Tablet -->
                                                <circle cx="50" cy="50" r="35" fill="transparent" stroke="#94a3b8" stroke-width="30" stroke-dasharray="45 175" stroke-dashoffset="-160"></circle>
                                                <!-- Other -->
                                                <circle cx="50" cy="50" r="35" fill="transparent" stroke="#e2e8f0" stroke-width="30" stroke-dasharray="15 205" stroke-dashoffset="-205"></circle>
                                            </svg>
                                            <div style="position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center;">
                                            </div>
                                            <div style="position:absolute; top:25px; right:20px; font-size:10px; color:white; font-weight:bold;">45%</div>
                                            <div style="position:absolute; bottom:30px; left:20px; font-size:10px; color:white; font-weight:bold;">27.9%</div>
                                        </div>
                                    </div>

                                    <div style="text-align:center;">
                                        <div style="font-size:12px; color:var(--slate-700); font-weight:600; margin-bottom:16px;">Sessions by OS</div>
                                        <div style="position:relative; width:160px; height:160px;">
                                            <svg width="160" height="160" viewBox="0 0 100 100" style="transform: rotate(-90deg);">
                                                <circle cx="50" cy="50" r="35" fill="transparent" stroke="#1e3a8a" stroke-width="30" stroke-dasharray="60 160" stroke-dashoffset="0"></circle>
                                                <circle cx="50" cy="50" r="35" fill="transparent" stroke="#0f766e" stroke-width="30" stroke-dasharray="45 175" stroke-dashoffset="-60"></circle>
                                                <circle cx="50" cy="50" r="35" fill="transparent" stroke="#3b82f6" stroke-width="30" stroke-dasharray="40 180" stroke-dashoffset="-105"></circle>
                                                <circle cx="50" cy="50" r="35" fill="transparent" stroke="#06b6d4" stroke-width="30" stroke-dasharray="30 190" stroke-dashoffset="-145"></circle>
                                                <circle cx="50" cy="50" r="35" fill="transparent" stroke="#64748b" stroke-width="30" stroke-dasharray="45 175" stroke-dashoffset="-175"></circle>
                                            </svg>
                                            <div style="position:absolute; top:35px; right:20px; font-size:10px; color:white; font-weight:bold;">26.3%</div>
                                            <div style="position:absolute; top:35px; left:20px; font-size:10px; color:white; font-weight:bold;">20%</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            \`;
        }`;

html = beforeDash + newDash + afterDash;

// Replace renderPowerbi
const startPBI = 'function renderPowerbi(container) {';
const endPBI = 'function renderAdmin(container) {';

const beforePBI = html.substring(0, html.indexOf(startPBI));
const afterPBI = html.substring(html.indexOf(endPBI));

const newPBI = `function renderPowerbi(container) {
            container.innerHTML = \`
                <div class="fade-in">
                    <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:16px;">
                        <div>
                            <div style="display:flex; align-items:center; gap:8px; color:var(--primary-teal); font-weight:700; font-size:12px; letter-spacing:1px; text-transform:uppercase; margin-bottom:8px;">
                                <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
                                RENTABILITÉ
                            </div>
                            <h2 style="font-family:'Montserrat', sans-serif; font-size:32px; color:var(--dark-teal); font-weight:700; margin-bottom:8px;">PNB Commercial • Agences CAM 2025</h2>
                            <p style="color:var(--slate-500); max-width:800px; line-height:1.5;">Vision consolidée du Produit Net Bancaire commercial, marges et commissions par réseau, direction régionale, groupe et portefeuille.</p>
                        </div>
                    </div>
                    
                    <div style="display:flex; gap:16px; margin-bottom:32px;">
                        <button style="display:flex; gap:8px; align-items:center; background:white; border:1px solid #e2e8f0; border-radius:8px; padding:10px 20px; font-weight:600; color:var(--dark-teal); box-shadow:0 1px 2px rgba(0,0,0,0.05); cursor:pointer;">
                            <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                            Recharger
                        </button>
                        <button style="display:flex; gap:8px; align-items:center; background:#0e6944; border:1px solid #0e6944; border-radius:8px; padding:10px 20px; font-weight:600; color:white; box-shadow:0 1px 2px rgba(14,105,68,0.2); cursor:pointer;">
                            <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                            Exporter
                        </button>
                    </div>

                    <div style="background:var(--surface); border-radius:24px; border:1px solid var(--sec-bg); overflow:hidden; box-shadow:0 10px 25px -5px rgba(0,0,0,0.05);">
                        <div style="background:#0e6944; padding:16px 24px; color:white; display:flex; align-items:center; justify-content:space-between;">
                            <div style="display:flex; align-items:center; gap:12px;">
                                <div style="background:#F2C811; color:black; width:28px; height:28px; border-radius:6px; display:flex; align-items:center; justify-content:center; font-weight:bold; font-size:16px; font-family:'Manrope', sans-serif;">P</div>
                                <span style="font-weight:700; font-size:16px;">Power BI • Rapport embarqué</span>
                                <span style="display:flex; align-items:center; gap:6px; font-size:12px; color:rgba(255,255,255,0.7); margin-left:16px; font-family:'JetBrains Mono', monospace;">
                                    <span style="width:6px; height:6px; background:#4CAF50; border-radius:50%; display:inline-block;"></span>
                                    Tenant CAM • d45dd877...23ce
                                </span>
                            </div>
                            <div style="display:flex; gap:16px;">
                                <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" style="cursor:pointer; opacity:0.8;"><path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                                <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" style="cursor:pointer; opacity:0.8;"><path stroke-linecap="round" stroke-linejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"></path></svg>
                            </div>
                        </div>
                        
                        <div style="padding:20px 24px; background:#f4fbf7; border-bottom:1px solid #d1e8db; display:grid; grid-template-columns:repeat(5, 1fr); gap:20px; align-items:end;">
                            <div>
                                <label style="font-size:11px; font-weight:800; color:#0e6944; margin-bottom:8px; display:block; text-transform:uppercase; letter-spacing:0.5px;">Année</label>
                                <select style="width:100%; padding:12px; border-radius:8px; border:1px solid #d1e8db; background:white; color:var(--dark-teal); font-weight:500; font-family:'Manrope', sans-serif; cursor:pointer; outline:none;"><option>Tout</option><option>2026</option><option>2025</option></select>
                            </div>
                            <div>
                                <label style="font-size:11px; font-weight:800; color:#0e6944; margin-bottom:8px; display:block; text-transform:uppercase; letter-spacing:0.5px;">Mois</label>
                                <select style="width:100%; padding:12px; border-radius:8px; border:1px solid #d1e8db; background:white; color:var(--dark-teal); font-weight:500; font-family:'Manrope', sans-serif; cursor:pointer; outline:none;"><option>Tout</option></select>
                            </div>
                            <div>
                                <label style="font-size:11px; font-weight:800; color:#0e6944; margin-bottom:8px; display:block; text-transform:uppercase; letter-spacing:0.5px;">Réseau</label>
                                <select style="width:100%; padding:12px; border-radius:8px; border:1px solid #d1e8db; background:white; color:var(--dark-teal); font-weight:500; font-family:'Manrope', sans-serif; cursor:pointer; outline:none;"><option>Tout</option></select>
                            </div>
                            <div>
                                <label style="font-size:11px; font-weight:800; color:#0e6944; margin-bottom:8px; display:block; text-transform:uppercase; letter-spacing:0.5px;">DR</label>
                                <select style="width:100%; padding:12px; border-radius:8px; border:1px solid #d1e8db; background:white; color:var(--dark-teal); font-weight:500; font-family:'Manrope', sans-serif; cursor:pointer; outline:none;"><option>Tout</option></select>
                            </div>
                            <div>
                                <label style="font-size:11px; font-weight:800; color:#0e6944; margin-bottom:8px; display:block; text-transform:uppercase; letter-spacing:0.5px;">Agence</label>
                                <select style="width:100%; padding:12px; border-radius:8px; border:1px solid #d1e8db; background:white; color:var(--dark-teal); font-weight:500; font-family:'Manrope', sans-serif; cursor:pointer; outline:none;"><option>Tout</option></select>
                            </div>
                            <div style="grid-column: span 2;">
                                <label style="font-size:11px; font-weight:800; color:#0e6944; margin-bottom:8px; display:block; text-transform:uppercase; letter-spacing:0.5px;">Marché</label>
                                <select style="width:100%; padding:12px; border-radius:8px; border:1px solid #d1e8db; background:white; color:var(--dark-teal); font-weight:500; font-family:'Manrope', sans-serif; cursor:pointer; outline:none;"><option>Tout</option></select>
                            </div>
                            <div style="grid-column: span 2;">
                                <label style="font-size:11px; font-weight:800; color:#0e6944; margin-bottom:8px; display:block; text-transform:uppercase; letter-spacing:0.5px;">Portefeuille</label>
                                <select style="width:100%; padding:12px; border-radius:8px; border:1px solid #d1e8db; background:white; color:var(--dark-teal); font-weight:500; font-family:'Manrope', sans-serif; cursor:pointer; outline:none;"><option>Tout</option></select>
                            </div>
                            <div>
                                <button style="width:100%; padding:12px; display:flex; justify-content:center; gap:8px; align-items:center; background:white; color:#0e6944; border:1px solid #d1e8db; border-radius:8px; font-weight:700; cursor:pointer;">
                                    <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                                    Réinitialiser
                                </button>
                            </div>
                        </div>
                        
                        <div style="height:550px; background:#f9fafb; display:flex; flex-direction:column; align-items:center; justify-content:center; position:relative; overflow:hidden;">
                            <div style="position:absolute; inset:0; opacity:0.03; background-image:radial-gradient(circle at 2px 2px, black 1px, transparent 0); background-size:32px 32px;"></div>
                            <div style="display:flex; align-items:center; gap:16px; margin-bottom:32px; z-index:1;">
                                <div style="display:flex; gap:6px; align-items:flex-end; height:48px;">
                                    <div style="width:12px; height:24px; background:#E6C229; border-radius:2px;"></div>
                                    <div style="width:12px; height:36px; background:#F1D302; border-radius:2px;"></div>
                                    <div style="width:12px; height:48px; background:#F2B705; border-radius:2px;"></div>
                                </div>
                                <span style="font-size:36px; font-weight:300; color:#334155; font-family:'Segoe UI', system-ui, sans-serif;">Power BI</span>
                            </div>
                            <p style="color:#64748b; font-size:18px; font-family:'Segoe UI', system-ui, sans-serif; font-weight:400; margin-bottom:32px; z-index:1;">Connectez-vous pour voir ce rapport</p>
                            <button style="background:#0e6944; color:white; border:none; border-radius:6px; padding:12px 32px; font-size:16px; font-weight:600; font-family:'Segoe UI', system-ui, sans-serif; cursor:pointer; box-shadow:0 4px 12px rgba(14,105,68,0.2); transition:all 0.2s; z-index:1;" onclick="this.innerHTML='Connexion en cours...'; this.style.opacity='0.8'; setTimeout(() => showToast('Authentification SSO réussie'), 1000);">Se connecter</button>
                        </div>
                        <div style="background:#e8f4ed; padding:16px; font-size:13px; color:#1e293b; text-align:center; border-top:1px solid #d1e8db;">
                            Rapport sécurisé — authentification SSO au tenant CAM, affiché directement dans cette page. Si l'écran reste bloqué sur la connexion, autorisez les cookies tiers de <strong>app.powerbi.com</strong> dans le navigateur.
                        </div>
                    </div>
                </div>\`;
        }`;

html = beforePBI + newPBI + afterPBI;
fs.writeFileSync('index.html', html);
console.log('Fixed renderDashboard and renderPowerbi');
