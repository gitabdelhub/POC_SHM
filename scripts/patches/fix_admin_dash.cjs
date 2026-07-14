const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// Update UI form in admin-add-dash
const oldFormHtml = `                                <div>
                                    <label style="display:block; margin-bottom:8px; font-weight:600; color:var(--slate-700); font-size:13px;">URL du rapport (Power BI Embed Link ou autre web URL)</label>
                                    <input type="text" id="new-dash-url" placeholder="https://app.powerbi.com/reportEmbed?reportId=..." style="width:100%; padding:12px; border:1px solid var(--sec-bg); border-radius:8px;">
                                </div>`;

const newFormHtml = `                                <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px;">
                                    <div>
                                        <label style="display:block; margin-bottom:8px; font-weight:600; color:var(--slate-700); font-size:13px;">Module Parent (Optionnel)</label>
                                        <select id="new-dash-parent" style="width:100%; padding:12px; border:1px solid var(--sec-bg); border-radius:8px; background:white;">
                                            <option value="">Aucun (Module Principal)</option>
                                            <option value="dashboard">Pilotage Commercial</option>
                                            <option value="engagements">Espace Engagements</option>
                                            <option value="qualite">Qualité de Service Clientèle</option>
                                            <option value="rentabilite">Rentabilité</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label style="display:block; margin-bottom:8px; font-weight:600; color:var(--slate-700); font-size:13px;">URL du rapport (Optionnel, laissez vide pour un template générique)</label>
                                        <input type="text" id="new-dash-url" placeholder="https://app.powerbi.com/reportEmbed?reportId=..." style="width:100%; padding:12px; border:1px solid var(--sec-bg); border-radius:8px;">
                                    </div>
                                </div>`;

html = html.replace(oldFormHtml, newFormHtml);

// Update createCustomDashboard logic
const oldScript = `            const url = document.getElementById('new-dash-url').value.trim();
            if (!name || !url) {
                showToast('Veuillez remplir tous les champs', true);
                return;
            }
            const roles = Array.from(document.querySelectorAll('.new-dash-role:checked')).map(cb => cb.value);
            if (roles.length === 0) {
                showToast('Veuillez sélectionner au moins un rôle', true);
                return;
            }
            const id = 'custom-' + Date.now();
            APP.modules.push({
                id: id,
                name: name,
                icon: '<path stroke-linecap="round" stroke-linejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />',
                roles: roles,
                isCustomExt: true,
                url: url
            });`;

const newScript = `            const url = document.getElementById('new-dash-url').value.trim();
            const parentId = document.getElementById('new-dash-parent').value;
            if (!name) {
                showToast('Veuillez donner un nom au module', true);
                return;
            }
            const roles = Array.from(document.querySelectorAll('.new-dash-role:checked')).map(cb => cb.value);
            if (roles.length === 0) {
                showToast('Veuillez sélectionner au moins un rôle', true);
                return;
            }
            const id = 'custom-' + Date.now();
            const newModule = {
                id: id,
                name: name,
                icon: '<path stroke-linecap="round" stroke-linejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />',
                roles: roles,
                isCustomExt: true,
                url: url || ''
            };

            if (parentId) {
                const parentGroup = APP.modules.find(m => m.id === parentId);
                if (parentGroup) {
                    if (!parentGroup.isGroup) {
                        parentGroup.isGroup = true;
                        parentGroup.subItems = [];
                    }
                    parentGroup.subItems.push(newModule);
                } else {
                    APP.modules.push(newModule);
                }
            } else {
                APP.modules.push(newModule);
            }`;

html = html.replace(oldScript, newScript);

// Update route() logic to handle empty URLs nicely
const oldRouteLogic = `                    if (moduleDef && moduleDef.isCustomExt) {
                        content.innerHTML = \`<div class="fade-in" style="height:100%; display:flex; flex-direction:column;">
                            <h2 style="font-family:'Montserrat', sans-serif; font-size:24px; color:var(--dark-teal); font-weight:700; margin-bottom:16px;">\${moduleDef.name}</h2>
                            <div style="flex:1; background:var(--surface); border:1px solid var(--sec-bg); border-radius:var(--border-radius); overflow:hidden;">
                                <iframe src="\${moduleDef.url}" style="width:100%; height:100%; border:none;"></iframe>
                            </div>
                        </div>\`;`;

const newRouteLogic = `                    if (moduleDef && moduleDef.isCustomExt) {
                        if (moduleDef.url) {
                            content.innerHTML = \`<div class="fade-in" style="height:100%; display:flex; flex-direction:column;">
                                <h2 style="font-family:'Montserrat', sans-serif; font-size:24px; color:var(--dark-teal); font-weight:700; margin-bottom:16px;">\${moduleDef.name}</h2>
                                <div style="flex:1; background:var(--surface); border:1px solid var(--sec-bg); border-radius:var(--border-radius); overflow:hidden;">
                                    <iframe src="\${moduleDef.url}" style="width:100%; height:100%; border:none;"></iframe>
                                </div>
                            </div>\`;
                        } else {
                            content.innerHTML = \`<div class="fade-in" style="height:100%; display:flex; flex-direction:column;">
                                <h2 style="font-family:'Montserrat', sans-serif; font-size:24px; color:var(--dark-teal); font-weight:700; margin-bottom:16px;">\${moduleDef.name}</h2>
                                
                                <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:20px; margin-bottom:24px;">
                                    <div class="card" style="padding:24px;">
                                        <h3 style="font-size:14px; color:var(--slate-500); margin-bottom:12px;">Indicateur Principal</h3>
                                        <div style="font-size:36px; font-weight:800; color:var(--primary-teal);">N/A</div>
                                        <div style="font-size:12px; color:var(--slate-500); margin-top:8px;">Configuration en attente</div>
                                    </div>
                                    <div class="card" style="padding:24px;">
                                        <h3 style="font-size:14px; color:var(--slate-500); margin-bottom:12px;">Progression</h3>
                                        <div style="font-size:36px; font-weight:800; color:#10b981;">--</div>
                                    </div>
                                    <div class="card" style="padding:24px;">
                                        <h3 style="font-size:14px; color:var(--slate-500); margin-bottom:12px;">Statut</h3>
                                        <div style="display:inline-block; margin-top:8px; padding:6px 12px; background:var(--light-bg); color:var(--primary-teal); border-radius:12px; font-weight:600; font-size:14px;">Module initialisé</div>
                                    </div>
                                </div>
                                <div class="card" style="flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:40px; text-align:center;">
                                    <div style="width:64px; height:64px; border-radius:50%; background:var(--light-bg); color:var(--primary-teal); display:flex; align-items:center; justify-content:center; margin-bottom:20px;">
                                        <svg width="32" height="32" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                                    </div>
                                    <h3 style="font-family:'Montserrat', sans-serif; font-size:20px; color:var(--dark-teal); font-weight:600; margin-bottom:12px;">Ce module est en cours de construction</h3>
                                    <p style="color:var(--slate-500); max-width:400px; line-height:1.6; margin-bottom:24px;">Le tableau de bord "\${moduleDef.name}" a été créé, mais aucune source de données ou URL n'a encore été connectée.</p>
                                    <button class="btn btn-primary" onclick="location.hash='admin'">Configurer ce module</button>
                                </div>
                            </div>\`;
                        }`;

html = html.replace(oldRouteLogic, newRouteLogic);

fs.writeFileSync('index.html', html);
