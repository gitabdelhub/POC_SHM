const fs = require('fs');

let content = fs.readFileSync('index.html', 'utf8');

const cssBlock = `
        /* Styles pour l'agrandissement (Fullscreen) */
        .chart-fullscreen {
            position: fixed !important;
            top: 50% !important;
            left: 50% !important;
            transform: translate(-50%, -50%) !important;
            width: 90vw !important;
            height: 90vh !important;
            z-index: 9999 !important;
            box-shadow: 0 0 50px rgba(0,0,0,0.8) !important;
            background: var(--surface) !important;
            overflow: auto !important;
        }
        .expand-btn {
            position: absolute;
            top: 16px;
            right: 16px;
            background: var(--light-bg);
            border: 1px solid var(--sec-bg);
            color: var(--slate-700);
            border-radius: 4px;
            padding: 6px 10px;
            cursor: pointer;
            font-size: 12px;
            font-weight: 600;
            z-index: 100;
            transition: background 0.2s;
        }
        .expand-btn:hover {
            background: var(--sec-bg);
        }
        .chart-container, #map-container {
            position: relative;
        }
`;

if (!content.includes('.chart-fullscreen')) {
    content = content.replace('</style>', cssBlock + '\n    </style>');
}

const jsBlock = `
    <!-- Fullscreen Expand Logic -->
    <script>
        document.addEventListener('DOMContentLoaded', () => {
            const observer = new MutationObserver(() => {
                const containers = document.querySelectorAll('.chart-container, #map-container');
                containers.forEach(container => {
                    if(!container.querySelector('.expand-btn')) {
                        const btn = document.createElement('button');
                        btn.className = 'expand-btn';
                        btn.innerHTML = '🔍 Agrandir';
                        
                        // Prevent click from bubbling up
                        btn.onclick = (e) => {
                            e.stopPropagation();
                            
                            // Si c'est déjà en plein écran
                            if (container.classList.contains('chart-fullscreen')) {
                                container.classList.remove('chart-fullscreen');
                                btn.innerHTML = '🔍 Agrandir';
                                
                                // Remove overlay
                                const overlay = document.getElementById('fs-overlay');
                                if (overlay) overlay.remove();
                                
                            } else {
                                // Mettre en plein écran
                                container.classList.add('chart-fullscreen');
                                btn.innerHTML = '✖ Réduire';
                                
                                // Ajouter un overlay sombre derrière
                                const overlay = document.createElement('div');
                                overlay.id = 'fs-overlay';
                                overlay.style.position = 'fixed';
                                overlay.style.top = '0';
                                overlay.style.left = '0';
                                overlay.style.width = '100vw';
                                overlay.style.height = '100vh';
                                overlay.style.background = 'rgba(0,0,0,0.5)';
                                overlay.style.zIndex = '9998';
                                overlay.onclick = () => btn.click(); // Close when clicking outside
                                document.body.appendChild(overlay);
                            }
                        };
                        container.appendChild(btn);
                    }
                });
            });
            observer.observe(document.body, { childList: true, subtree: true });
        });
    </script>
`;

if (!content.includes('Fullscreen Expand Logic')) {
    content = content.replace('</body>', jsBlock + '\n</body>');
}

fs.writeFileSync('index.html', content);
console.log('index.html patched with expand logic successfully.');
