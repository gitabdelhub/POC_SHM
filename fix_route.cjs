const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const target = `case 'admin-add-dash':`;
const replace = `case 'admin-add-dash':
                case 'admin-queries':`;
if(html.includes(target) && !html.includes("case 'admin-queries':")) {
    html = html.replace(target, replace);
    fs.writeFileSync('index.html', html, 'utf8');
    console.log("Route added");
}
