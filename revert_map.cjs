const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');
let oldMap = fs.readFileSync('temp_map.txt', 'utf8');

const leafletString = `<div class="chart-content" style="position:relative; width:100%; height:400px; background:var(--light-bg); border-radius:8px; border:1px solid #e2e8f0; overflow:hidden;">
                            <div id="leafletMap" style="width: 100%; height: 100%; z-index: 1;"></div>
                        </div>`;

const chartContentStart = `<div class="chart-content"`;
const startIdx = oldMap.indexOf(chartContentStart);

// The end is exactly the `</div>` before `                        </div>` which is the closing of `fullscreen-capable`.
// Let's find: `                            </div>\n                        </div>`
const searchEnd = `                            </div>\n                        </div>`;
const endIdx = oldMap.indexOf(searchEnd, startIdx);

if (startIdx !== -1 && endIdx !== -1 && html.includes(leafletString)) {
    const oldChartContent = oldMap.substring(startIdx, endIdx + `                            </div>`.length);
    html = html.replace(leafletString, oldChartContent);
    fs.writeFileSync('index.html', html, 'utf8');
    console.log("Map reverted to SVG!");
} else {
    console.error("Could not find blocks properly.");
    console.log("startIdx:", startIdx, "endIdx:", endIdx, "leaflet included:", html.includes(leafletString));
}
