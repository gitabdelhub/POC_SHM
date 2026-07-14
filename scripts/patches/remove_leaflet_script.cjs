const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

const targetStart = `                if (document.getElementById('leafletMap') && typeof L !== 'undefined') {`;
const startIdx = html.indexOf(targetStart);

if (startIdx !== -1) {
    // Find where this block ends. It ends with:
    //                 }
    //             }, 100);
    const endStr = `                    }\n                }`;
    const endIdx = html.indexOf(endStr, startIdx);
    
    if (endIdx !== -1) {
        html = html.substring(0, startIdx) + html.substring(endIdx + endStr.length);
        fs.writeFileSync('index.html', html, 'utf8');
        console.log("Leaflet script block removed.");
    } else {
        console.log("Could not find end of Leaflet script block");
    }
} else {
    console.log("Could not find start of Leaflet script block");
}
