const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const regex = /function buildSidebar\(\) \{[\s\S]*?\}\n/;

const newCode = `function buildSidebar() {
            const ul = document.getElementById('sidebar-nav');
            ul.innerHTML = '';
            APP.modules.forEach(m => {
                if (m.roles && m.roles.includes(APP.userRole)) {
                    if (m.isGroup) {
                        ul.innerHTML += \`<div style="font-size: 11px; text-transform: uppercase; font-weight: 800; color: var(--slate-500); padding: 16px 24px 8px; letter-spacing: 0.5px;">\${m.name}</div>\`;
                        m.subItems.forEach(sub => {
                            ul.innerHTML += \`
                                <li class="nav-item" id="nav-\${sub.id}">
                                    <a href="#\${sub.id}" class="nav-link" style="padding-left: 32px;">
                                        <span>\${sub.name}</span>
                                    </a>
                                </li>\`;
                        });
                    } else {
                        ul.innerHTML += \`
                            <li class="nav-item" id="nav-\${m.id}">
                                <a href="#\${m.id}" class="nav-link">
                                    <div class="nav-icon"><svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">\${m.icon}</svg></div>
                                    <span>\${m.name}</span>
                                </a>
                            </li>\`;
                    }
                }
            });
        }\n`;

html = html.replace(regex, newCode);
fs.writeFileSync('index.html', html);
