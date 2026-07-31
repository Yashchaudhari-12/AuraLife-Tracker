/**
 * CalendarRenderer — Monthly Calendar View
 *
 * Renders a glassmorphic monthly calendar grid with:
 *  - Month navigation (prev / next / today)
 *  - Activity-based day coloring from `auralife_activity_log` (object keyed by YYYY-MM-DD)
 *  - Special ring for today, muted future dates
 *  - Clickable day cells that open a side-panel with full day detail
 *  - Notes field backed by `auralife_cal_notes` localStorage key
 */

export const CalendarRenderer = {

    // ─── Internal state ──────────────────────────────────────────────────────

    _rootId:        null,
    _habits:        [],
    _viewYear:      new Date().getFullYear(),
    _viewMonth:     new Date().getMonth(),   // 0-based
    _selectedDate:  null,

    // ─── localStorage helpers ─────────────────────────────────────────────────

    /** Returns activity log as object { 'YYYY-MM-DD': { xpEarned, habitsChecked, attendanceLogged } } */
    _getActivityLog() {
        try {
            return JSON.parse(localStorage.getItem('auralife_activity_log') || '{}');
        } catch (_) {
            return {};
        }
    },

    /** Returns cal notes object { 'YYYY-MM-DD': 'note text' } */
    _getNotes() {
        try {
            return JSON.parse(localStorage.getItem('auralife_cal_notes') || '{}');
        } catch (_) {
            return {};
        }
    },

    _saveNote(dateStr, text) {
        const notes = this._getNotes();
        if (text.trim() === '') {
            delete notes[dateStr];
        } else {
            notes[dateStr] = text;
        }
        localStorage.setItem('auralife_cal_notes', JSON.stringify(notes));
    },

    // ─── Activity scoring ─────────────────────────────────────────────────────

    /**
     * Returns an activity level string for color coding.
     * @param {object|null} entry - log entry for a day
     * @returns {'none'|'low'|'medium'|'high'}
     */
    _activityLevel(entry) {
        if (!entry) return 'none';
        const score = (entry.xpEarned || 0)
                    + (entry.habitsChecked || 0) * 3
                    + (entry.attendanceLogged || 0) * 2;
        if (score === 0)  return 'none';
        if (score < 10)   return 'low';
        if (score < 25)   return 'medium';
        return 'high';
    },

    /** Returns inline background color string for the given activity level */
    _activityColor(level) {
        const map = {
            none:   'rgba(255,255,255,0.04)',
            low:    'rgba(139,92,246,0.2)',
            medium: 'rgba(139,92,246,0.5)',
            high:   'rgba(139,92,246,0.9)',
        };
        return map[level] || map.none;
    },

    // ─── Date helpers ─────────────────────────────────────────────────────────

    _todayStr() {
        return new Date().toISOString().split('T')[0];
    },

    _dateStr(year, month, day) {
        return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    },

    _parseDate(dateStr) {
        // Safe parse: avoids timezone shift with new Date('YYYY-MM-DD')
        const [y, m, d] = dateStr.split('-').map(Number);
        return new Date(y, m - 1, d);
    },

    _formatMonthLabel(year, month) {
        return new Date(year, month, 1).toLocaleDateString('en-US', {
            month: 'long',
            year:  'numeric',
        });
    },

    _dayName(dateStr) {
        return this._parseDate(dateStr).toLocaleDateString('en-US', { weekday: 'long' });
    },

    _friendlyDate(dateStr) {
        return this._parseDate(dateStr).toLocaleDateString('en-US', {
            day:   'numeric',
            month: 'long',
            year:  'numeric',
        });
    },

    // ─── Public API ───────────────────────────────────────────────────────────

    /**
     * Render the full calendar UI into the element with the given rootId.
     * @param {string} rootId - ID of the container element
     * @param {Array}  habits - array of habit objects from HabitManager
     */
    render(rootId, habits) {
        this._rootId = rootId;
        this._habits = habits || [];

        const root = document.getElementById(rootId);
        if (!root) return;

        root.innerHTML = `
            <div class="cal-container">
                <div class="cal-card">
                    <div class="cal-nav" id="cal-nav-bar"></div>
                    <div class="cal-grid" id="cal-grid-inner"></div>
                    <div class="cal-legend">
                        <span class="cal-legend-label">Less</span>
                        <span class="cal-legend-swatch" style="background:rgba(255,255,255,0.04)"></span>
                        <span class="cal-legend-swatch" style="background:rgba(139,92,246,0.2)"></span>
                        <span class="cal-legend-swatch" style="background:rgba(139,92,246,0.5)"></span>
                        <span class="cal-legend-swatch" style="background:rgba(139,92,246,0.9)"></span>
                        <span class="cal-legend-label">More</span>
                    </div>
                </div>
                <div class="cal-detail-panel" id="cal-detail-panel">
                    <div class="cal-detail-empty">
                        <div class="cal-detail-empty-icon">📅</div>
                        <div class="cal-detail-empty-text">Click any day to see your activity details</div>
                    </div>
                </div>
            </div>
        `;

        this._renderNav();
        this._renderGrid();
    },

    /** Re-render only the navigation bar */
    _renderNav() {
        const nav = document.getElementById('cal-nav-bar');
        if (!nav) return;

        nav.innerHTML = `
            <button class="cal-nav-btn" id="cal-prev-btn" title="Previous month">&#8249;</button>
            <span class="cal-month-label">${this._formatMonthLabel(this._viewYear, this._viewMonth)}</span>
            <button class="cal-nav-btn cal-today-btn" id="cal-today-nav-btn">Today</button>
            <button class="cal-nav-btn" id="cal-next-btn" title="Next month">&#8250;</button>
        `;

        document.getElementById('cal-prev-btn').addEventListener('click', () => this._prevMonth());
        document.getElementById('cal-next-btn').addEventListener('click', () => this._nextMonth());
        document.getElementById('cal-today-nav-btn').addEventListener('click', () => this._goToToday());
    },

    /** Build and inject the 7-column day grid */
    _renderGrid() {
        const grid = document.getElementById('cal-grid-inner');
        if (!grid) return;

        const log     = this._getActivityLog();
        const todayStr = this._todayStr();
        const today   = this._parseDate(todayStr);

        // Day-of-week headers (Mon → Sun)
        const dayHeaders = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        let html = dayHeaders.map(d =>
            `<div class="cal-day-header">${d}</div>`
        ).join('');

        // First day of the view month
        const firstDay = new Date(this._viewYear, this._viewMonth, 1);
        // getDay() returns 0=Sun..6=Sat; convert to Mon=0..Sun=6
        const startDow = (firstDay.getDay() + 6) % 7;

        // Days in month
        const daysInMonth = new Date(this._viewYear, this._viewMonth + 1, 0).getDate();

        // Leading empty cells
        for (let i = 0; i < startDow; i++) {
            html += `<div class="cal-day empty"></div>`;
        }

        // Day cells
        for (let d = 1; d <= daysInMonth; d++) {
            const dateStr   = this._dateStr(this._viewYear, this._viewMonth, d);
            const entry     = log[dateStr] || null;
            const level     = this._activityLevel(entry);
            const bgColor   = this._activityColor(level);
            const isToday   = dateStr === todayStr;
            const isFuture  = this._parseDate(dateStr) > today;
            const isSelected = dateStr === this._selectedDate;
            const hasActivity = level !== 'none';

            const classes = [
                'cal-day',
                `act-${level}`,
                isToday    ? 'today'    : '',
                isFuture   ? 'future'   : '',
                isSelected ? 'selected' : '',
            ].filter(Boolean).join(' ');

            html += `
                <div class="${classes}"
                     style="background:${bgColor}"
                     data-date="${dateStr}"
                     title="${dateStr}">
                    <span class="cal-day-num">${d}</span>
                    ${hasActivity ? '<span class="cal-day-dot"></span>' : ''}
                </div>
            `;
        }

        // Trailing empty cells to complete the last row
        const totalCells   = startDow + daysInMonth;
        const trailingCells = (7 - (totalCells % 7)) % 7;
        for (let i = 0; i < trailingCells; i++) {
            html += `<div class="cal-day empty"></div>`;
        }

        grid.innerHTML = html;

        // Attach click handlers to day cells
        grid.querySelectorAll('.cal-day:not(.empty):not(.future)').forEach(cell => {
            cell.addEventListener('click', () => {
                const dateStr = cell.dataset.date;
                this._selectDay(dateStr);
            });
        });
    },

    // ─── Navigation ──────────────────────────────────────────────────────────

    _prevMonth() {
        if (this._viewMonth === 0) {
            this._viewMonth = 11;
            this._viewYear--;
        } else {
            this._viewMonth--;
        }
        this._renderNav();
        this._renderGrid();
    },

    _nextMonth() {
        if (this._viewMonth === 11) {
            this._viewMonth = 0;
            this._viewYear++;
        } else {
            this._viewMonth++;
        }
        this._renderNav();
        this._renderGrid();
    },

    _goToToday() {
        const now = new Date();
        this._viewYear  = now.getFullYear();
        this._viewMonth = now.getMonth();
        this._renderNav();
        this._renderGrid();
        // Auto-open today's detail
        this._selectDay(this._todayStr());
    },

    // ─── Day selection & detail panel ─────────────────────────────────────────

    _selectDay(dateStr) {
        this._selectedDate = dateStr;

        // Re-render grid to update selected highlight
        this._renderGrid();

        // Populate the detail panel
        this.showDayDetail(dateStr, this._habits);
    },

    /**
     * Populate #cal-detail-panel with full day data.
     * @param {string} dateStr - 'YYYY-MM-DD'
     * @param {Array}  habits  - habit objects with { id, name, icon, color, history: string[] }
     */
    showDayDetail(dateStr, habits) {
        const panel = document.getElementById('cal-detail-panel');
        if (!panel) return;

        const log       = this._getActivityLog();
        const notes     = this._getNotes();
        const entry     = log[dateStr] || {};
        const todayStr  = this._todayStr();
        const isPast    = dateStr <= todayStr;
        const isToday   = dateStr === todayStr;

        const xp              = entry.xpEarned       || 0;
        const attendanceCount = entry.attendanceLogged || 0;
        const habitsChecked   = entry.habitsChecked    || 0;
        const noteText        = notes[dateStr]         || '';

        // Categorise habits
        const done   = (habits || []).filter(h => (h.history || []).includes(dateStr));
        const missed = isPast
            ? (habits || []).filter(h => !(h.history || []).includes(dateStr))
            : [];

        // Build habit list HTML
        const habitRowHTML = (habitList, status) => habitList.map(h => `
            <div class="cal-habit-row">
                <span class="cal-habit-indicator ${status}"></span>
                <span class="cal-habit-icon">${h.icon || '⭐'}</span>
                <span class="cal-habit-name">${this._esc(h.name)}</span>
                <span class="cal-habit-status-tag ${status}">${status === 'done' ? '✓ Done' : '✗ Missed'}</span>
            </div>
        `).join('');

        const doneHTML   = done.length   ? habitRowHTML(done,   'done')   : '';
        const missedHTML = missed.length ? habitRowHTML(missed, 'missed') : '';

        const noHabitsHTML = (!done.length && !missed.length)
            ? `<p class="cal-no-habits">No habits tracked yet</p>`
            : '';

        panel.innerHTML = `
            <button class="cal-detail-close" id="cal-detail-close-btn" title="Close">&#215;</button>

            <div class="cal-detail-header">
                <div>
                    <div class="cal-detail-date">${this._friendlyDate(dateStr)}</div>
                    <div class="cal-detail-weekday">${this._dayName(dateStr)}${isToday ? ' · Today' : ''}</div>
                </div>
                <div class="cal-detail-xp-badge">
                    <span class="cal-detail-xp-num">${xp}</span>
                    <span class="cal-detail-xp-label">XP</span>
                </div>
            </div>

            <!-- Stats -->
            <div class="cal-section-title">📊 Activity</div>
            <div class="cal-stat-row">
                <span class="cal-stat-label">🏋️ Habits checked</span>
                <span class="cal-stat-value">${habitsChecked}</span>
            </div>
            <div class="cal-stat-row">
                <span class="cal-stat-label">📋 Attendance logged</span>
                <span class="cal-stat-value">${attendanceCount}</span>
            </div>

            <!-- Habits done -->
            ${done.length ? `<div class="cal-section-title">✅ Habits done</div>${doneHTML}` : ''}

            <!-- Habits missed (only for past/today) -->
            ${(isPast && missed.length) ? `<div class="cal-section-title">❌ Habits missed</div>${missedHTML}` : ''}

            ${noHabitsHTML}

            <!-- Notes -->
            <div class="cal-notes-wrap">
                <div class="cal-notes-label">📝 Notes</div>
                <textarea
                    class="cal-notes-input"
                    id="cal-notes-textarea"
                    placeholder="Add a note for this day…"
                    rows="3"
                >${this._esc(noteText)}</textarea>
                <div class="cal-notes-saved-hint" id="cal-notes-saved-hint">✓ Saved</div>
            </div>
        `;

        // Notes auto-save on blur / input (debounced)
        const textarea  = document.getElementById('cal-notes-textarea');
        const savedHint = document.getElementById('cal-notes-saved-hint');
        let   saveTimer = null;

        const persistNote = () => {
            this._saveNote(dateStr, textarea.value);
            savedHint.classList.add('show');
            clearTimeout(saveTimer);
            saveTimer = setTimeout(() => savedHint.classList.remove('show'), 1800);
        };

        textarea.addEventListener('input', () => {
            clearTimeout(saveTimer);
            saveTimer = setTimeout(persistNote, 700);
        });

        textarea.addEventListener('blur', persistNote);

        // Close button (mobile)
        const closeBtn = document.getElementById('cal-detail-close-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                panel.classList.remove('visible');
                this._selectedDate = null;
                this._renderGrid();
            });
        }

        // Show panel
        panel.classList.add('visible');
    },

    // ─── Utility ─────────────────────────────────────────────────────────────

    /** HTML-escape a string to prevent XSS in innerHTML */
    _esc(str) {
        return String(str ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    },
};
