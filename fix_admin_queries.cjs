const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// 1. Add menu item
const menuTarget = `{ id: 'admin-filters', name: "Configuration des filtres" },`;
const menuReplace = `{ id: 'admin-filters', name: "Configuration des filtres" },
                    { id: 'admin-queries', name: "Historique des requêtes" },`;
if(html.includes(menuTarget) && !html.includes("'admin-queries'")) {
    html = html.replace(menuTarget, menuReplace);
}

// 2. Add Title text for activeTab
const titleTarget = `activeTab === 'admin-filters' ? 'Configuration des Filtres' :`;
const titleReplace = `activeTab === 'admin-filters' ? 'Configuration des Filtres' :
                            activeTab === 'admin-queries' ? 'Historique des Requêtes SQL' :`;
if(html.includes(titleTarget) && !html.includes("'Historique des Requêtes SQL'")) {
    html = html.replace(titleTarget, titleReplace);
}

// 3. Insert the admin-queries tab content
const contentTarget = `<!-- Utilisateurs -->`;
const contentReplace = `<!-- Historique des requetes -->
                        <div id="admin-queries" class="\${activeTab === 'admin-queries' ? '' : 'hidden'}">
                            <div class="card" style="display: flex; flex-direction: column; height: 75vh;">
                                <div class="card-header" style="flex-shrink: 0;">
                                    <h3 class="chart-title" style="margin:0;">Historique des requêtes SQL du Chatbot</h3>
                                    <button class="btn btn-secondary" onclick="exportQueriesCSV()">
                                        <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" style="margin-right: 6px;"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                                        Exporter CSV
                                    </button>
                                </div>
                                <div style="flex: 1; overflow-y: auto;">
                                    <table style="width:100%; border-collapse:collapse; text-align:left;">
                                        <thead style="background:var(--light-bg); position: sticky; top: 0; z-index: 10;">
                                            <tr>
                                                <th style="padding:12px; font-size:12px; font-weight:600; color:var(--slate-500); border-bottom:1px solid #e2e8f0;">Date & Heure</th>
                                                <th style="padding:12px; font-size:12px; font-weight:600; color:var(--slate-500); border-bottom:1px solid #e2e8f0;">Utilisateur</th>
                                                <th style="padding:12px; font-size:12px; font-weight:600; color:var(--slate-500); border-bottom:1px solid #e2e8f0;">Question Posée</th>
                                                <th style="padding:12px; font-size:12px; font-weight:600; color:var(--slate-500); border-bottom:1px solid #e2e8f0;">Requête SQL Générée</th>
                                                <th style="padding:12px; font-size:12px; font-weight:600; color:var(--slate-500); border-bottom:1px solid #e2e8f0;">Résultats</th>
                                                <th style="padding:12px; font-size:12px; font-weight:600; color:var(--slate-500); border-bottom:1px solid #e2e8f0;">Temps (ms)</th>
                                            </tr>
                                        </thead>
                                        <tbody id="queries-tbody">
                                            \${MOCK.queries.map(q => \`
                                                <tr>
                                                    <td style="padding:12px; font-size:12px; color:var(--slate-500); border-bottom:1px solid #f1f5f9;">\${q.date}</td>
                                                    <td style="padding:12px; border-bottom:1px solid #f1f5f9;">
                                                        <span style="background:var(--accent-teal-light); color:var(--primary-teal); padding:4px 8px; border-radius:4px; font-size:11px; font-weight:600;">\${q.user}</span>
                                                    </td>
                                                    <td style="padding:12px; max-width:250px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; border-bottom:1px solid #f1f5f9;" title="\${q.question.replace(/"/g, '&quot;')}">\${q.question}</td>
                                                    <td style="padding:12px; max-width:300px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; font-family:'JetBrains Mono', monospace; font-size:11px; color:var(--slate-500); border-bottom:1px solid #f1f5f9;" title="\${q.sql ? q.sql.replace(/"/g, '&quot;') : ''}">\${q.sql}</td>
                                                    <td style="padding:12px; font-weight:600; font-size:12px; border-bottom:1px solid #f1f5f9;">\${q.results} lignes</td>
                                                    <td style="padding:12px; font-family:'JetBrains Mono', monospace; font-size:12px; border-bottom:1px solid #f1f5f9;">\${q.time} ms</td>
                                                </tr>
                                            \`).join('')}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Utilisateurs -->`;
if(html.includes(contentTarget) && !html.includes('id="admin-queries"')) {
    html = html.replace(contentTarget, contentReplace);
}

fs.writeFileSync('index.html', html, 'utf8');
console.log("Admin queries tab added.");
