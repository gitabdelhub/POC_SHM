const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const regex = /<h2 style="font-family:'Montserrat', sans-serif; font-size:24px; color:var\(--dark-teal\); font-weight:800; margin:0;">Performances Financières & Commerciales<\/h2>\s*<\/div>/;

const newHeader = `<h2 style="font-family:'Montserrat', sans-serif; font-size:24px; color:var(--dark-teal); font-weight:800; margin:0; flex:1;">Performances Financières & Commerciales</h2>
                        <button onclick="exportDashCSV()" style="background:var(--primary-teal); color:white; border:none; padding:8px 16px; border-radius:6px; font-size:12px; font-weight:600; cursor:pointer; display:flex; align-items:center; gap:6px;">
                            <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg> Exporter CSV
                        </button>
                    </div>`;

html = html.replace(regex, newHeader);

const dashExportFunc = `
        function exportDashCSV() {
            let csv = "Indicateur;Valeur\\nProduit Net Bancaire;1.42 Md MAD\\nEncours Crédits;45.8 Md MAD\\nEncours Dépôts;52.4 Md MAD\\nCoût du Risque;0.85%\\n";
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
`;

html = html.replace('function exportQueriesCSV', dashExportFunc + '\n        function exportQueriesCSV');

fs.writeFileSync('index.html', html);
