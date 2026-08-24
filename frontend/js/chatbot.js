/* =============================================================================
   ATTENTION - CODE NON UTILISE (conserve pour historique)
   =============================================================================

   Ce fichier N'EST PAS charge par index.html : le portail embarque sa propre
   copie de ces fonctions directement dans sa balise <script>.

   Verifie le 23/08/2026 : les fonctions ci-dessous ont DIVERGE de celles
   reellement executees dans index.html. Elles sont donc obsoletes.

   => Ne pas modifier ce fichier en esperant changer le comportement du site.
   => La version qui s'execute est celle de index.html.

   Deux options quand tu auras le temps :
     1. Supprimer frontend/js/ (le plus simple, le code est mort).
     2. Extraire pour de bon le <script> de index.html vers ces fichiers,
        puis les charger avec <script src="js/...js"></script>.
        A faire APRES la soutenance : c'est du confort de maintenance,
        pas une correction fonctionnelle.
   ============================================================================= */

/* ==========================================================================
   SAHAM BANK ANALYTICS PORTAL - SAHAMAI CHATBOT ENGINE
   ========================================================================== */

let isChatFullscreen = false;
let AI_QUERY_LOGS = [];

function toggleSahamChatFullscreen() {
    isChatFullscreen = !isChatFullscreen;
    const panel = document.getElementById('saham-chat-panel');
    const fsBtn = document.getElementById('saham-chat-fs-btn');
    if (isChatFullscreen) {
        panel.classList.add('fullscreen');
        fsBtn.innerHTML = '<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 14h6m0 0v6m0-6l-7 7m17-11h-6m0 0V4m0 6l7-7M4 10h6m0 0V4m0 6l-7-7m17 11h-6m0 0v6m0-6l7 7"></path></svg>';
        fsBtn.title = "Réduire";
    } else {
        panel.classList.remove('fullscreen');
        fsBtn.innerHTML = '<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"></path></svg>';
        fsBtn.title = "Plein écran";
    }
}

function toggleSahamChat() {
    const panel = document.getElementById('saham-chat-panel');
    const fab = document.getElementById('saham-fab');
    const isActive = panel.classList.toggle('active');
    if (isActive) {
        if (fab) fab.classList.add('hidden');
        document.getElementById('saham-chat-input').focus();
    } else {
        if (fab) fab.classList.remove('hidden');
    }
}

function initChatResize() {
    const panel = document.getElementById('saham-chat-panel');
    if (!panel || panel.dataset.resizable === '1') return;
    panel.dataset.resizable = '1';

    const MIN_W = 340, MIN_H = 320;
    const getMaxW = () => window.innerWidth - 24;
    const getMaxH = () => window.innerHeight - 24;

    const saved = localStorage.getItem('saham_chat_size');
    if (saved) {
        try {
            const s = JSON.parse(saved);
            if (s.width && s.height) {
                panel.style.width  = Math.max(MIN_W, Math.min(getMaxW(), s.width))  + 'px';
                panel.style.height = Math.max(MIN_H, Math.min(getMaxH(), s.height)) + 'px';
            }
        } catch (e) {}
    }

    panel.querySelectorAll('.saham-resize-handle').forEach(handle => {
        handle.addEventListener('mousedown', e => {
            e.preventDefault();
            e.stopPropagation();
            if (panel.classList.contains('fullscreen')) return;

            const dir = handle.dataset.dir;
            const rect = panel.getBoundingClientRect();
            const startX = e.clientX, startY = e.clientY;
            const startW = rect.width,  startH = rect.height;
            const startRight  = window.innerWidth  - rect.right;
            const startBottom = window.innerHeight - rect.bottom;

            const onMove = ev => {
                const dx = ev.clientX - startX;
                const dy = ev.clientY - startY;
                const maxW = getMaxW(), maxH = getMaxH();
                let w = startW, h = startH;

                if (dir.includes('e')) w = startW + dx;
                if (dir.includes('s')) h = startH + dy;
                if (dir.includes('w')) {
                    w = startW - dx;
                    w = Math.max(MIN_W, Math.min(maxW, w));
                    panel.style.right = startRight + 'px';
                }
                if (dir.includes('n')) {
                    h = startH - dy;
                    h = Math.max(MIN_H, Math.min(maxH, h));
                    panel.style.bottom = startBottom + 'px';
                }

                w = Math.max(MIN_W, Math.min(maxW, w));
                h = Math.max(MIN_H, Math.min(maxH, h));

                panel.style.width  = w + 'px';
                panel.style.height = h + 'px';

                localStorage.setItem('saham_chat_size', JSON.stringify({ width: w, height: h }));
            };

            const onUp = () => {
                document.removeEventListener('mousemove', onMove);
                document.removeEventListener('mouseup', onUp);
                document.body.style.cursor    = '';
                document.body.style.userSelect = '';
            };

            document.addEventListener('mousemove', onMove);
            document.addEventListener('mouseup', onUp);
            document.body.style.cursor    = getComputedStyle(handle).cursor;
            document.body.style.userSelect = 'none';
        });
    });
}

function fillSahamChat(btn) {
    const input = document.getElementById('saham-chat-input');
    input.value = btn.innerText;
    input.focus();
}

function escHtml(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, c => (
        {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]
    ));
}

function buildSahamTable(columns, rows, rowCount) {
    if (!columns || !rows || !columns.length) return '';
    const head = columns.map(c => `<th style="padding:8px; font-size:11px; font-weight:600; color:#3b504a; border-bottom:1px solid #e9eceb; text-align:left;">${escHtml(c)}</th>`).join('');
    const body = rows.map(row => `<tr>${row.map(cell => `<td style="padding:6px 8px; font-size:11px; border-bottom:1px solid #f1f5f9;">${escHtml(cell)}</td>`).join('')}</tr>`).join('');
    return `
        <table style="width:100%; border-collapse:collapse; font-size:12px; margin-top:8px; background:#f4f6f5; border-radius:6px; overflow:hidden;">
            <thead><tr>${head}</tr></thead>
            <tbody>${body}</tbody>
        </table>
        <div style="font-size:11px; color:#6b7d78; margin-top:6px;">${rowCount} ligne(s)</div>
    `;
}

function buildSahamChart(chart) {
    if (!chart || !chart.labels || !chart.labels.length) return '';
    if (chart.type === 'pie') {
        const total = chart.values.reduce((a,b)=>a+b,0) || 1;
        const segs = chart.labels.map((l,i)=>`
            <div style="display:flex;align-items:center;gap:6px;font-size:11px;color:#3b504a;">
                <span style="width:10px;height:10px;border-radius:2px;background:hsl(${(i*137)%360},60%,50%);display:inline-block;"></span>
                ${escHtml(l)} (${Math.round(chart.values[i]/total*100)}%)
            </div>`).join('');
        return `<div style="margin-top:10px;display:flex;flex-direction:column;gap:4px;">${segs}</div>`;
    }
    const W = 260, H = 140, pad = 26;
    const max = Math.max(...chart.values);
    const step = (W - pad*2) / chart.labels.length;
    let bars = '', line = '';
    const points = [];
    chart.labels.forEach((l,i)=>{
        const v = chart.values[i];
        const bh = max > 0 ? (v/max)*(H - pad*2) : 0;
        const x = pad + i*step + step/2;
        const y = H - pad - bh;
        bars += `<rect x="${(x-step*0.3).toFixed(1)}" y="${y.toFixed(1)}" width="${(step*0.6).toFixed(1)}" height="${Math.max(bh,0).toFixed(1)}" rx="2" fill="rgba(200,16,46,0.75)"></rect>`;
        points.push(`${x.toFixed(1)},${y.toFixed(1)}`);
    });
    if (chart.type === 'line') {
        line = `<polyline points="${points.join(' ')}" fill="none" stroke="#C8102E" stroke-width="2.5"></polyline>`;
    }
    const labels = chart.labels.map((l,i)=>{
        const x = pad + i*step + step/2;
        const short = String(l).length > 10 ? String(l).slice(0,10)+'…' : l;
        return `<text x="${x.toFixed(1)}" y="${H-8}" text-anchor="middle" font-size="8" fill="#6b7d78">${escHtml(short)}</text>`;
    }).join('');
    return `
        <svg width="100%" height="${H}" viewBox="0 0 ${W} ${H}" style="margin-top:10px;display:block;">
            <line x1="${pad}" y1="${H-pad}" x2="${W-pad}" y2="${H-pad}" stroke="#e9eceb"></line>
            ${bars}${line}
            ${labels}
        </svg>
    `;
}

function buildSahamAnswer(data) {
    if (data.mode === 'oob') return `<p>${escHtml(data.answer)}</p>`;
    if (data.mode === 'error') return `<p style="color:#C8102E;">${escHtml(data.answer)}</p>`;

    const textPart = data.answer ? `<p style="font-weight:500;">${escHtml(data.answer)}</p>` : '';
    const tablePart = buildSahamTable(data.columns, data.rows, data.row_count);
    const chartPart = buildSahamChart(data.chart);
    const sqlBtnId = 'sql-toggle-' + Math.random().toString(36).substr(2, 9);

    const sqlBlock = data.sql ? `
        <div style="margin-top:8px;">
            <button onclick="document.getElementById('${sqlBtnId}').style.display = document.getElementById('${sqlBtnId}').style.display === 'none' ? 'block' : 'none'"
                    style="background:none; border:none; color:#6b7d78; font-size:11px; font-weight:600; cursor:pointer; padding:0; display:flex; align-items:center; gap:4px;">
                <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path></svg>
                Requête SQL exécutée
            </button>
            <div id="${sqlBtnId}" class="saham-sql-block" style="display:none;">
                <div class="saham-sql-header">
                    <span>Base Gold PostgreSQL (READ ONLY)</span>
                    <span class="saham-sql-badge">${data.row_count} ligne(s)</span>
                </div>
                <div class="saham-sql-content">${escHtml(data.sql)}</div>
            </div>
        </div>
    ` : '';

    return `${textPart}${tablePart}${chartPart}${sqlBlock}`;
}

async function handleSahamChatSubmit(e) {
    e.preventDefault();
    const input = document.getElementById('saham-chat-input');
    const text = input.value.trim();
    if (!text) return;

    const msgs = document.getElementById('saham-chat-messages');
    const btn = document.getElementById('saham-chat-send');

    // User message
    msgs.innerHTML += `
        <div class="saham-msg user">
            <div class="bubble">${escHtml(text)}</div>
        </div>
    `;
    input.value = '';
    input.disabled = true;
    btn.disabled = true;

    // Thinking indicator
    const step2Id = 'step2-' + Date.now();
    msgs.innerHTML += `
        <div class="saham-msg bot" id="${step2Id}">
            <div class="bubble">
                <div class="saham-exec-banner">
                    <div class="saham-spinner"></div>
                    Analyse des données et génération SQL...
                </div>
            </div>
        </div>
    `;
    msgs.scrollTop = msgs.scrollHeight;

    try {
        const token = localStorage.getItem('saham_access_token');
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = 'Bearer ' + token;
        const r = await fetch(API_BASE + '/ai/ask', {
            method: 'POST',
            headers,
            body: JSON.stringify({ question: text })
        });
        if (!r.ok) throw new Error('Erreur serveur ' + r.status);
        const data = await r.json();

        document.getElementById(step2Id).style.display = 'none';
        msgs.innerHTML += `
            <div class="saham-msg bot">
                <div class="bubble">
                    ${buildSahamAnswer(data)}
                </div>
            </div>
        `;
        loadAiLogs();
    } catch (err) {
        document.getElementById(step2Id).style.display = 'none';
        msgs.innerHTML += `
            <div class="saham-msg bot">
                <div class="bubble">
                    <p style="color:#C8102E;">Désolé, je n'ai pas pu analyser cette question. ${escHtml(err.message)}</p>
                </div>
            </div>
        `;
        loadAiLogs();
    }

    msgs.scrollTop = msgs.scrollHeight;
    input.disabled = false;
    btn.disabled = false;
    input.focus();
}

async function loadAiLogs() {
    const tbody = document.getElementById('queries-tbody');
    if (tbody) {
        tbody.innerHTML = `<tr><td colspan="6" style="padding:16px; text-align:center; font-size:12px; color:var(--slate-500);"><span style="display:inline-flex;align-items:center;gap:8px;"><span style="width:14px;height:14px;border:2px solid #e9eceb;border-top-color:var(--primary-teal);border-radius:50%;animation:spin 0.8s linear infinite;display:inline-block;"></span>Chargement...</span></td></tr>`;
    }
    try {
        const data = await apiGet('/ai/logs?limit=100');
        if (data && Array.isArray(data)) {
            AI_QUERY_LOGS = data;
            if (tbody) {
                if (!data.length) {
                    tbody.innerHTML = `<tr><td colspan="6" style="padding:20px; text-align:center; font-size:12px; color:var(--slate-500);">Aucune requête pour l'instant. Posez une question à SahamAI.</td></tr>`;
                    return;
                }
                tbody.innerHTML = data.map(q => {
                    const statusColor = q.status === 'success' ? '#10B981' : q.status === 'error' ? '#EF4444' : '#F59E0B';
                    const statusLabel = q.status === 'success' ? 'Succès' : q.status === 'error' ? 'Erreur' : (q.status || '—');
                    const dateStr = q.created_at ? new Date(q.created_at).toLocaleString('fr-FR') : '—';
                    return `
                    <tr style="transition:background 0.15s;" onmouseover="this.style.background='#f4f6f5'" onmouseout="this.style.background=''">
                        <td style="padding:12px; font-size:12px; color:var(--slate-500); border-bottom:1px solid #f1f5f9; white-space:nowrap;">${escHtml(dateStr)}</td>
                        <td style="padding:12px; border-bottom:1px solid #f1f5f9;">
                            <span style="background:var(--accent-teal-light); color:var(--primary-teal); padding:4px 8px; border-radius:4px; font-size:11px; font-weight:600;">${escHtml(q.user_nom || q.user_id || 'Inconnu')}</span>
                        </td>
                        <td style="padding:12px; max-width:250px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; border-bottom:1px solid #f1f5f9;" title="${escHtml(q.question)}">${escHtml(q.question)}</td>
                        <td style="padding:12px; max-width:300px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; font-family:'JetBrains Mono', monospace; font-size:11px; color:var(--slate-500); border-bottom:1px solid #f1f5f9;" title="${escHtml(q.sql || '')}">${escHtml(q.sql || '—')}</td>
                        <td style="padding:12px; border-bottom:1px solid #f1f5f9;">
                            <span style="display:inline-flex;align-items:center;gap:5px;font-size:11px;font-weight:700;color:${statusColor};">
                                <span style="width:6px;height:6px;border-radius:50%;background:${statusColor};display:inline-block;"></span>
                                ${escHtml(statusLabel)}
                            </span>
                        </td>
                        <td style="padding:12px; font-weight:600; font-size:12px; border-bottom:1px solid #f1f5f9;">${q.row_count !== null && q.row_count !== undefined ? q.row_count + ' lignes' : '—'}</td>
                        <td style="padding:12px; font-family:'JetBrains Mono', monospace; font-size:12px; border-bottom:1px solid #f1f5f9; white-space:nowrap;">${q.duration_ms !== null ? q.duration_ms + ' ms' : '—'}</td>
                    </tr>`;
                }).join('');
            }
        }
    } catch(e) {}
}

document.addEventListener('DOMContentLoaded', initChatResize);
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    initChatResize();
}
