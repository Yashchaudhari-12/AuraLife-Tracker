/**
 * AnalyticsV2 — Pure-SVG Chart Engine (no external libraries)
 *
 * Exports four chart renderers:
 *   renderWeeklyChart(containerId)          — 7-bar XP chart for last 7 days
 *   renderMonthlyChart(containerId)         — 30-day area/line activity chart
 *   renderHabitConsistency(containerId, habits) — horizontal completion bars
 *   renderGoalRings(containerId)            — 4 completion rings (Daily/Weekly/Monthly/Yearly)
 *
 * All charts:
 *   • Pure SVG with viewBox (responsive)
 *   • Read from localStorage (auralife_activity_log, auralife_tasks)
 *   • Handle empty data gracefully
 *   • Use the app's CSS custom-property palette
 */

export const AnalyticsV2 = {

    // ─── localStorage helpers ─────────────────────────────────────────────────

    /** Returns activity log: object keyed by 'YYYY-MM-DD' */
    _getActivityLog() {
        try { return JSON.parse(localStorage.getItem('auralife_activity_log') || '{}'); }
        catch (_) { return {}; }
    },

    /** Returns tasks data structure as stored by TaskManager */
    _getTasksData() {
        try {
            return JSON.parse(localStorage.getItem('auralife_tasks') || 'null') || {
                daily:   { tasks: [], history: [] },
                weekly:  { tasks: [], history: [] },
                monthly: { tasks: [], history: [] },
                yearly:  { tasks: [], history: [] },
            };
        } catch (_) {
            return { daily: { tasks: [], history: [] }, weekly: { tasks: [], history: [] }, monthly: { tasks: [], history: [] }, yearly: { tasks: [], history: [] } };
        }
    },

    // ─── Date utilities ───────────────────────────────────────────────────────

    _todayStr() {
        return new Date().toISOString().split('T')[0];
    },

    /**
     * Return an array of N date strings (YYYY-MM-DD) ending today, oldest first.
     * @param {number} n
     */
    _lastNDays(n) {
        const result = [];
        const today  = new Date();
        today.setHours(0, 0, 0, 0);
        for (let i = n - 1; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(today.getDate() - i);
            result.push(d.toISOString().split('T')[0]);
        }
        return result;
    },

    /** Short weekday label from date string */
    _shortWeekday(dateStr) {
        const [y, m, d] = dateStr.split('-').map(Number);
        return new Date(y, m - 1, d).toLocaleDateString('en-US', { weekday: 'short' });
    },

    /** Short date label e.g. "Jul 4" */
    _shortDate(dateStr) {
        const [y, m, d] = dateStr.split('-').map(Number);
        return new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    },

    // ─── SVG helpers ──────────────────────────────────────────────────────────

    /** Wrap SVG markup in a responsive container with a unique defs section */
    _svgWrap(width, height, content, defs = '') {
        return `
            <svg viewBox="0 0 ${width} ${height}" width="100%" style="overflow:visible;display:block;"
                 xmlns="http://www.w3.org/2000/svg">
                <defs>${defs}</defs>
                ${content}
            </svg>
        `;
    },

    /** Render a centred "No data yet" message inside the SVG bounds */
    _emptyState(width, height, message = 'No data yet') {
        return this._svgWrap(width, height, `
            <text x="${width / 2}" y="${height / 2 - 10}" text-anchor="middle"
                  font-size="28" opacity="0.25">📊</text>
            <text x="${width / 2}" y="${height / 2 + 18}" text-anchor="middle"
                  fill="#6b7280" font-size="13" font-family="Inter, sans-serif">${message}</text>
        `);
    },

    // ─── 1. Weekly XP Bar Chart ───────────────────────────────────────────────

    /**
     * 7-bar vertical bar chart showing XP earned each day for the last 7 days.
     * @param {string} containerId
     */
    renderWeeklyChart(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const log     = this._getActivityLog();
        const days    = this._lastNDays(7);
        const todayStr = this._todayStr();

        const values = days.map(d => (log[d] && log[d].xpEarned) ? log[d].xpEarned : 0);
        const maxVal = Math.max(...values, 1);   // guard against all-zero

        if (values.every(v => v === 0)) {
            container.innerHTML = this._emptyState(560, 220, 'No XP earned in the last 7 days');
            return;
        }

        // SVG dimensions
        const W = 560, H = 220;
        const padL = 44, padR = 16, padT = 28, padB = 44;
        const chartW = W - padL - padR;
        const chartH = H - padT - padB;
        const barGroupW = chartW / 7;
        const barW = Math.max(barGroupW * 0.52, 16);

        // Y-axis grid lines + labels
        const ySteps = 4;
        let gridLines = '';
        let yLabels   = '';
        for (let s = 0; s <= ySteps; s++) {
            const val  = Math.round((maxVal / ySteps) * s);
            const y    = padT + chartH - (s / ySteps) * chartH;
            gridLines += `<line x1="${padL}" y1="${y}" x2="${W - padR}" y2="${y}"
                               stroke="rgba(255,255,255,0.05)" stroke-width="1"/>`;
            yLabels   += `<text x="${padL - 6}" y="${y + 4}" text-anchor="end"
                               fill="#6b7280" font-size="10" font-family="Inter, sans-serif">${val}</text>`;
        }

        // Bars + value labels + x-axis labels
        let bars = '';
        days.forEach((dateStr, i) => {
            const val     = values[i];
            const barH    = (val / maxVal) * chartH;
            const x       = padL + i * barGroupW + (barGroupW - barW) / 2;
            const y       = padT + chartH - barH;
            const isToday = dateStr === todayStr;
            const label   = this._shortWeekday(dateStr);
            const gradId  = `wkBar-${i}`;

            // Glow rect for today
            const glow = isToday
                ? `<rect x="${x - 3}" y="${y - 3}" width="${barW + 6}" height="${barH + 6}"
                          rx="8" fill="rgba(6,182,212,0.12)" filter="url(#wkGlow)"/>`
                : '';

            bars += `
                <defs>
                    <linearGradient id="${gradId}" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%"   stop-color="${isToday ? '#06b6d4' : '#8b5cf6'}"/>
                        <stop offset="100%" stop-color="${isToday ? '#8b5cf6' : '#4c1d95'}"/>
                    </linearGradient>
                </defs>
                <!-- Background track -->
                <rect x="${x}" y="${padT}" width="${barW}" height="${chartH}"
                      rx="5" fill="rgba(255,255,255,0.03)"/>
                ${glow}
                <!-- Bar (animated via CSS transition, set height via style) -->
                <rect x="${x}" y="${y}" width="${barW}" height="${barH}"
                      rx="5" fill="url(#${gradId})"
                      style="transform-origin: ${x + barW / 2}px ${padT + chartH}px;
                             animation: wkBarGrow 0.6s cubic-bezier(0.34,1.56,0.64,1) ${i * 60}ms both;">
                </rect>
                <!-- Value label above bar -->
                ${val > 0 ? `
                <text x="${x + barW / 2}" y="${y - 6}" text-anchor="middle"
                      fill="${isToday ? '#06b6d4' : '#c4b5fd'}"
                      font-size="11" font-weight="700" font-family="Outfit, sans-serif">${val}</text>
                ` : ''}
                <!-- X-axis label -->
                <text x="${x + barW / 2}" y="${H - 8}" text-anchor="middle"
                      fill="${isToday ? '#06b6d4' : '#9ca3af'}"
                      font-size="11" font-weight="${isToday ? '700' : '400'}"
                      font-family="Inter, sans-serif">${label}</text>
            `;
        });

        const defs = `
            <filter id="wkGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur"/>
                <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
            <style>
                @keyframes wkBarGrow {
                    from { transform: scaleY(0); }
                    to   { transform: scaleY(1); }
                }
            </style>
        `;

        container.innerHTML = this._svgWrap(W, H, gridLines + yLabels + bars, defs);
    },

    // ─── 2. Monthly Activity Area Chart ──────────────────────────────────────

    /**
     * 30-day area/line chart. Activity score = habitsChecked + attendanceLogged*2 + xpEarned/10
     * @param {string} containerId
     */
    renderMonthlyChart(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const log  = this._getActivityLog();
        const days = this._lastNDays(30);

        const scores = days.map(d => {
            const e = log[d];
            if (!e) return 0;
            return (e.habitsChecked || 0)
                 + (e.attendanceLogged || 0) * 2
                 + (e.xpEarned || 0) / 10;
        });

        if (scores.every(s => s === 0)) {
            container.innerHTML = this._emptyState(600, 220, 'No activity data for the last 30 days');
            return;
        }

        const W = 600, H = 220;
        const padL = 46, padR = 16, padT = 24, padB = 40;
        const chartW = W - padL - padR;
        const chartH = H - padT - padB;
        const maxScore = Math.max(...scores, 1);

        const xOf = (i) => padL + (i / (days.length - 1)) * chartW;
        const yOf = (s) => padT + chartH - (s / maxScore) * chartH;

        // Build path points
        const pts = scores.map((s, i) => `${xOf(i)},${yOf(s)}`);

        // Line path
        const linePath = `M ${pts.join(' L ')}`;

        // Area fill path (close below the line)
        const areaPath = `M ${xOf(0)},${padT + chartH} L ${pts.join(' L ')} L ${xOf(days.length - 1)},${padT + chartH} Z`;

        // Y-axis grid
        const ySteps = 4;
        let gridLines = '', yLabels = '';
        for (let s = 0; s <= ySteps; s++) {
            const val = (maxScore / ySteps * s).toFixed(0);
            const y   = padT + chartH - (s / ySteps) * chartH;
            gridLines += `<line x1="${padL}" y1="${y}" x2="${W - padR}" y2="${y}"
                               stroke="rgba(255,255,255,0.05)" stroke-width="1"/>`;
            yLabels   += `<text x="${padL - 6}" y="${y + 4}" text-anchor="end"
                               fill="#6b7280" font-size="10" font-family="Inter, sans-serif">${val}</text>`;
        }

        // X-axis labels at weekly intervals (every 7 days)
        let xLabels = '';
        [0, 6, 13, 20, 27, 29].forEach(i => {
            if (i < days.length) {
                xLabels += `
                    <text x="${xOf(i)}" y="${H - 6}" text-anchor="middle"
                          fill="#6b7280" font-size="10" font-family="Inter, sans-serif">
                        ${this._shortDate(days[i])}
                    </text>`;
            }
        });

        // Hover dots (data points) — shown via SVG title tooltip
        let dots = '';
        scores.forEach((s, i) => {
            if (s > 0) {
                dots += `
                    <circle cx="${xOf(i)}" cy="${yOf(s)}" r="4"
                            fill="#8b5cf6" stroke="rgba(15,23,42,0.8)" stroke-width="2"
                            style="cursor:default;">
                        <title>${this._shortDate(days[i])}: score ${s.toFixed(1)}</title>
                    </circle>`;
            }
        });

        // Today marker
        const todayIdx = days.indexOf(this._todayStr());
        let todayMark = '';
        if (todayIdx >= 0 && scores[todayIdx] > 0) {
            todayMark = `
                <circle cx="${xOf(todayIdx)}" cy="${yOf(scores[todayIdx])}" r="6"
                        fill="none" stroke="#06b6d4" stroke-width="2">
                    <title>Today: ${scores[todayIdx].toFixed(1)}</title>
                </circle>`;
        }

        const defs = `
            <linearGradient id="mAreaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stop-color="#8b5cf6" stop-opacity="0.35"/>
                <stop offset="100%" stop-color="#8b5cf6" stop-opacity="0.02"/>
            </linearGradient>
        `;

        const content = `
            ${gridLines}
            ${yLabels}
            ${xLabels}
            <!-- Area fill -->
            <path d="${areaPath}" fill="url(#mAreaGrad)"/>
            <!-- Line -->
            <path d="${linePath}" fill="none" stroke="#8b5cf6" stroke-width="2.5"
                  stroke-linejoin="round" stroke-linecap="round"/>
            ${dots}
            ${todayMark}
        `;

        container.innerHTML = this._svgWrap(W, H, content, defs);
    },

    // ─── 3. Habit Consistency Horizontal Bars ─────────────────────────────────

    /**
     * Horizontal bar chart: one row per habit, showing 30-day completion %.
     * @param {string} containerId
     * @param {Array}  habits - habit objects from HabitManager
     */
    renderHabitConsistency(containerId, habits) {
        const container = document.getElementById(containerId);
        if (!container) return;

        if (!habits || habits.length === 0) {
            container.innerHTML = this._emptyState(560, 120, 'No habits added yet');
            return;
        }

        // Calculate 30-day completion % for each habit
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const days30 = Array.from({ length: 30 }, (_, i) => {
            const d = new Date(today);
            d.setDate(today.getDate() - i);
            return d.toISOString().split('T')[0];
        });

        const withPct = habits.map(h => {
            const set  = new Set(h.history || []);
            const done = days30.filter(d => set.has(d)).length;
            return {
                ...h,
                pct: Math.round((done / 30) * 100),
            };
        }).sort((a, b) => b.pct - a.pct);

        // Dimensions
        const ROW_H  = 44;
        const PAD_L  = 150;   // space for emoji + name on left
        const PAD_R  = 52;    // space for % label on right
        const W      = 560;
        const H      = Math.max(withPct.length * ROW_H + 12, 80);
        const chartW = W - PAD_L - PAD_R;

        let rows = '';
        withPct.forEach((h, i) => {
            const y      = i * ROW_H + 8;
            const barW   = (h.pct / 100) * chartW;
            const color  = h.color || '#8b5cf6';
            const gradId = `hbGrad-${i}`;

            rows += `
                <defs>
                    <linearGradient id="${gradId}" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%"   stop-color="${color}" stop-opacity="0.9"/>
                        <stop offset="100%" stop-color="${color}" stop-opacity="0.55"/>
                    </linearGradient>
                </defs>
                <!-- Emoji + Name -->
                <text x="${PAD_L - 10}" y="${y + 18}" text-anchor="end"
                      font-size="14" font-family="Inter, sans-serif">${this._esc(h.icon || '⭐')}</text>
                <text x="${PAD_L - 28}" y="${y + 18}" text-anchor="end"
                      fill="#d1d5db" font-size="12" font-family="Inter, sans-serif"
                      font-weight="500">${this._esc(h.name.length > 14 ? h.name.slice(0, 13) + '…' : h.name)}</text>
                <!-- Track -->
                <rect x="${PAD_L}" y="${y + 6}" width="${chartW}" height="20"
                      rx="10" fill="rgba(255,255,255,0.05)"/>
                <!-- Fill bar (animated) -->
                <rect x="${PAD_L}" y="${y + 6}" width="${barW}" height="20"
                      rx="10" fill="url(#${gradId})"
                      style="transform-origin:${PAD_L}px center;
                             animation:hbBarGrow 0.7s cubic-bezier(0.34,1.56,0.64,1) ${i * 80}ms both;">
                </rect>
                <!-- Percent label -->
                <text x="${PAD_L + chartW + 8}" y="${y + 20}" text-anchor="start"
                      fill="${color}" font-size="12" font-weight="700"
                      font-family="Outfit, sans-serif">${h.pct}%</text>
            `;
        });

        const defs = `
            <style>
                @keyframes hbBarGrow {
                    from { transform: scaleX(0); }
                    to   { transform: scaleX(1); }
                }
            </style>
        `;

        container.innerHTML = this._svgWrap(W, H, rows, defs);
    },

    // ─── 4. Goal Completion Rings ─────────────────────────────────────────────

    /**
     * 4 SVG completion rings side by side: Daily / Weekly / Monthly / Yearly
     * Data from auralife_tasks localStorage (TaskManager structure).
     * @param {string} containerId
     */
    renderGoalRings(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const data = this._getTasksData();

        const periods = [
            { key: 'daily',   label: 'Daily',   color: '#06b6d4', icon: '☀️'  },
            { key: 'weekly',  label: 'Weekly',  color: '#8b5cf6', icon: '📅'  },
            { key: 'monthly', label: 'Monthly', color: '#f59e0b', icon: '🗓️'  },
            { key: 'yearly',  label: 'Yearly',  color: '#10b981', icon: '🏆'  },
        ];

        const W   = 520;
        const H   = 160;
        const ringW = W / 4;
        const cx  = (i) => ringW * i + ringW / 2;
        const cy  = H / 2 - 8;
        const R   = 52;        // outer radius
        const SW  = 10;        // stroke width
        const r   = R - SW / 2;
        const circ = 2 * Math.PI * r;

        let rings = '';
        let defs  = '';

        periods.forEach((p, i) => {
            const pd        = data[p.key] || { tasks: [], history: [] };
            const total     = (pd.tasks || []).length;
            const completed = (pd.tasks || []).filter(t => t.completed).length;
            const pct       = total > 0 ? Math.round((completed / total) * 100) : 0;
            const offset    = circ - (pct / 100) * circ;
            const gradId    = `ringGrad-${i}`;
            const cx_       = cx(i);

            defs += `
                <linearGradient id="${gradId}" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%"   stop-color="${p.color}" stop-opacity="1"/>
                    <stop offset="100%" stop-color="${p.color}" stop-opacity="0.6"/>
                </linearGradient>
            `;

            rings += `
                <!-- Background ring track -->
                <circle cx="${cx_}" cy="${cy}" r="${r}"
                        fill="none" stroke="rgba(255,255,255,0.07)" stroke-width="${SW}"/>
                <!-- Filled arc -->
                <circle cx="${cx_}" cy="${cy}" r="${r}"
                        fill="none"
                        stroke="${total === 0 ? 'rgba(255,255,255,0.06)' : `url(#${gradId})`}"
                        stroke-width="${SW}"
                        stroke-dasharray="${circ}"
                        stroke-dashoffset="${total === 0 ? circ : offset}"
                        stroke-linecap="round"
                        transform="rotate(-90 ${cx_} ${cy})"
                        style="transition: stroke-dashoffset 1s ease-in-out;">
                </circle>
                <!-- Center: percentage -->
                <text x="${cx_}" y="${cy + 6}" text-anchor="middle"
                      fill="${total === 0 ? '#4b5563' : p.color}"
                      font-size="18" font-weight="800"
                      font-family="Outfit, sans-serif">${total === 0 ? '–' : pct + '%'}</text>
                <!-- Label below ring -->
                <text x="${cx_}" y="${cy + R + 18}" text-anchor="middle"
                      fill="#9ca3af" font-size="11" font-weight="600"
                      font-family="Inter, sans-serif">${p.icon} ${p.label}</text>
                <!-- Fraction below label -->
                <text x="${cx_}" y="${cy + R + 32}" text-anchor="middle"
                      fill="#6b7280" font-size="10"
                      font-family="Inter, sans-serif">${completed}/${total}</text>
                <!-- Glow for 100% -->
                ${pct === 100 && total > 0 ? `
                <circle cx="${cx_}" cy="${cy}" r="${r}"
                        fill="none" stroke="${p.color}" stroke-width="3"
                        opacity="0.25" filter="url(#ringGlow)"/>
                ` : ''}
            `;
        });

        defs += `
            <filter id="ringGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="5"/>
            </filter>
        `;

        container.innerHTML = this._svgWrap(W, H + 20, rings, defs);
    },

    // ─── Utility ─────────────────────────────────────────────────────────────

    /** HTML-escape to prevent XSS in SVG text content */
    _esc(str) {
        return String(str ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    },
};
