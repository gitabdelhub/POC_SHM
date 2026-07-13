const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const target = `<div style="display:flex; justify-content:space-between; align-items:flex-start;">
                            <h3 style="font-family:'Montserrat', sans-serif; font-size:16px; font-weight:700; color:var(--dark-teal); margin-top:0; margin-bottom:16px;">Cartographie Commerciale (Bubble Map)</h3>
                            <button class="btn-fullscreen" onclick="toggleFullscreen(this)"><svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"></path></svg></button>
                        </div>`;
const replace = `<div style="display:flex; justify-content:space-between; align-items:flex-start; position: relative; z-index: 10000;">
                            <h3 style="font-family:'Montserrat', sans-serif; font-size:16px; font-weight:700; color:var(--dark-teal); margin-top:0; margin-bottom:16px;">Cartographie Commerciale (Bubble Map)</h3>
                            <button class="btn-fullscreen" onclick="toggleFullscreen(this)"><svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"></path></svg></button>
                        </div>`;

if (html.includes(target)) {
    html = html.replace(target, replace);
    fs.writeFileSync('index.html', html, 'utf8');
    console.log("Header fixed");
} else {
    console.log("Target not found");
}
