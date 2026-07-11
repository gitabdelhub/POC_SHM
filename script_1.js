
        function openSqlModal(sql) {
            const highlight = sql
                .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
                .replace(/\b(SELECT|FROM|WHERE|GROUP BY|ORDER BY|LIMIT|SUM|ASC|DESC|AND|OR|IN|INTERVAL)\b/gi, '<span style="color:#C586C0; font-weight:bold;">$1</span>')
                .replace(/\b(\d+)\b/g, '<span style="color:#B5CEA8;">$1</span>')
                .replace(/('[^']*')/g, '<span style="color:#B5CEA8;">$1</span>')
                .replace(/([a-zA-Z_][a-zA-Z0-9_]*\.[a-zA-Z_][a-zA-Z0-9_]*)/g, '<span style="color:#569CD6;">$1</span>');
            document.getElementById('sql-modal-content').innerHTML = highlight;
            document.getElementById('sql-modal').style.display = 'flex';
        }
    