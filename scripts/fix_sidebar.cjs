const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const oldSidebar = /function buildSidebar\(\) \{[\s\S]*?ul\.innerHTML = '';[\s\S]*?APP\.modules\.forEach\(m => \{[\s\S]*?if \(m\.roles && m\.roles\.includes\(APP\.userRole\)\) \{[\s\S]*?\}\s*\);\s*\}/;
const newSidebar = `function buildSidebar() {
            const ul = document.getElementById('sidebar-nav');
            ul.innerHTML = '';
            APP.modules.forEach(m => {
                let showModule = false;
                if (APP.userRole === 'Admin') {
                    // Pour l'Admin, on ne montre que la section 'admin'
                    showModule = (m.id === 'admin');
                } else {
                    // Pour les autres, on montre les modules où ils ont accès, mais on cache la section admin si ce n'est pas censé être vu (normalement seul Admin y a accès)
                    showModule = m.roles && m.roles.includes(APP.userRole);
                }

                if (showModule) {
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
        }`;
html = html.replace(oldSidebar, newSidebar);

fs.writeFileSync('index.html', html);
