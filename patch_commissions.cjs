const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf-8');

const searchCommissions = `
        function renderCommissions(container) {
            container.innerHTML = \`
                <div class="fade-in">
                    <div style="background:white; border-radius:12px; border:1px solid var(--sec-bg); padding:40px; text-align:center;">
                        <svg width="48" height="48" fill="none" stroke="var(--primary-teal)" stroke-width="1.5" viewBox="0 0 24 24" style="margin-bottom:16px;">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <h3 style="font-family:'Montserrat', sans-serif; font-size:18px; color:var(--dark-teal); margin-bottom:8px;">Tableau de bord des commissions</h3>
                        <p style="color:var(--slate-500); font-size:14px; max-width:400px; margin:0 auto;">Le reporting détaillé des commissions par ligne de métier sera disponible dans la prochaine release.</p>
                    </div>
                </div>
            \`;
        }
`.trim();

const replaceCommissions = `
        function renderCommissions(container) {
            container.innerHTML = \`
                <div class="fade-in">
                    <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:24px;">
                        <div>
                            <h2 style="font-family:'Montserrat', sans-serif; font-size:24px; color:var(--dark-teal); font-weight:700; margin-bottom:8px;">Suivi des Commissions</h2>
                            <p style="color:var(--slate-500); font-size:14px;">Analyse détaillée des commissions perçues par type d'opération et par agence.</p>
                        </div>
                        <div style="display:flex; gap:12px;">
                            <button onclick="showToast('Export Excel en cours...')" class="btn btn-secondary"><svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg> Exporter</button>
                        </div>
                    </div>

                    <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:16px; margin-bottom:24px;">
                        <div class="card" style="padding:20px;">
                            <h3 style="font-size:12px; color:var(--slate-500); text-transform:uppercase; margin-bottom:8px;">Total Commissions (Mois)</h3>
                            <div style="font-size:28px; font-weight:800; color:var(--dark-teal);">12.4 <span style="font-size:14px; color:var(--slate-500);">M MAD</span></div>
                            <div style="font-size:12px; color:#10b981; margin-top:4px; font-weight:600;">+8.2% vs M-1</div>
                        </div>
                        <div class="card" style="padding:20px;">
                            <h3 style="font-size:12px; color:var(--slate-500); text-transform:uppercase; margin-bottom:8px;">Transferts & Monétique</h3>
                            <div style="font-size:28px; font-weight:800; color:var(--dark-teal);">4.1 <span style="font-size:14px; color:var(--slate-500);">M MAD</span></div>
                            <div style="font-size:12px; color:#10b981; margin-top:4px; font-weight:600;">+2.5% vs M-1</div>
                        </div>
                        <div class="card" style="padding:20px;">
                            <h3 style="font-size:12px; color:var(--slate-500); text-transform:uppercase; margin-bottom:8px;">Trade Finance</h3>
                            <div style="font-size:28px; font-weight:800; color:var(--dark-teal);">5.8 <span style="font-size:14px; color:var(--slate-500);">M MAD</span></div>
                            <div style="font-size:12px; color:#10b981; margin-top:4px; font-weight:600;">+11.4% vs M-1</div>
                        </div>
                    </div>

                    <div class="card fullscreen-capable" style="display:flex; flex-direction:column;">
                        <div style="display:flex; justify-content:space-between; align-items:center;">
                            <h3 class="chart-title" style="margin:0;">Évolution des Commissions par Segment</h3>
                            <button class="btn-fullscreen" onclick="toggleFullscreen(this)"><svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"></path></svg></button>
                        </div>
                        <div class="chart-content" style="flex:1; position:relative; min-height:300px; margin-top:24px;">
                            <canvas id="commissionsChart"></canvas>
                        </div>
                    </div>
                </div>
            \`;
            setTimeout(() => {
                if (window.commissionsChartInstance) window.commissionsChartInstance.destroy();
                const ctx = document.getElementById('commissionsChart');
                if (ctx) {
                    window.commissionsChartInstance = new Chart(ctx.getContext('2d'), {
                        type: 'bar',
                        data: {
                            labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'],
                            datasets: [
                                { label: 'Trade Finance', data: [5.1, 5.3, 5.4, 5.2, 5.5, 5.8], backgroundColor: '#2e4741', borderRadius: 4 },
                                { label: 'Transferts & Monétique', data: [3.8, 3.9, 4.0, 3.8, 4.0, 4.1], backgroundColor: '#d33b21', borderRadius: 4 },
                                { label: 'Bancassurance', data: [2.1, 2.2, 2.3, 2.4, 2.4, 2.5], backgroundColor: '#6b7d78', borderRadius: 4 }
                            ]
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                                tooltip: { backgroundColor: '#3b504a', titleFont: { family: 'Montserrat' }, bodyFont: { family: 'Manrope' } }
                            },
                            scales: {
                                x: { stacked: true, grid: { display: false } },
                                y: { stacked: true, beginAtZero: true, grid: { borderDash: [5, 5] } }
                            }
                        }
                    });
                }
            }, 50);
        }
`.trim();

html = html.replace(searchCommissions, replaceCommissions);

fs.writeFileSync('index.html', html);
console.log('Commissions updated.');
