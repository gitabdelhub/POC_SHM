const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf-8');

const risquesRegex = /<div class="card">\s*<h3 class="chart-title">Répartition du Risque par Marché<\/h3>[\s\S]*?<\/div>/;
const newRisques = `<div class="card">
                            <h3 class="chart-title">Répartition du Risque par Marché</h3>
                            <div style="position:relative; height:200px; margin-top:24px;">
                                <canvas id="risqueChart"></canvas>
                            </div>
                        </div>`;

html = html.replace(risquesRegex, newRisques);

// We need to add the setTimeout to init the Chart to renderRisques
const renderRisquesRegex = /function renderRisques\(container\) {[\s\S]*?container.innerHTML = `[\s\S]*?`;\s*}/;

let renderRisquesFunc = html.match(renderRisquesRegex)[0];
let newRenderRisquesFunc = renderRisquesFunc.replace(/`;\s*}$/, `\`;
            setTimeout(() => {
                if (window.risqueChartInstance) window.risqueChartInstance.destroy();
                const ctxRisque = document.getElementById('risqueChart');
                if (ctxRisque) {
                    window.risqueChartInstance = new Chart(ctxRisque.getContext('2d'), {
                        type: 'bar',
                        data: {
                            labels: ['Immobilier', 'PME', 'Corporate'],
                            datasets: [{
                                label: 'NPL (%)',
                                data: [5.2, 4.8, 2.1],
                                backgroundColor: ['#d33b21', '#d33b21', '#6b7d78'],
                                borderRadius: 4
                            }]
                        },
                        options: {
                            indexAxis: 'y',
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                                legend: { display: false },
                                tooltip: {
                                    backgroundColor: '#3b504a',
                                    callbacks: {
                                        label: function(context) { return ' ' + context.raw + '% NPL'; }
                                    }
                                }
                            },
                            scales: {
                                x: { beginAtZero: true, grid: { borderDash: [5, 5] }, max: 10 },
                                y: { grid: { display: false } }
                            }
                        }
                    });
                }
            }, 50);
        }`);

html = html.replace(renderRisquesRegex, newRenderRisquesFunc);

fs.writeFileSync('index.html', html);
console.log('Done patching risques!');
