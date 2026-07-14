const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const regex = /function renderAdmin\(content\) \{[\s\S]*?(?=function renderQualite)/;

const newRenderAdmin = `function renderAdmin(content, activeTab = 'admin-add-dash') {
            content.innerHTML = \`<div class="fade-in">
                    <h2 style="font-family:'Montserrat', sans-serif; font-size:24px; color:var(--dark-teal); font-weight:700; margin-bottom:24px;">CONSOLE ADMIN</h2>
                    
                    <!-- Utilisateurs -->
                    <div id="admin-users" class="\${activeTab === 'admin-users' ? '' : 'hidden'}">
                        <div class="card">
                            <div class="card-header">
                                <h3 class="chart-title" style="margin:0;">Gestion des Utilisateurs</h3>
                                <button class="btn btn-primary" onclick="showToast('Ajouter utilisateur')">+ Nouvel Utilisateur</button>
                            </div>
                            <div class="table-responsive">
                                <table>
                                    <thead><tr><th>Utilisateur</th><th>Email</th><th>Profil Technique</th><th>Agence / DR</th><th>Statut</th><th>Actions</th></tr></thead>
                                    <tbody>
                                        \${MOCK.admins.map(a => \`
                                            <tr>
                                                <td style="font-weight:600">\${a.nom}</td>
                                                <td>\${a.email}</td>
                                                <td><span style="background:var(--accent-teal-light); color:var(--primary-teal); padding:4px 8px; border-radius:4px; font-size:11px;">\${a.profil}</span></td>
                                                <td>\${a.agence}</td>
                                                <td>\${getStatutBadge(a.statut)}</td>
                                                <td>
                                                    <button class="icon-btn" onclick="showToast('Modifier utilisateur')"><svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg></button>
                                                </td>
                                            </tr>\`).join('')}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    <!-- Gestion des accès -->
                    <div id="admin-access" class="\${activeTab === 'admin-access' ? '' : 'hidden'}">
                        <div class="card" style="padding:32px;">
                            <h3 class="chart-title">Gestion des Accès / Permissions</h3>
                            <p style="color:var(--slate-500); margin-bottom:24px;">Configurez la visibilité des onglets pour chaque profil métier ou accordez des accès exceptionnels.</p>
                            <div style="background:var(--light-bg); border-radius:8px; padding:24px; text-align:center;">
                                <svg width="48" height="48" fill="none" stroke="var(--primary-teal)" stroke-width="2" viewBox="0 0 24 24" style="margin-bottom:16px; opacity:0.5;"><path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                                <h4 style="font-weight:600; color:var(--dark-teal); margin-bottom:8px;">Matrice des rôles</h4>
                                <p style="color:var(--slate-500); font-size:13px; margin-bottom:16px;">Sélectionnez un profil pour modifier ses habilitations sur les rapports et modules.</p>
                                <select style="padding:10px 16px; border-radius:8px; border:1px solid var(--sec-bg); font-size:14px; width:250px;">
                                    <option>Directeur Général</option>
                                    <option>Directeur de Réseau</option>
                                    <option>Chargé d'Affaires</option>
                                    <option>Directeur Risques</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <!-- Gestion des dashboards -->
                    <div id="admin-dashboards" class="\${activeTab === 'admin-dashboards' ? '' : 'hidden'}">
                        <div class="card" style="padding:32px;">
                            <h3 class="chart-title">Dashboards configurés</h3>
                            <div class="table-responsive" style="margin-top:24px;">
                                <table>
                                    <thead><tr><th>Nom du Module</th><th>ID</th><th>Type</th><th>Rôles autorisés</th><th>Actions</th></tr></thead>
                                    <tbody id="admin-dash-list">
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    <!-- Gestion des embeddings -->
                    <div id="admin-embeddings" class="\${activeTab === 'admin-embeddings' ? '' : 'hidden'}">
                        <div class="card" style="padding:32px;">
                            <h3 class="chart-title">Configuration Power BI / Embeddings</h3>
                            <div style="display:grid; grid-template-columns:1fr 1fr; gap:24px; margin-top:20px;">
                                <div>
                                    <label style="display:block; margin-bottom:8px; font-weight:600; color:var(--slate-700); font-size:13px;">Tenant ID</label>
                                    <input type="text" value="b41b72d0-4e9f-4c26-8a69-f949f367c91d" style="width:100%; padding:12px; border:1px solid var(--sec-bg); border-radius:8px; background:var(--light-bg)" readonly>
                                </div>
                                <div>
                                    <label style="display:block; margin-bottom:8px; font-weight:600; color:var(--slate-700); font-size:13px;">Client ID</label>
                                    <input type="text" value="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" style="width:100%; padding:12px; border:1px solid var(--sec-bg); border-radius:8px; background:var(--light-bg)" readonly>
                                </div>
                                <div style="grid-column:1/-1;">
                                    <label style="display:block; margin-bottom:8px; font-weight:600; color:var(--slate-700); font-size:13px;">Workspace ID (Production)</label>
                                    <input type="text" value="wks-saham-prod-001" style="width:100%; padding:12px; border:1px solid var(--sec-bg); border-radius:8px; background:var(--light-bg)" readonly>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Configuration des filtres -->
                    <div id="admin-filters" class="\${activeTab === 'admin-filters' ? '' : 'hidden'}">
                        <div class="card" style="padding:32px;">
                            <h3 class="chart-title">Configuration globale des filtres</h3>
                            <p style="color:var(--slate-500); margin-bottom:24px;">Gérez les filtres par défaut appliqués sur les embeddings via le RLS (Row-Level Security) selon le profil utilisateur connecté.</p>
                            <div style="padding:16px; border:1px solid var(--sec-bg); border-radius:8px; margin-bottom:16px; display:flex; justify-content:space-between; align-items:center;">
                                <div>
                                    <div style="font-weight:600; color:var(--dark-teal);">Filtre: Région Automatique</div>
                                    <div style="font-size:12px; color:var(--slate-500);">Applique le filtre "Région" selon l'affectation du DR.</div>
                                </div>
                                <div style="width:40px; height:24px; background:var(--primary-teal); border-radius:12px; position:relative;">
                                    <div style="width:20px; height:20px; background:white; border-radius:50%; position:absolute; top:2px; right:2px;"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Ajouter un Dashboard -->
                    <div id="admin-add-dash" class="\${activeTab === 'admin-add-dash' ? '' : 'hidden'}">
                        <div class="card" style="padding:32px;">
                            <h3 class="chart-title">Créer un nouveau module (Power BI ou URL)</h3>
                            <p style="color:var(--slate-500); margin-bottom:24px; line-height:1.6;">Créez dynamiquement un nouveau lien dans le menu de gauche pour intégrer un rapport Power BI ou une page web externe.</p>
                            
                            <div style="display:flex; flex-direction:column; gap:20px;">
                                <div>
                                    <label style="display:block; margin-bottom:8px; font-weight:600; color:var(--slate-700); font-size:13px;">Nom du Module</label>
                                    <input type="text" id="new-dash-name" placeholder="Ex: Suivi des Réclamations" style="width:100%; padding:12px; border:1px solid var(--sec-bg); border-radius:8px;">
                                </div>
                                <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px;">
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
                                </div>
                                <div>
                                    <label style="display:block; margin-bottom:8px; font-weight:600; color:var(--slate-700); font-size:13px;">Accès (Rôles autorisés)</label>
                                    <div style="display:flex; gap:16px; flex-wrap:wrap;">
                                        <label style="display:flex; align-items:center; gap:8px;"><input type="checkbox" class="new-dash-role" value="DG" checked> Direction Générale</label>
                                        <label style="display:flex; align-items:center; gap:8px;"><input type="checkbox" class="new-dash-role" value="DR" checked> Dir. Réseau</label>
                                        <label style="display:flex; align-items:center; gap:8px;"><input type="checkbox" class="new-dash-role" value="CA"> Chargé d'Affaires</label>
                                        <label style="display:flex; align-items:center; gap:8px;"><input type="checkbox" class="new-dash-role" value="AR"> Dir. Risques</label>
                                        <label style="display:flex; align-items:center; gap:8px;"><input type="checkbox" class="new-dash-role" value="Admin" checked> Admin</label>
                                    </div>
                                </div>
                                <div>
                                    <button class="btn btn-primary" onclick="createCustomDashboard()">Créer le module</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>\`;

            // Populate dashboard list if in that tab
            if (activeTab === 'admin-dashboards') {
                setTimeout(() => {
                    const tbody = document.getElementById('admin-dash-list');
                    if (tbody) {
                        let html = '';
                        APP.modules.forEach(m => {
                            if (m.isGroup) {
                                html += \`<tr><td colspan="5" style="background:var(--light-bg); font-weight:700; font-size:11px; text-transform:uppercase; color:var(--slate-500);">\${m.name}</td></tr>\`;
                                m.subItems.forEach(sub => {
                                    html += \`<tr>
                                        <td style="padding-left:24px;">\${sub.name}</td>
                                        <td><code style="background:var(--sec-bg); padding:2px 6px; border-radius:4px; font-size:11px;">\${sub.id}</code></td>
                                        <td>\${sub.isCustomExt ? 'Externe/Custom' : 'Natif'}</td>
                                        <td>\${(sub.roles || m.roles || []).join(', ')}</td>
                                        <td><button class="icon-btn" onclick="showToast('Modifier accès')"><svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg></button></td>
                                    </tr>\`;
                                });
                            } else {
                                html += \`<tr>
                                    <td>\${m.name}</td>
                                    <td><code style="background:var(--sec-bg); padding:2px 6px; border-radius:4px; font-size:11px;">\${m.id}</code></td>
                                    <td>\${m.isCustomExt ? 'Externe/Custom' : 'Natif'}</td>
                                    <td>\${(m.roles || []).join(', ')}</td>
                                    <td><button class="icon-btn" onclick="showToast('Modifier accès')"><svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg></button></td>
                                </tr>\`;
                            }
                        });
                        tbody.innerHTML = html;
                    }
                }, 100);
            }
        }
`;

html = html.replace(regex, newRenderAdmin);
fs.writeFileSync('index.html', html);
