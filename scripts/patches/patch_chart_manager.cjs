const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf-8');

const chartManagerCode = `
        /* --- ChartManager (For Data Warehouse Integration) --- */
        window.ChartManager = {
            instances: {},
            
            initBarChart: function(canvasId, labels, dataArr, label) {
                if (this.instances[canvasId]) this.instances[canvasId].destroy();
                const ctx = document.getElementById(canvasId);
                if (!ctx) return;
                
                this.instances[canvasId] = new Chart(ctx.getContext('2d'), {
                    type: 'bar',
                    data: {
                        labels: labels,
                        datasets: [{
                            label: label,
                            data: dataArr,
                            backgroundColor: dataArr.map((_, i) => i === dataArr.length - 1 ? '#d33b21' : '#2e4741'),
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
            },
            
            initDoughnutChart: function(canvasId, labels, dataArr, colors) {
                if (this.instances[canvasId]) this.instances[canvasId].destroy();
                const ctx = document.getElementById(canvasId);
                if (!ctx) return;
                
                this.instances[canvasId] = new Chart(ctx.getContext('2d'), {
                    type: 'doughnut',
                    data: {
                        labels: labels,
                        datasets: [{
                            data: dataArr,
                            backgroundColor: colors,
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
                                callbacks: { label: function(c) { return ' ' + c.label + ': ' + c.raw + '%'; } }
                            }
                        }
                    }
                });
            },
            
            initHorizontalBarChart: function(canvasId, labels, dataArr, colors) {
                if (this.instances[canvasId]) this.instances[canvasId].destroy();
                const ctx = document.getElementById(canvasId);
                if (!ctx) return;
                
                this.instances[canvasId] = new Chart(ctx.getContext('2d'), {
                    type: 'bar',
                    data: {
                        labels: labels,
                        datasets: [{
                            label: 'Valeur',
                            data: dataArr,
                            backgroundColor: colors,
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
                                callbacks: { label: function(c) { return ' ' + c.raw; } }
                            }
                        },
                        scales: {
                            x: { beginAtZero: true, grid: { borderDash: [5, 5] } },
                            y: { grid: { display: false } }
                        }
                    }
                });
            }
        };
`;

// Insert the ChartManager right before renderDashboard
html = html.replace('function renderDashboard(container) {', chartManagerCode + '\n        function renderDashboard(container) {');

// Update renderDashboard chart initialization
const renderDashboardSetTimeout = /setTimeout\(\(\) => \{[\s\S]*?window\.creditChartInstance[\s\S]*?\}\);[\s\S]*?\}\);\s*\}, 50\);/;
const newRenderDashboardSetTimeout = `setTimeout(() => {
                window.ChartManager.initBarChart('pnbChart', 
                    ['Jan','Fév','Mar','Avr','Mai','Juin','Juil','Aoû','Sep','Oct','Nov','Déc'], 
                    [112, 125, 138, 141, 156, 184, 142, 135, 151, 165, 178, 221], 
                    'PNB (M MAD)');
                window.ChartManager.initDoughnutChart('creditChart',
                    ['Retail (Immo & Conso)', 'Entreprises & PME', 'Corporate & IB', 'Autres'],
                    [64, 20, 12, 4],
                    ['#2e4741', '#1d2b27', '#d33b21', '#e9eceb']);
            }, 50);`;
            
html = html.replace(renderDashboardSetTimeout, newRenderDashboardSetTimeout);

// Update renderRisques chart initialization
const renderRisquesSetTimeout = /setTimeout\(\(\) => \{[\s\S]*?window\.risqueChartInstance = new Chart[\s\S]*?\}\);[\s\S]*?\}\);\s*\}, 50\);/;
const newRenderRisquesSetTimeout = `setTimeout(() => {
                window.ChartManager.initHorizontalBarChart('risqueChart',
                    ['Immobilier', 'PME', 'Corporate'],
                    [5.2, 4.8, 2.1],
                    ['#d33b21', '#d33b21', '#6b7d78']);
            }, 50);`;
html = html.replace(renderRisquesSetTimeout, newRenderRisquesSetTimeout);

fs.writeFileSync('index.html', html);
console.log('Done ChartManager!');
