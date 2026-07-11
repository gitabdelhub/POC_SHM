const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const badLoginSVG = `<svg viewBox="0 0 100 100" width="44" height="44" style="overflow:visible;">
                        <path d="M70,10 C20,10 10,60 40,80 C60,95 95,65 75,30 C55,-5 20,25 25,60 C30,95 70,100 90,80" fill="none" stroke="#D32F2F" stroke-width="6" stroke-linecap="round"/>
                        <path d="M15,50 C40,70 70,80 85,50" fill="none" stroke="#D32F2F" stroke-width="6" stroke-linecap="round"/>
                    </svg>`;

const goodLoginSVG = `<svg viewBox="0 0 100 100" width="44" height="44" style="overflow:visible;">
                        <path d="M30,70 C 50,90 90,60 70,30 C 50,0 10,30 30,50 C 50,70 90,40 70,10" fill="none" stroke="#D32F2F" stroke-width="4" stroke-linecap="round"/>
                        <path d="M20,60 C 40,80 80,50 60,20" fill="none" stroke="#D32F2F" stroke-width="4" stroke-linecap="round"/>
                        <circle cx="65" cy="25" r="4" fill="#D32F2F"/>
                    </svg>`;

html = html.replace(badLoginSVG, goodLoginSVG);

const badSidebarSVG = `<svg viewBox="0 0 100 100" width="32" height="32" style="flex-shrink:0; overflow:visible;">
                    <path d="M70,10 C20,10 10,60 40,80 C60,95 95,65 75,30 C55,-5 20,25 25,60 C30,95 70,100 90,80" fill="none" stroke="#D32F2F" stroke-width="8" stroke-linecap="round"/>
                    <path d="M15,50 C40,70 70,80 85,50" fill="none" stroke="#D32F2F" stroke-width="8" stroke-linecap="round"/>
                </svg>`;

const goodSidebarSVG = `<svg viewBox="0 0 100 100" width="32" height="32" style="flex-shrink:0; overflow:visible;">
                    <path d="M30,70 C 50,90 90,60 70,30 C 50,0 10,30 30,50 C 50,70 90,40 70,10" fill="none" stroke="#D32F2F" stroke-width="5" stroke-linecap="round"/>
                    <path d="M20,60 C 40,80 80,50 60,20" fill="none" stroke="#D32F2F" stroke-width="5" stroke-linecap="round"/>
                    <circle cx="65" cy="25" r="4" fill="#D32F2F"/>
                </svg>`;

html = html.replace(badSidebarSVG, goodSidebarSVG);

fs.writeFileSync('index.html', html);
console.log('Fixed logos 2!');
