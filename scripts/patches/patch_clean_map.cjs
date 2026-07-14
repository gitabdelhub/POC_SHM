const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const oldStr = `<div class="chart-content" style="position:relative; width:100%; height:400px; background:var(--light-bg); border-radius:8px; border:1px solid #e2e8f0; overflow:hidden; display: flex; justify-content: center; align-items: center;">
                            <div style="position: relative; height: 100%; aspect-ratio: 400/600; padding: 0; max-width: 100%;">
                                <!-- Complete Morocco map -->`;

const newStr = `<div class="chart-content" style="position:relative; width:100%; height:400px; background:var(--light-bg); border-radius:8px; border:1px solid #e2e8f0; overflow:hidden; display: flex; justify-content: center; align-items: center;">
                                <!-- Complete Morocco map -->`;

if (html.includes(oldStr)) {
    html = html.replace(oldStr, newStr);
    
    // Also remove the extra closing </div>
    const oldEndStr = `                                </svg>
                            </div>
                        </div>
                    </div>
                    \` : ''}`;

    const newEndStr = `                                </svg>
                        </div>
                    </div>
                    \` : ''}`;
    
    html = html.replace(oldEndStr, newEndStr);
    fs.writeFileSync('index.html', html, 'utf8');
    console.log("Map cleaned");
} else {
    console.log("Could not find start");
}
