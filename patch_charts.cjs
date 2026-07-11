const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf-8');

// 1. Add Chart.js to head
if (!html.includes('chart.js')) {
    html = html.replace('</head>', '    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>\n</head>');
}

// 2. Replace Bar Chart in renderDashboard
// Look for <!-- Bar Chart --> and the div following it up to <!-- Donut Chart -->
const barChartRegex = /<!-- Bar Chart -->[\s\S]*?(?=<!-- Donut Chart -->)/;
const newBarChart = `<!-- Bar Chart -->
                        <div style="flex:2; background:white; border-radius:12px; border:1px solid var(--sec-bg); box-shadow:0 2px 8px rgba(0,0,0,0.02); overflow:hidden; display:flex; flex-direction:column;">
                            <div style="padding:20px 24px; border-bottom:1px solid var(--sec-bg); display:flex; justify-content:space-between; align-items:center;">
                                <h3 style="font-family:'Montserrat', sans-serif; font-size:16px; font-weight:700; color:var(--dark-teal); margin:0;">Évolution du Produit Net Bancaire (M MAD)</h3>
                                <select style="padding:6px 12px; border:1px solid var(--sec-bg); border-radius:6px; font-size:12px; background:var(--light-bg);"><option>Année 2025</option><option>Année 2026</option></select>
                            </div>
                            <div style="flex:1; padding:24px; position:relative; min-height: 250px;">
                                <canvas id="pnbChart"></canvas>
                            </div>
                        </div>
                        
                        `;
html = html.replace(barChartRegex, newBarChart);

// 3. Replace Donut Chart in renderDashboard
const donutChartRegex = /<!-- Donut Chart -->[\s\S]*?(?=<div style="flex:1; background:white; border-radius:12px; border:1px solid var(--sec-bg); box-shadow:0 2px 8px rgba\(0,0,0,0.02\); overflow:hidden; display:flex; flex-direction:column;"|<\/div>\s*<\/div>\s*<\/div>\s*`;\s*})/
const newDonutChart = `<!-- Donut Chart -->
                        <div style="flex:1; background:white; border-radius:12px; border:1px solid var(--sec-bg); box-shadow:0 2px 8px rgba(0,0,0,0.02); overflow:hidden;">
                            <div style="padding:20px 24px; border-bottom:1px solid var(--sec-bg);">
                                <h3 style="font-family:'Montserrat', sans-serif; font-size:16px; font-weight:700; color:var(--dark-teal); margin:0;">Répartition des Crédits</h3>
                            </div>
                            <div style="padding:24px; position:relative; min-height: 250px;">
                                <canvas id="creditChart"></canvas>
                            </div>
                        </div>
                    </div>
                </div>
            \`;
            
            setTimeout(() => {
                if (window.pnbChartInstance) window.pnbChartInstance.destroy();
                if (window.creditChartInstance) window.creditChartInstance.destroy();

                const ctxPnb = document.getElementById('pnbChart');
                if (ctxPnb) {
                    window.pnbChartInstance = new Chart(ctxPnb.getContext('2d'), {
                        type: 'bar',
                        data: {
                            labels: ['Jan','Fév','Mar','Avr','Mai','Juin','Juil','Aoû','Sep','Oct','Nov','Déc'],
                            datasets: [{
                                label: 'PNB (M MAD)',
                                data: [112, 125, 138, 141, 156, 184, 142, 135, 151, 165, 178, 221],
                                backgroundColor: [
                                    '#2e4741', '#2e4741', '#2e4741', '#2e4741', '#2e4741', '#2e4741',
                                    '#2e4741', '#2e4741', '#2e4741', '#2e4741', '#2e4741', '#d33b21'
                                ],
                                borderRadius: 4
                            }]
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                                legend: { display: false },
                                tooltip: {
                                    backgroundColor: '#3b504a',
                                    titleFont: { family: 'Montserrat' },
                                    bodyFont: { family: 'Manrope' }
                                }
                            },
                            scales: {
                                y: { beginAtZero: true, grid: { borderDash: [5, 5] } },
                                x: { grid: { display: false } }
                            }
                        }
                    });
                }

                const ctxCredit = document.getElementById('creditChart');
                if (ctxCredit) {
                    window.creditChartInstance = new Chart(ctxCredit.getContext('2d'), {
                        type: 'doughnut',
                        data: {
                            labels: ['Retail (Immo & Conso)', 'Entreprises & PME', 'Corporate & IB', 'Autres'],
                            datasets: [{
                                data: [64, 20, 12, 4],
                                backgroundColor: ['#2e4741', '#1d2b27', '#d33b21', '#e9eceb'],
                                borderWidth: 0,
                                hoverOffset: 4
                            }]
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            cutout: '75%',
                            plugins: {
                                legend: { position: 'bottom', labels: { usePointStyle: true, font: { family: 'Manrope', size: 11 } } },
                                tooltip: {
                                    backgroundColor: '#3b504a',
                                    callbacks: {
                                        label: function(context) {
                                            return ' ' + context.label + ': ' + context.raw + '%';
                                        }
                                    }
                                }
                            }
                        }
                    });
                }
            }, 50);
        }
`;

// Wait, the Donut Chart replacement might be tricky. Let's do it with replace directly.
let newHtml = html.replace(/<!-- Donut Chart -->[\s\S]*?`\s*;\s*}/, newDonutChart);

fs.writeFileSync('index.html', newHtml);
console.log('Done!');
