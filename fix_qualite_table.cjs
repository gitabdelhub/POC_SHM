const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const oldTableRows = /<tr><td>AG-104<\/td><td>Casablanca Centre<\/td><td>72 <span style="color:#0e6944;">▲<\/span><\/td><td>45<\/td><td>1.2 Jours<\/td><\/tr>[\s\S]*?<tr><td>AG-305<\/td><td>Marrakech Guéliz<\/td><td>61 <span style="color:#d33b21;">▼<\/span><\/td><td>58<\/td><td>3.1 Jours<\/td><\/tr>/;

const newTableRows = `
                                    \${APP.userRole === 'DR' ? \`
                                        <tr><td>AG-201</td><td>Rabat Agdal</td><td>68 <span style="color:#0e6944;">▲</span></td><td>32</td><td>1.8 Jours</td></tr>
                                        <tr><td>AG-202</td><td>Rabat Hassan</td><td>65 <span style="color:#0e6944;">▲</span></td><td>28</td><td>2.1 Jours</td></tr>
                                    \` : APP.userRole === 'CA' ? \`
                                        <tr><td>AG-201</td><td>Rabat Agdal</td><td>68 <span style="color:#0e6944;">▲</span></td><td>32</td><td>1.8 Jours</td></tr>
                                    \` : \`
                                        <tr><td>AG-104</td><td>Casablanca Centre</td><td>72 <span style="color:#0e6944;">▲</span></td><td>45</td><td>1.2 Jours</td></tr>
                                        <tr><td>AG-201</td><td>Rabat Agdal</td><td>68 <span style="color:#0e6944;">▲</span></td><td>32</td><td>1.8 Jours</td></tr>
                                        <tr><td>AG-305</td><td>Marrakech Guéliz</td><td>61 <span style="color:#d33b21;">▼</span></td><td>58</td><td>3.1 Jours</td></tr>
                                    \`}
`;

html = html.replace(oldTableRows, newTableRows);
fs.writeFileSync('index.html', html);
