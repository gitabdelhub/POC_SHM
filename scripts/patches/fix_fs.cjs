const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const targetFunc = `        function toggleFullscreen(btn) {
            const card = btn.closest('.fullscreen-capable');
            if (!card) return;
            
            const isFullscreen = card.classList.contains('fullscreen-active');
            
            if (!isFullscreen) {
                // Going fullscreen
                // 1. Create placeholder to prevent layout shift of other cards
                const rect = card.getBoundingClientRect();
                const placeholder = document.createElement('div');
                placeholder.className = 'fullscreen-placeholder';
                placeholder.style.width = rect.width + 'px';
                placeholder.style.height = rect.height + 'px';
                // Copy flex properties so siblings don't stretch
                const computed = getComputedStyle(card);
                placeholder.style.flex = computed.flex;
                placeholder.style.margin = computed.margin;
                card.parentNode.insertBefore(placeholder, card);
                
                card.classList.add('fullscreen-active');
                
                btn.innerHTML = \`<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg>\`;
            } else {
                // Leaving fullscreen
                card.classList.remove('fullscreen-active');
                
                const placeholder = card.previousElementSibling;
                if (placeholder && placeholder.classList.contains('fullscreen-placeholder')) {
                    placeholder.remove();
                }
                
                btn.innerHTML = \`<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"></path></svg>\`;
            }

            setTimeout(() => {
                window.dispatchEvent(new Event('resize'));
            }, 50);
        }`;

const replaceFunc = `        function toggleFullscreen(btn) {
            const card = btn.closest('.fullscreen-capable');
            if (!card) return;
            
            const isFullscreen = card.classList.contains('fullscreen-active');
            
            if (!isFullscreen) {
                // Going fullscreen
                const rect = card.getBoundingClientRect();
                const placeholder = document.createElement('div');
                placeholder.className = 'fullscreen-placeholder';
                placeholder.id = 'active-fullscreen-placeholder';
                placeholder.style.width = rect.width + 'px';
                placeholder.style.height = rect.height + 'px';
                const computed = getComputedStyle(card);
                placeholder.style.flex = computed.flex;
                placeholder.style.margin = computed.margin;
                
                card.parentNode.insertBefore(placeholder, card);
                
                // Move card to body to escape all transform contexts
                document.body.appendChild(card);
                card.classList.add('fullscreen-active');
                
                btn.innerHTML = \`<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg>\`;
            } else {
                // Leaving fullscreen
                card.classList.remove('fullscreen-active');
                
                const placeholder = document.getElementById('active-fullscreen-placeholder');
                if (placeholder) {
                    placeholder.parentNode.insertBefore(card, placeholder);
                    placeholder.remove();
                }
                
                btn.innerHTML = \`<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"></path></svg>\`;
            }

            setTimeout(() => {
                window.dispatchEvent(new Event('resize'));
            }, 50);
        }`;

if(html.includes(targetFunc)) {
    html = html.replace(targetFunc, replaceFunc);
    fs.writeFileSync('index.html', html, 'utf8');
    console.log("Replaced");
} else {
    console.log("Not found");
}
