const fs = require('fs');
const world = JSON.parse(fs.readFileSync('world.geojson', 'utf8'));
console.log(world.features[0].properties);
const features = world.features.filter(f => f.properties.ISO_A3 === 'MAR' || f.properties.ISO_A3 === 'ESH');
console.log(features.length);
