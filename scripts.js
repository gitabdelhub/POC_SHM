14-1192-                { id: 'CR-2026-004', client: 'StartUp Tech M', type: 'Assurance RC Pro', montant: 500000, score: 62, statut: 'A risque' }
15-1193-            ],
16-1194-            // Seasonality: Peaks in Q2 (M6) and Q4 (M12)
17-1195-            pnbData: [11.2, 12.5, 13.8, 14.1, 15.6, 18.4, 14.2, 13.5, 15.1, 16.5, 17.8, 22.1], // Millions MAD
18-1196-            creditDistrib: [
19-1197-                { label: 'Assurance Non-Vie', value: 40 }, { label: 'Assurance Vie', value: 30 }, 
20-1198-                { label: 'Bancassurance', value: 15 }, { label: 'Corporate', value: 10 }, { label: 'Santé', value: 5 }
21-1199-            ],
22-1200-            admins: [
23-1201-                { nom: 'Amina Bennani', email: 'a.bennani@saham.ma', profil: 'Admin IT', agence: 'Siège Casa', statut: 'Actif', dashboards: 4 },
24-1202-                { nom: 'Youssef Amrani', email: 'y.amrani@saham.ma', profil: 'Admin Data', agence: 'Siège Casa', statut: 'Actif', dashboards: 8 },
25-1203-                { nom: 'Hassan El Fassi', email: 'h.elfassi@saham.ma', profil: 'Admin Risque', agence: 'Siège Casa', statut: 'Suspendu', dashboards: 1 }
26-1204-            ],
27-1205-            
28-1206-            queries: [
29-1207-                { id: 'Q001', question: "Clients avec score de risque critique (&lt; 30)", sql: "SELECT id, nom, score, encours FROM clients WHERE score < 30 ORDER BY score ASC LIMIT 5;", results: 14, time: 142, date: "07/07/2026 09:14", user: "Directeur Régional", tables: ['clients'], status: 'Succès' },
30-1208-                { id: 'Q002', question: "Agences avec le plus fort taux NPL", sql: "SELECT agence, npl_ratio FROM agences_perf ORDER BY npl_ratio DESC LIMIT 3;", results: 8, time: 85, date: "07/07/2026 09:42", user: "Administrateur", tables: ['agences_perf', 'credits'], status: 'Succès' },
31-1209-                { id: 'Q003', question: "Transactions suspectes dernières 48h", sql: "SELECT id_trx, montant, motif_alerte FROM transactions WHERE alerte_aml = true AND date_trx >= NOW() - INTERVAL '48 hours';", results: 4, time: 210, date: "07/07/2026 10:05", user: "Directeur Agence", tables: ['transactions', 'alertes_aml'], status: 'Succès' },
32-1210-                { id: 'Q004', question: "Quel est le CA de l'agence Anfa ?", sql: "SELECT sum(ca) FROM agences_perf WHERE agence = 'Casablanca Anfa';", results: 1, time: 54, date: "06/07/2026 14:22", user: "Chef d'Agence", tables: ['agences_perf'], status: 'Succès' },
33-1211-                { id: 'Q005', question: "Montre moi les clients de Tanger", sql: "SELECT * FROM clients WHERE ville = 'Tanger';", results: 342, time: 120, date: "06/07/2026 15:10", user: "Conseiller Pro", tables: ['clients'], status: 'Succès' },
34-1212-                { id: 'Q006', question: "Dossiers crédit en surveillance ce mois", sql: "SELECT id, type, montant, agence FROM dossiers WHERE statut = 'Surveillance' AND extract(month from date_maj) = extract(month from current_date);", results: 8, time: 165, date: "06/07/2026 16:45", user: "Analyste Risque", tables: ['dossiers'], status: 'Succès' },
35-1213-                { id: 'Q007', question: "Evolution des dépôts par trimestre", sql: "SELECT trimestre, sum(depots) FROM performances GROUP BY trimestre ORDER BY trimestre;", results: 4, time: 88, date: "05/07/2026 09:30", user: "Directeur Régional", tables: ['performances'], status: 'Succès' },
36-1214-                { id: 'Q008', question: "Clients ayant souscrit à l'assurance vie", sql: "SELECT * FROM clients c JOIN produits p ON c.id = p.client_id WHERE p.type = 'Assurance Vie';", results: 1250, time: 310, date: "05/07/2026 11:15", user: "Marketing", tables: ['clients', 'produits'], status: 'Erreur' },
37-1215-                { id: 'Q009', question: "Top 5 expositions crédit par segment", sql: "SELECT segment, sum(encours) as total_encours FROM clients GROUP BY segment ORDER BY total_encours DESC LIMIT 5;", results: 5, time: 112, date: "05/07/2026 14:50", user: "Analyste Risque", tables: ['clients'], status: 'Succès' },
38-1216-                { id: 'Q010', question: "Churn prévu par agence Q3 2026", sql: "SELECT agence, predicted_churn_rate FROM churn_predictions WHERE quarter = 'Q3-2026' ORDER BY predicted_churn_rate DESC LIMIT 3;", results: 8, time: 195, date: "04/07/2026 08:20", user: "Data Scientist", tables: ['churn_predictions'], status: 'Succès' },
39-1217-                { id: 'Q011', question: "PME éligibles à une offre crédit", sql: "SELECT nom, encours, score_appetence FROM clients WHERE segment = 'PME' AND eligibilite_credit = true ORDER BY score_appetence DESC LIMIT 5;", results: 142, time: 240, date: "04/07/2026 10:30", user: "Conseiller Pro", tables: ['clients', 'scoring'], status: 'Succès' },
40-1218-                { id: 'Q012', question: "Comparatif encours vs objectifs par DR", sql: "SELECT dr, sum(encours) as realise, sum(objectif) as cible FROM agences_perf GROUP BY dr;", results: 3, time: 95, date: "04/07/2026 16:15", user: "Directeur Régional", tables: ['agences_perf'], status: 'Succès' },
41-1219-                { id: 'Q013', question: "Nombre de réclamations ouvertes", sql: "SELECT count(*) FROM reclamations WHERE statut = 'Ouverte';", results: 1, time: 42, date: "03/07/2026 09:05", user: "Service Client", tables: ['reclamations'], status: 'Succès' },
42-1220-                { id: 'Q014', question: "Temps moyen de traitement des crédits", sql: "SELECT avg(date_decision - date_depot) FROM dossiers WHERE statut IN ('Approuvé', 'Rejeté');", results: 1, time: 134, date: "03/07/2026 11:40", user: "Administrateur", tables: ['dossiers'], status: 'Succès' },
43-1221-                { id: 'Q015', question: "Liste des collaborateurs absents", sql: "SELECT * FROM rh_absences WHERE date_debut <= CURRENT_DATE AND date_fin >= CURRENT_DATE;", results: 24, time: 68, date: "02/07/2026 08:50", user: "RH", tables: ['rh_absences'], status: 'Erreur' },
44-1222-                { id: 'Q016', question: "Portefeuille à risque Casablanca vs Marrakech", sql: "SELECT ville, sum(encours_npl) as risque_total FROM clients WHERE ville IN ('Casablanca', 'Marrakech') GROUP BY ville;", results: 2, time: 105, date: "02/07/2026 14:12", user: "Analyste Risque", tables: ['clients'], status: 'Succès' },
45-1223-                { id: 'Q017', question: "Évolution du PNB ce trimestre", sql: "SELECT mois, pnb_realise, pnb_objectif FROM performances WHERE trimestre = 'Q3' ORDER BY mois ASC;", results: 3, time: 76, date: "01/07/2026 09:25", user: "Directeur Financier", tables: ['performances'], status: 'Succès' },
46-1224-                { id: 'Q018', question: "Clients VIP sans visite depuis 6 mois", sql: "SELECT * FROM clients WHERE segment = 'Premium' AND last_visit < NOW() - INTERVAL '6 months';", results: 45, time: 180, date: "01/07/2026 11:55", user: "Conseiller VIP", tables: ['clients', 'visites'], status: 'Succès' },
47-1225-                { id: 'Q019', question: "Taux de transformation des leads", sql: "SELECT count(case when converted then 1 end)::float / count(*) FROM leads;", results: 1, time: 155, date: "30/06/2026 15:30", user: "Marketing", tables: ['leads'], status: 'Succès' },
48-1226-                { id: 'Q020', question: "Liste des guichets automatiques en panne", sql: "SELECT id_atm, localisation FROM atms WHERE statut_technique != 'OK';", results: 12, time: 50, date: "30/06/2026 17:45", user: "Support IT", tables: ['atms'], status: 'Succès' }
49-1227-            ], // Query logger
50-1228-        };
51-1229-
52-1230-        // Generate 100 Clients with realistic risk correlation
53-1231-        for(let i=1; i<=100; i++) {
54-1232-            const fname = MOCK.firstNames[Math.floor(Math.random() * MOCK.firstNames.length)];
55-1233-            const lname = MOCK.lastNames[Math.floor(Math.random() * MOCK.lastNames.length)];
56-1234-            const segment = MOCK.segments[Math.floor(Math.random() * MOCK.segments.length)];
57-1235-            const agence = MOCK.agences[Math.floor(Math.random() * MOCK.agences.length)];
58-1236-            
59-1237-            // Base encours
60-1238-            let baseEncours = 50000;
61-1239-            if (segment === 'Premium') baseEncours = 300000;
62-1240-            if (segment === 'PME') baseEncours = 1000000;
63-1241-            if (segment === 'Corporate') baseEncours = 5000000;
64-1242-            
65-1243-            const encours = Math.floor(Math.random() * baseEncours) + baseEncours / 2;
66-1244-            
67-1245-            // Risk correlation: PME and Agricole have slightly higher risk. Corporate has lower risk.
68-1246-            let baseScore = 65;
69-1247-            if (segment === 'Corporate') baseScore += 20;
70-1248-            if (segment === 'PME') baseScore -= 15;
71-1249-            if (segment === 'Agricole') baseScore -= 20;
72-1250-            
73-1251-            // Some specific agencies have higher risk (e.g. Tanger Marina)
74-1252-            if (agence === 'Tanger Marina') baseScore -= 10;
75-1253-            
76-1254-            let score = baseScore + (Math.floor(Math.random() * 40) - 20);
77-1255-            score = Math.max(10, Math.min(99, score)); // clamp 10-99
78-1256-            
79-1257-            let statut = 'Actif';
80-1258-            if (score < 40) statut = 'À risque';
81-1259-            if (score < 25) statut = 'Défaut';
82-1260-
83-1261-            MOCK.clients.push({ id: `CLI-${10000+i}`, nom: `${fname} ${lname}`, segment, agence, ville: agence.split(' ')[0], encours, score, statut, age: Math.floor(Math.random() * 50) + 22 });
84-1262-        }
85-1263-
86-1264-        // Generate 35 Dossiers (Engagements)
87-1265-        const statutsDossier = ['En analyse', 'Validé', 'Débloqué', 'Surveillance', 'Contentieux'];
88-1266-        const typesCredit = ['Mourabaha Immo', 'Ijara', 'Mourabaha Auto', 'Crédit Tréso', 'Investissement PME'];
89-1267-        for(let i=1; i<=35; i++) {
90-1268-            const client = MOCK.clients[Math.floor(Math.random() * MOCK.clients.length)];
91-1269-            MOCK.dossiers.push({
92-1270-                ref: `SBK-${new Date().getFullYear()}-${1000+i}`,
93-1271-                client: client.nom,
94-1272-                type: typesCredit[Math.floor(Math.random() * typesCredit.length)],
95-1273-                montant: Math.floor(Math.random() * 1900000) + 100000,
96-1274-                duree: [12, 24, 36, 48, 60, 120, 240][Math.floor(Math.random() * 7)],
97-1275-                taux: (Math.random() * 3 + 2).toFixed(2),
98-1276-                score: client.score,
99-1277-                statut: statutsDossier[Math.floor(Math.random() * statutsDossier.length)]
100-1278-            });
101-1279-        }
102-1280-
103-1281-        /* --- 2. APP STATE --- */
104-1282-        const APP = {
105-1283-            userRole: null,
106-1284-            modules: [
107-1285-                { id: 'dashboard', name: "Pilotage Commercial", icon: '<path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>', roles: ['DG', 'DR', 'CA', 'AR', 'Admin'], hasSub: true },
108-1286-                { id: 'ciblage', name: "Ciblage & Campagnes", icon: '<path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />', roles: ['DG', 'DR', 'CA', 'Admin'] },
109-1287-                { id: 'engagements', name: "Espace Engagements", icon: '<path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.956 11.956 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>', roles: ['DG', 'DR', 'CA', 'AR', 'Admin'], hasSub: true },
110-1288-                { id: 'qualite', name: "Qualité de Service Clientèle", icon: '<path stroke-linecap="round" stroke-linejoin="round" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>', roles: ['DG', 'DR', 'CA', 'AR', 'Admin'], hasSub: true },
111-1289-                { id: 'rentabilite', name: "Rentabilité", icon: '<path d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>', roles: ['DG', 'DR', 'CA', 'AR', 'Admin'], isGroup: true, subItems: [
112-1290-                    { id: 'powerbi', name: "PNB Commercial" },
113-1291-                    { id: 'commissions', name: "Suivi des Commissions" }
114-1292-                ]},
115-1293-                { id: 'admin', name: "Administration & BI", icon: '<path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>', roles: ['Admin'] }
116-1294-            ]
117-1295-        };
118-1296-
119-1297-        /* --- 3. UTILITIES & COMPONENTS --- */
120-1298-        const formatMAD = (num) => new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD', maximumFractionDigits: 0 }).format(num);
121-1299-        
122-1300-        function showToast(message, type='success') {
123-1301-            const container = document.getElementById('toast-container');
124-1302-            const toast = document.createElement('div');
125-1303-            toast.className = `toast`;
126-1304-            toast.style.borderLeftColor = type === 'success' ? '#10B981' : 'var(--primary-orange)';
127-1305-            toast.innerHTML = `<svg width="24" height="24" fill="none" stroke="${type === 'success' ? '#10B981' : 'var(--primary-orange)'}" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> <span>${message}</span>`;
128-1306-            container.appendChild(toast);
129-1307-            setTimeout(() => toast.classList.add('show'), 10);
130-1308-            setTimeout(() => {
131-1309-                toast.classList.remove('show');
132-1310-                setTimeout(() => toast.remove(), 300);
133-1311-            }, 3000);
134-1312-        }
135-1313-
136-1314-        function openDrawer(title, contentHTML) {
137-1315-            document.getElementById('drawer-title').innerText = title;
138-1316-            document.getElementById('drawer-content').innerHTML = contentHTML;
139-1317-            document.getElementById('drawer-overlay').classList.add('active');
140-1318-            document.getElementById('drawer-panel').classList.add('active');
141-1319-        }
142-1320-        function closeDrawer() {
143-1321-            document.getElementById('drawer-overlay').classList.remove('active');
144-1322-            document.getElementById('drawer-panel').classList.remove('active');
145-1323-        }
146-1324-
147-1325-                function getScoreBadge(score) {
148-1326-            let color = '#10B981';
149-1327-            let label = 'Bon';
150-1328-            if(score < 70) { color = '#F59E0B'; label = 'Moyen'; }
151-1329-            if(score < 40) { color = '#EF4444'; label = 'Risqué'; }
152-1330-            
153-1331-            return `
154-1332-            <div style="display:flex; align-items:center; gap:8px;">
155-1333-                <span style="font-weight:700; width:24px; text-align:right;">${score}</span>
156-1334-                <div style="flex:1; max-width:80px; height:6px; background:var(--sec-bg); border-radius:3px; overflow:hidden;">
157-1335-                    <div style="height:100%; width:${score}%; background:${color};"></div>
158-1336-                </div>
159-1337-                <span style="font-size:11px; color:var(--slate-500);">${label}</span>
160-1338-            </div>`;
161-1339-        }
162-1340-
163-1341-                function getStatutBadge(statut) {
164-1342-            const map = {
165-1343-                'Actif': 'success', 'À risque': 'warning', 'Défaut': 'danger',
166-1344-                'Validé': 'success', 'Débloqué': 'success', 'En analyse': 'info', 'Surveillance': 'warning', 'Contentieux': 'danger'
167-1345-            };
168-1346-            const colorClass = map[statut] || 'info';
169-1347-            let dot = '';
170-1348-            if (statut === 'À risque') {
171-1349-                dot = '<span style="display:inline-block; width:6px; height:6px; background:currentColor; border-radius:50%; margin-right:6px; animation: pulse 1.5s infinite;"></span>';
172-1350-            }
173-1351-            return `<span class="status-badge status-${colorClass}" style="display:inline-flex; align-items:center;">${dot}${statut}</span>`;
174-1352-        }
175-1353-
176-1354-                function buildKPI(title, value, delta, isPos, iconSvg) {
177-1355-            // value might be string like '1.2M MAD' or number
178-1356-            return `
179-1357-            <div class="kpi-card">
180-1358-                <div class="kpi-header">
181-1359-                    <span>${title}</span>
182-1360-                    <div class="kpi-icon"><svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">${iconSvg}</svg></div>
183-1361-                </div>
184-1362-                <div class="kpi-value animate-val" data-val="${value}">0</div>
185-1363-                <div class="kpi-delta ${isPos ? 'delta-positive' : 'delta-negative'}">
186-1364-                    <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="${isPos ? 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6' : 'M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6'}"></path></svg>
187-1365-                    ${delta}
188-1366-                </div>
189-1367-            </div>`;
190-1368-        }
191-1369-
192-1370-        /* SVG Line Chart Builder */
193-1371-        function createLineChart(data, width=700, height=250) {
194-1372-            const padX = 40, padY = 40;
195-1373-            const max = Math.max(...data) * 1.1;
196-1374-            const stepX = (width - padX * 2) / (data.length - 1);
197-1375-            
198-1376-            let points = data.map((d, i) => {
199-1377-                const x = padX + i * stepX;
200-1378-                const y = height - padY - (d / max) * (height - padY * 2);
201-1379-                return `${x},${y}`;
202-1380-            }).join(' ');
203-1381-
204-1382-            let circles = data.map((d, i) => {
205-1383-                const x = padX + i * stepX;
206-1384-                const y = height - padY - (d / max) * (height - padY * 2);
207-1385-                return `<circle cx="${x}" cy="${y}" r="4" fill="var(--primary-orange)" stroke="var(--surface)" stroke-width="2" class="hover-point" data-val="${d}M MAD" onmouseover="showTooltip(event, '${d}M MAD')" onmouseout="hideTooltip()"/>
208-1386-                        <text x="${x}" y="${height - 10}" font-size="10" fill="var(--slate-500)" text-anchor="middle">M${i+1}</text>`;
209-1387-            }).join('');
210-1388-
211-1389-            return `
212-1390-            <svg viewBox="0 0 ${width} ${height}" class="nat-chart">
213-1391-                <!-- Grid -->
214-1392-                <line x1="${padX}" y1="${padY}" x2="${width-padX}" y2="${padY}" stroke="var(--sec-bg)" />
215-1393-                <line x1="${padX}" y1="${height/2}" x2="${width-padX}" y2="${height/2}" stroke="var(--sec-bg)" />
216-1394-                <line x1="${padX}" y1="${height-padY}" x2="${width-padX}" y2="${height-padY}" stroke="var(--slate-300)" />
217-1395-                <!-- Path -->
218-1396-                <polyline points="${points}" fill="rgba(46, 71, 65, 0.1)" stroke="var(--primary-teal)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
219-1397-                ${circles}
220-1398-            </svg>`;
221-1399-        }
222-1400-
223-1401-        /* SVG Bar Chart Builder */
224-1402-        function createBarChart(dataArr, width=700, height=250) {
225-1403-            const padX = 40, padY = 40;
226-1404-            const max = Math.max(...dataArr.map(d => d.value)) * 1.1;
227-1405-            const barWidth = 40;
228-1406-            const stepX = (width - padX * 2) / dataArr.length;
229-1407-
230-1408-            let rects = dataArr.map((d, i) => {
231-1409-                const x = padX + (i * stepX) + (stepX/2) - (barWidth/2);
232-1410-                const h = (d.value / max) * (height - padY * 2);
233-1411-                const y = height - padY - h;
234-1412-                return `
235-1413-                <rect x="${x}" y="${y}" width="${barWidth}" height="${h}" fill="var(--primary-teal)" rx="4" ry="4" 
236-1414-                      onmouseover="this.setAttribute('fill', 'var(--dark-teal)'); showTooltip(event, '${d.value}%')" 
237-1415-                      onmouseout="this.setAttribute('fill', 'var(--primary-teal)'); hideTooltip()"/>
238-1416-                <text x="${x + barWidth/2}" y="${height - 15}" font-size="10" fill="var(--slate-500)" text-anchor="middle" transform="rotate(-30 ${x + barWidth/2},${height - 15})">${d.label}</text>
239-1417-                <text x="${x + barWidth/2}" y="${y - 8}" font-size="12" fill="var(--text-main)" font-weight="bold" text-anchor="middle">${d.value}%</text>`;
240-1418-            }).join('');
241-1419-
242-1420-            return `<svg viewBox="0 0 ${width} ${height}" class="nat-chart">
243-1421-                 <line x1="${padX}" y1="${height-padY}" x2="${width-padX}" y2="${height-padY}" stroke="var(--slate-300)" />
244-1422-                ${rects}
245-1423-            </svg>`;
246-1424-        }
247-1425-
248-1426-        let tooltipEl = null;
249-1427-        function showTooltip(e, text) {
250-1428-            if(!tooltipEl) tooltipEl = document.getElementById('tooltip');
251-1429-            tooltipEl.innerText = text;
252-1430-            tooltipEl.style.opacity = 1;
253-1431-            tooltipEl.style.left = (e.pageX + 10) + 'px';
254-1432-            tooltipEl.style.top = (e.pageY - 20) + 'px';
255-1433-        }
256-1434-        function hideTooltip() { if(tooltipEl) tooltipEl.style.opacity = 0; }
257-1435-
258-1436-        /* Power BI Placeholder */
259-1437-        const PBI_TEMPLATE = `
260-1438-            <div class="pbi-placeholder fade-in">
261-1439-                <div class="pbi-logo"><svg width="32" height="32" fill="currentColor" viewBox="0 0 24 24"><path d="M4 10h4v10H4zM10 4h4v16h-4zM16 14h4v6h-4z"/></svg></div>
262-1440-                <h3 class="font-brand" style="font-size:24px; color:var(--text-main); margin-bottom:12px;">Rapport connecté au workspace Saham Bank</h3>
263-1441-                <p style="max-width:400px; margin-bottom:24px;">Cette vue nécessite une licence Power BI Pro. L'intégration iframe est configurée en backend.</p>
264-1442-                <button class="btn btn-primary" onclick="showToast('Ouverture du rapport PBI en plein écran simulée')">Ouvrir en plein écran</button>
265-1443-            </div>`;
266-1444-
267-1445-        /* --- 4. CORE LOGIC & ROUTING --- */
268-1446-
269-1447-        function login(role) {
270-1448-            APP.userRole = role;
271-1449-            document.getElementById('login-screen').classList.add('hidden');
272-1450-            document.getElementById('app-layout').classList.remove('hidden');
273-1451-            document.getElementById('saham-fab').classList.remove('hidden');
274-1452-            
275-1453-            // Set User Info
276-1454-            const roleNames = { 'DG': 'Directeur Général', 'DA': "Directeur d'Agence", 'Admin': 'Administrateur IT' };
277-1455-            document.getElementById('user-avatar').innerText = role;
278-1456-            // document.getElementById('user-role-label').innerText = roleNames[role];
279-1457-            const nameMapping = { 'DG': 'Mehdi Tazi', 'DR': 'Youssef Berrada', 'CA': 'Amine Benali', 'AR': 'Nadia Fassi', 'Admin': 'Admin System' };
280-1458-            document.getElementById('user-name').innerText = nameMapping[role] || 'Utilisateur';
281-1459-            document.getElementById('user-avatar').innerText = (nameMapping[role] || 'U').substring(0, 2).toUpperCase();
282-1460-            buildSidebar();
283-1461-            
284-1462-            // Default route based on role
285-1463-            const firstModule = APP.modules.find(m => m.roles.includes(role)).id;
286-1464-            location.hash = firstModule;
287-1465-            route();
288-1466-        }
289-1467-
290-1468-        window.createCustomDashboard = function() {
291-1469-            const name = document.getElementById('new-dash-name').value;
292-1470-            const url = document.getElementById('new-dash-url').value;
293-1471-            const roles = Array.from(document.querySelectorAll('.new-dash-role:checked')).map(el => el.value);
294-1472-            
295-1473-            if(!name || !url || roles.length === 0) {
296-1474-                showToast("Veuillez remplir tous les champs et sélectionner au moins un rôle.", "error");
297-1475-                return;
298-1476-            }
299-1477-            
300-1478-            const newId = 'custom_pbi_' + Date.now();
301-1479-            APP.modules.push({
302-1480-                id: newId,
303-1481-                name: name,
304-1482-                icon: '<path stroke-linecap="round" stroke-linejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>',
305-1483-                roles: roles,
306-1484-                isCustomExt: true,
307-1485-                url: url
308-1486-            });
309-1487-            
310-1488-            buildSidebar();
311-1489-            showToast("Module '" + name + "' créé avec succès.");
312-1490-            document.getElementById('new-dash-name').value = '';
313-1491-            document.getElementById('new-dash-url').value = '';
314-1492-        };
315-1493-
316-1494-        function logout() {
317-1495-            location.hash = '';
318-1496-            document.getElementById('app-layout').classList.add('hidden');
319-1497-            document.getElementById('saham-fab').classList.add('hidden');
320-1498-            document.getElementById('saham-chat-panel').classList.remove('active');
321-1499-            document.getElementById('login-screen').classList.remove('hidden');
322-1500-        }
323-1501-
324-1502-        function toggleSidebar() {
325-1503-            document.getElementById('sidebar').classList.toggle('collapsed');
326-1504-        }
327-1505-
328-1506-        function buildSidebar() {
329-1507-            const ul = document.getElementById('sidebar-nav');
330-1508-            ul.innerHTML = '';
331-1509-            APP.modules.forEach(m => {
332-1510-                if (m.roles && m.roles.includes(APP.userRole)) {
333-1511-                    if (m.isGroup) {
334-1512-                        ul.innerHTML += `<div style="font-size: 11px; text-transform: uppercase; font-weight: 800; color: var(--slate-500); padding: 16px 24px 8px; letter-spacing: 0.5px;">${m.name}</div>`;
335-1513-                        m.subItems.forEach(sub => {
336-1514-                            ul.innerHTML += `
337-1515-                                <li class="nav-item" id="nav-${sub.id}">
338-1516-                                    <a href="#${sub.id}" class="nav-link" style="padding-left: 32px;">
339-1517-                                        <span>${sub.name}</span>
340-1518-                                    </a>
341-1519-                                </li>`;
342-1520-                        });
343-1521-                    } else {
344-1522-                        ul.innerHTML += `
345-1523-                            <li class="nav-item" id="nav-${m.id}">
346-1524-                                <a href="#${m.id}" class="nav-link">
347-1525-                                    <div class="nav-icon"><svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">${m.icon}</svg></div>
348-1526-                                    <span>${m.name}</span>
349-1527-                                </a>
350-1528-                            </li>`;
351-1529-                    }
352-1530-                }
353-1531-            });
354-1532-        }
355-1533-            });
356-1534-        }
357-1535-
358-1536-        
359-1537-        window.switchTab = function(btn, targetId) {
360-1538-            const tabs = btn.parentElement.querySelectorAll('.tab');
361-1539-            tabs.forEach(t => t.classList.remove('active'));
362-1540-            btn.classList.add('active');
363-1541-
364-1542-            const container = btn.closest('.fade-in');
365-1543-            if (targetId.startsWith('pbi-')) {
366-1544-                ['pbi-fin', 'pbi-risk', 'pbi-com'].forEach(id => {
367-1545-                    const el = document.getElementById(id);
368-1546-                    if(el) el.classList.add('hidden');
369-1547-                });
370-1548-            } else if (targetId.startsWith('admin-')) {
371-1549-                ['admin-pbi', 'admin-users', 'admin-queries', 'admin-add-dash'].forEach(id => {
372-1550-                    const el = document.getElementById(id);
373-1551-                    if(el) el.classList.add('hidden');
374-1552-                });
375-1553-            }
376-1554-
377-1555-            const target = document.getElementById(targetId);
378-1556-            if(target) target.classList.remove('hidden');
379-1557-        };
380-1558-
381-1559-        
382-1560-        function createCustomDashboard() {
383-1561-            const name = document.getElementById('new-dash-name').value.trim();
384-1562-            const url = document.getElementById('new-dash-url').value.trim();
385-1563-            if (!name || !url) {
386-1564-                showToast('Veuillez remplir tous les champs', true);
387-1565-                return;
388-1566-            }
389-1567-            const roles = Array.from(document.querySelectorAll('.new-dash-role:checked')).map(cb => cb.value);
390-1568-            if (roles.length === 0) {
391-1569-                showToast('Veuillez sélectionner au moins un rôle', true);
392-1570-                return;
393-1571-            }
394-1572-            const id = 'custom-' + Date.now();
395-1573-            APP.modules.push({
396-1574-                id: id,
397-1575-                name: name,
398-1576-                icon: '<path stroke-linecap="round" stroke-linejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />',
399-1577-                roles: roles,
400-1578-                isCustomExt: true,
401-1579-                url: url
402-1580-            });
403-1581-            buildSidebar();
404-1582-            showToast('Dashboard créé avec succès');
405-1583-            document.getElementById('new-dash-name').value = '';
406-1584-            document.getElementById('new-dash-url').value = '';
407-1585-        }
408-1586-
409-1587-        function route() {
410-1588-            const hash = location.hash.replace('#', '') || 'dashboard';
411-1589-            
412-1590-            // Update Active Nav
413-1591-            document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
414-1592-            const activeNav = document.getElementById(`nav-${hash}`);
415-1593-            if(activeNav) activeNav.classList.add('active');
416-1594-
417-1595-            let moduleDef = APP.modules.find(m => m.id === hash);
418-1596-            if (!moduleDef) {
419-1597-                APP.modules.forEach(m => {
420-1598-                    if (m.isGroup) {
421-1599-                        const sub = m.subItems.find(s => s.id === hash);
422-1600-                        if (sub) moduleDef = { ...sub, name: m.name + ' / ' + sub.name };
423-1601-                    }
424-1602-                });
425-1603-            }
426-1604-            if(moduleDef) document.getElementById('breadcrumb').innerText = moduleDef.name;
427-1605-
428-1606-            const content = document.getElementById('main-content');
429-1607-            content.innerHTML = ''; // clear
430-1608-            content.scrollTop = 0;
431-1609-
432-1610-            switch(hash) {
433-1611-                case 'dashboard': renderDashboard(content); break;
434-1612-                case 'custom_dash': renderCustomDash(content); break;
435-1613-                case 'powerbi': renderPowerbi(content); break;
436-1614-                case 'portefeuille': renderPortefeuille(content); break;
437-1615-                case 'engagements': renderEngagements(content); break;
438-1616-                case 'ciblage': renderCiblage(content); break;
439-1617-                case 'risques': renderRisques(content); break;
440-1618-                case 'chatbot': renderChatbot(content); break;
441-1619-                case 'admin': renderAdmin(content); break;
442-1620-                case 'qualite': renderQualite(content); break; // Fallback or distinct view
443-1621-                case 'commissions': renderCommissions(content); break; // Fallback or distinct view
444-1622-                default: 
445-1623-                    if (moduleDef && moduleDef.isCustomExt) {
446-1624-                        content.innerHTML = `<div class="fade-in" style="height:100%; display:flex; flex-direction:column;">
447-1625-                            <h2 style="font-family:'Montserrat', sans-serif; font-size:24px; color:var(--dark-teal); font-weight:700; margin-bottom:16px;">${moduleDef.name}</h2>
448-1626-                            <div style="flex:1; background:var(--surface); border:1px solid var(--sec-bg); border-radius:var(--border-radius); overflow:hidden;">
449-1627-                                <iframe src="${moduleDef.url}" style="width:100%; height:100%; border:none;"></iframe>
450-1628-                            </div>
451-1629-                        </div>`;
452-1630-                    } else {
453-1631-                        renderDashboard(content);
454-1632-                    }
455-1633-                    break;
456-1634-            }
457-1635-        }
458-1636-        window.addEventListener('hashchange', route);
459-1637-
460-1638-        
461-1639-        window.toggleSql = function(btn) {
462-1640-            const container = btn.nextElementSibling;
463-1641-            if(container.classList.contains('active')) {
464-1642-                container.classList.remove('active');
465-1643-                btn.innerHTML = '<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg> Voir la requête SQL';
466-1644-            } else {
467-1645-                container.classList.add('active');
468-1646-                btn.innerHTML = '<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"></path></svg> Masquer la requête SQL';
469-1647-            }
470-1648-        }
471-1649-
472-1650-        /* --- 5. MODULE RENDERERS --- */
473-1651-
474-1652-        function renderDashboard(container) {
475-1653-            const profileData = {
476-1654-                'DG': { title: 'Vue Macro Groupe', pnb: '1.42 Md', credits: '45.8 Md', depots: '52.4 Md', npl: '0.85', trendPNB: '+5.4%', trendCred: '+2.1%', trendDep: '+3.8%' },
477-1655-                'DR': { title: 'Vue Régionale (Rabat Agdal)', pnb: '345 M', credits: '12.1 Md', depots: '15.2 Md', npl: '0.92', trendPNB: '+3.2%', trendCred: '+1.5%', trendDep: '+2.1%' },
478-1656-                'CA': { title: 'Vue Portefeuille Clientèle', pnb: '85 M', credits: '2.4 Md', depots: '3.1 Md', npl: '1.02', trendPNB: '+1.4%', trendCred: '+0.8%', trendDep: '+1.2%' },
479-1657-                'AR': { title: 'Vue Agence', pnb: '65 M', credits: '1.8 Md', depots: '2.5 Md', npl: '0.98', trendPNB: '+1.1%', trendCred: '+0.5%', trendDep: '+0.9%' },
480-1658-                'Admin': { title: 'Vue Complète Système', pnb: '1.42 Md', credits: '45.8 Md', depots: '52.4 Md', npl: '0.85', trendPNB: '+5.4%', trendCred: '+2.1%', trendDep: '+3.8%' }
481-1659-            };
482-1660-            const data = profileData[APP.userRole] || profileData['DG'];
483-1661-            const formatVal = (str) => {
484-1662-                const parts = str.split(' ');
485-1663-                return `${parts[0]} <span style="font-size:16px; font-weight:600; color:var(--slate-500);">${parts[1] || ''} MAD</span>`;
486-1664-            };
487-1665-
488-1666-            container.innerHTML = `
489-1667-                <div class="fade-in">
490-1668-                    <div style="display:flex; align-items:center; gap:12px; margin-bottom:24px;">
491-1669-                        <span style="background:var(--light-bg); color:var(--primary-teal); padding:4px 12px; border-radius:20px; font-size:11px; font-weight:700; letter-spacing:1px; text-transform:uppercase;">${data.title}</span>
492-1670-                        <h2 style="font-family:'Montserrat', sans-serif; font-size:24px; color:var(--dark-teal); font-weight:800; margin:0; flex:1;">Performances Financières & Commerciales</h2>
493-1671-                        <button onclick="exportDashCSV()" style="background:var(--primary-teal); color:white; border:none; padding:8px 16px; border-radius:6px; font-size:12px; font-weight:600; cursor:pointer; display:flex; align-items:center; gap:6px;">
494-1672-                            <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg> Exporter CSV
495-1673-                        </button>
496-1674-                    </div>
497-1675-
498-1676-                    <!-- KPI Row -->
499-1677-                    <div style="display:grid; grid-template-columns: repeat(4, 1fr); gap:16px; margin-bottom:24px;">
500-1678-                        <div style="background:white; border-radius:12px; border:1px solid var(--sec-bg); padding:20px; box-shadow:0 2px 8px rgba(0,0,0,0.02);">
501-1679-                            <h3 style="font-family:'Montserrat', sans-serif; font-size:12px; color:var(--slate-500); text-transform:uppercase; letter-spacing:0.5px; margin-bottom:8px; display:flex; justify-content:space-between; align-items:center;">
502-1680-                                Produit Net Bancaire <div style="width:24px; height:24px; border-radius:50%; background:#f0fdf4; color:#16a34a; display:flex; align-items:center; justify-content:center; font-size:12px;">▲</div>
503-1681-                            </h3>
504-1682-                            <div style="font-size:32px; font-weight:800; color:var(--dark-teal); margin-bottom:12px; font-family:'Manrope', sans-serif;">${formatVal(data.pnb)}</div>
505-1683-                            <div style="font-size:12px; color:var(--slate-500); display:flex; align-items:center; gap:6px;">
506-1684-                                <span style="background:#f0fdf4; color:#16a34a; padding:2px 6px; border-radius:4px; font-weight:600; font-size:10px;">${data.trendPNB}</span> vs année précédente
507-1685-                            </div>
508-1686-                        </div>
509-1687-
510-1688-                        <div style="background:white; border-radius:12px; border:1px solid var(--sec-bg); padding:20px; box-shadow:0 2px 8px rgba(0,0,0,0.02);">
511-1689-                            <h3 style="font-family:'Montserrat', sans-serif; font-size:12px; color:var(--slate-500); text-transform:uppercase; letter-spacing:0.5px; margin-bottom:8px; display:flex; justify-content:space-between; align-items:center;">
512-1690-                                Encours Crédits <div style="width:24px; height:24px; border-radius:50%; background:#f0fdf4; color:#16a34a; display:flex; align-items:center; justify-content:center; font-size:12px;">▲</div>
513-1691-                            </h3>
514-1692-                            <div style="font-size:32px; font-weight:800; color:var(--dark-teal); margin-bottom:12px; font-family:'Manrope', sans-serif;">${formatVal(data.credits)}</div>
515-1693-                            <div style="font-size:12px; color:var(--slate-500); display:flex; align-items:center; gap:6px;">
516-1694-                                <span style="background:#f0fdf4; color:#16a34a; padding:2px 6px; border-radius:4px; font-weight:600; font-size:10px;">${data.trendCred}</span> vs objectif annuel
517-1695-                            </div>
518-1696-                        </div>
519-1697-
520-1698-                        <div style="background:white; border-radius:12px; border:1px solid var(--sec-bg); padding:20px; box-shadow:0 2px 8px rgba(0,0,0,0.02);">
521-1699-                            <h3 style="font-family:'Montserrat', sans-serif; font-size:12px; color:var(--slate-500); text-transform:uppercase; letter-spacing:0.5px; margin-bottom:8px; display:flex; justify-content:space-between; align-items:center;">
522-1700-                                Encours Dépôts <div style="width:24px; height:24px; border-radius:50%; background:#f0fdf4; color:#16a34a; display:flex; align-items:center; justify-content:center; font-size:12px;">▲</div>
523-1701-                            </h3>
524-1702-                            <div style="font-size:32px; font-weight:800; color:var(--dark-teal); margin-bottom:12px; font-family:'Manrope', sans-serif;">${formatVal(data.depots)}</div>
525-1703-                            <div style="font-size:12px; color:var(--slate-500); display:flex; align-items:center; gap:6px;">
526-1704-                                <span style="background:#f0fdf4; color:#16a34a; padding:2px 6px; border-radius:4px; font-weight:600; font-size:10px;">${data.trendDep}</span> collecte nette
527-1705-                            </div>
528-1706-                        </div>
529-1707-
530-1708-                        <div style="background:white; border-radius:12px; border:1px solid var(--sec-bg); padding:20px; box-shadow:0 2px 8px rgba(0,0,0,0.02);">
531-1709-                            <h3 style="font-family:'Montserrat', sans-serif; font-size:12px; color:var(--slate-500); text-transform:uppercase; letter-spacing:0.5px; margin-bottom:8px; display:flex; justify-content:space-between; align-items:center;">
532-1710-                                Coût du Risque <div style="width:24px; height:24px; border-radius:50%; background:#f0fdf4; color:#16a34a; display:flex; align-items:center; justify-content:center; font-size:12px;">▼</div>
533-1711-                            </h3>
534-1712-                            <div style="font-size:32px; font-weight:800; color:var(--dark-teal); margin-bottom:12px; font-family:'Manrope', sans-serif;">${data.npl}<span style="font-size:24px;">%</span></div>
535-1713-                            <div style="font-size:12px; color:var(--slate-500); display:flex; align-items:center; gap:6px;">
536-1714-                                <span style="background:#f0fdf4; color:#16a34a; padding:2px 6px; border-radius:4px; font-weight:600; font-size:10px;">-12 pts</span> amélioration qualité
537-1715-                            </div>
538-1716-                        </div>
539-1717-                    </div>
540-1718-                    
541-1719-                    <!-- Interactive Bubble Map for DG/DR -->
542-1720-                    ${(APP.userRole === 'DG' || APP.userRole === 'DR') ? `
543-1721-                    <div style="margin-bottom:24px; background:white; border-radius:12px; border:1px solid var(--sec-bg); padding:20px; box-shadow:0 2px 8px rgba(0,0,0,0.02);">
544-1722-                        <h3 style="font-family:'Montserrat', sans-serif; font-size:16px; font-weight:700; color:var(--dark-teal); margin-top:0; margin-bottom:16px;">Cartographie Commerciale (Bubble Map)</h3>
545-1723-                        <div style="position:relative; width:100%; height:300px; background:var(--light-bg); border-radius:8px; border:1px solid #e2e8f0; overflow:hidden;">
546-1724-                            <!-- Simplified Moroccan Map Background using SVG -->
547-1725-                            <svg width="100%" height="100%" viewBox="0 0 800 400" preserveAspectRatio="xMidYMid slice" style="position:absolute; top:0; left:0; opacity:0.1;">
548-1726-                                <path d="M100,50 Q400,10 700,50 T750,350 Q400,380 50,350 Z" fill="#0e6944" />
549-1727-                            </svg>
550-1728-                            <!-- Bubbles -->
551-1729-                            <div style="position:absolute; top:30%; left:40%; width:40px; height:40px; background:rgba(14, 105, 68, 0.6); border:2px solid #0e6944; border-radius:50%; display:flex; align-items:center; justify-content:center; color:white; font-size:10px; font-weight:bold; cursor:pointer;" title="Casablanca: 12.5 Md" onclick="showToast('Région Casablanca: 12.5 Md MAD', 'info')">Casa</div>
552-1730-                            <div style="position:absolute; top:20%; left:50%; width:30px; height:30px; background:rgba(211, 59, 33, 0.6); border:2px solid #d33b21; border-radius:50%; display:flex; align-items:center; justify-content:center; color:white; font-size:9px; font-weight:bold; cursor:pointer;" title="Rabat: 8.2 Md" onclick="showToast('Région Rabat: 8.2 Md MAD', 'info')">Rabat</div>
553-1731-                            <div style="position:absolute; top:50%; left:35%; width:25px; height:25px; background:rgba(14, 105, 68, 0.6); border:2px solid #0e6944; border-radius:50%; display:flex; align-items:center; justify-content:center; color:white; font-size:8px; font-weight:bold; cursor:pointer;" title="Marrakech: 5.1 Md" onclick="showToast('Région Marrakech: 5.1 Md MAD', 'info')">KeCH</div>
554-1732-                            <div style="position:absolute; top:15%; left:55%; width:20px; height:20px; background:rgba(211, 59, 33, 0.6); border:2px solid #d33b21; border-radius:50%; display:flex; align-items:center; justify-content:center; color:white; font-size:7px; font-weight:bold; cursor:pointer;" title="Tanger: 4.8 Md" onclick="showToast('Région Tanger: 4.8 Md MAD', 'info')">TNG</div>
555-1733-                            <div style="position:absolute; top:70%; left:25%; width:15px; height:15px; background:rgba(14, 105, 68, 0.6); border:2px solid #0e6944; border-radius:50%; display:flex; align-items:center; justify-content:center; color:white; font-size:6px; font-weight:bold; cursor:pointer;" title="Agadir: 3.2 Md" onclick="showToast('Région Agadir: 3.2 Md MAD', 'info')">AGA</div>
556-1734-                        </div>
557-1735-                    </div>
558-1736-                    ` : ''}
559-1737-                    <!-- Main Charts Row -->
560-1738-                    <div style="display:flex; gap:24px; margin-bottom:24px;">
561-1739-                        
562-1740-                        <!-- Bar Chart -->
563-1741-                        <div style="flex:2; background:white; border-radius:12px; border:1px solid var(--sec-bg); box-shadow:0 2px 8px rgba(0,0,0,0.02); overflow:hidden; display:flex; flex-direction:column;">
564-1742-                            <div style="padding:20px 24px; border-bottom:1px solid var(--sec-bg); display:flex; justify-content:space-between; align-items:center;">
565-1743-                                <h3 style="font-family:'Montserrat', sans-serif; font-size:16px; font-weight:700; color:var(--dark-teal); margin:0;">Évolution du Produit Net Bancaire (M MAD)</h3>
566-1744-                                <select style="padding:6px 12px; border:1px solid var(--sec-bg); border-radius:6px; font-size:12px; background:var(--light-bg);"><option>Année 2025</option><option>Année 2026</option></select>
567-1745-                            </div>
568-1746-                            <div style="flex:1; padding:24px; position:relative; display:flex; align-items:flex-end; gap:16px; justify-content:space-between; height:250px;">
569-1747-                                <div style="position:absolute; left:24px; right:24px; top:24px; bottom:24px; border-bottom:1px solid #e2e8f0; display:flex; flex-direction:column; justify-content:space-between;">
570-1748-                                    <div style="border-bottom:1px dashed #e2e8f0; width:100%;"></div>
571-1749-                                    <div style="border-bottom:1px dashed #e2e8f0; width:100%;"></div>
572-1750-                                    <div style="border-bottom:1px dashed #e2e8f0; width:100%;"></div>
573-1751-                                    <div style="border-bottom:1px dashed #e2e8f0; width:100%;"></div>
574-1752-                                </div>
575-1753-                                ${[112, 125, 138, 141, 156, 184, 142, 135, 151, 165, 178, 221].map((val, i) => `
576-1754-                                <div style="position:relative; flex:1; display:flex; flex-direction:column; align-items:center; justify-content:flex-end; height:100%; z-index:1;">
577-1755-                                    <div style="width:60%; background:${i === 11 ? '#d33b21' : '#0e6944'}; height:${(val/250)*100}%; border-radius:4px 4px 0 0; transition:height 1s ease-out; opacity:0.9;"></div>
578-1756-                                    <span style="font-size:10px; color:var(--slate-500); margin-top:8px;">${['Jan','Fév','Mar','Avr','Mai','Juin','Juil','Aoû','Sep','Oct','Nov','Déc'][i]}</span>
579-1757-                                </div>
580-1758-                                `).join('')}
581-1759-                            </div>
582-1760-                        </div>
583-1761-
584-1762-                        <!-- Donut Chart -->
585-1763-                        <div style="flex:1; background:white; border-radius:12px; border:1px solid var(--sec-bg); box-shadow:0 2px 8px rgba(0,0,0,0.02); overflow:hidden;">
586-1764-                            <div style="padding:20px 24px; border-bottom:1px solid var(--sec-bg);">
587-1765-                                <h3 style="font-family:'Montserrat', sans-serif; font-size:16px; font-weight:700; color:var(--dark-teal); margin:0;">Répartition des Crédits</h3>
588-1766-                            </div>
589-1767-                            <div style="display:flex; flex-direction:column; align-items:center; padding:24px;">
590-1768-                                <div style="position:relative; width:180px; height:180px; margin-bottom:24px;">
591-1769-                                    <svg width="180" height="180" viewBox="0 0 100 100" style="transform: rotate(-90deg);">
592-1770-                                        <circle cx="50" cy="50" r="35" fill="transparent" stroke="#0e6944" stroke-width="20" stroke-dasharray="140 220" stroke-dashoffset="0"></circle>
593-1771-                                        <circle cx="50" cy="50" r="35" fill="transparent" stroke="#1d2b27" stroke-width="20" stroke-dasharray="45 220" stroke-dashoffset="-140"></circle>
594-1772-                                        <circle cx="50" cy="50" r="35" fill="transparent" stroke="#d33b21" stroke-width="20" stroke-dasharray="25 220" stroke-dashoffset="-185"></circle>
595-1773-                                        <circle cx="50" cy="50" r="35" fill="transparent" stroke="#e9eceb" stroke-width="20" stroke-dasharray="10 220" stroke-dashoffset="-210"></circle>
596-1774-                                    </svg>
597-1775-                                    <div style="position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center;">
598-1776-                                        <span style="font-size:24px; font-weight:800; color:var(--dark-teal); font-family:'Manrope', sans-serif;">45.8</span>
599-1777-                                        <span style="font-size:10px; color:var(--slate-500); text-transform:uppercase; font-weight:600;">Md MAD</span>
600-1778-                                    </div>
601-1779-                                </div>
602-1780-                                <div style="width:100%; display:flex; flex-direction:column; gap:12px;">
603-1781-                                    <div style="display:flex; justify-content:space-between; align-items:center; font-size:12px; color:var(--slate-700);">
604-1782-                                        <div style="display:flex; align-items:center; gap:8px;"><div style="width:12px; height:12px; background:#0e6944; border-radius:2px;"></div> Retail (Immo & Conso)</div>
605-1783-                                        <span style="font-weight:700;">64%</span>
606-1784-                                    </div>
607-1785-                                    <div style="display:flex; justify-content:space-between; align-items:center; font-size:12px; color:var(--slate-700);">
608-1786-                                        <div style="display:flex; align-items:center; gap:8px;"><div style="width:12px; height:12px; background:#1d2b27; border-radius:2px;"></div> Entreprises & PME</div>
609-1787-                                        <span style="font-weight:700;">20%</span>
610-1788-                                    </div>
611-1789-                                    <div style="display:flex; justify-content:space-between; align-items:center; font-size:12px; color:var(--slate-700);">
612-1790-                                        <div style="display:flex; align-items:center; gap:8px;"><div style="width:12px; height:12px; background:#d33b21; border-radius:2px;"></div> Corporate & IB</div>
613-1791-                                        <span style="font-weight:700;">12%</span>
614-1792-                                    </div>
615-1793-                                </div>
616-1794-                            </div>
617-1795-                        </div>
618-1796-                    </div>
619-1797-                </div>
620-1798-            `;
621-1799-        }
622-1800-
623-1801-        function renderCiblage(container) {
624-1802-            container.innerHTML = `
625-1803-                <div class="fade-in">
626-1804-                    <div style="display:flex; align-items:center; gap:12px; margin-bottom:24px;">
627-1805-                        <span style="background:var(--light-bg); color:var(--primary-teal); padding:4px 12px; border-radius:20px; font-size:11px; font-weight:700; letter-spacing:1px; text-transform:uppercase;">Marketing & Ventes</span>
628-1806-                        <h2 style="font-family:'Montserrat', sans-serif; font-size:24px; color:var(--dark-teal); font-weight:800; margin:0;">Ciblage & Campagnes</h2>
629-1807-                    </div>
630-1808-                    <div style="background:white; border-radius:12px; border:1px solid var(--sec-bg); padding:24px; box-shadow:0 2px 8px rgba(0,0,0,0.02); text-align:center;">
631-1809-                        <svg width="64" height="64" fill="none" stroke="var(--slate-300)" stroke-width="1.5" viewBox="0 0 24 24" style="margin-bottom:16px;">
632-1810-                            <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
633-1811-                        </svg>
634-1812-                        <h3 style="font-family:'Montserrat', sans-serif; font-size:18px; color:var(--dark-teal); margin-bottom:8px;">Outil de ciblage en construction</h3>
635-1813-                        <p style="color:var(--slate-500); font-size:14px; max-width:400px; margin:0 auto;">Le module de ciblage client et de génération de leads commerciaux sera bientôt disponible dans cette vue.</p>
636-1814-                        <button style="margin-top:24px; background:var(--primary-teal); color:white; border:none; padding:10px 24px; border-radius:8px; font-weight:600; cursor:pointer; box-shadow:0 2px 4px rgba(0,0,0,0.1);" onclick="showToast('Bientôt disponible')">Être notifié</button>
637-1815-                    </div>
638-1816-                </div>
639-1817-            `;
640-1818-        }
641-1819-
642-1820-        
643-1821-        function renderQualite(container) {
644-1822-            container.innerHTML = `
645-1823-                <div class="fade-in">
646-1824-                    <div style="display:flex; align-items:center; gap:12px; margin-bottom:24px;">
647-1825-                        <span style="background:var(--light-bg); color:var(--primary-teal); padding:4px 12px; border-radius:20px; font-size:11px; font-weight:700; letter-spacing:1px; text-transform:uppercase;">Services & Qualité</span>
648-1826-                        <h2 style="font-family:'Montserrat', sans-serif; font-size:24px; color:var(--dark-teal); font-weight:800; margin:0;">Qualité de Service Clientèle</h2>
649-1827-                    </div>
650-1828-                    
651-1829-                    <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:24px; margin-bottom:24px;">
652-1830-                        <div class="card" style="padding:24px;">
653-1831-                            <h3 style="font-size:14px; color:var(--slate-500); margin-bottom:12px;">Réclamations Ouvertes</h3>
654-1832-                            
655-1833-<div style="font-size:36px; font-weight:800; color:#d33b21;">${APP.userRole === 'DR' ? '42' : APP.userRole === 'CA' ? '12' : '124'}</div>
656-1834-                            <div style="font-size:12px; color:var(--slate-500); margin-top:8px;">-15% vs mois dernier</div>
657-1835-                        </div>
658-1836-                        <div class="card" style="padding:24px;">
659-1837-                            <h3 style="font-size:14px; color:var(--slate-500); margin-bottom:12px;">Délai de Résolution (Jours)</h3>
660-1838-                            <div style="font-size:36px; font-weight:800; color:#0e6944;">${APP.userRole === 'DR' ? '1.8' : APP.userRole === 'CA' ? '1.2' : '2.4'}</div>
661-1839-                            <div style="font-size:12px; color:var(--slate-500); margin-top:8px;">Objectif: < 3 jours</div>
662-1840-                        </div>
663-1841-                        <div class="card" style="padding:24px;">
664-1842-                            <h3 style="font-size:14px; color:var(--slate-500); margin-bottom:12px;">NPS (Net Promoter Score)</h3>
665-1843-                            <div style="font-size:36px; font-weight:800; color:#0e6944;">${APP.userRole === 'DR' ? '68' : APP.userRole === 'CA' ? '71' : '64'}</div>
666-1844-
667-1845-                            <div style="font-size:12px; color:var(--slate-500); margin-top:8px;">+4 points T3</div>
668-1846-                        </div>
669-1847-                    </div>
670-1848-
671-1849-                    <div class="card" style="padding:24px;">
672-1850-                        <h3 style="font-family:'Montserrat', sans-serif; font-size:16px; font-weight:700; color:var(--dark-teal); margin-bottom:16px;">Top Agences (Satisfaction Client)</h3>
673-1851-                        <div class="table-responsive">
674-1852-                            <table>
675-1853-                                <thead>
676-1854-                                    <tr><th>Code Agence</th><th>Région</th><th>NPS</th><th>Réclamations Traitées</th><th>Délai Moyen</th></tr>
677-1855-                                </thead>
678-1856-                                <tbody>
679-1857-                                    
680-1858-                                    ${APP.userRole === 'DR' ? `
681-1859-                                        <tr><td>AG-201</td><td>Rabat Agdal</td><td>68 <span style="color:#0e6944;">▲</span></td><td>32</td><td>1.8 Jours</td></tr>
682-1860-                                        <tr><td>AG-202</td><td>Rabat Hassan</td><td>65 <span style="color:#0e6944;">▲</span></td><td>28</td><td>2.1 Jours</td></tr>
683-1861-                                    ` : APP.userRole === 'CA' ? `
684-1862-                                        <tr><td>AG-201</td><td>Rabat Agdal</td><td>68 <span style="color:#0e6944;">▲</span></td><td>32</td><td>1.8 Jours</td></tr>
685-1863-                                    ` : `
686-1864-                                        <tr><td>AG-104</td><td>Casablanca Centre</td><td>72 <span style="color:#0e6944;">▲</span></td><td>45</td><td>1.2 Jours</td></tr>
687-1865-                                        <tr><td>AG-201</td><td>Rabat Agdal</td><td>68 <span style="color:#0e6944;">▲</span></td><td>32</td><td>1.8 Jours</td></tr>
688-1866-                                        <tr><td>AG-305</td><td>Marrakech Guéliz</td><td>61 <span style="color:#d33b21;">▼</span></td><td>58</td><td>3.1 Jours</td></tr>
689-1867-                                    `}
690-1868-
691-1869-                                </tbody>
692-1870-                            </table>
693-1871-                        </div>
694-1872-                    </div>
695-1873-                </div>
696-1874-            `;
697-1875-        }
698-1876-
699-1877-        function renderCommissions(container) {
700-1878-            container.innerHTML = `
701-1879-                <div class="fade-in">
702-1880-                    <div style="display:flex; align-items:center; gap:12px; margin-bottom:24px;">
703-1881-                        <span style="background:var(--light-bg); color:var(--primary-teal); padding:4px 12px; border-radius:20px; font-size:11px; font-weight:700; letter-spacing:1px; text-transform:uppercase;">Rentabilité</span>
704-1882-                        <h2 style="font-family:'Montserrat', sans-serif; font-size:24px; color:var(--dark-teal); font-weight:800; margin:0;">Suivi des Commissions</h2>
705-1883-                    </div>
706-1884-                    <div style="background:white; border-radius:12px; border:1px solid var(--sec-bg); padding:24px; box-shadow:0 2px 8px rgba(0,0,0,0.02); text-align:center;">
707-1885-                        <svg width="64" height="64" fill="none" stroke="var(--slate-300)" stroke-width="1.5" viewBox="0 0 24 24" style="margin-bottom:16px;">
708-1886-                            <path stroke-linecap="round" stroke-linejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
709-1887-                        </svg>
710-1888-                        <h3 style="font-family:'Montserrat', sans-serif; font-size:18px; color:var(--dark-teal); margin-bottom:8px;">Tableau de bord des commissions</h3>
711-1889-                        <p style="color:var(--slate-500); font-size:14px; max-width:400px; margin:0 auto;">Le reporting détaillé des commissions par ligne de métier sera disponible dans la prochaine release.</p>
712-1890-                    </div>
713-1891-                </div>
714-1892-            `;
715-1893-        }
716-1894-
717-1895-        function renderPowerbi(container) {
718-1896-            container.innerHTML = `
719-1897-                <div class="fade-in">
720-1898-                    <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:16px;">
721-1899-                        <div>
722-1900-                            <div style="display:flex; align-items:center; gap:8px; color:var(--primary-teal); font-weight:700; font-size:12px; letter-spacing:1px; text-transform:uppercase; margin-bottom:8px;">
723-1901-                                <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
724-1902-                                RENTABILITÉ
725-1903-                            </div>
726-1904-                            <h2 style="font-family:'Montserrat', sans-serif; font-size:32px; color:var(--dark-teal); font-weight:700; margin-bottom:8px;">PNB Commercial • Agences CAM 2025</h2>
727-1905-                            <p style="color:var(--slate-500); max-width:800px; line-height:1.5;">Vision consolidée du Produit Net Bancaire commercial, marges et commissions par réseau, direction régionale, groupe et portefeuille.</p>
728-1906-                        </div>
729-1907-                    </div>
730-1908-                    
731-1909-                    <div style="display:flex; gap:16px; margin-bottom:32px;">
732-1910-                        <button style="display:flex; gap:8px; align-items:center; background:white; border:1px solid #e2e8f0; border-radius:8px; padding:10px 20px; font-weight:600; color:var(--dark-teal); box-shadow:0 1px 2px rgba(0,0,0,0.05); cursor:pointer;">
733-1911-                            <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
734-1912-                            Recharger
735-1913-                        </button>
736-1914-                        <button style="display:flex; gap:8px; align-items:center; background:#0e6944; border:1px solid #0e6944; border-radius:8px; padding:10px 20px; font-weight:600; color:white; box-shadow:0 1px 2px rgba(14,105,68,0.2); cursor:pointer;">
737-1915-                            <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
738-1916-                            Exporter
739-1917-                        </button>
740-1918-                    </div>
741-1919-
742-1920-                    <div style="background:var(--surface); border-radius:24px; border:1px solid var(--sec-bg); overflow:hidden; box-shadow:0 10px 25px -5px rgba(0,0,0,0.05);">
743-1921-                        <div style="background:#0e6944; padding:16px 24px; color:white; display:flex; align-items:center; justify-content:space-between;">
744-1922-                            <div style="display:flex; align-items:center; gap:12px;">
745-1923-                                <div style="background:#F2C811; color:black; width:28px; height:28px; border-radius:6px; display:flex; align-items:center; justify-content:center; font-weight:bold; font-size:16px; font-family:'Manrope', sans-serif;">P</div>
746-1924-                                <span style="font-weight:700; font-size:16px;">Power BI • Rapport embarqué</span>
747-1925-                                <span style="display:flex; align-items:center; gap:6px; font-size:12px; color:rgba(255,255,255,0.7); margin-left:16px; font-family:'JetBrains Mono', monospace;">
748-1926-                                    <span style="width:6px; height:6px; background:#4CAF50; border-radius:50%; display:inline-block;"></span>
749-1927-                                    Tenant CAM • d45dd877...23ce
750-1928-                                </span>
751-1929-                            </div>
752-1930-                            <div style="display:flex; gap:16px;">
753-1931-                                <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" style="cursor:pointer; opacity:0.8;"><path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
754-1932-                                <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" style="cursor:pointer; opacity:0.8;"><path stroke-linecap="round" stroke-linejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"></path></svg>
755-1933-                            </div>
756-1934-                        </div>
757-1935-                        
758-1936-                        <div style="padding:20px 24px; background:#f4fbf7; border-bottom:1px solid #d1e8db; display:grid; grid-template-columns:repeat(5, 1fr); gap:20px; align-items:end;">
759-1937-                            <div>
760-1938-                                <label style="font-size:11px; font-weight:800; color:#0e6944; margin-bottom:8px; display:block; text-transform:uppercase; letter-spacing:0.5px;">Année</label>
761-1939-                                <select style="width:100%; padding:12px; border-radius:8px; border:1px solid #d1e8db; background:white; color:var(--dark-teal); font-weight:500; font-family:'Manrope', sans-serif; cursor:pointer; outline:none;"><option>Tout</option><option>2026</option><option>2025</option></select>
762-1940-                            </div>
763-1941-                            <div>
764-1942-                                <label style="font-size:11px; font-weight:800; color:#0e6944; margin-bottom:8px; display:block; text-transform:uppercase; letter-spacing:0.5px;">Mois</label>
765-1943-                                <select style="width:100%; padding:12px; border-radius:8px; border:1px solid #d1e8db; background:white; color:var(--dark-teal); font-weight:500; font-family:'Manrope', sans-serif; cursor:pointer; outline:none;"><option>Tout</option></select>
766-1944-                            </div>
767-1945-                            <div>
768-1946-                                <label style="font-size:11px; font-weight:800; color:#0e6944; margin-bottom:8px; display:block; text-transform:uppercase; letter-spacing:0.5px;">Réseau</label>
769-1947-                                <select style="width:100%; padding:12px; border-radius:8px; border:1px solid #d1e8db; background:white; color:var(--dark-teal); font-weight:500; font-family:'Manrope', sans-serif; cursor:pointer; outline:none;"><option>Tout</option></select>
770-1948-                            </div>
771-1949-                            <div>
772-1950-                                <label style="font-size:11px; font-weight:800; color:#0e6944; margin-bottom:8px; display:block; text-transform:uppercase; letter-spacing:0.5px;">DR</label>
773-1951-                                <select style="width:100%; padding:12px; border-radius:8px; border:1px solid #d1e8db; background:white; color:var(--dark-teal); font-weight:500; font-family:'Manrope', sans-serif; cursor:pointer; outline:none;"><option>Tout</option></select>
774-1952-                            </div>
775-1953-                            <div>
776-1954-                                <label style="font-size:11px; font-weight:800; color:#0e6944; margin-bottom:8px; display:block; text-transform:uppercase; letter-spacing:0.5px;">Agence</label>
777-1955-                                <select style="width:100%; padding:12px; border-radius:8px; border:1px solid #d1e8db; background:white; color:var(--dark-teal); font-weight:500; font-family:'Manrope', sans-serif; cursor:pointer; outline:none;"><option>Tout</option></select>
778-1956-                            </div>
779-1957-                            <div style="grid-column: span 2;">
780-1958-                                <label style="font-size:11px; font-weight:800; color:#0e6944; margin-bottom:8px; display:block; text-transform:uppercase; letter-spacing:0.5px;">Marché</label>
781-1959-                                <select style="width:100%; padding:12px; border-radius:8px; border:1px solid #d1e8db; background:white; color:var(--dark-teal); font-weight:500; font-family:'Manrope', sans-serif; cursor:pointer; outline:none;"><option>Tout</option></select>
782-1960-                            </div>
783-1961-                            <div style="grid-column: span 2;">
784-1962-                                <label style="font-size:11px; font-weight:800; color:#0e6944; margin-bottom:8px; display:block; text-transform:uppercase; letter-spacing:0.5px;">Portefeuille</label>
785-1963-                                <select style="width:100%; padding:12px; border-radius:8px; border:1px solid #d1e8db; background:white; color:var(--dark-teal); font-weight:500; font-family:'Manrope', sans-serif; cursor:pointer; outline:none;"><option>Tout</option></select>
786-1964-                            </div>
787-1965-                            <div>
788-1966-                                <button style="width:100%; padding:12px; display:flex; justify-content:center; gap:8px; align-items:center; background:white; color:#0e6944; border:1px solid #d1e8db; border-radius:8px; font-weight:700; cursor:pointer;">
789-1967-                                    <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
790-1968-                                    Réinitialiser
791-1969-                                </button>
792-1970-                            </div>
793-1971-                        </div>
794-1972-                        
795-1973-                        <div style="height:550px; background:#f9fafb; display:flex; flex-direction:column; align-items:center; justify-content:center; position:relative; overflow:hidden;">
796-1974-                            <div style="position:absolute; inset:0; opacity:0.03; background-image:radial-gradient(circle at 2px 2px, black 1px, transparent 0); background-size:32px 32px;"></div>
797-1975-                            <div style="display:flex; align-items:center; gap:16px; margin-bottom:32px; z-index:1;">
798-1976-                                <div style="display:flex; gap:6px; align-items:flex-end; height:48px;">
799-1977-                                    <div style="width:12px; height:24px; background:#E6C229; border-radius:2px;"></div>
800-1978-                                    <div style="width:12px; height:36px; background:#F1D302; border-radius:2px;"></div>
801-1979-                                    <div style="width:12px; height:48px; background:#F2B705; border-radius:2px;"></div>
802-1980-                                </div>
803-1981-                                <span style="font-size:36px; font-weight:300; color:#334155; font-family:'Segoe UI', system-ui, sans-serif;">Power BI</span>
804-1982-                            </div>
805-1983-                            <p style="color:#64748b; font-size:18px; font-family:'Segoe UI', system-ui, sans-serif; font-weight:400; margin-bottom:32px; z-index:1;">Connectez-vous pour voir ce rapport</p>
806-1984-                            <button style="background:#0e6944; color:white; border:none; border-radius:6px; padding:12px 32px; font-size:16px; font-weight:600; font-family:'Segoe UI', system-ui, sans-serif; cursor:pointer; box-shadow:0 4px 12px rgba(14,105,68,0.2); transition:all 0.2s; z-index:1;" onclick="this.innerHTML='Connexion en cours...'; this.style.opacity='0.8'; setTimeout(() => showToast('Authentification SSO réussie'), 1000);">Se connecter</button>
807-1985-                        </div>
808-1986-                        <div style="background:#e8f4ed; padding:16px; font-size:13px; color:#1e293b; text-align:center; border-top:1px solid #d1e8db;">
809-1987-                            Rapport sécurisé — authentification SSO au tenant CAM, affiché directement dans cette page. Si l'écran reste bloqué sur la connexion, autorisez les cookies tiers de <strong>app.powerbi.com</strong> dans le navigateur.
810-1988-                        </div>
811-1989-                    </div>
812-1990-                </div>`;
813-1991-        }        function renderPortefeuille(container) {
814-1992-            container.innerHTML = `
815-1993-                <div class="fade-in">
816-1994-                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px;">
817-1995-                        <h2 style="font-size:20px; font-weight:700; color:var(--text-main);">Portefeuille Clients (${MOCK.clients.length})</h2>
818-1996-                        <div style="display:flex; gap:12px;">
819-1997-                            <input type="text" placeholder="Rechercher (Nom, ICE...)" style="padding:10px 16px; border:1px solid var(--sec-bg); border-radius:8px; background:var(--surface); font-size:13px; width:240px;">
820-1998-                            <button class="btn btn-primary" onclick="showToast('Filtrage des clients')"><svg width="16" height="16" style="margin-right:8px;" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path></svg> Filtrer</button>
821-1999-                        </div>
822-2000-                    </div>
823-2001-                    
824-2002-                    <div class="card">
825-2003-                        <div class="table-responsive">
826-2004-                            <table>
827-2005-                                <thead>
828-2006-                                    <tr>
829-2007-                                        <th>Raison Sociale / Nom</th>
830-2008-                                        <th>Type</th>
831-2009-                                        <th>Agence</th>
832-2010-                                        <th>Encours Global</th>
833-2011-                                        <th>Score IA</th>
834-2012-                                        <th>Statut</th>
835-2013-                                        <th>Actions</th>
836-2014-                                    </tr>
837-2015-                                </thead>
838-2016-                                <tbody>
839-2017-                                    ${MOCK.clients.map(c => `
840-2018-                                        <tr>
841-2019-                                            <td style="font-weight:600; color:var(--text-main);">${c.nom}</td>
842-2020-                                            <td><span style="font-size:12px; color:var(--slate-500);">${c.type}</span></td>
843-2021-                                            <td>${c.agence}</td>
844-2022-                                            <td style="font-family:'JetBrains Mono', monospace; text-align:right;">${formatMAD(c.encours)}</td>
845-2023-                                            <td>
846-2024-                                                <div style="display:flex; align-items:center; gap:8px;">
847-2025-                                                    <div class="progress-bar" style="width:60px;"><div class="progress-fill" style="width:${c.score}%; background:${c.score < 50 ? 'var(--primary-orange)' : 'var(--primary-teal)'};"></div></div>
848-2026-                                                    <span style="font-size:12px; font-weight:600; color:${c.score < 50 ? 'var(--primary-orange)' : 'var(--text-main)'}">${c.score}/100</span>
849-2027-                                                </div>
850-2028-                                            </td>
851-2029-                                            <td>${getStatutBadge(c.statut)}</td>
852-2030-                                            <td><button class="btn btn-secondary" style="padding:4px 12px; font-size:11px;" onclick="showToast('Ouverture vue 360° pour ${c.nom}')">Vue 360°</button></td>
853-2031-                                        </tr>
854-2032-                                    `).join('')}
855-2033-                                </tbody>
856-2034-                            </table>
857-2035-                        </div>
858-2036-                    </div>
859-2037-                </div>
860-2038-            `;
861-2039-        }
862-2040-
863-2041-        // Module Engagements
864-2042-        function renderEngagements(container) {
865-2043-            container.innerHTML = `
866-2044-                <div class="fade-in">
867-2045-                    <h2 style="font-size:20px; font-weight:700; color:var(--text-main); margin-bottom:24px;">Octrois & Engagements</h2>
868-2046-                    
869-2047-                    <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:24px; margin-bottom:24px;">
870-2048-                        ${buildKPI('Demandes en attente', '24', '', false, '<path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>')}
871-2049-                        ${buildKPI('Dossiers Approuvés (Mois)', '142', '+12%', false, '<path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>')}
872-2050-                        ${buildKPI('Taux d\'Accord', '82%', '', false, '<path stroke-linecap="round" stroke-linejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>')}
873-2051-                    </div>
874-2052-
875-2053-                    <div class="card">
876-2054-                        <div class="card-header">
877-2055-                            <h3 class="chart-title" style="margin:0;">Comité de Crédit - Dossiers Récents</h3>
878-2056-                        </div>
879-2057-                        <div class="table-responsive">
880-2058-                            <table>
881-2059-                                <thead>
882-2060-                                    <tr><th>Réf. Dossier</th><th>Client</th><th>Type Crédit</th><th>Montant Demandé</th><th>Score Modèle</th><th>Statut</th><th>Action</th></tr>
883-2061-                                </thead>
884-2062-                                <tbody>
885-2063-                                    ${MOCK.dossiers.filter(d => (APP.userRole === 'DG' || APP.userRole === 'Admin') ? true : (APP.userRole === 'DR' ? d.client.length % 2 === 0 : d.client.length % 2 !== 0)).map(d => `
886-2064-                                        <tr>
887-2065-                                            <td style="font-family:'JetBrains Mono', monospace; font-size:12px;">${d.ref || d.id}</td>
888-2066-                                            <td style="font-weight:600;">${d.client}</td>
889-2067-                                            <td>${d.type}</td>
890-2068-                                            <td style="font-family:'JetBrains Mono', monospace; text-align:right;">${formatMAD(d.montant)}</td>
891-2069-                                            <td>${d.score}/100</td>
892-2070-                                            <td>${getStatutBadge(d.statut)}</td>
893-2071-                                            <td><button class="btn btn-secondary" style="padding:4px 12px; font-size:11px;">Étudier</button></td>
894-2072-                                        </tr>
895-2073-                                    `).join('')}
896-2074-                                </tbody>
897-2075-                            </table>
898-2076-                        </div>
899-2077-                    </div>
900-2078-                </div>
901-2079-            `;
902-2080-        }
903-2081-        
904-2082-        // Module Risques
905-2083-        function renderRisques(container) {
906-2084-            container.innerHTML = `
907-2085-                <div class="fade-in">
908-2086-                    <h2 style="font-size:20px; font-weight:700; color:var(--text-main); margin-bottom:24px;">Analyse des Risques & NPL</h2>
909-2087-                    
910-2088-                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:24px;">
911-2089-                        <div class="card">
912-2090-                            <h3 class="chart-title">Répartition du Risque par Marché</h3>
913-2091-                            <div style="display:flex; flex-direction:column; gap:16px; margin-top:24px;">
914-2092-                                <div><div style="display:flex; justify-content:space-between; margin-bottom:4px; font-size:12px; font-weight:600;"><span>Immobilier</span><span style="color:var(--primary-orange)">5.2% NPL</span></div><div class="progress-bar"><div class="progress-fill" style="width:75%; background:var(--primary-orange)"></div></div></div>
915-2093-                                <div><div style="display:flex; justify-content:space-between; margin-bottom:4px; font-size:12px; font-weight:600;"><span>PME</span><span style="color:var(--primary-orange)">4.8% NPL</span></div><div class="progress-bar"><div class="progress-fill" style="width:60%; background:var(--primary-orange)"></div></div></div>
916-2094-                                <div><div style="display:flex; justify-content:space-between; margin-bottom:4px; font-size:12px; font-weight:600;"><span>Corporate</span><span style="color:var(--slate-500)">2.1% NPL</span></div><div class="progress-bar"><div class="progress-fill" style="width:30%; background:var(--slate-500)"></div></div></div>
917-2095-                            </div>
918-2096-                        </div>
919-2097-                        <div class="card">
920-2098-                            <h3 class="chart-title">Matrice de Transition (Dégradation Score)</h3>
921-2099-                            <p style="font-size:13px; color:var(--slate-500); margin-bottom:16px;">Clients passés de la classe A/B vers C/D ce mois-ci.</p>
922-2100-                            <table style="width:100%; text-align:left; font-size:12px; border-collapse:collapse;">
923-2101-                                <tr style="border-bottom:1px solid var(--sec-bg);"><th style="padding:8px;">Classe Initiale</th><th style="padding:8px;">Nouvelle Classe</th><th style="padding:8px; text-align:right;">Nombre de Clients</th></tr>
924-2102-                                <tr style="border-bottom:1px solid var(--sec-bg);"><td style="padding:8px; font-weight:600; color:var(--primary-teal);">A (Faible Risque)</td><td style="padding:8px; color:var(--primary-orange);">C (Risque Elevé)</td><td style="padding:8px; text-align:right; font-weight:bold;">12</td></tr>
925-2103-                                <tr style="border-bottom:1px solid var(--sec-bg);"><td style="padding:8px; font-weight:600; color:var(--text-main);">B (Risque Modéré)</td><td style="padding:8px; color:var(--primary-orange);">D (Défaut Probable)</td><td style="padding:8px; text-align:right; font-weight:bold;">5</td></tr>
926-2104-                                <tr><td style="padding:8px; font-weight:600; color:var(--text-main);">B (Risque Modéré)</td><td style="padding:8px; color:var(--primary-orange);">C (Risque Elevé)</td><td style="padding:8px; text-align:right; font-weight:bold;">28</td></tr>
927-2105-                            </table>
928-2106-                        </div>
929-2107-                    </div>
930-2108-                </div>
931-2109-            `;
932-2110-        }
933-2111-
934-2112-        // Module Administration
935-2113-
936-2114-        function renderAdmin(container) {
937-2115-            container.innerHTML = `
938-2116-                <div class="fade-in">
939-2117-                    <h2 style="font-size:20px; font-weight:700; color:var(--text-main); margin-bottom:24px;">Administration & Power BI</h2>
940-2118-                    <div class="tabs">
941-2119-                        <div class="tab active" onclick="switchTab(this, 'admin-pbi')">Configuration Power BI</div>
942-2120-                        <div class="tab" onclick="switchTab(this, 'admin-users')">Utilisateurs Plateforme</div>
943-2121-                        <div class="tab" onclick="switchTab(this, 'admin-queries')">Journal IA</div>
944-2122-                        <div class="tab" onclick="switchTab(this, 'admin-add-dash')">Ajouter un Dashboard</div>
945-2123-                    </div>
946-2124-
947-2125-                    <div id="admin-pbi">
948-2126-                        <div class="card" style="padding:32px;">
949-2127-                            <h3 class="chart-title">Intégration Power BI Embedded</h3>
950-2128-                            <p style="color:var(--slate-500); margin-bottom:24px; line-height:1.6;">Configurez les identifiants Azure AD et le Workspace ID pour l'affichage natif des rapports Power BI dans l'application.</p>
951-2129-                            
952-2130-                            <div style="display:grid; grid-template-columns:1fr 1fr; gap:24px;">
953-2131-                                <div>
954-2132-                                    <label style="display:block; margin-bottom:8px; font-weight:600; color:var(--slate-700); font-size:13px;">Tenant ID</label>
955-2133-                                    <input type="text" value="b41b72d0-4e9f-4c26-8a69-f949f367c91d" style="width:100%; padding:12px; border:1px solid var(--sec-bg); border-radius:8px; background:var(--light-bg)" readonly>
956-2134-                                </div>
957-2135-                                <div>
958-2136-                                    <label style="display:block; margin-bottom:8px; font-weight:600; color:var(--slate-700); font-size:13px;">Client ID</label>
959-2137-                                    <input type="text" value="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" style="width:100%; padding:12px; border:1px solid var(--sec-bg); border-radius:8px; background:var(--light-bg)" readonly>
960-2138-                                </div>
961-2139-                                <div style="grid-column:1/-1;">
962-2140-                                    <label style="display:block; margin-bottom:8px; font-weight:600; color:var(--slate-700); font-size:13px;">Workspace ID (Production)</label>
963-2141-                                    <input type="text" value="wks-saham-prod-001" style="width:100%; padding:12px; border:1px solid var(--sec-bg); border-radius:8px; background:var(--light-bg)" readonly>
964-2142-                                </div>
965-2143-                            </div>
966-2144-                            <button class="btn btn-primary" style="margin-top:24px; background:var(--primary-teal); border:none;" onclick="showToast('Configuration enregistrée')">Sauvegarder Configuration</button>
967-2145-                        </div>
968-2146-                    </div>
969-2147-                    
970-2148-                    <div id="admin-users" class="hidden">
971-2149-                        <div class="card">
972-2150-                            <div class="card-header">
973-2151-                                <h3 class="chart-title" style="margin:0;">Gestion des Accès</h3>
974-2152-                                <button class="btn btn-primary" onclick="showToast('Modal ajout utilisateur')">+ Nouvel Utilisateur</button>
975-2153-                            </div>
976-2154-                            <div class="table-responsive">
977-2155-                                <table>
978-2156-                                    <thead><tr><th>Utilisateur</th><th>Email</th><th>Profil</th><th>Agence / DR</th><th>Statut</th><th>Actions</th></tr></thead>
979-2157-                                    <tbody>
980-2158-                                        ${MOCK.admins.map(a => `
981-2159-                                            <tr>
982-2160-                                                <td style="font-weight:600">${a.nom}</td>
983-2161-                                                <td>${a.email}</td>
984-2162-                                                <td><span style="background:var(--accent-teal-light); color:var(--primary-teal); padding:4px 8px; border-radius:4px; font-size:11px;">${a.profil}</span></td>
985-2163-                                                <td>${a.agence}</td>
986-2164-                                                <td>${getStatutBadge(a.statut)}</td>
987-2165-                                                <td>
988-2166-                                                    <button class="icon-btn" onclick="showToast('Modifier')"><svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg></button>
989-2167-                                                </td>
990-2168-                                            </tr>`).join('')}
991-2169-                                    </tbody>
992-2170-                                </table>
993-2171-                            </div>
994-2172-                        </div>
995-2173-                    </div>
996-2174-                    
997-2175-                    <div id="admin-add-dash" class="hidden">
998-2176-                        <div class="card" style="padding:32px;">
999-2177-                            <h3 class="chart-title">Créer un nouveau module (Power BI ou URL)</h3>
1000-2178-                            <p style="color:var(--slate-500); margin-bottom:24px; line-height:1.6;">Créez dynamiquement un nouveau lien dans le menu de gauche pour intégrer un rapport Power BI ou une page web externe.</p>
1001-2179-                            
1002---
1003-2983:    <script>
1004-2984-        function openSqlModal(sql) {
1005-2985-            const highlight = sql
1006-2986-                .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
1007-2987-                .replace(/\b(SELECT|FROM|WHERE|GROUP BY|ORDER BY|LIMIT|SUM|ASC|DESC|AND|OR|IN|INTERVAL)\b/gi, '<span style="color:#C586C0; font-weight:bold;">$1</span>')
1008-2988-                .replace(/\b(\d+)\b/g, '<span style="color:#B5CEA8;">$1</span>')
1009-2989-                .replace(/('[^']*')/g, '<span style="color:#B5CEA8;">$1</span>')
1010-2990-                .replace(/([a-zA-Z_][a-zA-Z0-9_]*\.[a-zA-Z_][a-zA-Z0-9_]*)/g, '<span style="color:#569CD6;">$1</span>');
1011-2991-            document.getElementById('sql-modal-content').innerHTML = highlight;
1012-2992-            document.getElementById('sql-modal').style.display = 'flex';
1013-2993-        }
1014:2994-    </script></body>
