const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const target = `const queriesHtml = MOCK.queries.map(q => \`
                            <tr>
                                <td style="font-size:12px; color:var(--slate-500);">\${q.date}</td>
                                <td><span style="background:var(--accent-teal-light); color:var(--primary-teal); padding:4px 8px; border-radius:4px; font-size:11px; font-weight:600;">\${q.user}</span></td>
                                <td style="max-width:250px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="\${q.question.replace(/"/g, '&quot;')}">\${q.question}</td>
                                <td style="max-width:300px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; font-family:'JetBrains Mono', monospace; font-size:11px; color:var(--slate-500);" title="\${q.sql.replace(/"/g, '&quot;')}">\${q.sql}</td>
                                <td style="font-weight:600;">\${q.results} lignes</td>
                                <td style="font-family:'JetBrains Mono', monospace; font-size:12px;">\${q.time} ms</td>
                            </tr>
                        \`).join('');`;

const replace = `const queriesHtml = MOCK.queries.map(q => \`
                                <tr>
                                    <td style="padding:12px; font-size:12px; color:var(--slate-500); border-bottom:1px solid #f1f5f9;">\${q.date}</td>
                                    <td style="padding:12px; border-bottom:1px solid #f1f5f9;">
                                        <span style="background:var(--accent-teal-light); color:var(--primary-teal); padding:4px 8px; border-radius:4px; font-size:11px; font-weight:600;">\${q.user}</span>
                                    </td>
                                    <td style="padding:12px; max-width:250px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; border-bottom:1px solid #f1f5f9;" title="\${q.question.replace(/"/g, '&quot;')}">\${q.question}</td>
                                    <td style="padding:12px; max-width:300px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; font-family:'JetBrains Mono', monospace; font-size:11px; color:var(--slate-500); border-bottom:1px solid #f1f5f9;" title="\${q.sql ? q.sql.replace(/"/g, '&quot;') : ''}">\${q.sql}</td>
                                    <td style="padding:12px; font-weight:600; font-size:12px; border-bottom:1px solid #f1f5f9;">\${q.results} lignes</td>
                                    <td style="padding:12px; font-family:'JetBrains Mono', monospace; font-size:12px; border-bottom:1px solid #f1f5f9;">\${q.time} ms</td>
                                </tr>
                        \`).join('');`;

if(html.includes(target)) {
    html = html.replace(target, replace);
    fs.writeFileSync('index.html', html, 'utf8');
    console.log("tbody updated.");
} else {
    console.log("Not found.");
}
