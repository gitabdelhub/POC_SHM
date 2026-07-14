const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// The string we are looking for is the map initialization part
const searchStr = `                        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
                            attribution: '&copy; OpenStreetMap &copy; CARTO',
                            subdomains: 'abcd',
                            maxZoom: 20
                        }).addTo(map);`;

const newMapStr = `                        // Hide standard tile layer, fetch GeoJSON for Morocco instead
                        fetch('mar.geojson').then(res => res.json()).then(data => {
                            L.geoJSON(data, {
                                style: {
                                    fillColor: '#f1f5f9', // slate-100
                                    weight: 1,
                                    opacity: 1,
                                    color: '#cbd5e1', // slate-300
                                    fillOpacity: 1
                                }
                            }).addTo(map);
                        });`;

if (html.includes(searchStr)) {
    html = html.replace(searchStr, newMapStr);
    fs.writeFileSync('index.html', html, 'utf8');
    console.log("Map GeoJSON replaced!");
} else {
    console.error("Could not find the target string.");
}
