/**
 * Analytics & Visualization Module
 * Renders custom interactive SVG Charts for attendance trends & life goals
 */

export const AnalyticsEngine = {
    renderSubjectBarChart(containerId, subjects) {
        const container = document.getElementById(containerId);
        if (!container) return;

        if (!subjects || subjects.length === 0) {
            container.innerHTML = `<div style="text-align: center; color: var(--text-muted); padding: 40px;">No subjects added yet.</div>`;
            return;
        }

        const width = 600;
        const height = 240;
        const padding = 40;
        const barWidth = Math.min(45, (width - padding * 2) / subjects.length - 15);

        let barsSVG = subjects.map((s, idx) => {
            const pct = s.total > 0 ? (s.attended / s.total) * 100 : 0;
            const barHeight = (pct / 100) * (height - padding * 2);
            const x = padding + idx * ((width - padding * 2) / subjects.length) + 15;
            const y = height - padding - barHeight;

            const color = pct >= s.targetPercentage ? '#06b6d4' : (pct >= s.targetPercentage - 5 ? '#f59e0b' : '#ef4444');

            return `
                <g class="chart-bar-group">
                    <rect x="${x}" y="${padding}" width="${barWidth}" height="${height - padding * 2}" fill="rgba(255,255,255,0.03)" rx="4"/>
                    <rect x="${x}" y="${y}" width="${barWidth}" height="${barHeight}" fill="${color}" rx="4">
                        <animate attributeName="height" from="0" to="${barHeight}" dur="0.8s" fill="freeze" />
                        <animate attributeName="y" from="${height - padding}" to="${y}" dur="0.8s" fill="freeze" />
                    </rect>
                    <!-- Target Line -->
                    <line x1="${x - 5}" y1="${height - padding - (s.targetPercentage / 100) * (height - padding * 2)}" 
                          x2="${x + barWidth + 5}" y2="${height - padding - (s.targetPercentage / 100) * (height - padding * 2)}" 
                          stroke="rgba(255,255,255,0.4)" stroke-dasharray="3,3" stroke-width="1.5"/>
                    <text x="${x + barWidth / 2}" y="${height - 12}" fill="#9ca3af" font-size="11" text-anchor="middle">${s.code || s.name.substring(0, 4)}</text>
                    <text x="${x + barWidth / 2}" y="${y - 8}" fill="${color}" font-size="12" font-weight="bold" text-anchor="middle">${pct.toFixed(0)}%</text>
                </g>
            `;
        }).join('');

        container.innerHTML = `
            <svg width="100%" height="${height}" viewBox="0 0 ${width} ${height}" style="overflow: visible;">
                <!-- Grid Lines -->
                <line x1="${padding}" y1="${padding}" x2="${width - padding}" y2="${padding}" stroke="rgba(255,255,255,0.05)" />
                <line x1="${padding}" y1="${padding + (height - padding * 2) * 0.25}" x2="${width - padding}" y2="${padding + (height - padding * 2) * 0.25}" stroke="rgba(255,255,255,0.05)" />
                <line x1="${padding}" y1="${padding + (height - padding * 2) * 0.5}" x2="${width - padding}" y2="${padding + (height - padding * 2) * 0.5}" stroke="rgba(255,255,255,0.05)" />
                <line x1="${padding}" y1="${padding + (height - padding * 2) * 0.75}" x2="${width - padding}" y2="${padding + (height - padding * 2) * 0.75}" stroke="rgba(255,255,255,0.05)" />
                ${barsSVG}
            </svg>
        `;
    },

    renderLifeScoreRing(containerId, score) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const size = 120;
        const strokeWidth = 10;
        const radius = (size - strokeWidth) / 2;
        const circumference = 2 * Math.PI * radius;
        const strokeDashoffset = circumference - (score / 100) * circumference;

        container.innerHTML = `
            <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
                <circle cx="${size / 2}" cy="${size / 2}" r="${radius}" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="${strokeWidth}"/>
                <circle cx="${size / 2}" cy="${size / 2}" r="${radius}" fill="none" stroke="url(#scoreGrad)" stroke-width="${strokeWidth}"
                        stroke-dasharray="${circumference}" stroke-dashoffset="${strokeDashoffset}" stroke-linecap="round"
                        transform="rotate(-90 ${size / 2} ${size / 2})" style="transition: stroke-dashoffset 1s ease-in-out;"/>
                <defs>
                    <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="#06b6d4" />
                        <stop offset="100%" stop-color="#8b5cf6" />
                    </linearGradient>
                </defs>
            </svg>
        `;
    }
};
