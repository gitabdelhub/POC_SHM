const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// Update renderPBI function
const oldRenderPBI = `        function renderPBI(container, moduleDef) {
            container.innerHTML = PBI_TEMPLATE;
        }`;

const newRenderPBI = `        function renderPBI(container, moduleDef) {
            container.innerHTML = \`
                <div class="fade-in">
                    <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:16px;">
                        <div>
                            <div style="display:flex; align-items:center; gap:8px; color:var(--primary-teal); font-weight:700; font-size:12px; letter-spacing:1px; text-transform:uppercase; margin-bottom:8px;">
                                <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
                                RENTABILITÉ
                            </div>
                            <h2 style="font-family:'Montserrat', sans-serif; font-size:32px; color:var(--dark-teal); font-weight:700; margin-bottom:8px;">\${moduleDef.name}</h2>
                            <p style="color:var(--slate-500); max-width:800px; line-height:1.5;">Vision consolidée du Produit Net Bancaire commercial, marges et commissions par réseau, direction régionale, groupe et portefeuille.</p>
                        </div>
                    </div>
                    
                    <div style="display:flex; gap:16px; margin-bottom:32px;">
                        <button class="btn btn-secondary" style="display:flex; gap:8px; align-items:center;">
                            <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                            Recharger
                        </button>
                        <button class="btn btn-primary" style="display:flex; gap:8px; align-items:center; background:#0e6944; border-color:#0e6944;">
                            <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                            Exporter
                        </button>
                    </div>

                    <div style="background:var(--surface); border-radius:12px; border:1px solid var(--sec-bg); overflow:hidden; box-shadow:0 4px 12px rgba(0,0,0,0.05);">
                        <div style="background:#0e6944; padding:12px 24px; color:white; display:flex; align-items:center; justify-content:space-between;">
                            <div style="display:flex; align-items:center; gap:12px;">
                                <div style="background:#F2C811; color:black; width:24px; height:24px; border-radius:4px; display:flex; align-items:center; justify-content:center; font-weight:bold; font-size:14px;">P</div>
                                <span style="font-weight:600; font-size:15px;">Power BI • Rapport embarqué</span>
                                <span style="display:flex; align-items:center; gap:6px; font-size:12px; color:rgba(255,255,255,0.7); margin-left:16px;">
                                    <span style="width:6px; height:6px; background:#4CAF50; border-radius:50%; display:inline-block;"></span>
                                    Tenant Saham • d45dd877...23ce
                                </span>
                            </div>
                            <div style="display:flex; gap:16px;">
                                <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" style="cursor:pointer; opacity:0.8;"><path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                                <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" style="cursor:pointer; opacity:0.8;"><path stroke-linecap="round" stroke-linejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"></path></svg>
                            </div>
                        </div>
                        
                        <div style="padding:20px 24px; background:#f4fbf7; border-bottom:1px solid var(--sec-bg); display:grid; grid-template-columns:repeat(5, 1fr); gap:16px; align-items:end;">
                            <div>
                                <label style="font-size:11px; font-weight:700; color:#0e6944; margin-bottom:6px; display:block; text-transform:uppercase;">Année</label>
                                <select class="form-select" style="width:100%; padding:10px; border-radius:6px; border:1px solid var(--slate-300);"><option>Tout</option><option>2026</option><option>2025</option></select>
                            </div>
                            <div>
                                <label style="font-size:11px; font-weight:700; color:#0e6944; margin-bottom:6px; display:block; text-transform:uppercase;">Mois</label>
                                <select class="form-select" style="width:100%; padding:10px; border-radius:6px; border:1px solid var(--slate-300);"><option>Tout</option></select>
                            </div>
                            <div>
                                <label style="font-size:11px; font-weight:700; color:#0e6944; margin-bottom:6px; display:block; text-transform:uppercase;">Réseau</label>
                                <select class="form-select" style="width:100%; padding:10px; border-radius:6px; border:1px solid var(--slate-300);"><option>Tout</option></select>
                            </div>
                            <div>
                                <label style="font-size:11px; font-weight:700; color:#0e6944; margin-bottom:6px; display:block; text-transform:uppercase;">DR</label>
                                <select class="form-select" style="width:100%; padding:10px; border-radius:6px; border:1px solid var(--slate-300);"><option>Tout</option></select>
                            </div>
                            <div>
                                <label style="font-size:11px; font-weight:700; color:#0e6944; margin-bottom:6px; display:block; text-transform:uppercase;">Agence</label>
                                <select class="form-select" style="width:100%; padding:10px; border-radius:6px; border:1px solid var(--slate-300);"><option>Tout</option></select>
                            </div>
                            <div style="grid-column: span 2;">
                                <label style="font-size:11px; font-weight:700; color:#0e6944; margin-bottom:6px; display:block; text-transform:uppercase;">Marché</label>
                                <select class="form-select" style="width:100%; padding:10px; border-radius:6px; border:1px solid var(--slate-300);"><option>Tout</option></select>
                            </div>
                            <div style="grid-column: span 2;">
                                <label style="font-size:11px; font-weight:700; color:#0e6944; margin-bottom:6px; display:block; text-transform:uppercase;">Portefeuille</label>
                                <select class="form-select" style="width:100%; padding:10px; border-radius:6px; border:1px solid var(--slate-300);"><option>Tout</option></select>
                            </div>
                            <div>
                                <button class="btn btn-secondary" style="width:100%; padding:10px; display:flex; justify-content:center; gap:8px; align-items:center; background:white; color:#0e6944; border-color:var(--slate-300);">
                                    <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                                    Réinitialiser
                                </button>
                            </div>
                        </div>
                        
                        <div style="height:500px; background:white; display:flex; flex-direction:column; align-items:center; justify-content:center;">
                            <div style="display:flex; align-items:center; gap:12px; margin-bottom:32px;">
                                <div style="display:flex; gap:4px; align-items:flex-end; height:32px;">
                                    <div style="width:8px; height:16px; background:#E6C229;"></div>
                                    <div style="width:8px; height:24px; background:#F1D302;"></div>
                                    <div style="width:8px; height:32px; background:#F2B705;"></div>
                                </div>
                                <span style="font-size:28px; font-weight:300; color:#444; font-family:'Segoe UI', sans-serif;">Power BI</span>
                            </div>
                            <p style="color:#666; font-size:18px; font-family:'Segoe UI', sans-serif; font-weight:300; margin-bottom:32px;">Connectez-vous pour voir ce rapport</p>
                            <button style="background:#0e6944; color:white; border:none; border-radius:4px; padding:10px 24px; font-size:15px; font-weight:600; font-family:'Segoe UI', sans-serif; cursor:pointer;" onclick="this.innerHTML='Connexion en cours...'; setTimeout(() => showToast('Authentification SSO réussie'), 1000);">Se connecter</button>
                        </div>
                        <div style="background:#e8f4ed; padding:16px; font-size:12px; color:#333; text-align:center; border-top:1px solid #d1e8db;">
                            Rapport sécurisé — authentification SSO au tenant Saham, affiché directement dans cette page. Si l'écran reste bloqué sur la connexion, autorisez les cookies tiers de app.powerbi.com dans le navigateur.
                        </div>
                    </div>
                </div>\`;
        }`;

html = html.replace(oldRenderPBI, newRenderPBI);

fs.writeFileSync('index.html', html);
console.log('Fixed renderPBI');
