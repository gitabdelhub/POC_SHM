const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const firstLoginRegex = /function login\(role\)\s*\{\s*APP\.userRole[\s\S]*?\}\s*function showToast/g;
html = html.replace(firstLoginRegex, 'function showToast');

const secondLoginRegex = /function login\(role\) \{[\s\S]*?route\(\);\s*\}/;
const newLogin = `function login(role) {
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
                location.hash = 'admin';
                setTimeout(() => {
                    // Force selecting 'Ajouter un dashboard' by default if it exists
                    const addTab = document.querySelector('button[onclick="switchTab(this, \\'admin-add-dash\\')"]');
                    if (addTab) {
                        addTab.click();
                    } else {
                        // Fallback
                        location.hash = 'admin';
                    }
                }, 50);
            } else {
                const firstModule = APP.modules.find(m => m.roles && m.roles.includes(role));
                if (firstModule) location.hash = firstModule.id;
            }
            route();
        }`;
html = html.replace(secondLoginRegex, newLogin);

fs.writeFileSync('index.html', html);
