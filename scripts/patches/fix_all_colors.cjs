const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

html = html.replace(/#0e6944/g, 'var(--primary-teal)');
html = html.replace(/rgba\(14, 105, 68/g, 'rgba(46, 71, 65');
html = html.replace(/rgba\(14,105,68/g, 'rgba(46, 71, 65');

// Let's also check for other instances of old bank colors
html = html.replace(/#16a34a/g, '#10b981'); // Just adjusting green if needed, but #16a34a is Tailwind green which is fine.

fs.writeFileSync('index.html', html);
