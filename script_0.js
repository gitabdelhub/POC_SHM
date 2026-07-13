
        /* --- 1. MOCK DATA GENERATION --- */
                // Realistic data generation
        const MOCK = {
            agences: ['Casablanca Anfa', 'Casablanca Maarif', 'Rabat Agdal', 'Rabat Hassan', 'Marrakech Gueliz', 'Agadir Centre', 'Fès Ville Nouvelle', 'Tanger Marina'],
            segments: ['Particuliers', 'Professionnels', 'PME', 'Grandes Entreprises', 'Bancassurance'],
            firstNames: ['Rachid', 'Fatima', 'Youssef', 'Khadija', 'Omar', 'Amina', 'Mehdi', 'Laila', 'Hassan', 'Sanae', 'Karim', 'Nadia', 'Adil', 'Mouna', 'Tarik'],
            lastNames: ['Benali', 'El Idrissi', 'Amrani', 'Tazi', 'Berrada', 'Bennani', 'Chraibi', 'Mansour', 'El Fassi', 'Alaoui', 'Tahiri', 'Zniber', 'Filali', 'El Ouardi', 'Kabbaj'],
            clients: [],
            dossiers: [
                { id: 'CR-2026-001', client: 'Groupe SNI', type: 'Assurance Flotte Auto', montant: 45000000, score: 88, statut: 'Actif' },
                { id: 'CR-2026-002', client: 'Maroc Telecom', type: 'Assurance Maladie', montant: 12000000, score: 92, statut: 'En attente' },
                { id: 'CR-2026-003', client: 'OCP Group', type: 'Couverture Multirisque', montant: 85000000, score: 95, statut: 'Actif' },
                { id: 'CR-2026-004', client: 'StartUp Tech M', type: 'Assurance RC Pro', montant: 500000, score: 62, statut: 'A risque' }
            ],
            // Seasonality: Peaks in Q2 (M6) and Q4 (M12)
            pnbData: [11.2, 12.5, 13.8, 14.1, 15.6, 18.4, 14.2, 13.5, 15.1, 16.5, 17.8, 22.1], // Millions MAD
            creditDistrib: [
                { label: 'Assurance Non-Vie', value: 40 }, { label: 'Assurance Vie', value: 30 }, 
                { label: 'Bancassurance', value: 15 }, { label: 'Corporate', value: 10 }, { label: 'Santé', value: 5 }
            ],
            admins: [
                { nom: 'Amina Bennani', email: 'a.bennani@saham.ma', profil: 'Admin IT', agence: 'Siège Casa', statut: 'Actif', dashboards: 4 },
                { nom: 'Youssef Amrani', email: 'y.amrani@saham.ma', profil: 'Admin Data', agence: 'Siège Casa', statut: 'Actif', dashboards: 8 },
                { nom: 'Hassan El Fassi', email: 'h.elfassi@saham.ma', profil: 'Admin Risque', agence: 'Siège Casa', statut: 'Suspendu', dashboards: 1 }
            ],
            
            queries: [
                { id: 'Q001', question: "Clients avec score de risque critique (&lt; 30)", sql: "SELECT id, nom, score, encours FROM clients WHERE score < 30 ORDER BY score ASC LIMIT 5;", results: 14, time: 142, date: "07/07/2026 09:14", user: "Directeur Régional", tables: ['clients'], status: 'Succès' },
                { id: 'Q002', question: "Agences avec le plus fort taux NPL", sql: "SELECT agence, npl_ratio FROM agences_perf ORDER BY npl_ratio DESC LIMIT 3;", results: 8, time: 85, date: "07/07/2026 09:42", user: "Administrateur", tables: ['agences_perf', 'credits'], status: 'Succès' },
                { id: 'Q003', question: "Transactions suspectes dernières 48h", sql: "SELECT id_trx, montant, motif_alerte FROM transactions WHERE alerte_aml = true AND date_trx >= NOW() - INTERVAL '48 hours';", results: 4, time: 210, date: "07/07/2026 10:05", user: "Directeur Agence", tables: ['transactions', 'alertes_aml'], status: 'Succès' },
                { id: 'Q004', question: "Quel est le CA de l'agence Anfa ?", sql: "SELECT sum(ca) FROM agences_perf WHERE agence = 'Casablanca Anfa';", results: 1, time: 54, date: "06/07/2026 14:22", user: "Chef d'Agence", tables: ['agences_perf'], status: 'Succès' },
                { id: 'Q005', question: "Montre moi les clients de Tanger", sql: "SELECT * FROM clients WHERE ville = 'Tanger';", results: 342, time: 120, date: "06/07/2026 15:10", user: "Conseiller Pro", tables: ['clients'], status: 'Succès' },
                { id: 'Q006', question: "Dossiers crédit en surveillance ce mois", sql: "SELECT id, type, montant, agence FROM dossiers WHERE statut = 'Surveillance' AND extract(month from date_maj) = extract(month from current_date);", results: 8, time: 165, date: "06/07/2026 16:45", user: "Analyste Risque", tables: ['dossiers'], status: 'Succès' },
                { id: 'Q007', question: "Evolution des dépôts par trimestre", sql: "SELECT trimestre, sum(depots) FROM performances GROUP BY trimestre ORDER BY trimestre;", results: 4, time: 88, date: "05/07/2026 09:30", user: "Directeur Régional", tables: ['performances'], status: 'Succès' },
                { id: 'Q008', question: "Clients ayant souscrit à l'assurance vie", sql: "SELECT * FROM clients c JOIN produits p ON c.id = p.client_id WHERE p.type = 'Assurance Vie';", results: 1250, time: 310, date: "05/07/2026 11:15", user: "Marketing", tables: ['clients', 'produits'], status: 'Erreur' },
                { id: 'Q009', question: "Top 5 expositions crédit par segment", sql: "SELECT segment, sum(encours) as total_encours FROM clients GROUP BY segment ORDER BY total_encours DESC LIMIT 5;", results: 5, time: 112, date: "05/07/2026 14:50", user: "Analyste Risque", tables: ['clients'], status: 'Succès' },
                { id: 'Q010', question: "Churn prévu par agence Q3 2026", sql: "SELECT agence, predicted_churn_rate FROM churn_predictions WHERE quarter = 'Q3-2026' ORDER BY predicted_churn_rate DESC LIMIT 3;", results: 8, time: 195, date: "04/07/2026 08:20", user: "Data Scientist", tables: ['churn_predictions'], status: 'Succès' },
                { id: 'Q011', question: "PME éligibles à une offre crédit", sql: "SELECT nom, encours, score_appetence FROM clients WHERE segment = 'PME' AND eligibilite_credit = true ORDER BY score_appetence DESC LIMIT 5;", results: 142, time: 240, date: "04/07/2026 10:30", user: "Conseiller Pro", tables: ['clients', 'scoring'], status: 'Succès' },
                { id: 'Q012', question: "Comparatif encours vs objectifs par DR", sql: "SELECT dr, sum(encours) as realise, sum(objectif) as cible FROM agences_perf GROUP BY dr;", results: 3, time: 95, date: "04/07/2026 16:15", user: "Directeur Régional", tables: ['agences_perf'], status: 'Succès' },
                { id: 'Q013', question: "Nombre de réclamations ouvertes", sql: "SELECT count(*) FROM reclamations WHERE statut = 'Ouverte';", results: 1, time: 42, date: "03/07/2026 09:05", user: "Service Client", tables: ['reclamations'], status: 'Succès' },
                { id: 'Q014', question: "Temps moyen de traitement des crédits", sql: "SELECT avg(date_decision - date_depot) FROM dossiers WHERE statut IN ('Approuvé', 'Rejeté');", results: 1, time: 134, date: "03/07/2026 11:40", user: "Administrateur", tables: ['dossiers'], status: 'Succès' },
                { id: 'Q015', question: "Liste des collaborateurs absents", sql: "SELECT * FROM rh_absences WHERE date_debut <= CURRENT_DATE AND date_fin >= CURRENT_DATE;", results: 24, time: 68, date: "02/07/2026 08:50", user: "RH", tables: ['rh_absences'], status: 'Erreur' },
                { id: 'Q016', question: "Portefeuille à risque Casablanca vs Marrakech", sql: "SELECT ville, sum(encours_npl) as risque_total FROM clients WHERE ville IN ('Casablanca', 'Marrakech') GROUP BY ville;", results: 2, time: 105, date: "02/07/2026 14:12", user: "Analyste Risque", tables: ['clients'], status: 'Succès' },
                { id: 'Q017', question: "Évolution du PNB ce trimestre", sql: "SELECT mois, pnb_realise, pnb_objectif FROM performances WHERE trimestre = 'Q3' ORDER BY mois ASC;", results: 3, time: 76, date: "01/07/2026 09:25", user: "Directeur Financier", tables: ['performances'], status: 'Succès' },
                { id: 'Q018', question: "Clients VIP sans visite depuis 6 mois", sql: "SELECT * FROM clients WHERE segment = 'Premium' AND last_visit < NOW() - INTERVAL '6 months';", results: 45, time: 180, date: "01/07/2026 11:55", user: "Conseiller VIP", tables: ['clients', 'visites'], status: 'Succès' },
                { id: 'Q019', question: "Taux de transformation des leads", sql: "SELECT count(case when converted then 1 end)::float / count(*) FROM leads;", results: 1, time: 155, date: "30/06/2026 15:30", user: "Marketing", tables: ['leads'], status: 'Succès' },
                { id: 'Q020', question: "Liste des guichets automatiques en panne", sql: "SELECT id_atm, localisation FROM atms WHERE statut_technique != 'OK';", results: 12, time: 50, date: "30/06/2026 17:45", user: "Support IT", tables: ['atms'], status: 'Succès' }
            ], // Query logger
        };

        // Generate 100 Clients with realistic risk correlation
        for(let i=1; i<=100; i++) {
            const fname = MOCK.firstNames[Math.floor(Math.random() * MOCK.firstNames.length)];
            const lname = MOCK.lastNames[Math.floor(Math.random() * MOCK.lastNames.length)];
            const segment = MOCK.segments[Math.floor(Math.random() * MOCK.segments.length)];
            const agence = MOCK.agences[Math.floor(Math.random() * MOCK.agences.length)];
            
            // Base encours
            let baseEncours = 50000;
            if (segment === 'Premium') baseEncours = 300000;
            if (segment === 'PME') baseEncours = 1000000;
            if (segment === 'Corporate') baseEncours = 5000000;
            
            const encours = Math.floor(Math.random() * baseEncours) + baseEncours / 2;
            
            // Risk correlation: PME and Agricole have slightly higher risk. Corporate has lower risk.
            let baseScore = 65;
            if (segment === 'Corporate') baseScore += 20;
            if (segment === 'PME') baseScore -= 15;
            if (segment === 'Agricole') baseScore -= 20;
            
            // Some specific agencies have higher risk (e.g. Tanger Marina)
            if (agence === 'Tanger Marina') baseScore -= 10;
            
            let score = baseScore + (Math.floor(Math.random() * 40) - 20);
            score = Math.max(10, Math.min(99, score)); // clamp 10-99
            
            let statut = 'Actif';
            if (score < 40) statut = 'À risque';
            if (score < 25) statut = 'Défaut';

            MOCK.clients.push({ id: `CLI-${10000+i}`, nom: `${fname} ${lname}`, segment, agence, ville: agence.split(' ')[0], encours, score, statut, age: Math.floor(Math.random() * 50) + 22 });
        }

        // Generate 35 Dossiers (Engagements)
        const statutsDossier = ['En analyse', 'Validé', 'Débloqué', 'Surveillance', 'Contentieux'];
        const typesCredit = ['Mourabaha Immo', 'Ijara', 'Mourabaha Auto', 'Crédit Tréso', 'Investissement PME'];
        for(let i=1; i<=35; i++) {
            const client = MOCK.clients[Math.floor(Math.random() * MOCK.clients.length)];
            MOCK.dossiers.push({
                ref: `SBK-${new Date().getFullYear()}-${1000+i}`,
                client: client.nom,
                type: typesCredit[Math.floor(Math.random() * typesCredit.length)],
                montant: Math.floor(Math.random() * 1900000) + 100000,
                duree: [12, 24, 36, 48, 60, 120, 240][Math.floor(Math.random() * 7)],
                taux: (Math.random() * 3 + 2).toFixed(2),
                score: client.score,
                statut: statutsDossier[Math.floor(Math.random() * statutsDossier.length)]
            });
        }

        /* --- 2. APP STATE --- */
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
                { id: 'admin', name: "Administration & BI", icon: '<path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>', roles: ['Admin'] }
            ]
        };

        /* --- 3. UTILITIES & COMPONENTS --- */
        const formatMAD = (num) => new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD', maximumFractionDigits: 0 }).format(num);
        
        function showToast(message, type='success') {
            const container = document.getElementById('toast-container');
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

                function getScoreBadge(score) {
            let color = '#10B981';
            let label = 'Bon';
            if(score < 70) { color = '#F59E0B'; label = 'Moyen'; }
            if(score < 40) { color = '#EF4444'; label = 'Risqué'; }
            
            return `
            <div style="display:flex; align-items:center; gap:8px;">
                <span style="font-weight:700; width:24px; text-align:right;">${score}</span>
                <div style="flex:1; max-width:80px; height:6px; background:var(--sec-bg); border-radius:3px; overflow:hidden;">
                    <div style="height:100%; width:${score}%; background:${color};"></div>
                </div>
                <span style="font-size:11px; color:var(--slate-500);">${label}</span>
            </div>`;
        }

                function getStatutBadge(statut) {
            const map = {
                'Actif': 'success', 'À risque': 'warning', 'Défaut': 'danger',
                'Validé': 'success', 'Débloqué': 'success', 'En analyse': 'info', 'Surveillance': 'warning', 'Contentieux': 'danger'
            };
            const colorClass = map[statut] || 'info';
            let dot = '';
            if (statut === 'À risque') {
                dot = '<span style="display:inline-block; width:6px; height:6px; background:currentColor; border-radius:50%; margin-right:6px; animation: pulse 1.5s infinite;"></span>';
            }
            return `<span class="status-badge status-${colorClass}" style="display:inline-flex; align-items:center;">${dot}${statut}</span>`;
        }

                function buildKPI(title, value, delta, isPos, iconSvg) {
            // value might be string like '1.2M MAD' or number
            return `
            <div class="kpi-card">
                <div class="kpi-header">
                    <span>${title}</span>
                    <div class="kpi-icon"><svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">${iconSvg}</svg></div>
                </div>
                <div class="kpi-value animate-val" data-val="${value}">0</div>
                <div class="kpi-delta ${isPos ? 'delta-positive' : 'delta-negative'}">
                    <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="${isPos ? 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6' : 'M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6'}"></path></svg>
                    ${delta}
                </div>
            </div>`;
        }

        /* SVG Line Chart Builder */
        function createLineChart(data, width=700, height=250) {
            const padX = 40, padY = 40;
            const max = Math.max(...data) * 1.1;
            const stepX = (width - padX * 2) / (data.length - 1);
            
            let points = data.map((d, i) => {
                const x = padX + i * stepX;
                const y = height - padY - (d / max) * (height - padY * 2);
                return `${x},${y}`;
            }).join(' ');

            let circles = data.map((d, i) => {
                const x = padX + i * stepX;
                const y = height - padY - (d / max) * (height - padY * 2);
                return `<circle cx="${x}" cy="${y}" r="4" fill="var(--primary-orange)" stroke="var(--surface)" stroke-width="2" class="hover-point" data-val="${d}M MAD" onmouseover="showTooltip(event, '${d}M MAD')" onmouseout="hideTooltip()"/>
                        <text x="${x}" y="${height - 10}" font-size="10" fill="var(--slate-500)" text-anchor="middle">M${i+1}</text>`;
            }).join('');

            return `
            <svg viewBox="0 0 ${width} ${height}" class="nat-chart">
                <!-- Grid -->
                <line x1="${padX}" y1="${padY}" x2="${width-padX}" y2="${padY}" stroke="var(--sec-bg)" />
                <line x1="${padX}" y1="${height/2}" x2="${width-padX}" y2="${height/2}" stroke="var(--sec-bg)" />
                <line x1="${padX}" y1="${height-padY}" x2="${width-padX}" y2="${height-padY}" stroke="var(--slate-300)" />
                <!-- Path -->
                <polyline points="${points}" fill="rgba(46, 71, 65, 0.1)" stroke="var(--primary-teal)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                ${circles}
            </svg>`;
        }

        /* SVG Bar Chart Builder */
        function createBarChart(dataArr, width=700, height=250) {
            const padX = 40, padY = 40;
            const max = Math.max(...dataArr.map(d => d.value)) * 1.1;
            const barWidth = 40;
            const stepX = (width - padX * 2) / dataArr.length;

            let rects = dataArr.map((d, i) => {
                const x = padX + (i * stepX) + (stepX/2) - (barWidth/2);
                const h = (d.value / max) * (height - padY * 2);
                const y = height - padY - h;
                return `
                <rect x="${x}" y="${y}" width="${barWidth}" height="${h}" fill="var(--primary-teal)" rx="4" ry="4" 
                      onmouseover="this.setAttribute('fill', 'var(--dark-teal)'); showTooltip(event, '${d.value}%')" 
                      onmouseout="this.setAttribute('fill', 'var(--primary-teal)'); hideTooltip()"/>
                <text x="${x + barWidth/2}" y="${height - 15}" font-size="10" fill="var(--slate-500)" text-anchor="middle" transform="rotate(-30 ${x + barWidth/2},${height - 15})">${d.label}</text>
                <text x="${x + barWidth/2}" y="${y - 8}" font-size="12" fill="var(--text-main)" font-weight="bold" text-anchor="middle">${d.value}%</text>`;
            }).join('');

            return `<svg viewBox="0 0 ${width} ${height}" class="nat-chart">
                 <line x1="${padX}" y1="${height-padY}" x2="${width-padX}" y2="${height-padY}" stroke="var(--slate-300)" />
                ${rects}
            </svg>`;
        }

        let tooltipEl = null;
        function showTooltip(e, text) {
            if(!tooltipEl) tooltipEl = document.getElementById('tooltip');
            tooltipEl.innerText = text;
            tooltipEl.style.opacity = 1;
            tooltipEl.style.left = (e.pageX + 10) + 'px';
            tooltipEl.style.top = (e.pageY - 20) + 'px';
        }
        function hideTooltip() { if(tooltipEl) tooltipEl.style.opacity = 0; }

        /* Power BI Placeholder */
        const PBI_TEMPLATE = `
            <div class="pbi-placeholder fade-in">
                <div class="pbi-logo"><svg width="32" height="32" fill="currentColor" viewBox="0 0 24 24"><path d="M4 10h4v10H4zM10 4h4v16h-4zM16 14h4v6h-4z"/></svg></div>
                <h3 class="font-brand" style="font-size:24px; color:var(--text-main); margin-bottom:12px;">Rapport connecté au workspace Saham Bank</h3>
                <p style="max-width:400px; margin-bottom:24px;">Cette vue nécessite une licence Power BI Pro. L'intégration iframe est configurée en backend.</p>
                <button class="btn btn-primary" onclick="showToast('Ouverture du rapport PBI en plein écran simulée')">Ouvrir en plein écran</button>
            </div>`;

        /* --- 4. CORE LOGIC & ROUTING --- */

        function login(role) {
            APP.userRole = role;
            document.getElementById('login-screen').classList.add('hidden');
            document.getElementById('app-layout').classList.remove('hidden');
            document.getElementById('saham-fab').classList.remove('hidden');
            
            // Set User Info
            const roleNames = { 'DG': 'Directeur Général', 'DA': "Directeur d'Agence", 'Admin': 'Administrateur IT' };
            document.getElementById('user-avatar').innerText = role;
            // document.getElementById('user-role-label').innerText = roleNames[role];
            const nameMapping = { 'DG': 'Mehdi Tazi', 'DR': 'Youssef Berrada', 'CA': 'Amine Benali', 'AR': 'Nadia Fassi', 'Admin': 'Admin System' };
            document.getElementById('user-name').innerText = nameMapping[role] || 'Utilisateur';
            document.getElementById('user-avatar').innerText = (nameMapping[role] || 'U').substring(0, 2).toUpperCase();
            buildSidebar();
            
            // Default route based on role
            const firstModule = APP.modules.find(m => m.roles.includes(role)).id;
            location.hash = firstModule;
            route();
        }

        window.createCustomDashboard = function() {
            const name = document.getElementById('new-dash-name').value;
            const url = document.getElementById('new-dash-url').value;
            const roles = Array.from(document.querySelectorAll('.new-dash-role:checked')).map(el => el.value);
            
            if(!name || !url || roles.length === 0) {
                showToast("Veuillez remplir tous les champs et sélectionner au moins un rôle.", "error");
                return;
            }
            
            const newId = 'custom_pbi_' + Date.now();
            APP.modules.push({
                id: newId,
                name: name,
                icon: '<path stroke-linecap="round" stroke-linejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>',
                roles: roles,
                isCustomExt: true,
                url: url
            });
            
            buildSidebar();
            showToast("Module '" + name + "' créé avec succès.");
            document.getElementById('new-dash-name').value = '';
            document.getElementById('new-dash-url').value = '';
        };

        
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


        function toggleSidebar() {
            document.getElementById('sidebar').classList.toggle('collapsed');
        }

        function buildSidebar() {
            const ul = document.getElementById('sidebar-nav');
            ul.innerHTML = '';
            APP.modules.forEach(m => {
                if (m.roles && m.roles.includes(APP.userRole)) {
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

        window.switchTab = function(btn, targetId) {
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
                ['admin-pbi', 'admin-users', 'admin-queries', 'admin-add-dash'].forEach(id => {
                    const el = document.getElementById(id);
                    if(el) el.classList.add('hidden');
                });
            }

            const target = document.getElementById(targetId);
            if(target) target.classList.remove('hidden');
        };

        
        function createCustomDashboard() {
            const name = document.getElementById('new-dash-name').value.trim();
            const url = document.getElementById('new-dash-url').value.trim();
            if (!name || !url) {
                showToast('Veuillez remplir tous les champs', true);
                return;
            }
            const roles = Array.from(document.querySelectorAll('.new-dash-role:checked')).map(cb => cb.value);
            if (roles.length === 0) {
                showToast('Veuillez sélectionner au moins un rôle', true);
                return;
            }
            const id = 'custom-' + Date.now();
            APP.modules.push({
                id: id,
                name: name,
                icon: '<path stroke-linecap="round" stroke-linejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />',
                roles: roles,
                isCustomExt: true,
                url: url
            });
            buildSidebar();
            showToast('Dashboard créé avec succès');
            document.getElementById('new-dash-name').value = '';
            document.getElementById('new-dash-url').value = '';
        }

        function route() {
            const hash = location.hash.replace('#', '') || 'dashboard';
            
            // Update Active Nav
            document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
            const activeNav = document.getElementById(`nav-${hash}`);
            if(activeNav) activeNav.classList.add('active');

            let moduleDef = APP.modules.find(m => m.id === hash);
            if (!moduleDef) {
                APP.modules.forEach(m => {
                    if (m.isGroup) {
                        const sub = m.subItems.find(s => s.id === hash);
                        if (sub) moduleDef = { ...sub, name: m.name + ' / ' + sub.name };
                    }
                });
            }
            if(moduleDef) document.getElementById('breadcrumb').innerText = moduleDef.name;

            const content = document.getElementById('main-content');
            content.innerHTML = ''; // clear
            content.scrollTop = 0;

            switch(hash) {
                case 'dashboard': renderDashboard(content); break;
                case 'custom_dash': renderCustomDash(content); break;
                case 'powerbi': renderPowerbi(content); break;
                case 'portefeuille': renderPortefeuille(content); break;
                case 'engagements': renderEngagements(content); break;
                case 'ciblage': renderCiblage(content); break;
                case 'risques': renderRisques(content); break;
                case 'chatbot': renderChatbot(content); break;
                case 'admin': renderAdmin(content); break;
                case 'qualite': renderQualite(content); break; // Fallback or distinct view
                case 'commissions': renderCommissions(content); break; // Fallback or distinct view
                default: 
                    if (moduleDef && moduleDef.isCustomExt) {
                        content.innerHTML = `<div class="fade-in" style="height:100%; display:flex; flex-direction:column;">
                            <h2 style="font-family:'Montserrat', sans-serif; font-size:24px; color:var(--dark-teal); font-weight:700; margin-bottom:16px;">${moduleDef.name}</h2>
                            <div style="flex:1; background:var(--surface); border:1px solid var(--sec-bg); border-radius:var(--border-radius); overflow:hidden;">
                                <iframe src="${moduleDef.url}" style="width:100%; height:100%; border:none;"></iframe>
                            </div>
                        </div>`;
                    } else {
                        renderDashboard(content);
                    }
                    break;
            }
        }
        window.addEventListener('hashchange', route);

        
        window.toggleSql = function(btn) {
            const container = btn.nextElementSibling;
            if(container.classList.contains('active')) {
                container.classList.remove('active');
                btn.innerHTML = '<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg> Voir la requête SQL';
            } else {
                container.classList.add('active');
                btn.innerHTML = '<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"></path></svg> Masquer la requête SQL';
            }
        }

        /* --- 5. MODULE RENDERERS --- */

        function renderDashboard(container) {
            const profileData = {
                'DG': { title: 'Vue Macro Groupe', pnb: '1.42 Md', credits: '45.8 Md', depots: '52.4 Md', npl: '0.85', trendPNB: '+5.4%', trendCred: '+2.1%', trendDep: '+3.8%' },
                'DR': { title: 'Vue Régionale (Rabat Agdal)', pnb: '345 M', credits: '12.1 Md', depots: '15.2 Md', npl: '0.92', trendPNB: '+3.2%', trendCred: '+1.5%', trendDep: '+2.1%' },
                'CA': { title: 'Vue Portefeuille Clientèle', pnb: '85 M', credits: '2.4 Md', depots: '3.1 Md', npl: '1.02', trendPNB: '+1.4%', trendCred: '+0.8%', trendDep: '+1.2%' },
                'AR': { title: 'Vue Agence', pnb: '65 M', credits: '1.8 Md', depots: '2.5 Md', npl: '0.98', trendPNB: '+1.1%', trendCred: '+0.5%', trendDep: '+0.9%' },
                'Admin': { title: 'Vue Complète Système', pnb: '1.42 Md', credits: '45.8 Md', depots: '52.4 Md', npl: '0.85', trendPNB: '+5.4%', trendCred: '+2.1%', trendDep: '+3.8%' }
            };
            const data = profileData[APP.userRole] || profileData['DG'];
            const formatVal = (str) => {
                const parts = str.split(' ');
                return `${parts[0]} <span style="font-size:16px; font-weight:600; color:var(--slate-500);">${parts[1] || ''} MAD</span>`;
            };

            container.innerHTML = `
                <div class="fade-in">
                    <div style="display:flex; align-items:center; gap:12px; margin-bottom:24px;">
                        <span style="background:var(--light-bg); color:var(--primary-teal); padding:4px 12px; border-radius:20px; font-size:11px; font-weight:700; letter-spacing:1px; text-transform:uppercase;">${data.title}</span>
                        <h2 style="font-family:'Montserrat', sans-serif; font-size:24px; color:var(--dark-teal); font-weight:800; margin:0; flex:1;">Performances Financières & Commerciales</h2>
                        <button onclick="exportDashCSV()" style="background:var(--primary-teal); color:white; border:none; padding:8px 16px; border-radius:6px; font-size:12px; font-weight:600; cursor:pointer; display:flex; align-items:center; gap:6px;">
                            <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg> Exporter CSV
                        </button>
                    </div>

                    <!-- KPI Row -->
                    <div style="display:grid; grid-template-columns: repeat(4, 1fr); gap:16px; margin-bottom:24px;">
                        <div style="background:white; border-radius:12px; border:1px solid var(--sec-bg); padding:20px; box-shadow:0 2px 8px rgba(0,0,0,0.02);">
                            <h3 style="font-family:'Montserrat', sans-serif; font-size:12px; color:var(--slate-500); text-transform:uppercase; letter-spacing:0.5px; margin-bottom:8px; display:flex; justify-content:space-between; align-items:center;">
                                Produit Net Bancaire <div style="width:24px; height:24px; border-radius:50%; background:#f0fdf4; color:#16a34a; display:flex; align-items:center; justify-content:center; font-size:12px;">▲</div>
                            </h3>
                            <div style="font-size:32px; font-weight:800; color:var(--dark-teal); margin-bottom:12px; font-family:'Manrope', sans-serif;">${formatVal(data.pnb)}</div>
                            <div style="font-size:12px; color:var(--slate-500); display:flex; align-items:center; gap:6px;">
                                <span style="background:#f0fdf4; color:#16a34a; padding:2px 6px; border-radius:4px; font-weight:600; font-size:10px;">${data.trendPNB}</span> vs année précédente
                            </div>
                        </div>

                        <div style="background:white; border-radius:12px; border:1px solid var(--sec-bg); padding:20px; box-shadow:0 2px 8px rgba(0,0,0,0.02);">
                            <h3 style="font-family:'Montserrat', sans-serif; font-size:12px; color:var(--slate-500); text-transform:uppercase; letter-spacing:0.5px; margin-bottom:8px; display:flex; justify-content:space-between; align-items:center;">
                                Encours Crédits <div style="width:24px; height:24px; border-radius:50%; background:#f0fdf4; color:#16a34a; display:flex; align-items:center; justify-content:center; font-size:12px;">▲</div>
                            </h3>
                            <div style="font-size:32px; font-weight:800; color:var(--dark-teal); margin-bottom:12px; font-family:'Manrope', sans-serif;">${formatVal(data.credits)}</div>
                            <div style="font-size:12px; color:var(--slate-500); display:flex; align-items:center; gap:6px;">
                                <span style="background:#f0fdf4; color:#16a34a; padding:2px 6px; border-radius:4px; font-weight:600; font-size:10px;">${data.trendCred}</span> vs objectif annuel
                            </div>
                        </div>

                        <div style="background:white; border-radius:12px; border:1px solid var(--sec-bg); padding:20px; box-shadow:0 2px 8px rgba(0,0,0,0.02);">
                            <h3 style="font-family:'Montserrat', sans-serif; font-size:12px; color:var(--slate-500); text-transform:uppercase; letter-spacing:0.5px; margin-bottom:8px; display:flex; justify-content:space-between; align-items:center;">
                                Encours Dépôts <div style="width:24px; height:24px; border-radius:50%; background:#f0fdf4; color:#16a34a; display:flex; align-items:center; justify-content:center; font-size:12px;">▲</div>
                            </h3>
                            <div style="font-size:32px; font-weight:800; color:var(--dark-teal); margin-bottom:12px; font-family:'Manrope', sans-serif;">${formatVal(data.depots)}</div>
                            <div style="font-size:12px; color:var(--slate-500); display:flex; align-items:center; gap:6px;">
                                <span style="background:#f0fdf4; color:#16a34a; padding:2px 6px; border-radius:4px; font-weight:600; font-size:10px;">${data.trendDep}</span> collecte nette
                            </div>
                        </div>

                        <div style="background:white; border-radius:12px; border:1px solid var(--sec-bg); padding:20px; box-shadow:0 2px 8px rgba(0,0,0,0.02);">
                            <h3 style="font-family:'Montserrat', sans-serif; font-size:12px; color:var(--slate-500); text-transform:uppercase; letter-spacing:0.5px; margin-bottom:8px; display:flex; justify-content:space-between; align-items:center;">
                                Coût du Risque <div style="width:24px; height:24px; border-radius:50%; background:#f0fdf4; color:#16a34a; display:flex; align-items:center; justify-content:center; font-size:12px;">▼</div>
                            </h3>
                            <div style="font-size:32px; font-weight:800; color:var(--dark-teal); margin-bottom:12px; font-family:'Manrope', sans-serif;">${data.npl}<span style="font-size:24px;">%</span></div>
                            <div style="font-size:12px; color:var(--slate-500); display:flex; align-items:center; gap:6px;">
                                <span style="background:#f0fdf4; color:#16a34a; padding:2px 6px; border-radius:4px; font-weight:600; font-size:10px;">-12 pts</span> amélioration qualité
                            </div>
                        </div>
                    </div>
                                        <!-- Interactive Bubble Map for DG/DR -->
                    ${(APP.userRole === 'DG' || APP.userRole === 'DR') ? `
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
                    ` : ''}
                    <!-- Main Charts Row -->
                    <div style="display:flex; gap:24px; margin-bottom:24px;">
                        
                        <!-- Bar Chart -->
                        <div style="flex:2; background:white; border-radius:12px; border:1px solid var(--sec-bg); box-shadow:0 2px 8px rgba(0,0,0,0.02); overflow:hidden; display:flex; flex-direction:column;">
                            <div style="padding:20px 24px; border-bottom:1px solid var(--sec-bg); display:flex; justify-content:space-between; align-items:center;">
                                <h3 style="font-family:'Montserrat', sans-serif; font-size:16px; font-weight:700; color:var(--dark-teal); margin:0;">Évolution du Produit Net Bancaire (M MAD)</h3>
                                <select style="padding:6px 12px; border:1px solid var(--sec-bg); border-radius:6px; font-size:12px; background:var(--light-bg);"><option>Année 2025</option><option>Année 2026</option></select>
                            </div>
                            <div style="flex:1; padding:24px; position:relative; display:flex; align-items:flex-end; gap:16px; justify-content:space-between; height:250px;">
                                <div style="position:absolute; left:24px; right:24px; top:24px; bottom:24px; border-bottom:1px solid #e2e8f0; display:flex; flex-direction:column; justify-content:space-between;">
                                    <div style="border-bottom:1px dashed #e2e8f0; width:100%;"></div>
                                    <div style="border-bottom:1px dashed #e2e8f0; width:100%;"></div>
                                    <div style="border-bottom:1px dashed #e2e8f0; width:100%;"></div>
                                    <div style="border-bottom:1px dashed #e2e8f0; width:100%;"></div>
                                </div>
                                ${[112, 125, 138, 141, 156, 184, 142, 135, 151, 165, 178, 221].map((val, i) => `
                                <div style="position:relative; flex:1; display:flex; flex-direction:column; align-items:center; justify-content:flex-end; height:100%; z-index:1;">
                                    <div style="width:60%; background:${i === 11 ? '#d33b21' : '#0e6944'}; height:${(val/250)*100}%; border-radius:4px 4px 0 0; transition:height 1s ease-out; opacity:0.9;"></div>
                                    <span style="font-size:10px; color:var(--slate-500); margin-top:8px;">${['Jan','Fév','Mar','Avr','Mai','Juin','Juil','Aoû','Sep','Oct','Nov','Déc'][i]}</span>
                                </div>
                                `).join('')}
                            </div>
                        </div>

                        <!-- Donut Chart -->
                        <div style="flex:1; background:white; border-radius:12px; border:1px solid var(--sec-bg); box-shadow:0 2px 8px rgba(0,0,0,0.02); overflow:hidden;">
                            <div style="padding:20px 24px; border-bottom:1px solid var(--sec-bg);">
                                <h3 style="font-family:'Montserrat', sans-serif; font-size:16px; font-weight:700; color:var(--dark-teal); margin:0;">Répartition des Crédits</h3>
                            </div>
                            <div style="display:flex; flex-direction:column; align-items:center; padding:24px;">
                                <div style="position:relative; width:180px; height:180px; margin-bottom:24px;">
                                    <svg width="180" height="180" viewBox="0 0 100 100" style="transform: rotate(-90deg);">
                                        <circle cx="50" cy="50" r="35" fill="transparent" stroke="#0e6944" stroke-width="20" stroke-dasharray="140 220" stroke-dashoffset="0"></circle>
                                        <circle cx="50" cy="50" r="35" fill="transparent" stroke="#1d2b27" stroke-width="20" stroke-dasharray="45 220" stroke-dashoffset="-140"></circle>
                                        <circle cx="50" cy="50" r="35" fill="transparent" stroke="#d33b21" stroke-width="20" stroke-dasharray="25 220" stroke-dashoffset="-185"></circle>
                                        <circle cx="50" cy="50" r="35" fill="transparent" stroke="#e9eceb" stroke-width="20" stroke-dasharray="10 220" stroke-dashoffset="-210"></circle>
                                    </svg>
                                    <div style="position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center;">
                                        <span style="font-size:24px; font-weight:800; color:var(--dark-teal); font-family:'Manrope', sans-serif;">45.8</span>
                                        <span style="font-size:10px; color:var(--slate-500); text-transform:uppercase; font-weight:600;">Md MAD</span>
                                    </div>
                                </div>
                                <div style="width:100%; display:flex; flex-direction:column; gap:12px;">
                                    <div style="display:flex; justify-content:space-between; align-items:center; font-size:12px; color:var(--slate-700);">
                                        <div style="display:flex; align-items:center; gap:8px;"><div style="width:12px; height:12px; background:#0e6944; border-radius:2px;"></div> Retail (Immo & Conso)</div>
                                        <span style="font-weight:700;">64%</span>
                                    </div>
                                    <div style="display:flex; justify-content:space-between; align-items:center; font-size:12px; color:var(--slate-700);">
                                        <div style="display:flex; align-items:center; gap:8px;"><div style="width:12px; height:12px; background:#1d2b27; border-radius:2px;"></div> Entreprises & PME</div>
                                        <span style="font-weight:700;">20%</span>
                                    </div>
                                    <div style="display:flex; justify-content:space-between; align-items:center; font-size:12px; color:var(--slate-700);">
                                        <div style="display:flex; align-items:center; gap:8px;"><div style="width:12px; height:12px; background:#d33b21; border-radius:2px;"></div> Corporate & IB</div>
                                        <span style="font-weight:700;">12%</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }

        function renderCiblage(container) {
            container.innerHTML = `
                <div class="fade-in">
                    <div style="display:flex; align-items:center; gap:12px; margin-bottom:24px;">
                        <span style="background:var(--light-bg); color:var(--primary-teal); padding:4px 12px; border-radius:20px; font-size:11px; font-weight:700; letter-spacing:1px; text-transform:uppercase;">Marketing & Ventes</span>
                        <h2 style="font-family:'Montserrat', sans-serif; font-size:24px; color:var(--dark-teal); font-weight:800; margin:0;">Ciblage & Campagnes</h2>
                    </div>
                    <div style="background:white; border-radius:12px; border:1px solid var(--sec-bg); padding:24px; box-shadow:0 2px 8px rgba(0,0,0,0.02); text-align:center;">
                        <svg width="64" height="64" fill="none" stroke="var(--slate-300)" stroke-width="1.5" viewBox="0 0 24 24" style="margin-bottom:16px;">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                        </svg>
                        <h3 style="font-family:'Montserrat', sans-serif; font-size:18px; color:var(--dark-teal); margin-bottom:8px;">Outil de ciblage en construction</h3>
                        <p style="color:var(--slate-500); font-size:14px; max-width:400px; margin:0 auto;">Le module de ciblage client et de génération de leads commerciaux sera bientôt disponible dans cette vue.</p>
                        <button style="margin-top:24px; background:var(--primary-teal); color:white; border:none; padding:10px 24px; border-radius:8px; font-weight:600; cursor:pointer; box-shadow:0 2px 4px rgba(0,0,0,0.1);" onclick="showToast('Bientôt disponible')">Être notifié</button>
                    </div>
                </div>
            `;
        }

        
        function renderQualite(container) {
            container.innerHTML = `
                <div class="fade-in">
                    <div style="display:flex; align-items:center; gap:12px; margin-bottom:24px;">
                        <span style="background:var(--light-bg); color:var(--primary-teal); padding:4px 12px; border-radius:20px; font-size:11px; font-weight:700; letter-spacing:1px; text-transform:uppercase;">Services & Qualité</span>
                        <h2 style="font-family:'Montserrat', sans-serif; font-size:24px; color:var(--dark-teal); font-weight:800; margin:0;">Qualité de Service Clientèle</h2>
                    </div>
                    
                    <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:24px; margin-bottom:24px;">
                        <div class="card" style="padding:24px;">
                            <h3 style="font-size:14px; color:var(--slate-500); margin-bottom:12px;">Réclamations Ouvertes</h3>
                            
<div style="font-size:36px; font-weight:800; color:#d33b21;">${APP.userRole === 'DR' ? '42' : APP.userRole === 'CA' ? '12' : '124'}</div>
                            <div style="font-size:12px; color:var(--slate-500); margin-top:8px;">-15% vs mois dernier</div>
                        </div>
                        <div class="card" style="padding:24px;">
                            <h3 style="font-size:14px; color:var(--slate-500); margin-bottom:12px;">Délai de Résolution (Jours)</h3>
                            <div style="font-size:36px; font-weight:800; color:#0e6944;">${APP.userRole === 'DR' ? '1.8' : APP.userRole === 'CA' ? '1.2' : '2.4'}</div>
                            <div style="font-size:12px; color:var(--slate-500); margin-top:8px;">Objectif: < 3 jours</div>
                        </div>
                        <div class="card" style="padding:24px;">
                            <h3 style="font-size:14px; color:var(--slate-500); margin-bottom:12px;">NPS (Net Promoter Score)</h3>
                            <div style="font-size:36px; font-weight:800; color:#0e6944;">${APP.userRole === 'DR' ? '68' : APP.userRole === 'CA' ? '71' : '64'}</div>

                            <div style="font-size:12px; color:var(--slate-500); margin-top:8px;">+4 points T3</div>
                        </div>
                    </div>

                    <div class="card" style="padding:24px;">
                        <h3 style="font-family:'Montserrat', sans-serif; font-size:16px; font-weight:700; color:var(--dark-teal); margin-bottom:16px;">Top Agences (Satisfaction Client)</h3>
                        <div class="table-responsive">
                            <table>
                                <thead>
                                    <tr><th>Code Agence</th><th>Région</th><th>NPS</th><th>Réclamations Traitées</th><th>Délai Moyen</th></tr>
                                </thead>
                                <tbody>
                                    
                                    ${APP.userRole === 'DR' ? `
                                        <tr><td>AG-201</td><td>Rabat Agdal</td><td>68 <span style="color:#0e6944;">▲</span></td><td>32</td><td>1.8 Jours</td></tr>
                                        <tr><td>AG-202</td><td>Rabat Hassan</td><td>65 <span style="color:#0e6944;">▲</span></td><td>28</td><td>2.1 Jours</td></tr>
                                    ` : APP.userRole === 'CA' ? `
                                        <tr><td>AG-201</td><td>Rabat Agdal</td><td>68 <span style="color:#0e6944;">▲</span></td><td>32</td><td>1.8 Jours</td></tr>
                                    ` : `
                                        <tr><td>AG-104</td><td>Casablanca Centre</td><td>72 <span style="color:#0e6944;">▲</span></td><td>45</td><td>1.2 Jours</td></tr>
                                        <tr><td>AG-201</td><td>Rabat Agdal</td><td>68 <span style="color:#0e6944;">▲</span></td><td>32</td><td>1.8 Jours</td></tr>
                                        <tr><td>AG-305</td><td>Marrakech Guéliz</td><td>61 <span style="color:#d33b21;">▼</span></td><td>58</td><td>3.1 Jours</td></tr>
                                    `}

                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            `;
        }

        function renderCommissions(container) {
            container.innerHTML = `
                <div class="fade-in">
                    <div style="display:flex; align-items:center; gap:12px; margin-bottom:24px;">
                        <span style="background:var(--light-bg); color:var(--primary-teal); padding:4px 12px; border-radius:20px; font-size:11px; font-weight:700; letter-spacing:1px; text-transform:uppercase;">Rentabilité</span>
                        <h2 style="font-family:'Montserrat', sans-serif; font-size:24px; color:var(--dark-teal); font-weight:800; margin:0;">Suivi des Commissions</h2>
                    </div>
                    <div style="background:white; border-radius:12px; border:1px solid var(--sec-bg); padding:24px; box-shadow:0 2px 8px rgba(0,0,0,0.02); text-align:center;">
                        <svg width="64" height="64" fill="none" stroke="var(--slate-300)" stroke-width="1.5" viewBox="0 0 24 24" style="margin-bottom:16px;">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <h3 style="font-family:'Montserrat', sans-serif; font-size:18px; color:var(--dark-teal); margin-bottom:8px;">Tableau de bord des commissions</h3>
                        <p style="color:var(--slate-500); font-size:14px; max-width:400px; margin:0 auto;">Le reporting détaillé des commissions par ligne de métier sera disponible dans la prochaine release.</p>
                    </div>
                </div>
            `;
        }

        function renderPowerbi(container) {
            container.innerHTML = `
                <div class="fade-in">
                    <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:16px;">
                        <div>
                            <div style="display:flex; align-items:center; gap:8px; color:var(--primary-teal); font-weight:700; font-size:12px; letter-spacing:1px; text-transform:uppercase; margin-bottom:8px;">
                                <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
                                RENTABILITÉ
                            </div>
                            <h2 style="font-family:'Montserrat', sans-serif; font-size:32px; color:var(--dark-teal); font-weight:700; margin-bottom:8px;">PNB Commercial • Agences CAM 2025</h2>
                            <p style="color:var(--slate-500); max-width:800px; line-height:1.5;">Vision consolidée du Produit Net Bancaire commercial, marges et commissions par réseau, direction régionale, groupe et portefeuille.</p>
                        </div>
                    </div>
                    
                    <div style="display:flex; gap:16px; margin-bottom:32px;">
                        <button style="display:flex; gap:8px; align-items:center; background:white; border:1px solid #e2e8f0; border-radius:8px; padding:10px 20px; font-weight:600; color:var(--dark-teal); box-shadow:0 1px 2px rgba(0,0,0,0.05); cursor:pointer;">
                            <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                            Recharger
                        </button>
                        <button style="display:flex; gap:8px; align-items:center; background:#0e6944; border:1px solid #0e6944; border-radius:8px; padding:10px 20px; font-weight:600; color:white; box-shadow:0 1px 2px rgba(14,105,68,0.2); cursor:pointer;">
                            <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                            Exporter
                        </button>
                    </div>

                    <div style="background:var(--surface); border-radius:24px; border:1px solid var(--sec-bg); overflow:hidden; box-shadow:0 10px 25px -5px rgba(0,0,0,0.05);">
                        <div style="background:#0e6944; padding:16px 24px; color:white; display:flex; align-items:center; justify-content:space-between;">
                            <div style="display:flex; align-items:center; gap:12px;">
                                <div style="background:#F2C811; color:black; width:28px; height:28px; border-radius:6px; display:flex; align-items:center; justify-content:center; font-weight:bold; font-size:16px; font-family:'Manrope', sans-serif;">P</div>
                                <span style="font-weight:700; font-size:16px;">Power BI • Rapport embarqué</span>
                                <span style="display:flex; align-items:center; gap:6px; font-size:12px; color:rgba(255,255,255,0.7); margin-left:16px; font-family:'JetBrains Mono', monospace;">
                                    <span style="width:6px; height:6px; background:#4CAF50; border-radius:50%; display:inline-block;"></span>
                                    Tenant CAM • d45dd877...23ce
                                </span>
                            </div>
                            <div style="display:flex; gap:16px;">
                                <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" style="cursor:pointer; opacity:0.8;"><path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                                <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" style="cursor:pointer; opacity:0.8;"><path stroke-linecap="round" stroke-linejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"></path></svg>
                            </div>
                        </div>
                        
                        <div style="padding:20px 24px; background:#f4fbf7; border-bottom:1px solid #d1e8db; display:grid; grid-template-columns:repeat(5, 1fr); gap:20px; align-items:end;">
                            <div>
                                <label style="font-size:11px; font-weight:800; color:#0e6944; margin-bottom:8px; display:block; text-transform:uppercase; letter-spacing:0.5px;">Année</label>
                                <select style="width:100%; padding:12px; border-radius:8px; border:1px solid #d1e8db; background:white; color:var(--dark-teal); font-weight:500; font-family:'Manrope', sans-serif; cursor:pointer; outline:none;"><option>Tout</option><option>2026</option><option>2025</option></select>
                            </div>
                            <div>
                                <label style="font-size:11px; font-weight:800; color:#0e6944; margin-bottom:8px; display:block; text-transform:uppercase; letter-spacing:0.5px;">Mois</label>
                                <select style="width:100%; padding:12px; border-radius:8px; border:1px solid #d1e8db; background:white; color:var(--dark-teal); font-weight:500; font-family:'Manrope', sans-serif; cursor:pointer; outline:none;"><option>Tout</option></select>
                            </div>
                            <div>
                                <label style="font-size:11px; font-weight:800; color:#0e6944; margin-bottom:8px; display:block; text-transform:uppercase; letter-spacing:0.5px;">Réseau</label>
                                <select style="width:100%; padding:12px; border-radius:8px; border:1px solid #d1e8db; background:white; color:var(--dark-teal); font-weight:500; font-family:'Manrope', sans-serif; cursor:pointer; outline:none;"><option>Tout</option></select>
                            </div>
                            <div>
                                <label style="font-size:11px; font-weight:800; color:#0e6944; margin-bottom:8px; display:block; text-transform:uppercase; letter-spacing:0.5px;">DR</label>
                                <select style="width:100%; padding:12px; border-radius:8px; border:1px solid #d1e8db; background:white; color:var(--dark-teal); font-weight:500; font-family:'Manrope', sans-serif; cursor:pointer; outline:none;"><option>Tout</option></select>
                            </div>
                            <div>
                                <label style="font-size:11px; font-weight:800; color:#0e6944; margin-bottom:8px; display:block; text-transform:uppercase; letter-spacing:0.5px;">Agence</label>
                                <select style="width:100%; padding:12px; border-radius:8px; border:1px solid #d1e8db; background:white; color:var(--dark-teal); font-weight:500; font-family:'Manrope', sans-serif; cursor:pointer; outline:none;"><option>Tout</option></select>
                            </div>
                            <div style="grid-column: span 2;">
                                <label style="font-size:11px; font-weight:800; color:#0e6944; margin-bottom:8px; display:block; text-transform:uppercase; letter-spacing:0.5px;">Marché</label>
                                <select style="width:100%; padding:12px; border-radius:8px; border:1px solid #d1e8db; background:white; color:var(--dark-teal); font-weight:500; font-family:'Manrope', sans-serif; cursor:pointer; outline:none;"><option>Tout</option></select>
                            </div>
                            <div style="grid-column: span 2;">
                                <label style="font-size:11px; font-weight:800; color:#0e6944; margin-bottom:8px; display:block; text-transform:uppercase; letter-spacing:0.5px;">Portefeuille</label>
                                <select style="width:100%; padding:12px; border-radius:8px; border:1px solid #d1e8db; background:white; color:var(--dark-teal); font-weight:500; font-family:'Manrope', sans-serif; cursor:pointer; outline:none;"><option>Tout</option></select>
                            </div>
                            <div>
                                <button style="width:100%; padding:12px; display:flex; justify-content:center; gap:8px; align-items:center; background:white; color:#0e6944; border:1px solid #d1e8db; border-radius:8px; font-weight:700; cursor:pointer;">
                                    <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                                    Réinitialiser
                                </button>
                            </div>
                        </div>
                        
                        <div style="height:550px; background:#f9fafb; display:flex; flex-direction:column; align-items:center; justify-content:center; position:relative; overflow:hidden;">
                            <div style="position:absolute; inset:0; opacity:0.03; background-image:radial-gradient(circle at 2px 2px, black 1px, transparent 0); background-size:32px 32px;"></div>
                            <div style="display:flex; align-items:center; gap:16px; margin-bottom:32px; z-index:1;">
                                <div style="display:flex; gap:6px; align-items:flex-end; height:48px;">
                                    <div style="width:12px; height:24px; background:#E6C229; border-radius:2px;"></div>
                                    <div style="width:12px; height:36px; background:#F1D302; border-radius:2px;"></div>
                                    <div style="width:12px; height:48px; background:#F2B705; border-radius:2px;"></div>
                                </div>
                                <span style="font-size:36px; font-weight:300; color:#334155; font-family:'Segoe UI', system-ui, sans-serif;">Power BI</span>
                            </div>
                            <p style="color:#64748b; font-size:18px; font-family:'Segoe UI', system-ui, sans-serif; font-weight:400; margin-bottom:32px; z-index:1;">Connectez-vous pour voir ce rapport</p>
                            <button style="background:#0e6944; color:white; border:none; border-radius:6px; padding:12px 32px; font-size:16px; font-weight:600; font-family:'Segoe UI', system-ui, sans-serif; cursor:pointer; box-shadow:0 4px 12px rgba(14,105,68,0.2); transition:all 0.2s; z-index:1;" onclick="this.innerHTML='Connexion en cours...'; this.style.opacity='0.8'; setTimeout(() => showToast('Authentification SSO réussie'), 1000);">Se connecter</button>
                        </div>
                        <div style="background:#e8f4ed; padding:16px; font-size:13px; color:#1e293b; text-align:center; border-top:1px solid #d1e8db;">
                            Rapport sécurisé — authentification SSO au tenant CAM, affiché directement dans cette page. Si l'écran reste bloqué sur la connexion, autorisez les cookies tiers de <strong>app.powerbi.com</strong> dans le navigateur.
                        </div>
                    </div>
                </div>`;
        }        function renderPortefeuille(container) {
            container.innerHTML = `
                <div class="fade-in">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px;">
                        <h2 style="font-size:20px; font-weight:700; color:var(--text-main);">Portefeuille Clients (${MOCK.clients.length})</h2>
                        <div style="display:flex; gap:12px;">
                            <input type="text" placeholder="Rechercher (Nom, ICE...)" style="padding:10px 16px; border:1px solid var(--sec-bg); border-radius:8px; background:var(--surface); font-size:13px; width:240px;">
                            <button class="btn btn-primary" onclick="showToast('Filtrage des clients')"><svg width="16" height="16" style="margin-right:8px;" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path></svg> Filtrer</button>
                        </div>
                    </div>
                    
                    <div class="card">
                        <div class="table-responsive">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Raison Sociale / Nom</th>
                                        <th>Type</th>
                                        <th>Agence</th>
                                        <th>Encours Global</th>
                                        <th>Score IA</th>
                                        <th>Statut</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${MOCK.clients.map(c => `
                                        <tr>
                                            <td style="font-weight:600; color:var(--text-main);">${c.nom}</td>
                                            <td><span style="font-size:12px; color:var(--slate-500);">${c.type}</span></td>
                                            <td>${c.agence}</td>
                                            <td style="font-family:'JetBrains Mono', monospace; text-align:right;">${formatMAD(c.encours)}</td>
                                            <td>
                                                <div style="display:flex; align-items:center; gap:8px;">
                                                    <div class="progress-bar" style="width:60px;"><div class="progress-fill" style="width:${c.score}%; background:${c.score < 50 ? 'var(--primary-orange)' : 'var(--primary-teal)'};"></div></div>
                                                    <span style="font-size:12px; font-weight:600; color:${c.score < 50 ? 'var(--primary-orange)' : 'var(--text-main)'}">${c.score}/100</span>
                                                </div>
                                            </td>
                                            <td>${getStatutBadge(c.statut)}</td>
                                            <td><button class="btn btn-secondary" style="padding:4px 12px; font-size:11px;" onclick="showToast('Ouverture vue 360° pour ${c.nom}')">Vue 360°</button></td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            `;
        }

        // Module Engagements
        function renderEngagements(container) {
            container.innerHTML = `
                <div class="fade-in">
                    <h2 style="font-size:20px; font-weight:700; color:var(--text-main); margin-bottom:24px;">Octrois & Engagements</h2>
                    
                    <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:24px; margin-bottom:24px;">
                        ${buildKPI('Demandes en attente', '24', '', false, '<path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>')}
                        ${buildKPI('Dossiers Approuvés (Mois)', '142', '+12%', false, '<path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>')}
                        ${buildKPI('Taux d\'Accord', '82%', '', false, '<path stroke-linecap="round" stroke-linejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>')}
                    </div>

                    <div class="card">
                        <div class="card-header">
                            <h3 class="chart-title" style="margin:0;">Comité de Crédit - Dossiers Récents</h3>
                        </div>
                        <div class="table-responsive">
                            <table>
                                <thead>
                                    <tr><th>Réf. Dossier</th><th>Client</th><th>Type Crédit</th><th>Montant Demandé</th><th>Score Modèle</th><th>Statut</th><th>Action</th></tr>
                                </thead>
                                <tbody>
                                    ${MOCK.dossiers.filter(d => (APP.userRole === 'DG' || APP.userRole === 'Admin') ? true : (APP.userRole === 'DR' ? d.client.length % 2 === 0 : d.client.length % 2 !== 0)).map(d => `
                                        <tr>
                                            <td style="font-family:'JetBrains Mono', monospace; font-size:12px;">${d.ref || d.id}</td>
                                            <td style="font-weight:600;">${d.client}</td>
                                            <td>${d.type}</td>
                                            <td style="font-family:'JetBrains Mono', monospace; text-align:right;">${formatMAD(d.montant)}</td>
                                            <td>${d.score}/100</td>
                                            <td>${getStatutBadge(d.statut)}</td>
                                            <td><button class="btn btn-secondary" style="padding:4px 12px; font-size:11px;">Étudier</button></td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            `;
        }
        
        // Module Risques
        function renderRisques(container) {
            container.innerHTML = `
                <div class="fade-in">
                    <h2 style="font-size:20px; font-weight:700; color:var(--text-main); margin-bottom:24px;">Analyse des Risques & NPL</h2>
                    
                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:24px;">
                        <div class="card">
                            <h3 class="chart-title">Répartition du Risque par Marché</h3>
                            <div style="display:flex; flex-direction:column; gap:16px; margin-top:24px;">
                                <div><div style="display:flex; justify-content:space-between; margin-bottom:4px; font-size:12px; font-weight:600;"><span>Immobilier</span><span style="color:var(--primary-orange)">5.2% NPL</span></div><div class="progress-bar"><div class="progress-fill" style="width:75%; background:var(--primary-orange)"></div></div></div>
                                <div><div style="display:flex; justify-content:space-between; margin-bottom:4px; font-size:12px; font-weight:600;"><span>PME</span><span style="color:var(--primary-orange)">4.8% NPL</span></div><div class="progress-bar"><div class="progress-fill" style="width:60%; background:var(--primary-orange)"></div></div></div>
                                <div><div style="display:flex; justify-content:space-between; margin-bottom:4px; font-size:12px; font-weight:600;"><span>Corporate</span><span style="color:var(--slate-500)">2.1% NPL</span></div><div class="progress-bar"><div class="progress-fill" style="width:30%; background:var(--slate-500)"></div></div></div>
                            </div>
                        </div>
                        <div class="card">
                            <h3 class="chart-title">Matrice de Transition (Dégradation Score)</h3>
                            <p style="font-size:13px; color:var(--slate-500); margin-bottom:16px;">Clients passés de la classe A/B vers C/D ce mois-ci.</p>
                            <table style="width:100%; text-align:left; font-size:12px; border-collapse:collapse;">
                                <tr style="border-bottom:1px solid var(--sec-bg);"><th style="padding:8px;">Classe Initiale</th><th style="padding:8px;">Nouvelle Classe</th><th style="padding:8px; text-align:right;">Nombre de Clients</th></tr>
                                <tr style="border-bottom:1px solid var(--sec-bg);"><td style="padding:8px; font-weight:600; color:var(--primary-teal);">A (Faible Risque)</td><td style="padding:8px; color:var(--primary-orange);">C (Risque Elevé)</td><td style="padding:8px; text-align:right; font-weight:bold;">12</td></tr>
                                <tr style="border-bottom:1px solid var(--sec-bg);"><td style="padding:8px; font-weight:600; color:var(--text-main);">B (Risque Modéré)</td><td style="padding:8px; color:var(--primary-orange);">D (Défaut Probable)</td><td style="padding:8px; text-align:right; font-weight:bold;">5</td></tr>
                                <tr><td style="padding:8px; font-weight:600; color:var(--text-main);">B (Risque Modéré)</td><td style="padding:8px; color:var(--primary-orange);">C (Risque Elevé)</td><td style="padding:8px; text-align:right; font-weight:bold;">28</td></tr>
                            </table>
                        </div>
                    </div>
                </div>
            `;
        }

        // Module Administration

        function renderAdmin(container) {
            container.innerHTML = `
                <div class="fade-in">
                    <h2 style="font-size:20px; font-weight:700; color:var(--text-main); margin-bottom:24px;">Administration & Power BI</h2>
                    <div class="tabs">
                        <div class="tab active" onclick="switchTab(this, 'admin-pbi')">Configuration Power BI</div>
                        <div class="tab" onclick="switchTab(this, 'admin-users')">Utilisateurs Plateforme</div>
                        <div class="tab" onclick="switchTab(this, 'admin-queries')">Journal IA</div>
                        <div class="tab" onclick="switchTab(this, 'admin-add-dash')">Ajouter un Dashboard</div>
                    </div>

                    <div id="admin-pbi">
                        <div class="card" style="padding:32px;">
                            <h3 class="chart-title">Intégration Power BI Embedded</h3>
                            <p style="color:var(--slate-500); margin-bottom:24px; line-height:1.6;">Configurez les identifiants Azure AD et le Workspace ID pour l'affichage natif des rapports Power BI dans l'application.</p>
                            
                            <div style="display:grid; grid-template-columns:1fr 1fr; gap:24px;">
                                <div>
                                    <label style="display:block; margin-bottom:8px; font-weight:600; color:var(--slate-700); font-size:13px;">Tenant ID</label>
                                    <input type="text" value="b41b72d0-4e9f-4c26-8a69-f949f367c91d" style="width:100%; padding:12px; border:1px solid var(--sec-bg); border-radius:8px; background:var(--light-bg)" readonly>
                                </div>
                                <div>
                                    <label style="display:block; margin-bottom:8px; font-weight:600; color:var(--slate-700); font-size:13px;">Client ID</label>
                                    <input type="text" value="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" style="width:100%; padding:12px; border:1px solid var(--sec-bg); border-radius:8px; background:var(--light-bg)" readonly>
                                </div>
                                <div style="grid-column:1/-1;">
                                    <label style="display:block; margin-bottom:8px; font-weight:600; color:var(--slate-700); font-size:13px;">Workspace ID (Production)</label>
                                    <input type="text" value="wks-saham-prod-001" style="width:100%; padding:12px; border:1px solid var(--sec-bg); border-radius:8px; background:var(--light-bg)" readonly>
                                </div>
                            </div>
                            <button class="btn btn-primary" style="margin-top:24px; background:var(--primary-teal); border:none;" onclick="showToast('Configuration enregistrée')">Sauvegarder Configuration</button>
                        </div>
                    </div>
                    
                    <div id="admin-users" class="hidden">
                        <div class="card">
                            <div class="card-header">
                                <h3 class="chart-title" style="margin:0;">Gestion des Accès</h3>
                                <button class="btn btn-primary" onclick="showToast('Modal ajout utilisateur')">+ Nouvel Utilisateur</button>
                            </div>
                            <div class="table-responsive">
                                <table>
                                    <thead><tr><th>Utilisateur</th><th>Email</th><th>Profil</th><th>Agence / DR</th><th>Statut</th><th>Actions</th></tr></thead>
                                    <tbody>
                                        ${MOCK.admins.map(a => `
                                            <tr>
                                                <td style="font-weight:600">${a.nom}</td>
                                                <td>${a.email}</td>
                                                <td><span style="background:var(--accent-teal-light); color:var(--primary-teal); padding:4px 8px; border-radius:4px; font-size:11px;">${a.profil}</span></td>
                                                <td>${a.agence}</td>
                                                <td>${getStatutBadge(a.statut)}</td>
                                                <td>
                                                    <button class="icon-btn" onclick="showToast('Modifier')"><svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg></button>
                                                </td>
                                            </tr>`).join('')}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                    
                    <div id="admin-add-dash" class="hidden">
                        <div class="card" style="padding:32px;">
                            <h3 class="chart-title">Créer un nouveau module (Power BI ou URL)</h3>
                            <p style="color:var(--slate-500); margin-bottom:24px; line-height:1.6;">Créez dynamiquement un nouveau lien dans le menu de gauche pour intégrer un rapport Power BI ou une page web externe.</p>
                            
                            <div style="display:flex; flex-direction:column; gap:20px;">
                                <div>
                                    <label style="display:block; margin-bottom:8px; font-weight:600; color:var(--slate-700); font-size:13px;">Nom du Module</label>
                                    <input type="text" id="new-dash-name" placeholder="Ex: Suivi des Réclamations" style="width:100%; padding:12px; border:1px solid var(--sec-bg); border-radius:8px;">
                                </div>
                                <div>
                                    <label style="display:block; margin-bottom:8px; font-weight:600; color:var(--slate-700); font-size:13px;">URL du rapport (Power BI Embed Link ou autre web URL)</label>
                                    <input type="text" id="new-dash-url" placeholder="https://app.powerbi.com/reportEmbed?reportId=..." style="width:100%; padding:12px; border:1px solid var(--sec-bg); border-radius:8px;">
                                </div>
                                <div>
                                    <label style="display:block; margin-bottom:8px; font-weight:600; color:var(--slate-700); font-size:13px;">Accès (Rôles autorisés)</label>
                                    <div style="display:flex; gap:16px; flex-wrap:wrap;">
                                        <label style="display:flex; align-items:center; gap:8px;"><input type="checkbox" class="new-dash-role" value="DG" checked> Direction Générale</label>
                                        <label style="display:flex; align-items:center; gap:8px;"><input type="checkbox" class="new-dash-role" value="DR" checked> Dir. Réseau</label>
                                        <label style="display:flex; align-items:center; gap:8px;"><input type="checkbox" class="new-dash-role" value="CA"> Chargé d'Affaires</label>
                                        <label style="display:flex; align-items:center; gap:8px;"><input type="checkbox" class="new-dash-role" value="AR"> Dir. Risques</label>
                                        <label style="display:flex; align-items:center; gap:8px;"><input type="checkbox" class="new-dash-role" value="Admin" checked> Admin</label>
                                    </div>
                                </div>
                                <div>
                                    <button class="btn btn-primary" onclick="createCustomDashboard()">Créer le module</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div id="admin-queries" class="hidden">
                        <!-- Top Metrics -->
                        <div class="metrics-grid" style="margin-bottom:24px; display:grid; grid-template-columns:repeat(4,1fr); gap:16px;">
                            <div class="card" style="padding:16px;">
                                <div style="color:var(--slate-500); font-size:12px; font-weight:600; text-transform:uppercase;">Total requêtes (Auj.)</div>
                                <div style="font-size:24px; font-weight:700; color:var(--dark-teal); margin-top:8px;">42</div>
                            </div>
                            <div class="card" style="padding:16px;">
                                <div style="color:var(--slate-500); font-size:12px; font-weight:600; text-transform:uppercase;">Temps moyen (Exéc.)</div>
                                <div style="font-size:24px; font-weight:700; color:var(--dark-teal); margin-top:8px;">124 ms</div>
                            </div>
                            <div class="card" style="padding:16px;">
                                <div style="color:var(--slate-500); font-size:12px; font-weight:600; text-transform:uppercase;">Question la plus posée</div>
                                <div style="font-size:16px; font-weight:700; color:var(--primary-teal); margin-top:8px; line-height:1.2;">"Clients à risque"</div>
                            </div>
                            <div class="card" style="padding:16px;">
                                <div style="color:var(--slate-500); font-size:12px; font-weight:600; text-transform:uppercase;">Taux de succès</div>
                                <div style="font-size:24px; font-weight:700; color:#4ade80; margin-top:8px;">98.5%</div>
                            </div>
                        </div>

                        <div class="card">
                            <div class="card-header" style="flex-wrap:wrap; gap:16px;">
                                <h3 class="chart-title" style="margin:0; flex-shrink:0;">Journal des Requêtes IA</h3>
                                
                                <!-- Filters -->
                                <div style="display:flex; gap:12px; flex:1; justify-content:flex-end; align-items:center;">
                                    <select style="padding:6px 12px; border-radius:6px; border:1px solid var(--sec-bg); font-size:12px; outline:none; background:var(--surface);">
                                        <option>Tous les profils</option>
                                        <option>Directeur Régional</option>
                                        <option>Chef d'Agence</option>
                                        <option>Analyste Risque</option>
                                    </select>
                                    <input type="date" style="padding:6px 12px; border-radius:6px; border:1px solid var(--sec-bg); font-size:12px; outline:none; background:var(--surface);" value="2026-07-07">
                                    <select style="padding:6px 12px; border-radius:6px; border:1px solid var(--sec-bg); font-size:12px; outline:none; background:var(--surface);">
                                        <option>Toutes les tables</option>
                                        <option>clients</option>
                                        <option>dossiers</option>
                                        <option>agences_perf</option>
                                        <option>transactions</option>
                                    </select>
                                    <button class="btn btn-primary" onclick="exportQueriesCSV()" style="padding:6px 16px; font-size:12px; display:flex; align-items:center; gap:6px;">
                                        <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg> 
                                        Exporter CSV
                                    </button>
                                </div>
                            </div>
                            <div class="table-responsive">
                                <table id="queries-table">
                                    <thead><tr>
                                        <th>Horodatage</th>
                                        <th>Profil utilisateur</th>
                                        <th>Question posée</th>
                                        <th>Requête SQL</th>
                                        <th>Tables interrogées</th>
                                        <th>Résultats</th>
                                        <th>Temps (ms)</th>
                                        <th>Statut</th>
                                    </tr></thead>
                                    <tbody id="queries-tbody">
                                        ${MOCK.queries.length === 0 ? '<tr><td colspan="8" style="text-align:center; color:var(--slate-500); padding:24px;">Aucune requête pour le moment.</td></tr>' : ''}
                                        ${MOCK.queries.map(q => `
                                            <tr>
                                                <td style="font-size:11px; color:var(--slate-500); white-space:nowrap;">${q.date}</td>
                                                <td><span style="background:var(--accent-teal-light); color:var(--primary-teal); padding:4px 8px; border-radius:4px; font-size:11px; font-weight:600; white-space:nowrap;">${q.user || 'Inconnu'}</span></td>
                                                <td style="max-width:180px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${q.question.replace(/"/g, '&quot;')}">${q.question.length > 60 ? q.question.substring(0, 60) + '...' : q.question}</td>
                                                <td>
                                                    <button onclick="openSqlModal('${q.sql.replace(/'/g, "\\'")}')" style="background:var(--sec-bg); border:1px solid #e9eceb; padding:4px 12px; border-radius:16px; font-size:11px; cursor:pointer; color:var(--slate-700); font-weight:500; display:flex; align-items:center; gap:4px; transition:all 0.2s;" onmouseover="this.style.background='var(--light-bg)'" onmouseout="this.style.background='var(--sec-bg)'">
                                                        <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                                                        Voir
                                                    </button>
                                                </td>
                                                <td>
                                                    <div style="display:flex; flex-wrap:wrap; gap:4px;">
                                                        ${(q.tables || ['clients']).map(t => `<span style="background:#f4f6f5; color:#6b7d78; padding:2px 6px; border-radius:4px; font-size:10px; border:1px solid #e9eceb;">${t}</span>`).join('')}
                                                    </div>
                                                </td>
                                                <td style="font-weight:600; text-align:right;">${q.results}</td>
                                                <td style="font-family:'JetBrains Mono', monospace; font-size:11px; text-align:right;">${q.time} ms</td>
                                                <td>
                                                    <span style="background:${q.status==='Erreur' ? '#fff5f5' : '#ecfdf5'}; color:${q.status==='Erreur' ? '#C8102E' : '#059669'}; padding:4px 8px; border-radius:12px; font-size:10px; font-weight:700; display:inline-flex; align-items:center; gap:4px;">
                                                        <span style="width:6px; height:6px; border-radius:50%; background:${q.status==='Erreur' ? '#C8102E' : '#10b981'};"></span>
                                                        ${q.status || 'Succès'}
                                                    </span>
                                                </td>
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }

        // Module Chatbot
        function renderChatbot(container) {
            container.innerHTML = `
                <div class="fade-in" style="display:flex; flex-direction:column; height:calc(100vh - 120px); gap:16px;">
                    <div>
                        <h2 style="font-size:24px; font-weight:700; color:var(--text-main); margin-bottom:4px;">Assistant IA (Chatbot)</h2>
                        <p style="color:var(--slate-500); font-size:14px;">Posez vos questions en langage naturel, le chatbot génèrera les requêtes SQL et vous fournira les données.</p>
                    </div>

                    <div style="flex:1; display:flex; gap:24px; min-height:0;">
                        <!-- Sidebar: Presets -->
                        <div class="chat-sidebar" style="padding:16px;">
                            <h3 style="font-size:12px; text-transform:uppercase; color:var(--slate-500); margin-bottom:12px; letter-spacing:0.5px;">Questions Fréquentes</h3>
                            <div style="display:flex; flex-direction:column; gap:8px;">
                                <button class="preset-btn" onclick="document.getElementById('main-chat-input').value=this.innerText; document.getElementById('main-chat-input').focus();">
                                    Quels sont les clients avec un score de risque > 80 en agence "Casablanca Anfa" ?
                                </button>
                                <button class="preset-btn" onclick="document.getElementById('main-chat-input').value=this.innerText; document.getElementById('main-chat-input').focus();">
                                    Affiche les 5 plus gros encours du segment PME.
                                </button>
                                <button class="preset-btn" onclick="document.getElementById('main-chat-input').value=this.innerText; document.getElementById('main-chat-input').focus();">
                                    Total des engagements par agence pour les crédits de Trésorerie ?
                                </button>
                                <button class="preset-btn" onclick="document.getElementById('main-chat-input').value=this.innerText; document.getElementById('main-chat-input').focus();">
                                    Quel est l'encours global moyen par segment ?
                                </button>
                            </div>
                        </div>

                        <!-- Main Chat Interface -->
                        <div class="chat-main">
                            <div id="main-chat-messages" style="flex:1; padding:24px; overflow-y:auto; display:flex; flex-direction:column; gap:16px;">
                                <div class="msg msg-bot" style="display:flex; gap:12px; max-width:80%;">
                                    <div style="width:36px; height:36px; border-radius:10px; background:var(--primary-teal); color:white; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
                                        <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/></svg>
                                    </div>
                                    <div class="bubble">Bonjour, je suis l'IA de Saham. Comment puis-je vous aider à interroger votre base de données aujourd'hui ?</div>
                                </div>
                            </div>
                            <div class="chat-input-area">
                                <input type="text" id="main-chat-input" placeholder="Ex: Montre les clients à risque..." style="flex:1; border:none; outline:none; font-size:14px; background:transparent;" onkeypress="if(event.key==='Enter') sendMainChat()">
                                <button class="btn btn-primary" onclick="sendMainChat()" style="padding:8px 24px;">Envoyer</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            // Re-bind the window sendMainChat function so it has context of these DOM elements
            window.sendMainChat = function() {
                const input = document.getElementById('main-chat-input');
                const text = input.value.trim();
                if(!text) return;
                
                const msgs = document.getElementById('main-chat-messages');
                
                // Add User Message
                msgs.innerHTML += `
                    <div class="msg msg-user" style="display:flex; gap:12px; max-width:80%; align-self:flex-end; flex-direction:row-reverse;">
                        <div style="width:36px; height:36px; border-radius:10px; background:var(--primary-orange); color:white; display:flex; align-items:center; justify-content:center; flex-shrink:0;">U</div>
                        <div class="bubble" style="background:var(--primary-orange); color:white; border-radius:16px 16px 0 16px; padding:16px 20px;">${text}</div>
                    </div>
                `;
                input.value = '';
                msgs.scrollTop = msgs.scrollHeight;
                
                // Simulate Bot processing
                setTimeout(() => {
                    let mockSQL = "SELECT * FROM clients;";
                    const startTime = performance.now();
                    let res = MOCK.clients.slice(0, 5);
                    let tableHtml = '';

                    const textLower = text.toLowerCase();
                    if (textLower.includes('casablanca') && textLower.includes('risque')) {
                        mockSQL = "SELECT * FROM clients WHERE agence = 'Casablanca Anfa' AND score_risque > 80;";
                        res = MOCK.clients.filter(c => c.agence === 'Casablanca Anfa' && c.score < 50).slice(0, 5);
                        tableHtml = `<table style="width:100%; border-collapse:collapse; font-size:12px; margin-top:8px; background:var(--surface); border-radius:4px; overflow:hidden; border:1px solid var(--sec-bg);">
                        <tr style="background:var(--sec-bg); color:var(--slate-700);"><th style="padding:6px; text-align:left;">Client</th><th style="padding:6px; text-align:left;">Score</th><th style="padding:6px; text-align:right;">Encours</th></tr>
                        ${res.map(c=>`<tr><td style="padding:6px; border-bottom:1px solid var(--sec-bg);">${c.nom}</td><td style="padding:6px; border-bottom:1px solid var(--sec-bg);">${c.score}</td><td style="padding:6px; border-bottom:1px solid var(--sec-bg); text-align:right; font-family:'JetBrains Mono', monospace;">${formatMAD(c.encours)}</td></tr>`).join('')}
                    </table>`;
                    } else if (textLower.includes('gros encours') && textLower.includes('pme')) {
                        mockSQL = "SELECT * FROM clients WHERE segment = 'PME' ORDER BY encours DESC LIMIT 5;";
                        res = [...MOCK.clients].filter(c => c.segment === 'PME').sort((a,b) => b.encours - a.encours).slice(0, 5);
                        tableHtml = `<table style="width:100%; border-collapse:collapse; font-size:12px; margin-top:8px; background:var(--surface); border-radius:4px; overflow:hidden; border:1px solid var(--sec-bg);">
                        <tr style="background:var(--sec-bg); color:var(--slate-700);"><th style="padding:6px; text-align:left;">Client</th><th style="padding:6px; text-align:left;">Segment</th><th style="padding:6px; text-align:right;">Encours</th></tr>
                        ${res.map(c=>`<tr><td style="padding:6px; border-bottom:1px solid var(--sec-bg);">${c.nom}</td><td style="padding:6px; border-bottom:1px solid var(--sec-bg);">${c.segment}</td><td style="padding:6px; border-bottom:1px solid var(--sec-bg); text-align:right; font-family:'JetBrains Mono', monospace;">${formatMAD(c.encours)}</td></tr>`).join('')}
                    </table>`;
                    } else if (textLower.includes('total des engagements') || textLower.includes('trésorerie')) {
                        mockSQL = "SELECT agence, SUM(montant) FROM engagements WHERE type = 'Trésorerie' GROUP BY agence;";
                        const agences = [...new Set(MOCK.clients.map(c => c.agence))];
                        res = agences.map(ag => {
                            const total = MOCK.clients.filter(c => c.agence === ag).reduce((sum, c) => sum + (c.encours * 0.4), 0);
                            return { agence: ag, total };
                        }).sort((a,b) => b.total - a.total).slice(0, 5);
                        tableHtml = `<table style="width:100%; border-collapse:collapse; font-size:12px; margin-top:8px; background:var(--surface); border-radius:4px; overflow:hidden; border:1px solid var(--sec-bg);">
                        <tr style="background:var(--sec-bg); color:var(--slate-700);"><th style="padding:6px; text-align:left;">Agence</th><th style="padding:6px; text-align:right;">Total Engagements (Trésorerie)</th></tr>
                        ${res.map(a=>`<tr><td style="padding:6px; border-bottom:1px solid var(--sec-bg);">${a.agence}</td><td style="padding:6px; border-bottom:1px solid var(--sec-bg); text-align:right; font-family:'JetBrains Mono', monospace;">${formatMAD(a.total)}</td></tr>`).join('')}
                    </table>`;
                    } else if (textLower.includes('encours global moyen') || textLower.includes('moyen par segment')) {
                        mockSQL = "SELECT segment, AVG(encours) as avg_encours FROM clients GROUP BY segment;";
                        const segments = [...new Set(MOCK.clients.map(c => c.segment))];
                        res = segments.map(seg => {
                            const clients = MOCK.clients.filter(c => c.segment === seg);
                            const avg = clients.reduce((sum, c) => sum + c.encours, 0) / clients.length;
                            return { segment: seg, avg };
                        }).sort((a,b) => b.avg - a.avg);
                        tableHtml = `<table style="width:100%; border-collapse:collapse; font-size:12px; margin-top:8px; background:var(--surface); border-radius:4px; overflow:hidden; border:1px solid var(--sec-bg);">
                        <tr style="background:var(--sec-bg); color:var(--slate-700);"><th style="padding:6px; text-align:left;">Segment</th><th style="padding:6px; text-align:right;">Encours Moyen</th></tr>
                        ${res.map(s=>`<tr><td style="padding:6px; border-bottom:1px solid var(--sec-bg);">${s.segment}</td><td style="padding:6px; border-bottom:1px solid var(--sec-bg); text-align:right; font-family:'JetBrains Mono', monospace;">${formatMAD(s.avg)}</td></tr>`).join('')}
                    </table>`;
                    } else {
                        tableHtml = `<p style="margin-bottom:8px">Je n'ai pas pu analyser cette requête avec précision. Veuillez essayer une des suggestions ou reformuler.</p>`;
                    }

                    const timeMs = Math.round(performance.now() - startTime + 45); // fake delay
                    MOCK.queries.unshift({ date: new Date().toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'}) + ' ' + new Date().toLocaleDateString('fr-FR'), user: APP.userRole, question: text, sql: mockSQL, results: res.length, time: timeMs });


                    msgs.innerHTML += `
                        <div class="msg msg-bot" style="display:flex; gap:12px; max-width:95%;">
                            <div style="width:36px; height:36px; border-radius:10px; background:var(--primary-teal); color:white; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
                                <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/></svg>
                            </div>
                            <div class="bubble">
                                <p style="margin-bottom:8px">Voici les résultats trouvés (${res.length} clients).</p>
                                ${tableHtml}
                                <div style="margin-top:12px; background:var(--light-bg); border-radius:6px; border:1px solid var(--sec-bg); overflow:hidden;">
                                    <button class="toggle-btn" style="width:100%; padding:8px 12px; background:#f4f6f5; text-align:left; font-size:12px; font-weight:600; cursor:pointer; border:none; color:var(--text-main); display:flex; align-items:center; gap:6px;" onclick="toggleSql(this)">
                                        <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                                        Voir la requête SQL
                                    </button>
                                    <div class="sql-container">
                                        <div class="sql-code">${syntaxHighlightSQL(mockSQL)}</div>
                                        <div class="sql-meta">Exécutée en ${timeMs}ms</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                    msgs.scrollTop = msgs.scrollHeight;
                }, 800);
            }
        }


        function exportDashCSV() {
            let csv = "Indicateur;Valeur\nProduit Net Bancaire;1.42 Md MAD\nEncours Crédits;45.8 Md MAD\nEncours Dépôts;52.4 Md MAD\nCoût du Risque;0.85%\n";
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', 'dashboard_export.csv');
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            showToast('Export Dashboard CSV terminé', 'success');
        }

        function exportQueriesCSV() {
            let csvContent = "ID;Date;Utilisateur;Question Posée;Statut;Temps (ms);Résultats;Tables Interrogées\n";
            MOCK.queries.forEach(q => {
                const row = [
                    q.id || 'N/A',
                    q.date,
                    q.user,
                    '"' + q.question.replace(/"/g, '""') + '"',
                    q.status,
                    q.time,
                    q.results,
                    (q.tables || []).join(',')
                ].join(';');
                csvContent += row + "\n";
            });
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', 'queries_log.csv');
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            showToast('Fichier queries_log.csv téléchargé', 'success');
        }

    
        function syntaxHighlightSQL(sql) {
            return sql
                .replace(/\b(SELECT|FROM|WHERE|GROUP BY|ORDER BY|LIMIT|SUM|ASC|DESC)\b/g, '<span class="sql-keyword-blue">$1</span>')
                .replace(/\b(clients|dossiers)\b/g, '<span class="sql-keyword-purple">$1</span>')
                .replace(/\b(AND|OR)\b/g, '<span class="sql-keyword-orange">$1</span>')
                .replace(/([0-9]+|'[^']*')/g, '<span class="sql-value-green">$1</span>');
        }

        async function sendChatFab() {
            const input = document.getElementById('chat-input-fab');
            const text = input.value.trim();
            if(!text) return;
            
            const container = document.getElementById('chat-messages');
            
            container.innerHTML += `<div class="chat-msg user">${text}</div>`;
            input.value = '';
            container.scrollTop = container.scrollHeight;
            
            const analyzeId = 'msg-' + Date.now();
            container.innerHTML += `<div id="${analyzeId}" class="chat-msg bot">Analyse de votre question<span class="typing-dots"><span></span><span></span><span></span></span></div>`;
            container.scrollTop = container.scrollHeight;
            
            await new Promise(r => setTimeout(r, 1200));
            document.getElementById(analyzeId).style.display = 'none';
            
            let sql = "SELECT * FROM clients LIMIT 5;";
            let nlpResponse = "Voici quelques données :";
            let tableHtml = "Résultats standards...";
            let resultsCount = 5;
            
            if(text.toLowerCase().includes('score') || text.toLowerCase().includes('risque')) {
                sql = "SELECT id, nom, score, encours FROM clients WHERE score < 40 ORDER BY score ASC;";
                const res = MOCK.clients.filter(c=>c.score<40).slice(0,4);
                resultsCount = res.length;
                nlpResponse = "J'ai identifié " + resultsCount + " clients présentant un score de risque inférieur à 40. Voici les détails :";
                tableHtml = `<table style="width:100%; border-collapse:collapse; font-size:12px; margin-top:8px; background:var(--surface); border-radius:4px; overflow:hidden; border:1px solid var(--sec-bg);">
                    <tr style="background:var(--sec-bg); color:var(--slate-700);"><th style="padding:6px; text-align:left;">Client</th><th style="padding:6px; text-align:left;">Score</th><th style="padding:6px; text-align:right;">Encours</th></tr>
                    ${res.map(c=>`<tr><td style="padding:6px; border-bottom:1px solid var(--sec-bg);">${c.nom}</td><td style="padding:6px; border-bottom:1px solid var(--sec-bg);">${c.score}</td><td style="padding:6px; border-bottom:1px solid var(--sec-bg); text-align:right; font-family:'JetBrains Mono', monospace;">${formatMAD(c.encours)}</td></tr>`).join('')}
                </table>`;
            } else if(text.toLowerCase().includes('encours') || text.toLowerCase().includes('top')) {
                sql = "SELECT agence, SUM(encours) as total_encours FROM clients GROUP BY agence ORDER BY total_encours DESC LIMIT 3;";
                resultsCount = 3;
                nlpResponse = "Voici le top 3 des agences par total d'encours.";
                tableHtml = `<table style="width:100%; border-collapse:collapse; font-size:12px; margin-top:8px; background:var(--surface); border-radius:4px; overflow:hidden; border:1px solid var(--sec-bg);">
                    <tr style="background:var(--sec-bg); color:var(--slate-700);"><th style="padding:6px; text-align:left;">Agence</th><th style="padding:6px; text-align:right;">Total Encours</th></tr>
                    <tr><td style="padding:6px; border-bottom:1px solid var(--sec-bg);">Casablanca Anfa</td><td style="padding:6px; border-bottom:1px solid var(--sec-bg); text-align:right; font-family:'JetBrains Mono', monospace;">125,400,000 MAD</td></tr>
                    <tr><td style="padding:6px; border-bottom:1px solid var(--sec-bg);">Rabat Agdal</td><td style="padding:6px; border-bottom:1px solid var(--sec-bg); text-align:right; font-family:'JetBrains Mono', monospace;">98,200,000 MAD</td></tr>
                    <tr><td style="padding:6px; border-bottom:1px solid var(--sec-bg);">Marrakech Gueliz</td><td style="padding:6px; border-bottom:1px solid var(--sec-bg); text-align:right; font-family:'JetBrains Mono', monospace;">87,500,000 MAD</td></tr>
                </table>`;
            }

            const highlightedSql = syntaxHighlightSQL(sql);
            const execTime = Math.floor(Math.random() * 150) + 50;

            MOCK.queries.unshift({
                question: text,
                sql: sql,
                results: resultsCount,
                time: execTime,
                date: new Date().toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'}) + ' ' + new Date().toLocaleDateString('fr-FR').toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'}) + ' ' + new Date().toLocaleDateString('fr-FR'),
                user: APP.userRole || 'Inconnu'
            });

            container.innerHTML += `
                <div class="chat-msg bot" style="width: 100%;">
                    <div style="font-weight:600; margin-bottom:4px; color:var(--dark-teal); font-size:12px;">Requête générée :</div>
                    <div class="chat-sql-block">${highlightedSql}</div>
                    <div style="margin-top:12px;">${nlpResponse}</div>
                    ${tableHtml}
                    <div style="text-align:right; font-size:10px; color:var(--slate-500); margin-top:8px;">Exécuté en ${execTime}ms</div>
                </div>`;
                
            container.scrollTop = container.scrollHeight;
        }

    
        // --- NEW SAHAM AI CHATBOT LOGIC ---
        let isChatFullscreen = false;
        function toggleSahamChatFullscreen() {
            isChatFullscreen = !isChatFullscreen;
            const panel = document.getElementById('saham-chat-panel');
            const fsBtn = document.getElementById('saham-chat-fs-btn');
            if (isChatFullscreen) {
                panel.classList.add('fullscreen');
                fsBtn.innerHTML = '<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 14h6m0 0v6m0-6l-7 7m17-11h-6m0 0V4m0 6l7-7M4 10h6m0 0V4m0 6l-7-7m17 11h-6m0 0v6m0-6l7 7"></path></svg>';
                fsBtn.title = "Réduire";
            } else {
                panel.classList.remove('fullscreen');
                fsBtn.innerHTML = '<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"></path></svg>';
                fsBtn.title = "Plein écran";
            }
        }
        
        function toggleSahamChat() {
            document.getElementById('saham-chat-panel').classList.toggle('active');
            if (document.getElementById('saham-chat-panel').classList.contains('active')) {
                document.getElementById('saham-chat-input').focus();
            }
        }

        function fillSahamChat(btn) {
            const input = document.getElementById('saham-chat-input');
            input.value = btn.innerText;
            input.focus();
        }

        async function handleSahamChatSubmit() {
            const input = document.getElementById('saham-chat-input');
            const btn = document.getElementById('saham-chat-btn');
            const text = input.value.trim();
            if(!text) return;

            // Hide chips
            const chips = document.getElementById('saham-chips');
            if (chips) chips.style.display = 'none';

            input.value = '';
            input.disabled = true;
            btn.disabled = true;

            const msgs = document.getElementById('saham-chat-messages');

            // Add user message
            msgs.innerHTML += `
                <div class="saham-msg user">
                    <div class="bubble">${text}</div>
                </div>
            `;
            msgs.scrollTop = msgs.scrollHeight;

            // Step 1: Compréhension
            const step1Id = 'msg-' + Date.now() + '-1';
            msgs.innerHTML += `
                <div id="${step1Id}" class="saham-msg bot">
                    <div class="bubble">
                        <div class="saham-msg-icon">
                            <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                            Analyse de votre question<span class="typing-dots"><span></span><span></span><span></span></span>
                        </div>
                    </div>
                </div>
            `;
            msgs.scrollTop = msgs.scrollHeight;
            await new Promise(r => setTimeout(r, 500));

            // Determine query info
            let sql = "SELECT * FROM clients LIMIT 5;";
            let nlpResponse = "Voici les données trouvées pour votre requête.";
            let execTime = Math.floor(Math.random() * 295) + 45; // 45-340ms
            let tableRows = "";
            let numRows = 5;
            let tablesUsed = ['clients'];
            let oob = false; // out of bounds

            const q = text.toLowerCase();
            if (q.includes('score de risque critique') || q.includes('< 30')) {
                sql = "SELECT id, nom, score, encours FROM clients WHERE score < 30 ORDER BY score ASC LIMIT 5;";
                nlpResponse = "J'ai trouvé plusieurs clients avec un score de risque critique (inférieur à 30). Voici les 5 plus critiques :";
                tableRows = `
                    <tr><td>El Fassi Nadia</td><td>12</td><td style="text-align:right">1,200,000</td></tr>
                    <tr><td>Bennani Omar</td><td>18</td><td style="text-align:right">450,000</td></tr>
                    <tr><td>Amrani Khadija</td><td>22</td><td style="text-align:right">3,500,000</td></tr>
                    <tr><td>Tazi Mehdi</td><td>25</td><td style="text-align:right">85,000</td></tr>
                    <tr><td>Zniber Laila</td><td>28</td><td style="text-align:right">920,000</td></tr>
                `;
                numRows = 14;
            } else if (q.includes('taux npl')) {
                sql = "SELECT agence, npl_ratio FROM agences_perf ORDER BY npl_ratio DESC LIMIT 3;";
                nlpResponse = "Voici les agences présentant le taux de créances douteuses (NPL) le plus élevé :";
                tableRows = `
                    <tr><td>Casablanca Anfa</td><td style="text-align:right">4.2%</td></tr>
                    <tr><td>Tanger Marina</td><td style="text-align:right">3.8%</td></tr>
                    <tr><td>Fès Ville Nouvelle</td><td style="text-align:right">3.5%</td></tr>
                `;
                tablesUsed = ['agences_perf', 'credits'];
                numRows = 8;
            } else if (q.includes('dossiers crédit en surveillance')) {
                sql = "SELECT id, type, montant, agence FROM dossiers WHERE statut = 'Surveillance' AND extract(month from date_maj) = extract(month from current_date);";
                nlpResponse = "Il y a actuellement 8 dossiers de crédit placés sous surveillance stricte ce mois-ci.";
                tableRows = `
                    <tr><td>D-8821</td><td>Crédit Invest.</td><td style="text-align:right">4,500,000</td></tr>
                    <tr><td>D-9012</td><td>Trésorerie</td><td style="text-align:right">850,000</td></tr>
                    <tr><td>D-8845</td><td>Leasing</td><td style="text-align:right">1,200,000</td></tr>
                    <tr><td>D-9100</td><td>Escompte</td><td style="text-align:right">340,000</td></tr>
                    <tr><td>D-8999</td><td>Trésorerie</td><td style="text-align:right">2,100,000</td></tr>
                `;
                tablesUsed = ['dossiers', 'clients'];
                numRows = 8;
            } else if (q.includes('expositions crédit par segment')) {
                sql = "SELECT segment, sum(encours) as total_encours FROM clients GROUP BY segment ORDER BY total_encours DESC LIMIT 5;";
                nlpResponse = "Voici la répartition des expositions de crédit pour les différents segments de la banque :";
                tableRows = `
                    <tr><td>Corporate</td><td style="text-align:right">4.2 MMDH</td></tr>
                    <tr><td>PME</td><td style="text-align:right">2.8 MMDH</td></tr>
                    <tr><td>Retail</td><td style="text-align:right">1.5 MMDH</td></tr>
                    <tr><td>Premium</td><td style="text-align:right">0.9 MMDH</td></tr>
                    <tr><td>Agricole</td><td style="text-align:right">0.6 MMDH</td></tr>
                `;
                numRows = 5;
            } else if (q.includes('pnb ce trimestre')) {
                sql = "SELECT mois, pnb_realise, pnb_objectif FROM performances WHERE trimestre = 'Q3' ORDER BY mois ASC;";
                nlpResponse = "L'évolution du Produit Net Bancaire ce trimestre montre une croissance soutenue par rapport aux objectifs :";
                tableRows = `
                    <tr><td>Juillet</td><td style="text-align:right">145 M</td><td style="text-align:right; color:#6b7d78">140 M</td></tr>
                    <tr><td>Août</td><td style="text-align:right">152 M</td><td style="text-align:right; color:#6b7d78">148 M</td></tr>
                    <tr><td>Septembre</td><td style="text-align:right">168 M</td><td style="text-align:right; color:#6b7d78">155 M</td></tr>
                `;
                tablesUsed = ['performances'];
                numRows = 3;
            } else if (q.includes('churn prévu par agence')) {
                sql = "SELECT agence, predicted_churn_rate FROM churn_predictions WHERE quarter = 'Q3-2026' ORDER BY predicted_churn_rate DESC LIMIT 3;";
                nlpResponse = "Selon notre modèle prédictif, voici les 3 agences avec le taux d'attrition estimé le plus élevé pour le trimestre en cours :";
                tableRows = `
                    <tr><td>Agadir Centre</td><td style="text-align:right; color:#C8102E">8.4%</td></tr>
                    <tr><td>Rabat Hassan</td><td style="text-align:right; color:#C8102E">7.2%</td></tr>
                    <tr><td>Casablanca Maarif</td><td style="text-align:right; color:#C8102E">6.5%</td></tr>
                `;
                tablesUsed = ['churn_predictions', 'clients'];
                numRows = 8;
            } else if (q.includes('transactions suspectes')) {
                sql = "SELECT id_trx, montant, motif_alerte FROM transactions WHERE alerte_aml = true AND date_trx >= NOW() - INTERVAL '48 hours';";
                nlpResponse = "Le système LCB-FT a remonté 4 transactions suspectes au cours des dernières 48 heures :";
                tableRows = `
                    <tr><td>TRX-9981</td><td style="text-align:right">850,000</td><td>Montant inusuel</td></tr>
                    <tr><td>TRX-1024</td><td style="text-align:right">45,000</td><td>Fractionnement</td></tr>
                    <tr><td>TRX-3092</td><td style="text-align:right">120,000</td><td>Origine risquée</td></tr>
                    <tr><td>TRX-8812</td><td style="text-align:right">2,400,000</td><td>Dépôt cash massif</td></tr>
                `;
                tablesUsed = ['transactions', 'alertes_aml'];
                numRows = 4;
            } else if (q.includes('comparatif encours vs objectifs')) {
                sql = "SELECT dr, sum(encours) as realise, sum(objectif) as cible FROM agences_perf GROUP BY dr;";
                nlpResponse = "Voici la consolidation des encours réalisés face aux objectifs par Direction Régionale :";
                tableRows = `
                    <tr><td>DR Centre</td><td style="text-align:right">5.2 MMDH</td><td style="text-align:right; color:#6b7d78">5.0 MMDH</td></tr>
                    <tr><td>DR Nord</td><td style="text-align:right">2.1 MMDH</td><td style="text-align:right; color:#6b7d78">2.4 MMDH</td></tr>
                    <tr><td>DR Sud</td><td style="text-align:right">1.8 MMDH</td><td style="text-align:right; color:#6b7d78">1.5 MMDH</td></tr>
                `;
                tablesUsed = ['agences_perf'];
                numRows = 3;
            } else if (q.includes('pme éligibles à une offre')) {
                sql = "SELECT nom, encours, score_appetence FROM clients WHERE segment = 'PME' AND eligibilite_credit = true ORDER BY score_appetence DESC LIMIT 5;";
                nlpResponse = "J'ai trouvé 142 PME éligibles à une offre de crédit de trésorerie avec un fort score d'appétence. Voici le Top 5 :";
                tableRows = `
                    <tr><td>TechSolutions SARL</td><td style="text-align:right">450 K</td><td style="text-align:right; color:#4ade80">92%</td></tr>
                    <tr><td>BatiMaroc SA</td><td style="text-align:right">1.2 M</td><td style="text-align:right; color:#4ade80">88%</td></tr>
                    <tr><td>AgriNord Coop</td><td style="text-align:right">850 K</td><td style="text-align:right; color:#4ade80">85%</td></tr>
                    <tr><td>LogisTrans</td><td style="text-align:right">2.1 M</td><td style="text-align:right; color:#4ade80">82%</td></tr>
                    <tr><td>MedPharma</td><td style="text-align:right">3.5 M</td><td style="text-align:right; color:#4ade80">79%</td></tr>
                `;
                tablesUsed = ['clients', 'scoring_marketing'];
                numRows = 142;
            } else if (q.includes('portefeuille à risque casablanca vs marrakech')) {
                sql = "SELECT ville, sum(encours_npl) as risque_total FROM clients WHERE ville IN ('Casablanca', 'Marrakech') GROUP BY ville;";
                nlpResponse = "Comparaison directe du portefeuille à risque entre les deux métropoles :";
                tableRows = `
                    <tr><td>Casablanca</td><td style="text-align:right">184,500,000 MAD</td></tr>
                    <tr><td>Marrakech</td><td style="text-align:right">42,800,000 MAD</td></tr>
                `;
                numRows = 2;
            } else if (q.includes('météo') || q.includes('football') || q.includes('blague') || q.includes('qui es')) {
                oob = true;
                nlpResponse = "Cette question dépasse le périmètre des données disponibles. Je suis optimisé pour analyser les données clients, crédits, transactions et performances des agences Saham Bank.";
            } else {
                // Generic fallback for any other query
                tableRows = `
                    <tr><td>Donnée 1</td><td style="text-align:right">85,000</td></tr>
                    <tr><td>Donnée 2</td><td style="text-align:right">42,000</td></tr>
                    <tr><td>Donnée 3</td><td style="text-align:right">12,500</td></tr>
                `;
                sql = "SELECT * FROM clients WHERE " + (text.split(' ')[0] || 'donnees') + " IS NOT NULL LIMIT 5;";
            }

            if (!oob) {
                // Step 2: Génération SQL
                document.getElementById(step1Id).style.display = 'none';
                const step2Id = 'msg-' + Date.now() + '-2';
                
                const highlight = sql
                    .replace(/\b(SELECT|FROM|WHERE|GROUP BY|ORDER BY|LIMIT|SUM|ASC|DESC|AND|OR|IN|INTERVAL)\b/g, '<span class="sql-syntax-purple">$1</span>')
                    .replace(/\b(clients|dossiers|agences_perf|performances|churn_predictions|transactions|alertes_aml|scoring_marketing)\b/g, '<span class="sql-syntax-cyan">$1</span>')
                    .replace(/([0-9]+|'[^']*')/g, '<span class="sql-syntax-green">$1</span>')
                    .replace(/([A-Z_a-z0-9]+.[A-Z_a-z0-9]+)/g, '<span class="sql-syntax-blue">$1</span>');

                msgs.innerHTML += `
                    <div id="${step2Id}" class="saham-msg bot">
                        <div class="bubble">
                            <div class="saham-sql-block">
                                <div class="saham-sql-header">
                                    <span>Requête SQL générée</span>
                                    <span class="saham-sql-badge">PostgreSQL</span>
                                </div>
                                <div class="saham-sql-content">${highlight}</div>
                            </div>
                        </div>
                    </div>
                `;
                msgs.scrollTop = msgs.scrollHeight;
                await new Promise(r => setTimeout(r, 800));

                // Log Query
                MOCK.queries.unshift({
                    question: text,
                    sql: sql,
                    results: numRows,
                    time: execTime,
                    date: new Date().toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'}) + ' ' + new Date().toLocaleDateString('fr-FR'),
                    user: APP.userRole || 'Inconnu'
                });
                if (document.getElementById('queries-tbody')) {
                    // Update table if it's currently rendered
                    if (window.renderAdmin) {
                        const queriesHtml = MOCK.queries.map(q => `
                            <tr>
                                <td style="font-size:12px; color:var(--slate-500);">${q.date}</td>
                                <td><span style="background:var(--accent-teal-light); color:var(--primary-teal); padding:4px 8px; border-radius:4px; font-size:11px; font-weight:600;">${q.user}</span></td>
                                <td style="max-width:250px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${q.question.replace(/"/g, '&quot;')}">${q.question}</td>
                                <td style="max-width:300px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; font-family:'JetBrains Mono', monospace; font-size:11px; color:var(--slate-500);" title="${q.sql.replace(/"/g, '&quot;')}">${q.sql}</td>
                                <td style="font-weight:600;">${q.results} lignes</td>
                                <td style="font-family:'JetBrains Mono', monospace; font-size:12px;">${q.time} ms</td>
                            </tr>
                        `).join('');
                        document.getElementById('queries-tbody').innerHTML = queriesHtml;
                    }
                }

                // Step 3: Exécution
                const step3Id = 'msg-' + Date.now() + '-3';
                msgs.innerHTML += `
                    <div id="${step3Id}" class="saham-msg bot">
                        <div class="bubble" style="padding:0; border:none; background:transparent; box-shadow:none;">
                            <div class="saham-exec-banner">
                                <div class="saham-spinner"></div>
                                Exécution sur la base de données... (${execTime}ms estimé)
                            </div>
                        </div>
                    </div>
                `;
                msgs.scrollTop = msgs.scrollHeight;
                await new Promise(r => setTimeout(r, 400));

                // Step 4: Réponse Finale
                document.getElementById(step3Id).style.display = 'none';
                
                const tableStr = tableRows ? `
                    <table style="width:100%; border-collapse:collapse; font-size:12px; margin-top:8px; background:#f4f6f5; border-radius:6px; overflow:hidden;">
                        ${tableRows}
                    </table>
                ` : "";

                const sourcesHtml = `
                    <div class="saham-rag-sources">
                        <div class="saham-rag-title" onclick="this.nextElementSibling.style.display = this.nextElementSibling.style.display === 'none' ? 'flex' : 'none'">
                            <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            Sources de données utilisées (${tablesUsed.length})
                        </div>
                        <div class="saham-rag-content" style="display:none;">
                            ${tablesUsed.map(t => `<div style="display:flex; justify-content:space-between;"><span>Table : <strong>${t}</strong></span><span>~1.2M lignes analysées</span></div>`).join('')}
                            <div style="display:flex; justify-content:space-between; margin-top:4px; font-style:italic;"><span>Période couverte</span><span>Temps réel</span></div>
                        </div>
                    </div>
                `;

                msgs.innerHTML += `
                    <div class="saham-msg bot">
                        <div class="bubble">
                            ${sourcesHtml}
                            <p>${nlpResponse}</p>
                            ${tableStr}
                            <button class="saham-btn-module" onclick="showToast('Ouverture du module concerné...')">
                                <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                                Voir dans le module
                            </button>
                        </div>
                    </div>
                `;
            } else {
                // OOB Response
                document.getElementById(step1Id).style.display = 'none';
                msgs.innerHTML += `
                    <div class="saham-msg bot">
                        <div class="bubble">
                            <p>${nlpResponse}</p>
                        </div>
                    </div>
                `;
            }

            msgs.scrollTop = msgs.scrollHeight;

            input.disabled = false;
            btn.disabled = false;
            input.focus();
        }

    