const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const oldSwitch = /window\.switchTab = function\(btn, targetId\) \{[\s\S]*?else if \(targetId\.startsWith\('admin-'\)\) \{[\s\S]*?\}\s*const target = document\.getElementById\(targetId\);\s*if\(target\) target\.classList\.remove\('hidden'\);\s*\}/;

const newSwitch = `window.switchTab = function(btn, targetId) {
            const tabs = btn.parentElement.querySelectorAll('.tab');
            tabs.forEach(t => t.classList.remove('active'));
            btn.classList.add('active');

            const container = btn.closest('.fade-in');
            if (targetId.startsWith('pbi-')) {
                ['pbi-fin', 'pbi-risk', 'pbi-com'].forEach(id => {
                    const el = document.getElementById(id);
                    if(el) el.classList.add('hidden');
                });
            } else if (targetId.startsWith('admin-')) {
                ['admin-users', 'admin-access', 'admin-dashboards', 'admin-embeddings', 'admin-filters', 'admin-add-dash'].forEach(id => {
                    const el = document.getElementById(id);
                    if(el) el.classList.add('hidden');
                });
            }
            
            const target = document.getElementById(targetId);
            if(target) target.classList.remove('hidden');
        }`;

html = html.replace(oldSwitch, newSwitch);
fs.writeFileSync('index.html', html);
