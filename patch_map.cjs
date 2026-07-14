const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const regex = /<svg width="100%" height="100%" viewBox="0 0 400 600" preserveAspectRatio="xMidYMid meet" style="opacity:1;">.*?<\/svg>/s;
const pathData = fs.readFileSync('mar_svg_merged.txt', 'utf8').trim();

const newSvg = `<svg width="100%" height="100%" viewBox="0 0 400 600" preserveAspectRatio="xMidYMid meet" style="opacity:1; background-color: #f3f4f4;">
                                    <path d="${pathData}" fill="#b0b8b4" stroke="none" />
                                    <!-- Bubbles -->
                                    <g style="cursor:pointer;" onclick="showToast('Région Tanger: 4.8 Md MAD', 'info')" transform="translate(281.5, 93.7)">
                                        <title>Tanger: 4.8 Md</title>
                                        <circle cx="0" cy="0" r="14" fill="#cc4a3d" stroke="none" />
                                        <text x="0" y="3" font-family="'Montserrat', sans-serif" font-size="7" font-weight="bold" fill="white" text-anchor="middle">TNG</text>
                                    </g>
                                    <g style="cursor:pointer;" onclick="showToast('Région Rabat: 10.6 Md MAD', 'info')" transform="translate(255.9, 147.0)">
                                        <title>Rabat: 10.6 Md</title>
                                        <circle cx="0" cy="0" r="18" fill="#cc4a3d" stroke="none" />
                                        <text x="0" y="3" font-family="'Montserrat', sans-serif" font-size="8" font-weight="bold" fill="white" text-anchor="middle">RAB</text>
                                    </g>
                                    <g style="cursor:pointer;" onclick="showToast('Région Casablanca: 22.4 Md MAD', 'info')" transform="translate(237.3, 160.6)">
                                        <title>Casablanca: 22.4 Md</title>
                                        <circle cx="0" cy="0" r="24" fill="rgba(59, 82, 73, 0.9)" stroke="#2b3b35" stroke-width="2"/>
                                        <text x="0" y="4" font-family="'Montserrat', sans-serif" font-size="10" font-weight="bold" fill="white" text-anchor="middle">CASA</text>
                                    </g>
                                    <g style="cursor:pointer;" onclick="showToast('Région Marrakech: 6.5 Md MAD', 'info')" transform="translate(226.8, 218.6)">
                                        <title>Marrakech: 6.5 Md</title>
                                        <circle cx="0" cy="0" r="15" fill="rgba(59, 82, 73, 0.9)" stroke="#2b3b35" stroke-width="2"/>
                                        <text x="0" y="3" font-family="'Montserrat', sans-serif" font-size="7" font-weight="bold" fill="white" text-anchor="middle">KCH</text>
                                    </g>
                                    <g style="cursor:pointer;" onclick="showToast('Région Agadir: 3.2 Md MAD', 'info')" transform="translate(186.8, 254.2)">
                                        <title>Agadir: 3.2 Md</title>
                                        <circle cx="0" cy="0" r="12" fill="rgba(59, 82, 73, 0.9)" stroke="#2b3b35" stroke-width="2"/>
                                        <text x="0" y="2.5" font-family="'Montserrat', sans-serif" font-size="6" font-weight="bold" fill="white" text-anchor="middle">AGA</text>
                                    </g>
                                    <g style="cursor:pointer;" onclick="showToast('Région Laâyoune: 1.1 Md MAD', 'info')" transform="translate(96.2, 348.8)">
                                        <title>Laâyoune: 1.1 Md</title>
                                        <circle cx="0" cy="0" r="9" fill="rgba(59, 82, 73, 0.9)" stroke="#2b3b35" stroke-width="2"/>
                                        <text x="0" y="2.5" font-family="'Montserrat', sans-serif" font-size="5" font-weight="bold" fill="white" text-anchor="middle">LAA</text>
                                    </g>
                                    <g style="cursor:pointer;" onclick="showToast('Région Dakhla: 0.5 Md MAD', 'info')" transform="translate(27.2, 444.6)">
                                        <title>Dakhla: 0.5 Md</title>
                                        <circle cx="0" cy="0" r="7" fill="rgba(59, 82, 73, 0.9)" stroke="#2b3b35" stroke-width="2"/>
                                        <text x="0" y="2" font-family="'Montserrat', sans-serif" font-size="4" font-weight="bold" fill="white" text-anchor="middle">DAK</text>
                                    </g>
                                </svg>`;

if (regex.test(html)) {
    html = html.replace(regex, newSvg);
    fs.writeFileSync('index.html', html, 'utf8');
    console.log("SVG map replaced!");
} else {
    console.log("Could not find the SVG block!");
}
