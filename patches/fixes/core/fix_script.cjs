const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const regex = /function login\(role\) \{[\s\S]*?window\.switchTab = function\(btn, targetId\)/;

const replacement = `function login(role) {
            APP.userRole = role;
            document.getElementById('login-screen').classList.add('hidden');
            document.getElementById('app-layout').classList.remove('hidden');
            document.getElementById('saham-fab').classList.remove('hidden');
            
            // Set User Info
            const roleNames = { 'DG': 'Directeur Général', 'DR': 'Directeur Régional', 'CA': "Chargé d'Affaires", 'AR': 'Analyste Risque', 'Admin': 'Administrateur IT' };
            const nameMapping = { 'DG': 'Mehdi Tazi', 'DR': 'Youssef Berrada', 'CA': 'Amine Benali', 'AR': 'Nadia Fassi', 'Admin': 'Meryem El Asri' };
            document.getElementById('user-avatar').innerText = (nameMapping[role] || role).substring(0,2).toUpperCase();
            document.getElementById('user-name').innerText = nameMapping[role] || role;

            buildSidebar();
            
            // Navigate to appropriate default tab based on role
            if (role === 'Admin') {
                location.hash = 'admin-add-dash';
            } else {
                const firstModule = APP.modules.find(m => m.roles && m.roles.includes(role) && m.id !== 'admin');
                if (firstModule) location.hash = firstModule.id;
                else location.hash = 'dashboard';
            }
            route();
        }

        function logout() {
            location.hash = '';
            document.getElementById('app-layout').classList.add('hidden');
            document.getElementById('saham-fab').classList.add('hidden');
            document.getElementById('saham-chat-panel').classList.remove('active');
            document.getElementById('login-screen').classList.remove('hidden');
        }

        function toggleSidebar() {
            document.getElementById('sidebar').classList.toggle('collapsed');
        }

        function buildSidebar() {
            const ul = document.getElementById('sidebar-nav');
            ul.innerHTML = '';
            APP.modules.forEach(m => {
                let showModule = false;
                if (APP.userRole === 'Admin') {
                    // Pour l'Admin, on ne montre que la section 'admin'
                    showModule = (m.id === 'admin');
                } else {
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
        }

        window.switchTab = function(btn, targetId)`;

html = html.replace(regex, replacement);
fs.writeFileSync('index.html', html);
