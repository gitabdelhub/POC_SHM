/* =============================================================================
   ATTENTION - CODE NON UTILISE (conserve pour historique)
   =============================================================================

   Ce fichier N'EST PAS charge par index.html : le portail embarque sa propre
   copie de ces fonctions directement dans sa balise <script>.

   Verifie le 23/08/2026 : les fonctions ci-dessous ont DIVERGE de celles
   reellement executees dans index.html. Elles sont donc obsoletes.

   => Ne pas modifier ce fichier en esperant changer le comportement du site.
   => La version qui s'execute est celle de index.html.

   Deux options quand tu auras le temps :
     1. Supprimer frontend/js/ (le plus simple, le code est mort).
     2. Extraire pour de bon le <script> de index.html vers ces fichiers,
        puis les charger avec <script src="js/...js"></script>.
        A faire APRES la soutenance : c'est du confort de maintenance,
        pas une correction fonctionnelle.
   ============================================================================= */

/* ==========================================================================
   SAHAM BANK ANALYTICS PORTAL - DASHBOARD & NAVIGATION ENGINE
   ========================================================================== */

const APP = {
    userRole: null,
    modules: [
        { id: 'dashboard', name: "Pilotage Commercial", icon: '<path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>', roles: ['DG', 'DR', 'CA', 'AR', 'Admin'], hasSub: true },
        { id: 'ciblage', name: "Ciblage & Campagnes", icon: '<path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />', roles: ['DG', 'DR', 'CA', 'Admin'] },
        { id: 'engagements', name: "Espace Engagements", icon: '<path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.956 11.956 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>', roles: ['DG', 'DR', 'CA', 'AR', 'Admin'], hasSub: true },
        { id: 'qualite', name: "Qualité de Service Clientèle", icon: '<path stroke-linecap="round" stroke-linejoin="round" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>', roles: ['DG', 'DR', 'CA', 'AR', 'Admin'], hasSub: true },
        { id: 'rentabilite', name: "Rentabilité", icon: '<path d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>', roles: ['DG', 'DR', 'CA', 'AR', 'Admin'], isGroup: true, subItems: [
            { id: 'powerbi', name: "PNB Commercial" },
            { id: 'commissions', name: "Suivi des Commissions" }
        ]},
        { id: 'admin', name: "CONSOLE ADMIN", icon: '<path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>', roles: ['Admin'], isGroup: true, subItems: [
            { id: 'admin-users', name: "Gestion des utilisateurs" },
            { id: 'admin-access', name: "Gestion des accès" },
            { id: 'admin-dashboards', name: "Gestion des dashboards" },
            { id: 'admin-embeddings', name: "Gestion des embeddings" },
            { id: 'admin-filters', name: "Configuration des filtres" },
            { id: 'admin-queries', name: "Historique des requêtes" },
            { id: 'admin-add-dash', name: "Ajouter un dashboard" }
        ] }
    ]
};

function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('collapsed');
}

function buildSidebar() {
    const ul = document.getElementById('sidebar-nav');
    if (!ul) return;
    ul.innerHTML = '';
    APP.modules.forEach(m => {
        let showModule = false;
        if (APP.userRole === 'Admin') {
            showModule = (m.id === 'admin');
        } else {
            showModule = m.roles && m.roles.includes(APP.userRole);
        }

        if (showModule) {
            if (m.isGroup) {
                ul.innerHTML += `<div style="font-size: 11px; text-transform: uppercase; font-weight: 800; color: var(--slate-500); padding: 16px 24px 8px; letter-spacing: 0.5px;">${m.name}</div>`;
                m.subItems.forEach(sub => {
                    ul.innerHTML += `
                        <li class="nav-item" id="nav-${sub.id}">
                            <a href="#${sub.id}" class="nav-link" style="padding-left: 32px;">
                                <span>${sub.name}</span>
                            </a>
                        </li>`;
                });
            } else {
                ul.innerHTML += `
                    <li class="nav-item" id="nav-${m.id}">
                        <a href="#${m.id}" class="nav-link">
                            <div class="nav-icon"><svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">${m.icon}</svg></div>
                            <span>${m.name}</span>
                        </a>
                    </li>`;
            }
        }
    });
}

function toggleFullscreen(btn) {
    const card = btn.closest('.fullscreen-capable');
    if (!card) return;
    const isFullscreen = card.classList.contains('fullscreen-active');
    if (!isFullscreen) {
        card.classList.add('fullscreen-active');
        btn.innerHTML = `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg>`;
    } else {
        card.classList.remove('fullscreen-active');
        btn.innerHTML = `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"></path></svg>`;
    }
}
