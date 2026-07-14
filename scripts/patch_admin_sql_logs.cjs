const fs = require('fs');

let content = fs.readFileSync('index.html', 'utf8');

// 1. Add to sidebar menu
const target1 = `{ id: 'admin-embeddings', name: "Gestion des embeddings" }`;
if (content.includes(target1) && !content.includes(`id: 'admin-sql-logs'`)) {
    content = content.replace(target1, `{ id: 'admin-sql-logs', name: "Logs Requêtes SQL" },
                    ${target1}`);
}

// 2. Add to visibility array
const target2 = `['admin-users', 'admin-access', 'admin-dashboards', 'admin-embeddings', 'admin-filters', 'admin-add-dash']`;
if (content.includes(target2)) {
    content = content.replace(target2, `['admin-users', 'admin-access', 'admin-dashboards', 'admin-embeddings', 'admin-filters', 'admin-add-dash', 'admin-sql-logs']`);
}

// 3. Add to switch statement
const target3 = `case 'admin-embeddings':
                case 'admin-filters':`;
if (content.includes(target3)) {
    content = content.replace(target3, `case 'admin-embeddings':
                case 'admin-sql-logs':
                case 'admin-filters':`);
}

// 4. Add to activeTab title logic
const target4 = `activeTab === 'admin-embeddings' ? 'Configuration Power BI' :`;
if (content.includes(target4)) {
    content = content.replace(target4, `activeTab === 'admin-sql-logs' ? 'Logs Requêtes SQL' :
                            ${target4}`);
}

// 5. Inject HTML block
const htmlBlock = `
                        <!-- Logs Requêtes SQL -->
                        <div id="admin-sql-logs" class="\${activeTab === 'admin-sql-logs' ? '' : 'hidden'}">
                            <div class="card" style="padding:32px; overflow-x: auto;">
                                <h3 class="chart-title" style="margin-bottom:16px;">Historique des Requêtes SQL Chatbot</h3>
                                <p style="color:var(--slate-500); margin-bottom:24px;">Consultez les requêtes générées par l'assistant IA pour l'audit et l'optimisation.</p>
                                <table style="width:100%; border-collapse: collapse; text-align: left; min-width: 900px;">
                                    <thead>
                                        <tr style="border-bottom: 1px solid var(--sec-bg); color: var(--slate-500);">
                                            <th style="padding: 12px 16px;">Date & Heure</th>
                                            <th style="padding: 12px 16px;">Utilisateur</th>
                                            <th style="padding: 12px 16px; width: 20%;">Question</th>
                                            <th style="padding: 12px 16px; width: 35%;">Requête SQL</th>
                                            <th style="padding: 12px 16px;">Statut</th>
                                            <th style="padding: 12px 16px;">Temps</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        \${MOCK.queries.map(q => \`
                                            <tr style="border-bottom: 1px solid var(--sec-bg); transition: background 0.2s;" onmouseover="this.style.background='var(--light-bg)'" onmouseout="this.style.background='transparent'">
                                                <td style="padding: 12px 16px; font-size:13px; white-space: nowrap;">\${q.date}</td>
                                                <td style="padding: 12px 16px; font-size:13px; font-weight:500;">\${q.user}</td>
                                                <td style="padding: 12px 16px; font-size:13px;">\${q.question}</td>
                                                <td style="padding: 12px 16px; font-size:12px; font-family: monospace; color:var(--primary-teal); word-break: break-all;">\${q.sql}</td>
                                                <td style="padding: 12px 16px;">
                                                    <span style="padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; \${q.status === 'Succès' ? 'background: #e6f4ea; color: #1e8e3e;' : 'background: #fce8e6; color: #d93025;'}">
                                                        \${q.status}
                                                    </span>
                                                </td>
                                                <td style="padding: 12px 16px; font-size:13px; white-space: nowrap;">\${q.time} ms</td>
                                            </tr>
                                        \`).join('')}
                                    </tbody>
                                </table>
                            </div>
                        </div>

`;

const target5 = `<!-- Gestion des embeddings -->`;
if (content.includes(target5) && !content.includes(`id="admin-sql-logs"`)) {
    content = content.replace(target5, htmlBlock + target5);
}

fs.writeFileSync('index.html', content);
console.log('index.html patched successfully.');
