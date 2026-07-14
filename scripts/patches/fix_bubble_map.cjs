const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const regexMap = /<!-- Main Charts Row -->/;
const bubbleMapHTML = `
                    <!-- Interactive Bubble Map for DG/DR -->
                    \${(APP.userRole === 'DG' || APP.userRole === 'DR') ? \`
                    <div style="margin-bottom:24px; background:white; border-radius:12px; border:1px solid var(--sec-bg); padding:20px; box-shadow:0 2px 8px rgba(0,0,0,0.02);">
                        <h3 style="font-family:'Montserrat', sans-serif; font-size:16px; font-weight:700; color:var(--dark-teal); margin-top:0; margin-bottom:16px;">Cartographie Commerciale (Bubble Map)</h3>
                        <div style="position:relative; width:100%; height:300px; background:var(--light-bg); border-radius:8px; border:1px solid #e2e8f0; overflow:hidden;">
                            <!-- Simplified Moroccan Map Background using SVG -->
                            <svg width="100%" height="100%" viewBox="0 0 800 400" preserveAspectRatio="xMidYMid slice" style="position:absolute; top:0; left:0; opacity:0.1;">
                                <path d="M100,50 Q400,10 700,50 T750,350 Q400,380 50,350 Z" fill="#0e6944" />
                            </svg>
                            <!-- Bubbles -->
                            <div style="position:absolute; top:30%; left:40%; width:40px; height:40px; background:rgba(14, 105, 68, 0.6); border:2px solid #0e6944; border-radius:50%; display:flex; align-items:center; justify-content:center; color:white; font-size:10px; font-weight:bold; cursor:pointer;" title="Casablanca: 12.5 Md" onclick="showToast('Région Casablanca: 12.5 Md MAD', 'info')">Casa</div>
                            <div style="position:absolute; top:20%; left:50%; width:30px; height:30px; background:rgba(211, 59, 33, 0.6); border:2px solid #d33b21; border-radius:50%; display:flex; align-items:center; justify-content:center; color:white; font-size:9px; font-weight:bold; cursor:pointer;" title="Rabat: 8.2 Md" onclick="showToast('Région Rabat: 8.2 Md MAD', 'info')">Rabat</div>
                            <div style="position:absolute; top:50%; left:35%; width:25px; height:25px; background:rgba(14, 105, 68, 0.6); border:2px solid #0e6944; border-radius:50%; display:flex; align-items:center; justify-content:center; color:white; font-size:8px; font-weight:bold; cursor:pointer;" title="Marrakech: 5.1 Md" onclick="showToast('Région Marrakech: 5.1 Md MAD', 'info')">KeCH</div>
                            <div style="position:absolute; top:15%; left:55%; width:20px; height:20px; background:rgba(211, 59, 33, 0.6); border:2px solid #d33b21; border-radius:50%; display:flex; align-items:center; justify-content:center; color:white; font-size:7px; font-weight:bold; cursor:pointer;" title="Tanger: 4.8 Md" onclick="showToast('Région Tanger: 4.8 Md MAD', 'info')">TNG</div>
                            <div style="position:absolute; top:70%; left:25%; width:15px; height:15px; background:rgba(14, 105, 68, 0.6); border:2px solid #0e6944; border-radius:50%; display:flex; align-items:center; justify-content:center; color:white; font-size:6px; font-weight:bold; cursor:pointer;" title="Agadir: 3.2 Md" onclick="showToast('Région Agadir: 3.2 Md MAD', 'info')">AGA</div>
                        </div>
                    </div>
                    \` : ''}
                    <!-- Main Charts Row -->`;

html = html.replace(regexMap, bubbleMapHTML);
fs.writeFileSync('index.html', html);
