const fs = require('fs');
const d3 = require('d3-geo');
const union = require('@turf/union').default;
const { featureCollection } = require('@turf/helpers');

const world = JSON.parse(fs.readFileSync('world.geojson', 'utf8'));

const mar = world.features.find(f => f.properties['ISO3166-1-Alpha-3'] === 'MAR');
const esh = world.features.find(f => f.properties['ISO3166-1-Alpha-3'] === 'ESH');

if (mar && esh) {
    const merged = union(featureCollection([mar, esh]));
    console.log("Merged geometry type:", merged.geometry.type);
    
    // Fit projection to merged geometry
    const projection = d3.geoMercator().fitSize([400, 600], merged);
    const pathGenerator = d3.geoPath().projection(projection);
    
    const svgPath = pathGenerator(merged);
    fs.writeFileSync('mar_svg_merged.txt', svgPath);
    
    // Recalculate cities for the new projection
    const cities = {
        'TNG': [-5.833954, 35.759465],
        'RAB': [-6.849813, 34.020882],
        'CASA': [-7.589843, 33.573110],
        'KCH': [-8.0083, 31.6295],
        'AGA': [-9.5981, 30.4202],
        'LAA': [-13.1991, 27.1253],
        'DAK': [-15.9390, 23.6848]
    };
    
    let bubbles = '';
    for (const [code, coords] of Object.entries(cities)) {
        const [x, y] = projection(coords);
        bubbles += `                                <g style="cursor:pointer;" onclick="showToast('Région ${code}', 'info')" transform="translate(${x.toFixed(1)}, ${y.toFixed(1)})">\n`;
        // We'll update the script to just output the raw x, y to see if they shifted much
    }
    
    // Actually, just save the projection config so we can inject them properly
    let citiesOutput = '';
    for (const [code, coords] of Object.entries(cities)) {
        const [x, y] = projection(coords);
        citiesOutput += `${code}: ${x.toFixed(1)}, ${y.toFixed(1)}\n`;
    }
    fs.writeFileSync('cities_merged.txt', citiesOutput);
    console.log("Done merging and generating svg.");
} else {
    console.log("Could not find MAR or ESH");
}
