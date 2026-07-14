const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// 1. Remove login-screen entirely from HTML and remove hidden from app-layout
html = html.replace(/<div id="login-screen">[\s\S]*?<!-- MAIN APP LAYOUT -->/m, '<!-- MAIN APP LAYOUT -->');
html = html.replace(/<div id="app-layout" class="hidden">/g, '<div id="app-layout">');

// 2. Add initialization logic at the end of the first script block
const scriptEnd = `
        window.addEventListener('DOMContentLoaded', () => {
            APP.userRole = 'DG'; // Default role
            buildSidebar();
            route();
            
            // Fix header user info based on DG
            document.getElementById('user-avatar').innerText = 'DG';
            document.getElementById('user-name').innerText = 'Directeur Général';
        });
    </script>
`;

html = html.replace(/    <\/script>\n<div id="sql-modal"/, scriptEnd + '<div id="sql-modal"');

fs.writeFileSync('index.html', html);
