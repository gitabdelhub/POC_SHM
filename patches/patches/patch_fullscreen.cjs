const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf-8');

// 1. Add CSS
const cssCode = `
        /* Fullscreen styles */
        .fullscreen-active {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            z-index: 9999 !important;
            border-radius: 0 !important;
            margin: 0 !important;
            max-height: none !important;
            display: flex !important;
            flex-direction: column !important;
            overflow: auto !important;
        }
        .btn-fullscreen {
            background: none;
            border: none;
            color: var(--slate-500);
            cursor: pointer;
            padding: 4px;
            border-radius: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .btn-fullscreen:hover {
            background: var(--sec-bg);
            color: var(--dark-teal);
        }
`;
if (!html.includes('.fullscreen-active')) {
    html = html.replace('</style>', cssCode + '</style>');
}

// 2. Add JS function
const jsCode = `
        function toggleFullscreen(btn) {
            const card = btn.closest('.fullscreen-capable');
            if (!card) return;
            
            card.classList.toggle('fullscreen-active');
            
            if (card.classList.contains('fullscreen-active')) {
                btn.innerHTML = \`<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg>\`;
            } else {
                btn.innerHTML = \`<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"></path></svg>\`;
            }

            setTimeout(() => {
                window.dispatchEvent(new Event('resize'));
            }, 50);
        }
`;
if (!html.includes('function toggleFullscreen')) {
    html = html.replace('function toggleSidebar()', jsCode + '\n        function toggleSidebar()');
}

fs.writeFileSync('index.html', html);
console.log('CSS and JS injected.');
