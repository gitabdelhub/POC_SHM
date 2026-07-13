const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// The broken string starts with "5,121.04" and ends with 'fill="var(--primary-teal)" />'
// Let's use regex to find and replace it!
const regex = /<!-- Complete Morocco map -->\s*[\d\.\,LMCZ]+\s*"\s*fill="var\(--primary-teal\)" \/>/s;

// Wait, let's first check if we can find it.
const match = html.match(/<!-- Complete Morocco map -->\s*(.*?)\s*fill="var\(--primary-teal\)" \/>/s);

if (match) {
    const fullMatch = match[0];
    const pathData = fs.readFileSync('mar_svg.txt', 'utf8').trim();
    
    const newSvg = `<!-- Complete Morocco map -->
                                <svg width="100%" height="100%" viewBox="0 0 400 600" preserveAspectRatio="xMidYMid meet" style="opacity:1;">
                                    <path d="${pathData}" fill="#f1f5f9" stroke="#cbd5e1" stroke-width="1.5" />`;
    
    html = html.replace(fullMatch, newSvg);
    fs.writeFileSync('index.html', html, 'utf8');
    console.log("Map fixed successfully!");
} else {
    console.log("Could not match the broken map string.");
}
