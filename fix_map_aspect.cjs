const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf-8');

const search = '<div class="chart-content" style="padding-top:40px; text-align:center; flex:1; display:flex; align-items:center; justify-content:center;">';
const replace = '<div class="chart-content" style="padding-top:40px; text-align:center; flex:1; display:flex; align-items:center; justify-content:center; overflow: hidden;">\n<div style="position:relative; aspect-ratio: 207 / 516; max-height: 100%; max-width: 100%; margin: 0 auto; display:flex; align-items:center; justify-content:center;">';

html = html.replace(search, replace);

// We need to close the div right before <!-- Detailed KPIs --> or similar.
// Let's find where the map container closes.
// The map bubbles end at </div> for the bubbles, then </div> for chart-content, then </div> for fullscreen-capable, then </div> for the row.
const searchClose = `
                            </div>
                        </div>
                        </div>
                    </div>
                    \` : ''}
                      
                    <!-- Detailed KPIs -->
`;
const replaceClose = `
                            </div>
                            </div>
                        </div>
                        </div>
                    </div>
                    \` : ''}
                      
                    <!-- Detailed KPIs -->
`;
html = html.replace(searchClose, replaceClose);

fs.writeFileSync('index.html', html);
console.log('Map aspect ratio fixed.');
