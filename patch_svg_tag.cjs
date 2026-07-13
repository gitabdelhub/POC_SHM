const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// Find the line with "<!-- Complete Morocco map -->" and add the SVG tag back
const target = `                                <!-- Complete Morocco map -->`;
const replace = `                                <!-- Complete Morocco map -->\n                                <svg width="100%" height="100%" viewBox="0 0 400 600" preserveAspectRatio="xMidYMid meet" style="opacity:0.6;">`;

if (html.includes(target)) {
    // wait, check if the svg tag is already there
    if (!html.includes('<svg width="100%" height="100%" viewBox="0 0 400 600"')) {
        html = html.replace(target, replace);
        fs.writeFileSync('index.html', html, 'utf8');
        console.log("Added SVG tag back");
    } else {
        console.log("SVG tag already exists");
    }
}
