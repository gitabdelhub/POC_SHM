const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const pathData = fs.readFileSync('mar_svg.txt', 'utf8').trim();

const oldMapContainerRegex = /<div style="position: relative; height: 100%; aspect-ratio: 400\/600; padding: 20px;">[\s\S]*?<\/div>\s*<\/div>/;

const newMapContainer = `<div style="position: relative; height: 100%; aspect-ratio: 400/600; padding: 20px;">
                                <!-- Complete Morocco map -->
                                <svg width="100%" height="100%" viewBox="0 0 400 600" preserveAspectRatio="xMidYMid meet" style="opacity:0.25;">
                                    <path d="${pathData}" fill="var(--primary-teal)" />
                                </svg>
                                <!-- Bubbles -->
                                <!-- Tanger -->
                                <div style="position:absolute; top:14.9%; left:70.1%; width:20px; height:20px; background:rgba(211, 59, 33, 0.8); border:2px solid #d33b21; border-radius:50%; display:flex; align-items:center; justify-content:center; color:white; font-size:7px; font-weight:bold; cursor:pointer;" title="Tanger: 4.8 Md" onclick="showToast('Région Tanger: 4.8 Md MAD', 'info')">TNG</div>
                                <!-- Rabat -->
                                <div style="position:absolute; top:23.7%; left:63.8%; width:30px; height:30px; background:rgba(211, 59, 33, 0.8); border:2px solid #d33b21; border-radius:50%; display:flex; align-items:center; justify-content:center; color:white; font-size:9px; font-weight:bold; cursor:pointer;" title="Rabat: 8.2 Md" onclick="showToast('Région Rabat: 8.2 Md MAD', 'info')">RAB</div>
                                <!-- Casablanca -->
                                <div style="position:absolute; top:25.9%; left:59.2%; width:40px; height:40px; background:rgba(46, 71, 65, 0.8); border:2px solid var(--primary-teal); border-radius:50%; display:flex; align-items:center; justify-content:center; color:white; font-size:10px; font-weight:bold; cursor:pointer;" title="Casablanca: 12.5 Md" onclick="showToast('Région Casablanca: 12.5 Md MAD', 'info')">CASA</div>
                                <!-- Marrakech -->
                                <div style="position:absolute; top:35.5%; left:56.6%; width:25px; height:25px; background:rgba(46, 71, 65, 0.8); border:2px solid var(--primary-teal); border-radius:50%; display:flex; align-items:center; justify-content:center; color:white; font-size:8px; font-weight:bold; cursor:pointer;" title="Marrakech: 5.1 Md" onclick="showToast('Région Marrakech: 5.1 Md MAD', 'info')">KCH</div>
                                <!-- Agadir -->
                                <div style="position:absolute; top:41.4%; left:46.7%; width:20px; height:20px; background:rgba(46, 71, 65, 0.8); border:2px solid var(--primary-teal); border-radius:50%; display:flex; align-items:center; justify-content:center; color:white; font-size:6px; font-weight:bold; cursor:pointer;" title="Agadir: 3.2 Md" onclick="showToast('Région Agadir: 3.2 Md MAD', 'info')">AGA</div>
                                <!-- Laayoune -->
                                <div style="position:absolute; top:57.0%; left:24.3%; width:15px; height:15px; background:rgba(46, 71, 65, 0.8); border:2px solid var(--primary-teal); border-radius:50%; display:flex; align-items:center; justify-content:center; color:white; font-size:5px; font-weight:bold; cursor:pointer;" title="Laâyoune: 1.1 Md" onclick="showToast('Région Laâyoune: 1.1 Md MAD', 'info')">LAA</div>
                                <!-- Dakhla -->
                                <div style="position:absolute; top:72.8%; left:7.2%; width:12px; height:12px; background:rgba(46, 71, 65, 0.8); border:2px solid var(--primary-teal); border-radius:50%; display:flex; align-items:center; justify-content:center; color:white; font-size:4px; font-weight:bold; cursor:pointer;" title="Dakhla: 0.5 Md" onclick="showToast('Région Dakhla: 0.5 Md MAD', 'info')">DAK</div>
                            </div>
                        </div>`;

html = html.replace(oldMapContainerRegex, newMapContainer);
fs.writeFileSync('index.html', html);
