const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf-8');

// 1. Update CSS
const cssSearch = `
        .fullscreen-active .chart-content {
            flex: 1 !important;
            min-height: 0 !important;
        }
`.trim();
const cssReplace = `
        .fullscreen-active .chart-content {
            flex: 1 !important;
            min-height: 0 !important;
            height: auto !important;
        }
        .fullscreen-active {
            padding: 20px !important;
            box-sizing: border-box !important;
        }
`.trim();

if (!html.includes('height: auto !important;')) {
    // Actually I didn't add .fullscreen-active .chart-content in my original patch! 
    // Let me just append to the style block.
    html = html.replace('</style>', `
        .fullscreen-active { padding: 20px !important; box-sizing: border-box !important; }
        .fullscreen-active .chart-content {
            flex: 1 !important;
            min-height: 0 !important;
            height: 100% !important;
        }
    </style>`);
}

// 2. Patch the Bubble Map
const mapSearch = `
                    <div style="margin-bottom:24px; background:white; border-radius:12px; border:1px solid var(--sec-bg); padding:20px; box-shadow:0 2px 8px rgba(0,0,0,0.02);">
                        <h3 style="font-family:'Montserrat', sans-serif; font-size:16px; font-weight:700; color:var(--dark-teal); margin-top:0; margin-bottom:16px;">Cartographie Commerciale (Bubble Map)</h3>
                        <div style="position:relative; width:100%; height:400px; background:var(--light-bg); border-radius:8px; border:1px solid #e2e8f0; overflow:hidden; display: flex; justify-content: center; align-items: center;">
`.trim();

const mapReplace = `
                    <div class="fullscreen-capable" style="display:flex; flex-direction:column; margin-bottom:24px; background:white; border-radius:12px; border:1px solid var(--sec-bg); padding:20px; box-shadow:0 2px 8px rgba(0,0,0,0.02);">
                        <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                            <h3 style="font-family:'Montserrat', sans-serif; font-size:16px; font-weight:700; color:var(--dark-teal); margin-top:0; margin-bottom:16px;">Cartographie Commerciale (Bubble Map)</h3>
                            <button class="btn-fullscreen" onclick="toggleFullscreen(this)"><svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"></path></svg></button>
                        </div>
                        <div class="chart-content" style="position:relative; width:100%; height:400px; background:var(--light-bg); border-radius:8px; border:1px solid #e2e8f0; overflow:hidden; display: flex; justify-content: center; align-items: center;">
`.trim();

html = html.replace(mapSearch, mapReplace);

fs.writeFileSync('index.html', html);
console.log('Map patched');
