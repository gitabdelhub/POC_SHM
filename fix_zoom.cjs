const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const oldStr = `                            L.geoJSON(data, {
                                style: {
                                    fillColor: '#f1f5f9', // slate-100
                                    weight: 1,
                                    opacity: 1,
                                    color: '#cbd5e1', // slate-300
                                    fillOpacity: 1
                                }
                            }).addTo(map);`;

const newStr = `                            const geoLayer = L.geoJSON(data, {
                                style: {
                                    fillColor: '#f1f5f9', // slate-100
                                    weight: 1,
                                    opacity: 1,
                                    color: '#cbd5e1', // slate-300
                                    fillOpacity: 1
                                }
                            }).addTo(map);
                            map.fitBounds(geoLayer.getBounds(), { padding: [20, 20] });`;

if (html.includes(oldStr)) {
    html = html.replace(oldStr, newStr);
    fs.writeFileSync('index.html', html, 'utf8');
    console.log("Zoom fixed");
} else {
    console.log("Could not find old string");
}
