        function renderPortefeuille(container) {
            container.innerHTML = `
                <div class="fade-in">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px;">
                        <h2 style="font-size:20px; font-weight:700; color:var(--text-main);">Portefeuille Clients (${MOCK.clients.length})</h2>
                        <div style="display:flex; gap:12px;">
                            <input type="text" placeholder="Rechercher (Nom, ICE...)" style="padding:10px 16px; border:1px solid var(--sec-bg); border-radius:8px; background:var(--surface); font-size:13px; width:240px;">
                            <button class="btn btn-primary" onclick="showToast('Filtrage des clients')"><svg width="16" height="16" style="margin-right:8px;" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path></svg> Filtrer</button>
                        </div>
                    </div>
                    
                    <div class="card">
                        <div class="table-responsive">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Raison Sociale / Nom</th>
                                        <th>Type</th>
                                        <th>Agence</th>
                                        <th>Encours Global</th>
                                        <th>Score IA</th>
                                        <th>Statut</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${MOCK.clients.map(c => `
                                        <tr>
                                            <td style="font-weight:600; color:var(--text-main);">${c.nom}</td>
                                            <td><span style="font-size:12px; color:var(--slate-500);">${c.type}</span></td>
                                            <td>${c.agence}</td>
                                            <td style="font-family:'JetBrains Mono', monospace; text-align:right;">${formatMAD(c.encours)}</td>
                                            <td>
                                                <div style="display:flex; align-items:center; gap:8px;">
                                                    <div class="progress-bar" style="width:60px;"><div class="progress-fill" style="width:${c.score}%; background:${c.score < 50 ? 'var(--primary-orange)' : 'var(--primary-teal)'};"></div></div>
                                                    <span style="font-size:12px; font-weight:600; color:${c.score < 50 ? 'var(--primary-orange)' : 'var(--text-main)'}">${c.score}/100</span>
                                                </div>
                                            </td>
                                            <td>${getStatutBadge(c.statut)}</td>
                                            <td><button class="btn btn-secondary" style="padding:4px 12px; font-size:11px;" onclick="showToast('Ouverture vue 360° pour ${c.nom}')">Vue 360°</button></td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            `;
        }

        // Module Engagements
        function renderEngagements(container) {
            container.innerHTML = `
                <div class="fade-in">
                    <h2 style="font-size:20px; font-weight:700; color:var(--text-main); margin-bottom:24px;">Octrois & Engagements</h2>
                    
                    <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:24px; margin-bottom:24px;">
                        ${buildKPI('Demandes en attente', '24', '', false, '<path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>')}
                        ${buildKPI('Dossiers Approuvés (Mois)', '142', '+12%', false, '<path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>')}
                        ${buildKPI('Taux d\'Accord', '82%', '', false, '<path stroke-linecap="round" stroke-linejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>')}
                    </div>

                    <div class="card">
                        <div class="card-header">
                            <h3 class="chart-title" style="margin:0;">Comité de Crédit - Dossiers Récents</h3>
                        </div>
                        <div class="table-responsive">
                            <table>
                                <thead>
                                    <tr><th>Réf. Dossier</th><th>Client</th><th>Type Crédit</th><th>Montant Demandé</th><th>Score Modèle</th><th>Statut</th><th>Action</th></tr>
                                </thead>
                                <tbody>
                                    ${MOCK.dossiers.map(d => `
                                        <tr>
                                            <td style="font-family:'JetBrains Mono', monospace; font-size:12px;">${d.id}</td>
                                            <td style="font-weight:600;">${d.client}</td>
                                            <td>${d.type}</td>
                                            <td style="font-family:'JetBrains Mono', monospace; text-align:right;">${formatMAD(d.montant)}</td>
                                            <td>${d.score}/100</td>
                                            <td>${getStatutBadge(d.statut)}</td>
                                            <td><button class="btn btn-secondary" style="padding:4px 12px; font-size:11px;">Étudier</button></td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            `;
        }
        
        // Module Risques
        function renderRisques(container) {
            container.innerHTML = `
                <div class="fade-in">
                    <h2 style="font-size:20px; font-weight:700; color:var(--text-main); margin-bottom:24px;">Analyse des Risques & NPL</h2>
                    
                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:24px;">
                        <div class="card">
                            <h3 class="chart-title">Répartition du Risque par Marché</h3>
                            <div style="display:flex; flex-direction:column; gap:16px; margin-top:24px;">
                                <div><div style="display:flex; justify-content:space-between; margin-bottom:4px; font-size:12px; font-weight:600;"><span>Immobilier</span><span style="color:var(--primary-orange)">5.2% NPL</span></div><div class="progress-bar"><div class="progress-fill" style="width:75%; background:var(--primary-orange)"></div></div></div>
                                <div><div style="display:flex; justify-content:space-between; margin-bottom:4px; font-size:12px; font-weight:600;"><span>PME</span><span style="color:var(--primary-orange)">4.8% NPL</span></div><div class="progress-bar"><div class="progress-fill" style="width:60%; background:var(--primary-orange)"></div></div></div>
                                <div><div style="display:flex; justify-content:space-between; margin-bottom:4px; font-size:12px; font-weight:600;"><span>Corporate</span><span style="color:var(--slate-500)">2.1% NPL</span></div><div class="progress-bar"><div class="progress-fill" style="width:30%; background:var(--slate-500)"></div></div></div>
                            </div>
                        </div>
                        <div class="card">
                            <h3 class="chart-title">Matrice de Transition (Dégradation Score)</h3>
                            <p style="font-size:13px; color:var(--slate-500); margin-bottom:16px;">Clients passés de la classe A/B vers C/D ce mois-ci.</p>
                            <table style="width:100%; text-align:left; font-size:12px; border-collapse:collapse;">
                                <tr style="border-bottom:1px solid var(--sec-bg);"><th style="padding:8px;">Classe Initiale</th><th style="padding:8px;">Nouvelle Classe</th><th style="padding:8px; text-align:right;">Nombre de Clients</th></tr>
                                <tr style="border-bottom:1px solid var(--sec-bg);"><td style="padding:8px; font-weight:600; color:var(--primary-teal);">A (Faible Risque)</td><td style="padding:8px; color:var(--primary-orange);">C (Risque Elevé)</td><td style="padding:8px; text-align:right; font-weight:bold;">12</td></tr>
                                <tr style="border-bottom:1px solid var(--sec-bg);"><td style="padding:8px; font-weight:600; color:var(--text-main);">B (Risque Modéré)</td><td style="padding:8px; color:var(--primary-orange);">D (Défaut Probable)</td><td style="padding:8px; text-align:right; font-weight:bold;">5</td></tr>
                                <tr><td style="padding:8px; font-weight:600; color:var(--text-main);">B (Risque Modéré)</td><td style="padding:8px; color:var(--primary-orange);">C (Risque Elevé)</td><td style="padding:8px; text-align:right; font-weight:bold;">28</td></tr>
                            </table>
                        </div>
                    </div>
                </div>
            `;
        }

        // Module Administration
