const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// 1. Add back login screen HTML
const loginHtml = `
    <!-- LOGIN SCREEN -->
    <div id="login-screen">
        <div class="landing-card fade-in">
            <header class="landing-header">
                <div class="landing-logo" style="display:flex; align-items:center;">
                    <img src="/logo_saham.png" alt="Saham Bank" style="height: 48px; object-fit: contain;">
                </div>
                <nav class="landing-nav">
                    <a>Produits</a>
                    <a>Solutions</a>
                    <a>Ressources</a>
                    <a>À propos</a>
                </nav>
                <div class="landing-actions">
                    <span class="landing-lang">MA 🇲🇦</span>
                    <button class="landing-btn" onclick="document.querySelector('.landing-cards-container').scrollIntoView({behavior:\\'smooth\\'})">Se connecter</button>
                </div>
            </header>
            
            <main class="landing-hero">
                <div class="shape shape-1"></div>
                <div class="shape shape-2"></div>
                
                <h1 class="fade-in" style="animation-delay: 0.1s">
                    Votre banque. Vos données.<br/>
                    <span class="landing-highlight">Votre IA.</span>
                </h1>
                
                <p class="fade-in" style="animation-delay: 0.2s">
                    Prenez le contrôle avec notre nouvelle plateforme d'intelligence de données
                    où vous pouvez piloter toutes vos performances en toute simplicité.
                </p>

                <div class="landing-cards-container">
                    <div class="landing-role-card fade-in" style="animation-delay: 0.3s" onclick="login('DG')">
                        <div class="landing-role-icon">
                            <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 2l-2 4h4l-2-4zM6 10h12v12H6z"></path></svg>
                        </div>
                        <h3>Direction Générale</h3>
                        <p>Vue macro, PNB, rentabilité globale et tableaux de bord stratégiques.</p>
                    </div>

                    <div class="landing-role-card fade-in" style="animation-delay: 0.4s" onclick="login('DR')">
                        <div class="landing-role-icon">
                            <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                        </div>
                        <h3>Directeur Régional</h3>
                        <p>Pilotage du réseau, suivi des agences, dépôts et encours par région.</p>
                    </div>
                    
                    <div class="landing-role-card fade-in" style="animation-delay: 0.5s" onclick="login('CA')">
                        <div class="landing-role-icon">
                            <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                        </div>
                        <h3>Chargé d'Affaires</h3>
                        <p>Gestion du portefeuille clients, instruction des crédits et ciblages.</p>
                    </div>

                    <div class="landing-role-card fade-in" style="animation-delay: 0.6s" onclick="login('AR')">
                        <div class="landing-role-icon" style="background:#fbeae7; color:var(--primary-orange);">
                            <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                        </div>
                        <h3>Direction des Risques</h3>
                        <p>Analyse des créances en souffrance, scoring et respect des normes.</p>
                    </div>

                    <div class="landing-role-card fade-in" style="animation-delay: 0.7s" onclick="login('Admin')">
                        <div class="landing-role-icon" style="background:#e0e7e5; color:var(--slate-700);">
                            <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                        </div>
                        <h3>Administrateur SI</h3>
                        <p>Connexion Power BI, gestion des accès et monitoring plateforme.</p>
                    </div>
                </div>
            </main>
        </div>
    </div>
`;
html = html.replace('<!-- MAIN APP LAYOUT -->', loginHtml + '\n    <!-- MAIN APP LAYOUT -->');

// 2. Hide app-layout again
html = html.replace('<div id="app-layout">', '<div id="app-layout" class="hidden">');

// 3. Re-add login/logout functions
const loginFunc = `
        function login(role) {
            APP.userRole = role;
            document.getElementById('login-screen').classList.add('hidden');
            document.getElementById('app-layout').classList.remove('hidden');
            document.getElementById('saham-fab').classList.remove('hidden');
            
            // Set User Info
            const roleNames = { 'DG': 'Directeur Général', 'DR': 'Directeur Régional', 'CA': "Chargé d'Affaires", 'AR': 'Analyste Risque', 'Admin': 'Administrateur IT' };
            document.getElementById('user-avatar').innerText = role.substring(0,2);
            document.getElementById('user-name').innerText = roleNames[role] || role;

            buildSidebar();
            route();
        }

        function logout() {
            location.hash = '';
            document.getElementById('app-layout').classList.add('hidden');
            document.getElementById('saham-fab').classList.add('hidden');
            document.getElementById('saham-chat-panel').classList.remove('active');
            document.getElementById('login-screen').classList.remove('hidden');
        }
`;

html = html.replace(/function logout\(\) \{[\s\S]*?\}/, loginFunc);

// 4. Re-add the Map
const mapHtml = `                    <!-- Interactive Bubble Map for DG/DR -->
                    \${(APP.userRole === 'DG' || APP.userRole === 'DR') ? \`
                    <div style="margin-bottom:24px; background:white; border-radius:12px; border:1px solid var(--sec-bg); padding:20px; box-shadow:0 2px 8px rgba(0,0,0,0.02);">
                        <h3 style="font-family:'Montserrat', sans-serif; font-size:16px; font-weight:700; color:var(--dark-teal); margin-top:0; margin-bottom:16px;">Cartographie Commerciale (Bubble Map)</h3>
                        <div style="position:relative; width:100%; height:300px; background:var(--light-bg); border-radius:8px; border:1px solid #e2e8f0; overflow:hidden;">
                            <!-- Simplified Moroccan Map Background using SVG -->
                            <svg width="100%" height="100%" viewBox="0 0 800 400" preserveAspectRatio="xMidYMid slice" style="position:absolute; top:0; left:0; opacity:0.1;">
                                <path d="M100,50 Q400,10 700,50 T750,350 Q400,380 50,350 Z" fill="#0e6944" />
                            </svg>
                            <!-- Bubbles -->
                            <div style="position:absolute; top:30%; left:40%; width:40px; height:40px; background:rgba(14, 105, 68, 0.6); border:2px solid #0e6944; border-radius:50%; display:flex; align-items:center; justify-content:center; color:white; font-size:10px; font-weight:bold; cursor:pointer;" title="Casablanca: 12.5 Md" onclick="showToast('Région Casablanca: 12.5 Md MAD', 'info')">Casa</div>
                            <div style="position:absolute; top:20%; left:50%; width:30px; height:30px; background:rgba(211, 59, 33, 0.6); border:2px solid #d33b21; border-radius:50%; display:flex; align-items:center; justify-content:center; color:white; font-size:9px; font-weight:bold; cursor:pointer;" title="Rabat: 8.2 Md" onclick="showToast('Région Rabat: 8.2 Md MAD', 'info')">Rabat</div>
                            <div style="position:absolute; top:50%; left:35%; width:25px; height:25px; background:rgba(14, 105, 68, 0.6); border:2px solid #0e6944; border-radius:50%; display:flex; align-items:center; justify-content:center; color:white; font-size:8px; font-weight:bold; cursor:pointer;" title="Marrakech: 5.1 Md" onclick="showToast('Région Marrakech: 5.1 Md MAD', 'info')">KeCH</div>
                            <div style="position:absolute; top:15%; left:55%; width:20px; height:20px; background:rgba(211, 59, 33, 0.6); border:2px solid #d33b21; border-radius:50%; display:flex; align-items:center; justify-content:center; color:white; font-size:7px; font-weight:bold; cursor:pointer;" title="Tanger: 4.8 Md" onclick="showToast('Région Tanger: 4.8 Md MAD', 'info')">TNG</div>
                            <div style="position:absolute; top:70%; left:25%; width:15px; height:15px; background:rgba(14, 105, 68, 0.6); border:2px solid #0e6944; border-radius:50%; display:flex; align-items:center; justify-content:center; color:white; font-size:6px; font-weight:bold; cursor:pointer;" title="Agadir: 3.2 Md" onclick="showToast('Région Agadir: 3.2 Md MAD', 'info')">AGA</div>
                        </div>
                    </div>
                    \` : ''}`;

html = html.replace('<!-- Main Charts Row -->', mapHtml + '\n                    <!-- Main Charts Row -->');

// 5. Remove the DOMContentLoaded block from fix_init.cjs
html = html.replace(/window\.addEventListener\('DOMContentLoaded'[\s\S]*?\}\);\n/, '');

fs.writeFileSync('index.html', html);
