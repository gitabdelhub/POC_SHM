const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// Find the start and end of the SVG map part
const startString = `<div class="chart-content" style="position:relative; width:100%; height:400px; background:var(--light-bg); border-radius:8px; border:1px solid #e2e8f0; overflow:hidden; display: flex; justify-content: center; align-items: center;">`;
const endString = `                            </div>
                        </div>`;
const endStringIndex = html.indexOf(endString, html.indexOf(startString));

const newMapContent = `<div class="chart-content" style="position:relative; width:100%; height:400px; background:var(--light-bg); border-radius:8px; border:1px solid #e2e8f0; overflow:hidden;">
                            <div id="leafletMap" style="width: 100%; height: 100%; z-index: 1;"></div>
                        </div>`;

if (html.indexOf(startString) !== -1 && endStringIndex !== -1) {
    const startIdx = html.indexOf(startString);
    html = html.substring(0, startIdx) + newMapContent + html.substring(endStringIndex + endString.length);
    fs.writeFileSync('index.html', html, 'utf8');
    console.log("Map replaced successfully!");
} else {
    console.error("Could not find map start or end");
}
