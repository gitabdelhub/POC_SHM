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
   SAHAM BANK ANALYTICS PORTAL - API HELPER & USER SESSION
   ========================================================================== */

/**
 * URL de l'API, resolue automatiquement selon l'environnement.
 * Voir le commentaire detaille dans index.html (meme logique).
 */
const API_BASE = (function () {
    if (typeof window !== 'undefined' && window.SAHAM_API_BASE) {
        return String(window.SAHAM_API_BASE).replace(/\/$/, '');
    }
    var h = (typeof location !== 'undefined' && location.hostname) || '';
    if (h === 'localhost' || h === '127.0.0.1' || h === '' || h === '::1') {
        return 'http://localhost:8000';
    }
    return '';
})();

async function apiGet(path) {
    try {
        const token = localStorage.getItem('saham_access_token');
        const headers = {};
        if (token) headers['Authorization'] = 'Bearer ' + token;
        const r = await fetch(API_BASE + path, { headers });
        if (!r.ok) return null;
        return await r.json();
    } catch(e) { return null; }
}

function showToast(message, type='success') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast`;
    toast.style.borderLeftColor = type === 'success' ? '#10B981' : 'var(--primary-orange)';
    toast.innerHTML = `<svg width="24" height="24" fill="none" stroke="${type === 'success' ? '#10B981' : 'var(--primary-orange)'}" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> <span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function openDrawer(title, contentHTML) {
    document.getElementById('drawer-title').innerText = title;
    document.getElementById('drawer-content').innerHTML = contentHTML;
    document.getElementById('drawer-overlay').classList.add('active');
    document.getElementById('drawer-panel').classList.add('active');
}
function closeDrawer() {
    document.getElementById('drawer-overlay').classList.remove('active');
    document.getElementById('drawer-panel').classList.remove('active');
}

function login(role) {
    const demoAccounts = {
        'DG': 'dg@sahambank.ma', 'DR': 'dr@sahambank.ma', 'CA': 'ca@sahambank.ma',
        'AR': 'ar@sahambank.ma', 'Admin': 'admin@sahambank.ma'
    };
    const email = demoAccounts[role];
    if (!email) { showToast('Aucun compte démo pour ce rôle', 'error'); return; }
    const password = localStorage.getItem('saham_demo_password') || 'Demo2026!';
    fetch(API_BASE + '/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    })
    .then(async r => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.detail || 'Email ou mot de passe incorrect');
        return data;
    })
    .then(data => {
        localStorage.setItem('saham_access_token', data.access_token);
        APP.userRole = role;
        document.getElementById('login-screen').classList.add('hidden');
        document.getElementById('app-layout').classList.remove('hidden');
        document.getElementById('saham-fab').classList.remove('hidden');

        const nameMapping = { 'DG': 'Mehdi Tazi', 'DR': 'Youssef Berrada', 'CA': 'Amine Benali', 'AR': 'Nadia Fassi', 'Admin': 'Meryem El Asri' };
        document.getElementById('user-avatar').innerText = (nameMapping[role] || role).substring(0,2).toUpperCase();
        document.getElementById('user-name').innerText = nameMapping[role] || role;

        buildSidebar();
        if (role === 'Admin') {
            location.hash = 'admin-add-dash';
        } else {
            const firstModule = APP.modules.find(m => m.roles && m.roles.includes(role) && m.id !== 'admin');
            if (firstModule) location.hash = firstModule.id;
            else location.hash = 'dashboard';
        }
        route();
    })
    .catch(err => showToast(err.message, 'error'));
}

function logout() {
    localStorage.removeItem('saham_access_token');
    location.hash = '';
    document.getElementById('app-layout').classList.add('hidden');
    document.getElementById('saham-fab').classList.add('hidden');
    document.getElementById('saham-chat-panel').classList.remove('active');
    document.getElementById('login-screen').classList.remove('hidden');
}
