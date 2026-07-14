const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const oldAdminModule = /\{ id: 'admin', name: "Administration & BI"[\s\S]*?roles: \['Admin'\] \}/;

const newAdminModule = `{ id: 'admin', name: "CONSOLE ADMIN", icon: '<path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>', roles: ['Admin'], isGroup: true, subItems: [
                    { id: 'admin-users', name: "Gestion des utilisateurs" },
                    { id: 'admin-access', name: "Gestion des accès" },
                    { id: 'admin-dashboards', name: "Gestion des dashboards" },
                    { id: 'admin-embeddings', name: "Gestion des embeddings" },
                    { id: 'admin-filters', name: "Configuration des filtres" },
                    { id: 'admin-add-dash', name: "Ajouter un dashboard" }
                ] }`;

html = html.replace(oldAdminModule, newAdminModule);
fs.writeFileSync('index.html', html);
