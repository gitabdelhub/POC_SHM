const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const additionalDetails = `
                        <!-- Objectifs Régionaux -->
                        <div style="flex:1; background:white; border-radius:12px; border:1px solid var(--sec-bg); box-shadow:0 2px 8px rgba(0,0,0,0.02); overflow:hidden; display:flex; flex-direction:column; margin-top:24px;">
                            <div style="padding:20px 24px; border-bottom:1px solid var(--sec-bg); display:flex; justify-content:space-between; align-items:center;">
                                <h3 style="font-family:'Montserrat', sans-serif; font-size:16px; font-weight:700; color:var(--dark-teal); margin:0;">Réalisation des Objectifs (PNB)</h3>
                            </div>
                            <div style="padding:0;">
                                <table style="width:100%; border-collapse:collapse; font-size:13px; text-align:left;">
                                    <thead>
                                        <tr style="background:var(--light-bg); border-bottom:1px solid var(--sec-bg); color:var(--slate-500);">
                                            <th style="padding:12px 24px; font-weight:600;">Région</th>
                                            <th style="padding:12px 24px; font-weight:600;">Réalisé (M MAD)</th>
                                            <th style="padding:12px 24px; font-weight:600;">Objectif (M MAD)</th>
                                            <th style="padding:12px 24px; font-weight:600;">Taux</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr style="border-bottom:1px solid var(--sec-bg);">
                                            <td style="padding:12px 24px; font-weight:600; color:var(--dark-teal);">Casablanca</td>
                                            <td style="padding:12px 24px;">450</td>
                                            <td style="padding:12px 24px; color:var(--slate-500);">420</td>
                                            <td style="padding:12px 24px;"><span style="color:#10b981; font-weight:700; background:#ecfdf5; padding:2px 6px; border-radius:4px;">107%</span></td>
                                        </tr>
                                        <tr style="border-bottom:1px solid var(--sec-bg);">
                                            <td style="padding:12px 24px; font-weight:600; color:var(--dark-teal);">Rabat - Salé</td>
                                            <td style="padding:12px 24px;">320</td>
                                            <td style="padding:12px 24px; color:var(--slate-500);">345</td>
                                            <td style="padding:12px 24px;"><span style="color:var(--primary-orange); font-weight:700; background:#fef2f2; padding:2px 6px; border-radius:4px;">92%</span></td>
                                        </tr>
                                        <tr style="border-bottom:1px solid var(--sec-bg);">
                                            <td style="padding:12px 24px; font-weight:600; color:var(--dark-teal);">Marrakech - Safi</td>
                                            <td style="padding:12px 24px;">180</td>
                                            <td style="padding:12px 24px; color:var(--slate-500);">175</td>
                                            <td style="padding:12px 24px;"><span style="color:#10b981; font-weight:700; background:#ecfdf5; padding:2px 6px; border-radius:4px;">102%</span></td>
                                        </tr>
                                        <tr>
                                            <td style="padding:12px 24px; font-weight:600; color:var(--dark-teal);">Tanger - Tétouan</td>
                                            <td style="padding:12px 24px;">210</td>
                                            <td style="padding:12px 24px; color:var(--slate-500);">215</td>
                                            <td style="padding:12px 24px;"><span style="color:var(--slate-700); font-weight:700; background:var(--sec-bg); padding:2px 6px; border-radius:4px;">97%</span></td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
`;

html = html.replace('<!-- Transaction History -->', additionalDetails + '\n                        <!-- Transaction History -->');

fs.writeFileSync('index.html', html);
