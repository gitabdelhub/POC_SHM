const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const targetAnim = `@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }`;
const replaceAnim = `@keyframes fadeIn { 0% { opacity: 0; transform: translateY(10px); } 99% { opacity: 1; transform: translateY(0); } 100% { opacity: 1; transform: none; } }`;

if(html.includes(targetAnim)) {
    html = html.replace(targetAnim, replaceAnim);
    fs.writeFileSync('index.html', html, 'utf8');
    console.log("Animation transform fixed.");
} else {
    console.log("Animation not found.");
}
