const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

const oldBubbles = `                                <!-- Bubbles -->
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
                                <div style="position:absolute; top:72.8%; left:7.2%; width:12px; height:12px; background:rgba(46, 71, 65, 0.8); border:2px solid var(--primary-teal); border-radius:50%; display:flex; align-items:center; justify-content:center; color:white; font-size:4px; font-weight:bold; cursor:pointer;" title="Dakhla: 0.5 Md" onclick="showToast('Région Dakhla: 0.5 Md MAD', 'info')">DAK</div>`;

const newBubbles = `                                <!-- Bubbles now in SVG -->
                                <g style="cursor:pointer;" onclick="showToast('Région Tanger: 4.8 Md MAD', 'info')" transform="translate(280.4, 89.4)">
                                    <title>Tanger: 4.8 Md</title>
                                    <circle cx="0" cy="0" r="10" fill="rgba(211, 59, 33, 0.8)" stroke="#d33b21" stroke-width="2"/>
                                    <text x="0" y="2.5" font-family="'Montserrat', sans-serif" font-size="7" font-weight="bold" fill="white" text-anchor="middle">TNG</text>
                                </g>
                                <g style="cursor:pointer;" onclick="showToast('Région Rabat: 8.2 Md MAD', 'info')" transform="translate(255.2, 142.2)">
                                    <title>Rabat: 8.2 Md</title>
                                    <circle cx="0" cy="0" r="15" fill="rgba(211, 59, 33, 0.8)" stroke="#d33b21" stroke-width="2"/>
                                    <text x="0" y="3" font-family="'Montserrat', sans-serif" font-size="9" font-weight="bold" fill="white" text-anchor="middle">RAB</text>
                                </g>
                                <g style="cursor:pointer;" onclick="showToast('Région Casablanca: 12.5 Md MAD', 'info')" transform="translate(236.8, 155.4)">
                                    <title>Casablanca: 12.5 Md</title>
                                    <circle cx="0" cy="0" r="20" fill="rgba(46, 71, 65, 0.8)" stroke="var(--primary-teal)" stroke-width="2"/>
                                    <text x="0" y="3.5" font-family="'Montserrat', sans-serif" font-size="10" font-weight="bold" fill="white" text-anchor="middle">CASA</text>
                                </g>
                                <g style="cursor:pointer;" onclick="showToast('Région Marrakech: 5.1 Md MAD', 'info')" transform="translate(226.4, 213.0)">
                                    <title>Marrakech: 5.1 Md</title>
                                    <circle cx="0" cy="0" r="12.5" fill="rgba(46, 71, 65, 0.8)" stroke="var(--primary-teal)" stroke-width="2"/>
                                    <text x="0" y="2.5" font-family="'Montserrat', sans-serif" font-size="8" font-weight="bold" fill="white" text-anchor="middle">KCH</text>
                                </g>
                                <g style="cursor:pointer;" onclick="showToast('Région Agadir: 3.2 Md MAD', 'info')" transform="translate(186.8, 248.4)">
                                    <title>Agadir: 3.2 Md</title>
                                    <circle cx="0" cy="0" r="10" fill="rgba(46, 71, 65, 0.8)" stroke="var(--primary-teal)" stroke-width="2"/>
                                    <text x="0" y="2.5" font-family="'Montserrat', sans-serif" font-size="6" font-weight="bold" fill="white" text-anchor="middle">AGA</text>
                                </g>
                                <g style="cursor:pointer;" onclick="showToast('Région Laâyoune: 1.1 Md MAD', 'info')" transform="translate(97.2, 342.0)">
                                    <title>Laâyoune: 1.1 Md</title>
                                    <circle cx="0" cy="0" r="7.5" fill="rgba(46, 71, 65, 0.8)" stroke="var(--primary-teal)" stroke-width="2"/>
                                    <text x="0" y="2" font-family="'Montserrat', sans-serif" font-size="5" font-weight="bold" fill="white" text-anchor="middle">LAA</text>
                                </g>
                                <g style="cursor:pointer;" onclick="showToast('Région Dakhla: 0.5 Md MAD', 'info')" transform="translate(28.8, 436.8)">
                                    <title>Dakhla: 0.5 Md</title>
                                    <circle cx="0" cy="0" r="6" fill="rgba(46, 71, 65, 0.8)" stroke="var(--primary-teal)" stroke-width="2"/>
                                    <text x="0" y="1.5" font-family="'Montserrat', sans-serif" font-size="4" font-weight="bold" fill="white" text-anchor="middle">DAK</text>
                                </g>
                                </svg>`; // Move closing tag down here

html = html.replace('</svg>\n' + oldBubbles, newBubbles);

fs.writeFileSync('index.html', html, 'utf8');
console.log("Bubbles patched");
