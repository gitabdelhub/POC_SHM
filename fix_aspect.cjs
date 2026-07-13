const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const oldMapContainer = `<div style="position:relative; width:100%; height:300px; background:var(--light-bg); border-radius:8px; border:1px solid #e2e8f0; overflow:hidden;">
                            <!-- Simplified Moroccan Map Background using SVG -->
                            <svg width="100%" height="100%" viewBox="0 0 400 600" preserveAspectRatio="xMidYMid meet" style="position:absolute; top:0; left:0; opacity:0.15; padding: 20px;">                                <!-- Complete Morocco outline (simplified) -->                                <path d="M 240 20 L 260 20 L 280 40 L 270 80 L 250 120 L 220 160 L 190 220 L 170 300 L 140 380 L 100 460 L 60 540 L 40 560 L 30 550 L 60 490 L 80 430 L 110 380 L 110 330 L 150 260 L 160 200 L 190 120 L 210 60 Z" fill="var(--primary-teal)" />                            </svg>
                            <!-- Bubbles -->
                            <div style="position:absolute; top:30%; left:45%; width:40px; height:40px; background:rgba(46, 71, 65, 0.6); border:2px solid var(--primary-teal); border-radius:50%; display:flex; align-items:center; justify-content:center; color:white; font-size:10px; font-weight:bold; cursor:pointer;" title="Casablanca: 12.5 Md" onclick="showToast('Région Casablanca: 12.5 Md MAD', 'info')">Casa</div>
                            <div style="position:absolute; top:20%; left:55%; width:30px; height:30px; background:rgba(211, 59, 33, 0.6); border:2px solid #d33b21; border-radius:50%; display:flex; align-items:center; justify-content:center; color:white; font-size:9px; font-weight:bold; cursor:pointer;" title="Rabat: 8.2 Md" onclick="showToast('Région Rabat: 8.2 Md MAD', 'info')">Rabat</div>
                            <div style="position:absolute; top:50%; left:38%; width:25px; height:25px; background:rgba(46, 71, 65, 0.6); border:2px solid var(--primary-teal); border-radius:50%; display:flex; align-items:center; justify-content:center; color:white; font-size:8px; font-weight:bold; cursor:pointer;" title="Marrakech: 5.1 Md" onclick="showToast('Région Marrakech: 5.1 Md MAD', 'info')">KeCH</div>
                            <div style="position:absolute; top:15%; left:60%; width:20px; height:20px; background:rgba(211, 59, 33, 0.6); border:2px solid #d33b21; border-radius:50%; display:flex; align-items:center; justify-content:center; color:white; font-size:7px; font-weight:bold; cursor:pointer;" title="Tanger: 4.8 Md" onclick="showToast('Région Tanger: 4.8 Md MAD', 'info')">TNG</div>
                            <div style="position:absolute; top:60%; left:28%; width:15px; height:15px; background:rgba(46, 71, 65, 0.6); border:2px solid var(--primary-teal); border-radius:50%; display:flex; align-items:center; justify-content:center; color:white; font-size:6px; font-weight:bold; cursor:pointer;" title="Agadir: 3.2 Md" onclick="showToast('Région Agadir: 3.2 Md MAD', 'info')">AGA</div><div style="position:absolute; top:75%; left:20%; width:15px; height:15px; background:rgba(46, 71, 65, 0.6); border:2px solid var(--primary-teal); border-radius:50%; display:flex; align-items:center; justify-content:center; color:white; font-size:6px; font-weight:bold; cursor:pointer;" title="Laâyoune: 1.1 Md" onclick="showToast('Région Laâyoune: 1.1 Md MAD', 'info')">LAA</div><div style="position:absolute; top:85%; left:12%; width:10px; height:10px; background:rgba(46, 71, 65, 0.6); border:2px solid var(--primary-teal); border-radius:50%; display:flex; align-items:center; justify-content:center; color:white; font-size:4px; font-weight:bold; cursor:pointer;" title="Dakhla: 0.5 Md" onclick="showToast('Région Dakhla: 0.5 Md MAD', 'info')">DAK</div>
                        </div>`;

const newMapContainer = `<div style="position:relative; width:100%; height:400px; background:var(--light-bg); border-radius:8px; border:1px solid #e2e8f0; overflow:hidden; display: flex; justify-content: center; align-items: center;">
                            <div style="position: relative; height: 100%; aspect-ratio: 400/600; padding: 20px;">
                                <!-- Complete Morocco outline (simplified) -->
                                <svg width="100%" height="100%" viewBox="0 0 400 600" preserveAspectRatio="xMidYMid meet" style="opacity:0.25;">
                                    <path d="M 230 10 L 250 15 L 275 35 L 265 65 L 245 110 L 210 150 L 180 210 L 160 290 L 130 370 L 90 450 L 50 530 L 30 550 L 20 540 L 50 480 L 70 420 L 100 370 L 100 320 L 140 250 L 150 190 L 180 110 L 200 50 Z" fill="var(--primary-teal)" />
                                </svg>
                                <!-- Bubbles -->
                                <!-- Tanger -->
                                <div style="position:absolute; top:4%; left:58%; width:20px; height:20px; background:rgba(211, 59, 33, 0.8); border:2px solid #d33b21; border-radius:50%; display:flex; align-items:center; justify-content:center; color:white; font-size:7px; font-weight:bold; cursor:pointer;" title="Tanger: 4.8 Md" onclick="showToast('Région Tanger: 4.8 Md MAD', 'info')">TNG</div>
                                <!-- Rabat -->
                                <div style="position:absolute; top:12%; left:51%; width:30px; height:30px; background:rgba(211, 59, 33, 0.8); border:2px solid #d33b21; border-radius:50%; display:flex; align-items:center; justify-content:center; color:white; font-size:9px; font-weight:bold; cursor:pointer;" title="Rabat: 8.2 Md" onclick="showToast('Région Rabat: 8.2 Md MAD', 'info')">RAB</div>
                                <!-- Casablanca -->
                                <div style="position:absolute; top:18%; left:44%; width:40px; height:40px; background:rgba(46, 71, 65, 0.8); border:2px solid var(--primary-teal); border-radius:50%; display:flex; align-items:center; justify-content:center; color:white; font-size:10px; font-weight:bold; cursor:pointer;" title="Casablanca: 12.5 Md" onclick="showToast('Région Casablanca: 12.5 Md MAD', 'info')">CASA</div>
                                <!-- Marrakech -->
                                <div style="position:absolute; top:30%; left:36%; width:25px; height:25px; background:rgba(46, 71, 65, 0.8); border:2px solid var(--primary-teal); border-radius:50%; display:flex; align-items:center; justify-content:center; color:white; font-size:8px; font-weight:bold; cursor:pointer;" title="Marrakech: 5.1 Md" onclick="showToast('Région Marrakech: 5.1 Md MAD', 'info')">KCH</div>
                                <!-- Agadir -->
                                <div style="position:absolute; top:42%; left:28%; width:20px; height:20px; background:rgba(46, 71, 65, 0.8); border:2px solid var(--primary-teal); border-radius:50%; display:flex; align-items:center; justify-content:center; color:white; font-size:6px; font-weight:bold; cursor:pointer;" title="Agadir: 3.2 Md" onclick="showToast('Région Agadir: 3.2 Md MAD', 'info')">AGA</div>
                                <!-- Laayoune -->
                                <div style="position:absolute; top:65%; left:16%; width:15px; height:15px; background:rgba(46, 71, 65, 0.8); border:2px solid var(--primary-teal); border-radius:50%; display:flex; align-items:center; justify-content:center; color:white; font-size:5px; font-weight:bold; cursor:pointer;" title="Laâyoune: 1.1 Md" onclick="showToast('Région Laâyoune: 1.1 Md MAD', 'info')">LAA</div>
                                <!-- Dakhla -->
                                <div style="position:absolute; top:85%; left:6%; width:12px; height:12px; background:rgba(46, 71, 65, 0.8); border:2px solid var(--primary-teal); border-radius:50%; display:flex; align-items:center; justify-content:center; color:white; font-size:4px; font-weight:bold; cursor:pointer;" title="Dakhla: 0.5 Md" onclick="showToast('Région Dakhla: 0.5 Md MAD', 'info')">DAK</div>
                            </div>
                        </div>`;

html = html.replace(oldMapContainer, newMapContainer);

fs.writeFileSync('index.html', html);
