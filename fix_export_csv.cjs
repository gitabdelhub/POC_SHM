const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const regex = /function exportQueriesCSV\(\) \{[\s\S]*?\}/;

const newCode = `function exportQueriesCSV() {
            let csvContent = "ID;Date;Utilisateur;Question Posée;Statut;Temps (ms);Résultats;Tables Interrogées\\n";
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
                csvContent += row + "\\n";
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
        }`;

html = html.replace(regex, newCode);
fs.writeFileSync('index.html', html);
