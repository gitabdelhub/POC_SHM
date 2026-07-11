const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf-8');

// Bar Chart
const barChartSearch = `
                        <!-- Bar Chart -->
                        <div style="flex:2; background:white; border-radius:12px; border:1px solid var(--sec-bg); box-shadow:0 2px 8px rgba(0,0,0,0.02); overflow:hidden; display:flex; flex-direction:column;">
                            <div style="padding:20px 24px; border-bottom:1px solid var(--sec-bg); display:flex; justify-content:space-between; align-items:center;">
                                <h3 style="font-family:'Montserrat', sans-serif; font-size:16px; font-weight:700; color:var(--dark-teal); margin:0;">Évolution du Produit Net Bancaire (M MAD)</h3>
                                <select style="padding:6px 12px; border:1px solid var(--sec-bg); border-radius:6px; font-size:12px; background:var(--light-bg);"><option>Année 2025</option><option>Année 2026</option></select>
                            </div>
`.trim();
const barChartReplace = `
                        <!-- Bar Chart -->
                        <div style="flex:2; background:white; border-radius:12px; border:1px solid var(--sec-bg); box-shadow:0 2px 8px rgba(0,0,0,0.02); overflow:hidden; display:flex; flex-direction:column;" class="fullscreen-capable">
                            <div style="padding:20px 24px; border-bottom:1px solid var(--sec-bg); display:flex; justify-content:space-between; align-items:center;">
                                <h3 style="font-family:'Montserrat', sans-serif; font-size:16px; font-weight:700; color:var(--dark-teal); margin:0;">Évolution du Produit Net Bancaire (M MAD)</h3>
                                <div style="display:flex; gap:8px;">
                                    <select style="padding:6px 12px; border:1px solid var(--sec-bg); border-radius:6px; font-size:12px; background:var(--light-bg);"><option>Année 2025</option><option>Année 2026</option></select>
                                    <button class="btn-fullscreen" onclick="toggleFullscreen(this)"><svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"></path></svg></button>
                                </div>
                            </div>
`.trim();

html = html.replace(barChartSearch, barChartReplace);

// Donut Chart
const donutChartSearch = `
                        <!-- Donut Chart -->
                        <div style="flex:1; background:white; border-radius:12px; border:1px solid var(--sec-bg); box-shadow:0 2px 8px rgba(0,0,0,0.02); overflow:hidden;">
                            <div style="padding:20px 24px; border-bottom:1px solid var(--sec-bg);">
                                <h3 style="font-family:'Montserrat', sans-serif; font-size:16px; font-weight:700; color:var(--dark-teal); margin:0;">Répartition des Crédits</h3>
                            </div>
                            <div style="padding:24px; position:relative; min-height: 250px;">
`.trim();
const donutChartReplace = `
                        <!-- Donut Chart -->
                        <div style="flex:1; background:white; border-radius:12px; border:1px solid var(--sec-bg); box-shadow:0 2px 8px rgba(0,0,0,0.02); overflow:hidden; display:flex; flex-direction:column;" class="fullscreen-capable">
                            <div style="padding:20px 24px; border-bottom:1px solid var(--sec-bg); display:flex; justify-content:space-between; align-items:center;">
                                <h3 style="font-family:'Montserrat', sans-serif; font-size:16px; font-weight:700; color:var(--dark-teal); margin:0;">Répartition des Crédits</h3>
                                <button class="btn-fullscreen" onclick="toggleFullscreen(this)"><svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"></path></svg></button>
                            </div>
                            <div style="flex:1; padding:24px; position:relative; min-height: 250px;">
`.trim();

html = html.replace(donutChartSearch, donutChartReplace);

// Map
const mapSearch = `
                        <div style="flex:2; background:white; border-radius:12px; border:1px solid var(--sec-bg); box-shadow:0 2px 8px rgba(0,0,0,0.02); overflow:hidden; position:relative;">
                            <div style="position:absolute; top:20px; left:20px; z-index:10;">
                                <h3 style="font-family:'Montserrat', sans-serif; font-size:16px; font-weight:700; color:var(--dark-teal); margin:0;">Répartition par Région</h3>
                                <div style="font-size:12px; color:var(--slate-500); margin-top:4px;">Vue géographique des encours</div>
                            </div>
                            
                            <div style="padding-top:40px; text-align:center;">
`.trim();
const mapReplace = `
                        <div style="flex:2; background:white; border-radius:12px; border:1px solid var(--sec-bg); box-shadow:0 2px 8px rgba(0,0,0,0.02); overflow:hidden; position:relative; display:flex; flex-direction:column;" class="fullscreen-capable">
                            <div style="position:absolute; top:20px; left:20px; z-index:10; width:calc(100% - 40px); display:flex; justify-content:space-between;">
                                <div>
                                    <h3 style="font-family:'Montserrat', sans-serif; font-size:16px; font-weight:700; color:var(--dark-teal); margin:0;">Répartition par Région</h3>
                                    <div style="font-size:12px; color:var(--slate-500); margin-top:4px;">Vue géographique des encours</div>
                                </div>
                                <button class="btn-fullscreen" onclick="toggleFullscreen(this)" style="background:white; border:1px solid var(--sec-bg); z-index:11;"><svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"></path></svg></button>
                            </div>
                            
                            <div class="chart-content" style="padding-top:40px; text-align:center; flex:1; display:flex; align-items:center; justify-content:center;">
`.trim();

html = html.replace(mapSearch, mapReplace);

// Horizontal Bar Chart
const hbarSearch = `
                        <div class="card">
                            <h3 class="chart-title">Répartition du Risque par Marché</h3>
                            <div style="position:relative; height:200px; margin-top:24px;">
`.trim();
const hbarReplace = `
                        <div class="card fullscreen-capable" style="display:flex; flex-direction:column;">
                            <div style="display:flex; justify-content:space-between; align-items:center;">
                                <h3 class="chart-title" style="margin:0;">Répartition du Risque par Marché</h3>
                                <button class="btn-fullscreen" onclick="toggleFullscreen(this)"><svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"></path></svg></button>
                            </div>
                            <div class="chart-content" style="flex:1; position:relative; min-height:200px; margin-top:24px;">
`.trim();

html = html.replace(hbarSearch, hbarReplace);


fs.writeFileSync('index.html', html);
console.log('DOM elements patched.');
