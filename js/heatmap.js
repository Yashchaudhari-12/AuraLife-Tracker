/**
 * GitHub-Style Activity Heatmap Renderer
 * Renders a 365-day SVG contribution grid based on daily activity logs.
 */

import { XPSystem } from './xp.js';

export const HeatmapRenderer = {

    // Color palette (dark → vibrant green, similar to GitHub)
    COLORS: {
        empty:   'rgba(255,255,255,0.05)',
        level1:  'rgba(16,185,129,0.25)',
        level2:  'rgba(16,185,129,0.5)',
        level3:  'rgba(16,185,129,0.75)',
        level4:  '#10b981',
        level5:  '#34d399',
    },

    getColor(score) {
        if (score === 0) return this.COLORS.empty;
        if (score <= 1)  return this.COLORS.level1;
        if (score <= 3)  return this.COLORS.level2;
        if (score <= 5)  return this.COLORS.level3;
        if (score <= 8)  return this.COLORS.level4;
        return this.COLORS.level5;
    },

    getActivityScore(dateKey, log) {
        const day = log[dateKey];
        if (!day) return 0;
        return (day.attendanceLogged || 0) + (day.goalsCompleted || 0) + (day.habitsChecked || 0);
    },

    /**
     * Render heatmap into a container element
     * @param {string} containerId - DOM element ID
     * @param {number} weeks - number of weeks to show (52 for full year, 12 for mini)
     */
    render(containerId, weeks = 52) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const activityLog = XPSystem.getActivityLog();
        const CELL  = 13;
        const GAP   = 3;
        const STEP  = CELL + GAP;
        const LEFT  = 28; // day label width
        const TOP   = 22; // month label height

        const days  = weeks * 7;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Build date array from oldest to newest
        const dates = [];
        for (let i = days - 1; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(today.getDate() - i);
            dates.push(d);
        }

        // Starting day-of-week offset for the first date
        const startOffset = dates[0].getDay(); // 0=Sun
        const totalCols   = Math.ceil((dates.length + startOffset) / 7);

        const svgW = LEFT + totalCols * STEP;
        const svgH = TOP  + 7 * STEP;

        // ── Build month labels ──
        let monthLabelHTML = '';
        let lastMonth = -1;
        dates.forEach((d, i) => {
            const col = Math.floor((startOffset + i) / 7);
            if (d.getMonth() !== lastMonth) {
                lastMonth = d.getMonth();
                const x = LEFT + col * STEP;
                const label = d.toLocaleString('default', { month: 'short' });
                monthLabelHTML += `<text x="${x}" y="14" fill="rgba(255,255,255,0.35)" font-size="10" font-family="Inter,sans-serif">${label}</text>`;
            }
        });

        // ── Build day labels (Mon / Wed / Fri) ──
        const dayLabels = ['', 'Mon', '', 'Wed', '', 'Fri', ''];
        let dayLabelHTML = '';
        dayLabels.forEach((lbl, row) => {
            if (!lbl) return;
            const y = TOP + row * STEP + CELL;
            dayLabelHTML += `<text x="0" y="${y}" fill="rgba(255,255,255,0.3)" font-size="9" font-family="Inter,sans-serif">${lbl}</text>`;
        });

        // ── Build cells ──
        let cellsHTML = '';
        let totalActive = 0;
        dates.forEach((d, i) => {
            const col     = Math.floor((startOffset + i) / 7);
            const row     = (startOffset + i) % 7;
            const x       = LEFT + col * STEP;
            const y       = TOP  + row * STEP;
            const dateKey = d.toISOString().split('T')[0];
            const score   = this.getActivityScore(dateKey, activityLog);
            const color   = this.getColor(score);
            const label   = d.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' });
            const tooltip = score > 0 ? `${label}: ${score} activities, ${activityLog[dateKey]?.xpEarned || 0} XP` : `${label}: No activity`;
            if (score > 0) totalActive++;
            cellsHTML += `<rect x="${x}" y="${y}" width="${CELL}" height="${CELL}" rx="2.5" fill="${color}" class="hm-cell" data-tip="${tooltip}" style="cursor:pointer;transition:opacity 0.15s"/>`;
        });

        // ── Legend ──
        const legendColors = [this.COLORS.empty, this.COLORS.level1, this.COLORS.level2, this.COLORS.level3, this.COLORS.level4, this.COLORS.level5];
        let legendHTML = `<div class="hm-legend"><span class="hm-legend-lbl">Less</span>`;
        legendColors.forEach(c => { legendHTML += `<span class="hm-legend-cell" style="background:${c}"></span>`; });
        legendHTML += `<span class="hm-legend-lbl">More</span></div>`;

        container.innerHTML = `
            <div class="hm-wrapper">
                <div class="hm-scroll-area">
                    <svg width="${svgW}" height="${svgH}" xmlns="http://www.w3.org/2000/svg">
                        ${monthLabelHTML}
                        ${dayLabelHTML}
                        ${cellsHTML}
                    </svg>
                </div>
                ${legendHTML}
                <div id="hm-tooltip-${containerId}" class="hm-tooltip" style="display:none;position:absolute;pointer-events:none;"></div>
            </div>
        `;

        // ── Tooltip events ──
        const tip = container.querySelector('.hm-tooltip');
        container.querySelectorAll('.hm-cell').forEach(cell => {
            cell.addEventListener('mouseenter', (e) => {
                if (!tip) return;
                tip.textContent = e.target.dataset.tip;
                tip.style.display = 'block';
                const cr = e.target.getBoundingClientRect();
                const pr = container.getBoundingClientRect();
                tip.style.left = (cr.left - pr.left + CELL / 2) + 'px';
                tip.style.top  = (cr.top  - pr.top  - 34) + 'px';
                tip.style.transform = 'translateX(-50%)';
            });
            cell.addEventListener('mouseleave', () => { if (tip) tip.style.display = 'none'; });
        });

        return totalActive;
    },
};
