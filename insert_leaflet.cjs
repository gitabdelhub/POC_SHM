const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const targetString = `                window.ChartManager.initDoughnutChart('creditChart',
                    ['Retail (Immo & Conso)', 'Entreprises & PME', 'Corporate & IB', 'Autres'],
                    [64, 20, 12, 4],
                    ['#2e4741', '#1d2b27', '#d33b21', '#e9eceb']);`;

const mapInitScript = `                window.ChartManager.initDoughnutChart('creditChart',
                    ['Retail (Immo & Conso)', 'Entreprises & PME', 'Corporate & IB', 'Autres'],
                    [64, 20, 12, 4],
                    ['#2e4741', '#1d2b27', '#d33b21', '#e9eceb']);

                if (document.getElementById('leafletMap') && typeof L !== 'undefined') {
                    // Check if map already initialized
                    if (!window._moroccoMap) {
                        const map = L.map('leafletMap').setView([31.7917, -7.0926], 5);
                        window._moroccoMap = map;
                        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
                            attribution: '&copy; OpenStreetMap &copy; CARTO',
                            subdomains: 'abcd',
                            maxZoom: 20
                        }).addTo(map);

                        const markers = [
                            { coords: [35.7595, -5.8340], size: 10, label: 'Tanger: 4.8 Md' },
                            { coords: [34.0209, -6.8416], size: 15, label: 'Rabat: 8.2 Md' },
                            { coords: [33.5731, -7.5898], size: 20, label: 'Casablanca: 12.5 Md' },
                            { coords: [31.6295, -7.9811], size: 12, label: 'Marrakech: 5.1 Md' },
                            { coords: [30.4278, -9.5981], size: 10, label: 'Agadir: 3.2 Md' },
                            { coords: [27.1253, -13.1625], size: 8, label: 'Laâyoune: 1.1 Md' },
                            { coords: [23.6848, -15.9579], size: 6, label: 'Dakhla: 0.5 Md' }
                        ];

                        markers.forEach(m => {
                            const circle = L.circleMarker(m.coords, {
                                radius: m.size,
                                fillColor: 'var(--primary-teal)',
                                color: 'var(--primary-teal)',
                                weight: 2,
                                opacity: 1,
                                fillOpacity: 0.8
                            }).addTo(map);
                            circle.bindPopup('<b>' + m.label.split(':')[0] + '</b><br>Encours: ' + m.label.split(':')[1]);
                        });
                        
                        window.addEventListener('resize', () => {
                            setTimeout(() => map.invalidateSize(), 100);
                        });
                    }
                }`;

html = html.replace(targetString, mapInitScript);
fs.writeFileSync('index.html', html, 'utf8');
console.log("Leaflet init added!");
