/**
 * UI Renderer and Event Controller
 * Fast, non-blocking single-tap actions
 */

import { Storage } from './storage.js';
import { AttendanceCalc } from './attendance.js';
import { GoalsCalc } from './goals.js';
import { TimetableManager } from './timetable.js';
import { AnalyticsEngine } from './analytics.js';
import { XPSystem } from './xp.js';
import { HeatmapRenderer } from './heatmap.js';
import { TaskManager } from './tasks.js';
import { HabitManager } from './habits.js';
import { CalendarRenderer } from './calendar.js';
import { AnalyticsV2 } from './analytics_v2.js';
import { TodaysFocus } from './todays_focus.js';
import { MilestoneGoalsV2 } from './goals_v2.js';
import { CodingDashboard } from './coding_dashboard.js';

const QUOTES = [
    { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
    { text: "Discipline is the bridge between goals and accomplishment.", author: "Jim Rohn" },
    { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
    { text: "Success is the sum of small efforts, repeated day in and day out.", author: "Robert Collier" },
    { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
    { text: "The harder you work for something, the greater you'll feel when you achieve it.", author: "Anonymous" },
    { text: "Dream it. Believe it. Build it.", author: "Anonymous" },
    { text: "Code is like humor. When you have to explain it, it's bad.", author: "Cory House" },
    { text: "First, solve the problem. Then, write the code.", author: "John Johnson" },
    { text: "The best way to predict the future is to create it.", author: "Peter Drucker" },
    { text: "Push yourself, because no one else is going to do it for you.", author: "Anonymous" },
    { text: "Great things never come from comfort zones.", author: "Anonymous" },
    { text: "Wake up with determination. Go to bed with satisfaction.", author: "Anonymous" },
    { text: "Do something today that your future self will thank you for.", author: "Sean Patrick Flanery" },
    { text: "Little things make big days.", author: "Anonymous" },
];
const QUOTE_EMOJIS = ['💡','🚀','🔥','⚡','🎯','💪','🌟','✨','🏆','🎓'];

export const UIController = {
    currentTab: 'dashboard',
    activeGoalFilter: 'all',
    activePeriod: 'daily',  // for tasks tab

    init() {
        this.bindEvents();
        this.renderAll();
    },

    bindEvents() {
        // Tab switching
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const targetTab = e.currentTarget.dataset.tab;
                if (targetTab) this.switchTab(targetTab);
            });
        });

        // Filter buttons for goals
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                e.currentTarget.classList.add('active');
                this.activeGoalFilter = e.currentTarget.dataset.filter;
                this.renderGoalsTab(Storage.getGoals());
            });
        });

        // Modal triggers & closes
        document.getElementById('btn-add-subject')?.addEventListener('click', () => this.openModal('modal-add-subject'));
        document.getElementById('btn-add-goal')?.addEventListener('click', () => this.openModal('modal-add-goal'));
        document.getElementById('btn-add-slot')?.addEventListener('click', () => this.openAddSlotForDay());
        document.getElementById('btn-export-backup')?.addEventListener('click', () => Storage.exportData());
        document.getElementById('btn-clear-all')?.addEventListener('click', () => this.clearAllData());
        
        document.getElementById('import-file-input')?.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (event) => {
                const success = Storage.importData(event.target.result);
                if (success) {
                    this.showToast('Data imported successfully!', 'success');
                    this.renderAll();
                } else {
                    this.showToast('Invalid backup file format.', 'error');
                }
            };
            reader.readAsText(file);
        });

        document.querySelectorAll('.modal-close, .modal-cancel').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal-overlay');
                if (modal) this.closeModal(modal.id);
            });
        });

        // Form Submit Handlers
        document.getElementById('form-add-subject')?.addEventListener('submit', (e) => this.handleAddSubject(e));
        document.getElementById('form-add-goal')?.addEventListener('submit', (e) => this.handleAddGoal(e));
        document.getElementById('form-add-goal-v2')?.addEventListener('submit', (e) => this.handleAddGoalV2(e));
        document.getElementById('form-edit-coding-targets')?.addEventListener('submit', (e) => this.handleSaveCodingTargets(e));
        document.getElementById('form-add-slot')?.addEventListener('submit', (e) => this.handleAddSlot(e));
        document.getElementById('form-add-habit')?.addEventListener('submit', (e) => this.handleAddHabit(e));
    },

    clearAllData() {
        Storage.clearAll();
        this.showToast('All subjects and goals cleared!', 'info');
        this.renderAll();
    },

    switchTab(tabName) {
        this.currentTab = tabName;
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });

        document.querySelectorAll('.tab-content').forEach(content => {
            content.style.display = content.id === `tab-${tabName}` ? 'block' : 'none';
        });

        this.renderAll();
    },

    renderAll() {
        const subjects = Storage.getSubjects();
        const goals = Storage.getGoals();
        const timetable = Storage.getTimetable();

        this.renderHeaderStats(subjects, goals);

        if (this.currentTab === 'dashboard') {
            this.renderDashboard(subjects, goals, timetable);
        } else if (this.currentTab === 'focus') {
            this.renderFocusTab();
        } else if (this.currentTab === 'habits') {
            this.renderHabitsTab();
        } else if (this.currentTab === 'goals-v2') {
            this.renderGoalsV2Tab();
        } else if (this.currentTab === 'attendance') {
            this.renderAttendanceTab(subjects);
        } else if (this.currentTab === 'timetable') {
            this.renderTimetableTab(timetable, subjects);
        } else if (this.currentTab === 'calendar') {
            this.renderCalendarTab();
        } else if (this.currentTab === 'analytics') {
            this.renderAnalyticsTab(subjects, goals);
        }
    },

    renderHeaderStats(subjects, goals) {
        const { overallPercentage } = AttendanceCalc.calculateOverallAttendance(subjects);
        const { overallProgressPct, activeStreaks } = GoalsCalc.calculateOverallGoalsStats(goals);

        const elAtt = document.getElementById('stat-header-attendance');
        const elGoal = document.getElementById('stat-header-goals');
        const elStreak = document.getElementById('stat-header-streak');

        if (elAtt) elAtt.textContent = `${overallPercentage}%`;
        if (elGoal) elGoal.textContent = `${overallProgressPct}%`;
        if (elStreak) elStreak.textContent = `${activeStreaks} 🔥`;
    },

    renderDashboard(subjects, goals, timetable) {
        const root = document.getElementById('dashboard-root');
        if (!root) return;

        const { overallPercentage } = AttendanceCalc.calculateOverallAttendance(subjects);
        const todaySchedule = TimetableManager.getTodaySchedule(timetable, subjects);
        const today      = new Date().toISOString().split('T')[0];
        const dayNames   = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
        const todayName  = dayNames[new Date().getDay()];

        // ── Data Services ────────────────────────────────────────────────
        const profile       = XPSystem.getProfile();
        const lvl           = XPSystem.getCurrentLevel(profile.total);
        const next          = XPSystem.getNextLevel(profile.total);
        const progress      = XPSystem.getXPProgress(profile.total);
        const todaySummary  = XPSystem.getTodaySummary();

        const habits        = HabitManager.getData();
        const habitStats    = HabitManager.getTodayStats(habits);
        const focusStats    = TodaysFocus.getStats();
        const codingStats   = CodingDashboard.getData();
        const codingStreak  = CodingDashboard.getCodingStreak();
        const codingWeek    = CodingDashboard.getProblemsThisWeek();

        const weeklyStats   = MilestoneGoalsV2.getStats('weekly');
        const monthlyStats  = MilestoneGoalsV2.getStats('monthly');
        const yearlyStats   = MilestoneGoalsV2.getStats('yearly');

        const streakLeaderboard = habits
            .map(h => ({ ...h, streak: HabitManager.calculateStreak(h.history || []) }))
            .sort((a, b) => b.streak - a.streak);

        const totalTodayItems = habitStats.total + focusStats.total;
        const doneTodayItems  = habitStats.done + focusStats.completed;
        const todayPct        = totalTodayItems > 0 ? Math.round((doneTodayItems / totalTodayItems) * 100) : 0;
        const todayColor      = todayPct === 100 ? '#10b981' : todayPct >= 50 ? '#f59e0b' : '#06b6d4';

        // ── Quotes ───────────────────────────────────────────────────────
        const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(),0,0)) / 86400000);
        const quote     = QUOTES[dayOfYear % QUOTES.length];
        const qEmoji    = QUOTE_EMOJIS[dayOfYear % QUOTE_EMOJIS.length];

        // ── Coding Widget HTML ───────────────────────────────────────────
        const hasCodingTargets = (codingStats.leetcodeTarget > 0 || codingStats.a2zTarget > 0 || (codingStats.leetcodeCurrent + codingStats.a2zCurrent > 0));
        const lcPct  = codingStats.leetcodeTarget > 0 ? Math.min(100, Math.round((codingStats.leetcodeCurrent / codingStats.leetcodeTarget) * 100)) : 0;
        const a2zPct = codingStats.a2zTarget > 0 ? Math.min(100, Math.round((codingStats.a2zCurrent / codingStats.a2zTarget) * 100)) : 0;

        const codingWidgetHTML = !hasCodingTargets ? '' : `
        <div class="coding-widget">
            <div class="coding-widget-header">
                <div class="coding-title-wrap">
                    <span style="font-size:24px;">💻</span>
                    <div>
                        <div style="font-family:var(--font-heading);font-size:18px;font-weight:800;color:white;">Engineering &amp; Coding Dashboard</div>
                        <div style="font-size:12px;color:var(--text-muted);">DSA &amp; Internship Prep Center</div>
                    </div>
                </div>
                <div style="display:flex;align-items:center;gap:10px;">
                    <button class="btn btn-secondary btn-sm" style="font-size:11px;" onclick="window.appUI.openEditCodingTargetsModal()">✏️ Edit Targets</button>
                    <div class="coding-badge">🔥 ${codingStreak} Day Coding Streak</div>
                </div>
            </div>

            <div class="coding-grid">
                <div class="coding-card">
                    <div style="display:flex;justify-content:space-between;align-items:flex-start;">
                        <div>
                            <div class="coding-card-val" style="color:#06b6d4;">${codingStats.leetcodeCurrent} <span style="font-size:14px;color:var(--text-muted);">/ ${codingStats.leetcodeTarget}</span></div>
                            <div class="coding-card-lbl">LeetCode Target</div>
                        </div>
                        <span style="font-size:12px;font-weight:700;color:#06b6d4;">${lcPct}%</span>
                    </div>
                    <div style="height:6px;background:rgba(255,255,255,0.08);border-radius:999px;margin-top:12px;overflow:hidden;">
                        <div style="height:100%;width:${lcPct}%;background:#06b6d4;border-radius:999px;"></div>
                    </div>
                    <div class="coding-quick-btns">
                        <button class="btn btn-sm btn-secondary" style="flex:1;font-size:11px;" onclick="window.appUI.quickLogCoding('leetcode', 1)">+1 Problem</button>
                    </div>
                </div>

                <div class="coding-card">
                    <div style="display:flex;justify-content:space-between;align-items:flex-start;">
                        <div>
                            <div class="coding-card-val" style="color:#8b5cf6;">${codingStats.a2zCurrent} <span style="font-size:14px;color:var(--text-muted);">/ ${codingStats.a2zTarget}</span></div>
                            <div class="coding-card-lbl">Striver A2Z Sheet</div>
                        </div>
                        <span style="font-size:12px;font-weight:700;color:#8b5cf6;">${a2zPct}%</span>
                    </div>
                    <div style="height:6px;background:rgba(255,255,255,0.08);border-radius:999px;margin-top:12px;overflow:hidden;">
                        <div style="height:100%;width:${a2zPct}%;background:#8b5cf6;border-radius:999px;"></div>
                    </div>
                    <div class="coding-quick-btns">
                        <button class="btn btn-sm btn-secondary" style="flex:1;font-size:11px;" onclick="window.appUI.quickLogCoding('a2z', 1)">+1 Problem</button>
                    </div>
                </div>

                <div class="coding-card">
                    <div class="coding-card-val" style="color:#f59e0b;">${codingWeek}</div>
                    <div class="coding-card-lbl">Problems Solved This Week</div>
                    <div style="font-size:11px;color:var(--text-muted);margin-top:10px;">Continuous DSA Practice</div>
                </div>

                <div class="coding-card">
                    <div class="coding-card-lbl" style="margin-bottom:6px;color:var(--primary-emerald);">Today's DSA Goal</div>
                    <div style="font-size:13px;font-weight:600;color:white;line-height:1.3;flex:1;">${this._escapeHtml(codingStats.dailyDsaGoal)}</div>
                </div>
            </div>
        </div>`;

        // ── Today's Focus HTML ───────────────────────────────────────────
        const focusItems = TodaysFocus.getData();
        const focusHTML = focusItems.length === 0
            ? `<div style="color:var(--text-muted);font-size:13px;padding:12px 0;">No focus tasks added for today. <a href="#" onclick="window.appUI.switchTab('focus');return false;" style="color:var(--primary-cyan);">+ Add Today's Focus →</a></div>`
            : focusItems.slice(0, 5).map(f => `
                <div class="focus-item-row ${f.completed ? 'completed' : ''}">
                    <div style="display:flex;align-items:center;gap:10px;">
                        <input type="checkbox" ${f.completed ? 'checked' : ''} onclick="window.appUI.toggleFocusItem('${f.id}')" style="cursor:pointer;width:16px;height:16px;accent-color:#06b6d4;">
                        <span style="font-size:14px;color:white;">${this._escapeHtml(f.text)}</span>
                    </div>
                    <button style="background:none;border:none;color:var(--text-muted);cursor:pointer;font-size:12px;" onclick="window.appUI.deleteFocusItem('${f.id}')">✕</button>
                </div>`).join('');

        // ── Today's Habits HTML ─────────────────────────────────────────
        const habitsHTML = habits.length === 0
            ? `<div style="color:var(--text-muted);font-size:13px;padding:12px 0;">No daily habits yet. <a href="#" onclick="window.appUI.switchTab('habits');return false;" style="color:var(--primary-cyan);">+ Add Habits →</a></div>`
            : habits.slice(0, 5).map(h => {
                const checked = (h.history || []).includes(today);
                const streak  = HabitManager.calculateStreak(h.history || []);
                return `<div class="habit-item">
                    <div>
                        <div class="habit-title">${h.icon || '⭐'} ${h.name}</div>
                        <span class="streak-pill">🔥 ${streak} day streak</span>
                    </div>
                    <button class="btn btn-sm ${checked ? 'btn-secondary' : 'btn-primary'}"
                            onclick="window.appUI.toggleHabitToday('${h.id}')">
                        ${checked ? '✓ Done' : 'Mark Done'}
                    </button>
                </div>`;
            }).join('');

        // ── Streak Leaderboard ───────────────────────────────────────────
        const leaderboardHTML = streakLeaderboard.length === 0
            ? `<div style="color:var(--text-muted);font-size:13px;padding:8px 0;">Add habits to see your streaks here.</div>`
            : streakLeaderboard.slice(0, 5).map((h, i) => {
                const medals = ['🥇','🥈','🥉'];
                const medal  = medals[i] || '🏅';
                return `<div style="display:flex;align-items:center;justify-content:space-between;padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.05);">
                    <div style="display:flex;align-items:center;gap:10px;">
                        <span style="font-size:16px;">${medal}</span>
                        <span style="font-size:16px;">${h.icon || '⭐'}</span>
                        <span style="font-weight:600;font-size:14px;color:white;">${this._escapeHtml(h.name)}</span>
                    </div>
                    <div style="display:flex;align-items:center;gap:6px;background:rgba(245,158,11,0.1);border:1px solid rgba(245,158,11,0.2);border-radius:999px;padding:3px 10px;">
                        <span style="font-size:14px;">🔥</span>
                        <span style="font-weight:800;color:#f59e0b;font-size:13px;">${h.streak} days</span>
                    </div>
                </div>`;
            }).join('');

        // ── Subject overview ─────────────────────────────────────────────
        const subjectBars = subjects.slice(0, 4).map(s => {
            const stats = AttendanceCalc.calculateStats(s.attended, s.total, s.targetPercentage);
            return `<div style="margin-bottom:10px;">
                <div style="display:flex;justify-content:space-between;font-size:13px;font-weight:600;margin-bottom:4px;">
                    <span>${s.name}</span><span style="color:${stats.statusColor}">${stats.percentage}%</span>
                </div>
                <div class="progress-bar-bg">
                    <div class="progress-bar-fill" style="width:${stats.percentage}%;background:${stats.statusColor};"></div>
                </div>
                <div style="font-size:11px;color:var(--text-muted);margin-top:3px;">${stats.message}</div>
            </div>`;
        }).join('') || `<div style="color:var(--text-muted);font-size:13px;">No subjects yet.</div>`;

        // ══════════════════════════════════════════════════════════════════
        // RENDER
        // ══════════════════════════════════════════════════════════════════
        root.innerHTML = `

        <!-- XP Banner -->
        <div class="xp-banner" style="margin-bottom:24px;">
            <div class="xp-level-badge" id="dash-level-badge">${lvl.icon}</div>
            <div class="xp-info">
                <div class="xp-level-name">Level ${lvl.level} · ${lvl.name}</div>
                <div class="xp-bar-track">
                    <div class="xp-bar-fill" id="dash-xp-bar" style="width:0%;background:linear-gradient(90deg,${lvl.color},#06b6d4);"></div>
                </div>
                <div class="xp-bar-label">${next ? `${progress.xpInLevel} / ${progress.xpNeeded} XP to Level ${next.level}` : '🏆 Max Level Reached!'}</div>
            </div>
            <div class="xp-total-block">
                <div class="xp-total-num" style="color:#c4b5fd;">${(profile?.total || 0).toLocaleString()}</div>
                <div class="xp-total-label">Total XP</div>
            </div>
        </div>

        <!-- 6-stat Row -->
        <div class="dash-stats-row" style="margin-bottom:24px;">
            <div class="dash-stat-card">
                <div class="dash-stat-icon">📚</div>
                <div class="dash-stat-val">${overallPercentage}%</div>
                <div class="dash-stat-lbl">Attendance</div>
            </div>
            <div class="dash-stat-card">
                <div class="dash-stat-icon">⚡</div>
                <div class="dash-stat-val">${focusStats.completed}/${focusStats.total}</div>
                <div class="dash-stat-lbl">Today's Focus</div>
            </div>
            <div class="dash-stat-card">
                <div class="dash-stat-icon">🔥</div>
                <div class="dash-stat-val">${habitStats.done}/${habitStats.total}</div>
                <div class="dash-stat-lbl">Habits Done</div>
            </div>
            <div class="dash-stat-card">
                <div class="dash-stat-icon">🎯</div>
                <div class="dash-stat-val">${weeklyStats.completed}/${weeklyStats.total}</div>
                <div class="dash-stat-lbl">Weekly Goals</div>
            </div>
            <div class="dash-stat-card">
                <div class="dash-stat-icon">🏆</div>
                <div class="dash-stat-val">${yearlyStats.completed}/${yearlyStats.total}</div>
                <div class="dash-stat-lbl">Yearly Goals</div>
            </div>
            <div class="dash-stat-card">
                <div class="dash-stat-icon">⚡</div>
                <div class="dash-stat-val">+${todaySummary.xpEarned}</div>
                <div class="dash-stat-lbl">XP Today</div>
            </div>
        </div>

        <!-- Engineering & Coding Dashboard Widget -->
        ${codingWidgetHTML}

        <!-- Row 1: Today's Focus + Today's Habits -->
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:20px;">
            <!-- Today's Focus -->
            <div class="glass-panel">
                <div class="dashboard-widget-title">
                    <span>⚡ Today's Focus</span>
                    <a href="#" onclick="window.appUI.switchTab('focus');return false;" style="font-size:12px;color:var(--primary-cyan);">View all →</a>
                </div>
                ${focusHTML}
            </div>

            <!-- Today's Habits -->
            <div class="glass-panel">
                <div class="dashboard-widget-title">
                    <span>🔥 Daily Habits Check-in</span>
                    <a href="#" onclick="window.appUI.switchTab('habits');return false;" style="font-size:12px;color:var(--primary-cyan);">View all →</a>
                </div>
                ${habitsHTML}
            </div>
        </div>

        <!-- Row 2: Heatmap + Streak Leaderboard -->
        <div style="display:grid;grid-template-columns:1fr 320px;gap:20px;margin-bottom:20px;">
            <div class="glass-panel" style="overflow:visible;">
                <div class="dashboard-widget-title">
                    <span>🌡️ Activity Heatmap</span>
                    <span style="font-size:12px;color:var(--text-muted);">Last 26 weeks</span>
                </div>
                <div id="dash-heatmap"></div>
            </div>
            <div class="glass-panel">
                <div class="dashboard-widget-title"><span>🏆 Streak Leaderboard</span></div>
                ${leaderboardHTML}
            </div>
        </div>

        <!-- Row 3: Attendance Health + Quote -->
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:20px;">
            <div class="glass-panel">
                <div class="dashboard-widget-title"><span>🎓 Attendance Health</span></div>
                ${subjectBars}
            </div>
            <div class="glass-panel quote-panel">
                <div class="quote-emoji">${qEmoji}</div>
                <div class="quote-text">"${quote.text}"</div>
                <div class="quote-author">— ${quote.author}</div>
            </div>
        </div>
        `;

        // Animate XP bar
        setTimeout(() => {
            const bar = document.getElementById('dash-xp-bar');
            if (bar) bar.style.width = `${progress.pct}%`;
        }, 80);

        HeatmapRenderer.render('dash-heatmap', 26);
    },



    renderAttendanceTab(subjects = Storage.getSubjects()) {
        const container = document.getElementById('attendance-subjects-grid');
        if (!container) return;

        if (subjects.length === 0) {
            container.innerHTML = `
                <div class="glass-panel" style="grid-column: 1 / -1; text-align: center; padding: 60px;">
                    <h3>No Subjects Added Yet</h3>
                    <p style="color: var(--text-muted); margin-top: 8px; margin-bottom: 20px;">Add your college subjects to track attendance and calculate safe bunks.</p>
                    <button class="btn btn-primary" onclick="window.appUI.openModal('modal-add-subject')">+ Add Your First Subject</button>
                </div>
            `;
            return;
        }

        container.innerHTML = subjects.map(s => {
            const stats = AttendanceCalc.calculateStats(s.attended, s.total, s.targetPercentage);
            const isSafe = stats.status === 'SAFE';

            return `
                <div class="subject-card" style="--subject-accent: ${s.color || 'var(--primary-cyan)'};">
                    <div class="subject-header">
                        <div>
                            <div class="subject-name">${s.name}</div>
                            <div class="subject-code-prof">${s.code} • ${s.professor || 'No Prof Listed'}</div>
                        </div>
                        <span class="badge ${isSafe ? 'badge-safe' : (stats.status === 'BORDERLINE' ? 'badge-warning' : 'badge-critical')}">
                            ${stats.status}
                        </span>
                    </div>

                    <div class="subject-stats-row">
                        <div class="subject-percentage-big">${stats.percentage}%</div>
                        <div class="subject-ratio">
                            Attended: <strong>${s.attended}</strong> / ${s.total}
                        </div>
                    </div>

                    <div class="progress-bar-bg" style="margin-bottom: 12px;">
                        <div class="progress-bar-fill" style="width: ${Math.min(100, stats.percentage)}%; background: ${stats.statusColor};"></div>
                    </div>

                    <div class="bunk-calculator-box ${isSafe ? 'bunk-box-safe' : 'bunk-box-danger'}">
                        ${stats.message}
                    </div>

                    <div class="subject-action-bar">
                        <button class="btn-attendance btn-present" onclick="window.appUI.logAttendance('${s.id}', 'present')">+ Present</button>
                        <button class="btn-attendance btn-absent" onclick="window.appUI.logAttendance('${s.id}', 'absent')">+ Absent</button>
                        <button class="btn-attendance btn-cancel" onclick="window.appUI.logAttendance('${s.id}', 'cancel')">Cancelled</button>
                    </div>

                    <div style="display: flex; justify-content: space-between; margin-top: 16px; padding-top: 12px; border-top: 1px solid var(--border-glass);">
                        <button class="btn btn-sm btn-secondary" onclick="window.appUI.undoLastLog('${s.id}')">↩ Undo</button>
                        <button class="btn btn-sm btn-danger" onclick="window.appUI.deleteSubject('${s.id}')">🗑️ Delete Subject</button>
                    </div>
                </div>
            `;
        }).join('');
    },

    renderGoalsTab(goals = Storage.getGoals()) {
        const container = document.getElementById('goals-grid');
        if (!container) return;

        let filtered = goals;
        if (this.activeGoalFilter !== 'all') {
            filtered = goals.filter(g => g.category === this.activeGoalFilter);
        }

        if (filtered.length === 0) {
            container.innerHTML = `
                <div class="glass-panel" style="grid-column: 1 / -1; text-align: center; padding: 60px;">
                    <h3>No Life Goals Created Yet</h3>
                    <p style="color: var(--text-muted); margin-top: 8px; margin-bottom: 20px;">Create custom coding targets, habits, or fitness milestones.</p>
                    <button class="btn btn-primary" onclick="window.appUI.openModal('modal-add-goal')">+ Create Your First Goal</button>
                </div>
            `;
            return;
        }

        container.innerHTML = filtered.map(g => {
            const progress = GoalsCalc.calculateGoalProgress(g);
            const today = new Date().toISOString().split('T')[0];

            let contentHTML = '';

            if (g.type === 'counter') {
                contentHTML = `
                    <div style="margin-top: 12px;">
                        <div style="display: flex; justify-content: space-between; font-size: 13px; font-weight: 600; margin-bottom: 6px;">
                            <span style="color: var(--text-muted);">Progress</span>
                            <span style="color: var(--primary-cyan);">${progress.label}</span>
                        </div>
                        <div class="progress-bar-bg" style="margin-bottom: 14px;">
                            <div class="progress-bar-fill" style="width: ${progress.percentage}%;"></div>
                        </div>
                        <div class="goal-counter-control">
                            <button class="btn btn-sm btn-secondary" onclick="window.appUI.updateGoalCounter('${g.id}', -1)">- 1</button>
                            <span class="goal-counter-val">${g.current}</span>
                            <button class="btn btn-sm btn-primary" onclick="window.appUI.updateGoalCounter('${g.id}', 1)">+ 1</button>
                        </div>
                    </div>
                `;
            } else if (g.type === 'streak') {
                const isCompletedToday = g.lastCompleted === today;
                contentHTML = `
                    <div style="margin-top: 14px; background: rgba(255,255,255,0.03); border: 1px solid var(--border-glass); border-radius: var(--radius-md); padding: 14px; text-align: center;">
                        <div style="font-family: var(--font-heading); font-size: 28px; font-weight: 800; color: #f59e0b; margin-bottom: 4px;">
                            🔥 ${g.streak || 0} <span style="font-size: 14px; font-weight: 500; color: var(--text-muted);">Days Streak</span>
                        </div>
                        <div style="font-size: 11px; color: var(--text-muted); margin-bottom: 12px;">Best: ${g.bestStreak || 0} Days</div>
                        <button class="btn ${isCompletedToday ? 'btn-secondary' : 'btn-primary'}" style="width: 100%;" 
                                onclick="window.appUI.toggleHabit('${g.id}')">
                            ${isCompletedToday ? '✓ Done Today' : '⚡ Mark Completed Today'}
                        </button>
                    </div>
                `;
            } else if (g.type === 'checklist') {
                const subtasks = g.subtasks || [];
                contentHTML = `
                    <div style="margin-top: 12px;">
                        <div style="display: flex; justify-content: space-between; font-size: 12px; color: var(--text-muted); margin-bottom: 8px;">
                            <span>Subtask Checklist</span>
                            <span>${progress.label}</span>
                        </div>
                        <div class="progress-bar-bg" style="margin-bottom: 12px;">
                            <div class="progress-bar-fill" style="width: ${progress.percentage}%;"></div>
                        </div>
                        <div>
                            ${subtasks.map(st => `
                                <div class="checklist-item">
                                    <input type="checkbox" class="checklist-checkbox" ${st.completed ? 'checked' : ''} 
                                           onchange="window.appUI.toggleSubtask('${g.id}', '${st.id}')">
                                    <span class="checklist-text ${st.completed ? 'completed' : ''}">${st.text}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;
            }

            return `
                <div class="goal-card">
                    <div>
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <span class="goal-category-tag">${g.category.toUpperCase()}</span>
                            <span class="priority-badge priority-${g.priority || 'medium'}">${g.priority || 'medium'}</span>
                        </div>
                        <div class="goal-title">${g.title}</div>
                        <div class="goal-desc">${g.description || ''}</div>
                        ${contentHTML}
                    </div>
                    <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 16px; padding-top: 12px; border-top: 1px solid var(--border-glass);">
                        <button class="btn btn-sm btn-danger" onclick="window.appUI.deleteGoal('${g.id}')">🗑️ Delete Goal</button>
                    </div>
                </div>
            `;
        }).join('');
    },

    renderTimetableTab(timetable, subjects) {
        const container = document.getElementById('timetable-grid-container');
        if (!container) return;

        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const currentDay = TimetableManager.getCurrentDayName();

        // Render day-switcher tabs
        const switcher = document.getElementById('timetable-day-switcher');
        if (switcher) {
            switcher.innerHTML = days.map(day => {
                const isToday = day === currentDay;
                const count = (timetable[day] || []).length;
                return `<button class="day-tab-btn ${isToday ? 'today-tab' : ''}" 
                    onclick="window.appUI.openAddSlotForDay('${day}')">
                    ${day.slice(0,3)}
                    ${count > 0 ? `<span style="margin-left:4px;font-size:9px;opacity:0.7">${count}</span>` : ''}
                </button>`;
            }).join('');
        }

        container.innerHTML = days.map(day => {
            // Sort slots by start time
            const slots = (timetable[day] || []).slice().sort((a, b) => a.time.localeCompare(b.time));
            const isToday = day === currentDay;

            return `
                <div class="timetable-day-col ${isToday ? 'today-col' : ''}">
                    <div class="timetable-day-header ${isToday ? 'today' : ''}">
                        <span>${day.slice(0, 3).toUpperCase()}</span>
                        ${isToday
                            ? '<span class="badge badge-safe" style="font-size:9px;">TODAY</span>'
                            : `<span class="slot-count-badge">${slots.length}</span>`
                        }
                    </div>
                    ${slots.map((slot, idx) => {
                        const subj = subjects.find(s => s.id === slot.subjectId) || { name: 'Unknown', color: '#6b7280' };
                        const timeLabel = slot.timeEnd ? `${slot.time} – ${slot.timeEnd}` : slot.time;
                        return `
                            <div class="timetable-slot-card" style="--slot-color: ${subj.color || '#06b6d4'};">
                                <button class="slot-delete-btn" onclick="window.appUI.deleteSlot('${day}', ${idx})" title="Remove class">✕</button>
                                <div class="slot-time">⏰ ${timeLabel}</div>
                                <div class="slot-subject">${subj.name}</div>
                                ${subj.code ? `<div class="slot-room" style="color: var(--text-muted); font-weight:600;">${subj.code}</div>` : ''}
                                ${slot.room ? `<div class="slot-room">📍 ${slot.room}</div>` : ''}
                            </div>
                        `;
                    }).join('')}
                    ${slots.length === 0
                        ? `<div class="timetable-empty" onclick="window.appUI.openAddSlotForDay('${day}')">＋ Add class</div>`
                        : `<button class="slot-add-mini-btn" onclick="window.appUI.openAddSlotForDay('${day}')">＋ Add class</button>`
                    }
                </div>
            `;
        }).join('');
    },

    openAddSlotForDay(day) {
        // Pre-fill the day select if provided
        const daySelect = document.getElementById('slot-day');
        if (daySelect && day) daySelect.value = day;

        // Populate subject dropdown from stored subjects
        const subjectSelect = document.getElementById('slot-subject');
        if (subjectSelect) {
            const subjects = Storage.getSubjects();
            subjectSelect.innerHTML = '<option value="">Select subject...</option>' +
                subjects.map(s => `<option value="${s.id}">${s.name}${s.code ? ' (' + s.code + ')' : ''}</option>`).join('');
        }

        // Reset form
        document.getElementById('slot-time-start').value = '';
        document.getElementById('slot-time-end').value = '';
        document.getElementById('slot-room').value = '';

        this.openModal('modal-add-slot');
    },

    handleAddSlot(e) {
        e.preventDefault();
        const day = document.getElementById('slot-day').value;
        const subjectId = document.getElementById('slot-subject').value;
        const timeStart = document.getElementById('slot-time-start').value;
        const timeEnd = document.getElementById('slot-time-end').value;
        const room = document.getElementById('slot-room').value.trim();

        if (!day || !subjectId || !timeStart) return;

        // Format time to 12h display
        const fmt = (t) => {
            if (!t) return '';
            const [h, m] = t.split(':').map(Number);
            const ampm = h < 12 ? 'AM' : 'PM';
            const h12 = h % 12 || 12;
            return `${h12}:${String(m).padStart(2,'0')} ${ampm}`;
        };

        const timetable = Storage.getTimetable();
        if (!timetable[day]) timetable[day] = [];

        timetable[day].push({
            id: 'slot-' + Date.now(),
            subjectId,
            time: fmt(timeStart),
            timeEnd: timeEnd ? fmt(timeEnd) : '',
            room
        });

        Storage.saveTimetable(timetable);
        this.closeModal('modal-add-slot');
        this.showToast(`Class added to ${day}!`, 'success');
        this.renderAll();
    },

    deleteSlot(day, slotIndex) {
        const timetable = Storage.getTimetable();
        if (!timetable[day]) return;
        const sorted = timetable[day].slice().sort((a, b) => a.time.localeCompare(b.time));
        const slotToRemove = sorted[slotIndex];
        if (!slotToRemove) return;
        timetable[day] = timetable[day].filter(s => s.id !== slotToRemove.id);
        Storage.saveTimetable(timetable);
        this.showToast('Class removed from schedule.', 'info');
        this.renderAll();
    },

    renderHabitsTab() {
        const root = document.getElementById('habits-tab-root');
        if (!root) return;

        const habits = HabitManager.getData();
        const todayStats = HabitManager.getTodayStats(habits);
        const today = HabitManager.todayKey();

        // ── Today's ring ──────────────────────────────────────────────────
        const R = 37, circ = 2 * Math.PI * R;
        const offset = circ - (todayStats.pct / 100) * circ;
        const ringColor = todayStats.pct === 100 ? '#10b981' : todayStats.pct >= 50 ? '#f59e0b' : '#ef4444';
        const states = [
            { min: 100, icon: '🎉', label: 'Perfect Day!' },
            { min: 75,  icon: '🔥', label: 'On Fire!' },
            { min: 50,  icon: '💪', label: 'Keep Going!' },
            { min: 1,   icon: '🌱', label: 'Good Start' },
            { min: 0,   icon: '☀️', label: 'Start Your Day' },
        ];
        const state = states.find(s => todayStats.pct >= s.min) || states[states.length-1];

        const ringHTML = `
            <div class="habits-today-ring">
                <div class="habits-ring-wrap">
                    <svg class="habits-ring-svg" width="90" height="90">
                        <circle class="habits-ring-bg" cx="45" cy="45" r="${R}"/>
                        <circle class="habits-ring-fill" cx="45" cy="45" r="${R}"
                            stroke="${ringColor}" stroke-dasharray="${circ}" stroke-dashoffset="${offset}"/>
                    </svg>
                    <div class="habits-ring-text">
                        <span class="habits-ring-pct" style="color:${ringColor}">${todayStats.pct}%</span>
                        <span class="habits-ring-label">done</span>
                    </div>
                </div>
                <div class="habits-today-stats">
                    <div class="habits-today-done">${todayStats.done}/${todayStats.total}</div>
                    <div class="habits-today-total">habits done today</div>
                    <div class="habits-state-badge">${state.icon} ${state.label}</div>
                </div>
            </div>`;

        // ── Habit Cards ───────────────────────────────────────────────────
        let cardsHTML;
        if (habits.length === 0) {
            cardsHTML = `
                <div class="habits-empty">
                    <span class="habits-empty-icon">🔥</span>
                    <div class="habits-empty-title">No habits yet</div>
                    <div class="habits-empty-sub">
                        Add your non-negotiable daily habits — things you commit to every single day regardless of anything else.
                    </div>
                    <button class="btn btn-primary" onclick="window.appUI.openAddHabitModal()">
                        + Add Your First Habit
                    </button>
                </div>`;
        } else {
            cardsHTML = `<div class="habits-grid">` +
                habits.map(h => {
                    const checked    = h.history && h.history.includes(today);
                    const streak     = HabitManager.calculateStreak(h.history || []);
                    const bestStreak = h.bestStreak || 0;
                    const rate30     = HabitManager.getCompletionRate(h.history || [], 30);
                    const dots       = HabitManager.getLast14Days(h.history || []);

                    const dotsHTML = dots.map(d => `
                        <div class="habit-dot ${d.done ? 'done' : ''} ${d.isToday ? 'today' : ''}"
                             style="${d.done ? `--habit-color:${h.color||'#06b6d4'}` : ''}"
                             title="${d.date}"></div>`).join('');

                    return `
                        <div class="habit-card ${checked ? 'done-today' : ''}"
                             style="--habit-color:${h.color || '#06b6d4'}">
                            <div class="habit-card-top">
                                <div class="habit-icon-name">
                                    <span class="habit-emoji">${h.icon || '⭐'}</span>
                                    <div>
                                        <div class="habit-name">${this._escapeHtml(h.name)}</div>
                                        <div class="habit-rate">${rate30}% this month</div>
                                    </div>
                                </div>
                                <div class="habit-card-actions">
                                    <button class="habit-delete-btn"
                                            onclick="window.appUI.deleteHabit('${h.id}')"
                                            title="Delete habit">✕</button>
                                </div>
                            </div>

                            <div class="habit-streak-row">
                                <div class="habit-streak-badge">🔥 ${streak} day${streak !== 1 ? 's' : ''}</div>
                                <span class="habit-best-streak">Best: ${bestStreak} days</span>
                            </div>

                            <div class="habit-dots-row">${dotsHTML}</div>

                            <button class="habit-check-btn ${checked ? 'checked' : ''}"
                                    onclick="window.appUI.toggleHabitToday('${h.id}')">
                                ${checked ? '✓ Done Today' : 'Mark Done'}
                            </button>
                        </div>`;
                }).join('') + `</div>`;
        }

        root.innerHTML = `
            <!-- Header -->
            <div class="habits-header">
                <div class="habits-header-left">
                    <div class="habits-header-title">🔥 Daily Habits</div>
                    <div class="habits-header-sub">Non-negotiable rituals — tracked every day, forever.</div>
                </div>
                ${ringHTML}
            </div>

            <!-- Cards -->
            ${cardsHTML}

            <!-- Add Habit CTA -->
            ${habits.length > 0 ? `
            <div class="add-habit-cta">
                <button class="btn btn-primary" onclick="window.appUI.openAddHabitModal()">
                    + Add New Habit
                </button>
            </div>` : ''}
        `;
    },

    openAddHabitModal() {
        const fieldName = document.getElementById('field-habit-name');
        if (fieldName) fieldName.value = '';

        const iconInput = document.getElementById('field-habit-icon');
        const colorInput = document.getElementById('field-habit-color');
        if (iconInput) iconInput.value = '⭐';
        if (colorInput) colorInput.value = '#06b6d4';

        const emojiGrid = document.getElementById('emoji-picker-grid');
        const colorRow  = document.getElementById('color-picker-row');

        if (emojiGrid) {
            let selectedEmoji = '⭐';
            emojiGrid.innerHTML = HabitManager.PRESET_EMOJIS.map(e => `
                <div class="emoji-option ${e === selectedEmoji ? 'selected' : ''}"
                     onclick="this.closest('.emoji-picker-grid').querySelectorAll('.emoji-option').forEach(x=>x.classList.remove('selected'));this.classList.add('selected');document.getElementById('field-habit-icon').value='${e}'">
                    ${e}
                </div>`).join('');
        }

        if (colorRow) {
            let selectedColor = '#06b6d4';
            colorRow.innerHTML = HabitManager.PRESET_COLORS.map(c => `
                <div class="color-option ${c === selectedColor ? 'selected' : ''}"
                     style="background:${c}"
                     onclick="this.closest('.color-picker-row').querySelectorAll('.color-option').forEach(x=>x.classList.remove('selected'));this.classList.add('selected');document.getElementById('field-habit-color').value='${c}'">
                </div>`).join('');
        }

        this.openModal('modal-add-habit');
        setTimeout(() => { if (fieldName) fieldName.focus(); }, 150);
    },

    handleAddHabit(e) {
        e.preventDefault();
        const name  = document.getElementById('field-habit-name')?.value?.trim();
        const icon  = document.getElementById('field-habit-icon')?.value || '⭐';
        const color = document.getElementById('field-habit-color')?.value || '#06b6d4';
        if (!name) return;

        HabitManager.addHabit(name, icon, color);
        XPSystem.earn('new_goal'); // +2 XP
        this.closeModal('modal-add-habit');
        e.target.reset();

        this.showToast(`Habit "${name}" added! (+2 XP)`, 'success');
        this.renderHabitsTab();
        this.renderDashboard(Storage.getSubjects(), Storage.getGoals(), TimetableManager.getData());
    },

    toggleHabitToday(habitId) {
        const habit = HabitManager.toggleToday(habitId);
        if (habit && HabitManager.isCheckedToday(habit)) {
            XPSystem.earn('habit_check'); // +3 XP
            const streak = HabitManager.calculateStreak(habit.history || []);

            // Automatic progress rollup to Milestone Goals V2
            const rollups = MilestoneGoalsV2.syncProgressFromKeyword(habit.name, 1);
            if (rollups && rollups.length > 0) {
                const names = rollups.map(r => `${r.period} (${r.currentCount}/${r.targetCount || ''})`).join(', ');
                this.showToast(`${habit.icon} ${habit.name} done! 🔗 Auto-synced to ${names} (+3 XP)`, 'success');
            } else {
                this.showToast(`${habit.icon} ${habit.name} — done! 🔥 ${streak} day streak (+3 XP)`, 'success');
            }
        } else if (habit && !HabitManager.isCheckedToday(habit)) {
            MilestoneGoalsV2.syncProgressFromKeyword(habit.name, -1);
        }
        this.renderHabitsTab();
        this.renderGoalsV2Tab();
    },

    deleteHabit(habitId) {
        HabitManager.deleteHabit(habitId);
        this.showToast('Habit removed.', 'info');
        this.renderHabitsTab();
    },

    renderTasksTab() {
        const root = document.getElementById('tasks-tab-root');
        if (!root) return;

        const allStats = TaskManager.getAllStats();
        const period   = this.activePeriod;
        const tasks    = TaskManager.getTasks(period);
        const stats    = allStats[period];
        const meta     = TaskManager.PERIOD_META;
        const COLORS   = { daily: '#06b6d4', weekly: '#8b5cf6', monthly: '#f59e0b', yearly: '#10b981' };

        // ── Build SVG ring helper ──────────────────────────────────────────
        const ring = (pct, color, size = 72) => {
            const r = (size / 2) - 6;
            const circ = 2 * Math.PI * r;
            const offset = circ - (pct / 100) * circ;
            return `
                <svg class="toc-ring-svg" width="${size}" height="${size}">
                    <circle class="toc-ring-bg" cx="${size/2}" cy="${size/2}" r="${r}"/>
                    <circle class="toc-ring-fill" cx="${size/2}" cy="${size/2}" r="${r}"
                        stroke="${color}" stroke-dasharray="${circ}" stroke-dashoffset="${offset}"/>
                </svg>`;
        };

        // ── Overview Cards ────────────────────────────────────────────────
        const overviewHTML = TaskManager.PERIODS.map(p => {
            const s = allStats[p];
            const c = COLORS[p];
            return `
                <div class="task-overview-card ${p === period ? 'active' : ''}"
                     style="--card-accent:${c}"
                     onclick="window.appUI.switchPeriod('${p}')">
                    <div class="toc-icon">${meta[p].icon}</div>
                    <div class="toc-ring-wrap">
                        ${ring(s.pct, c)}
                        <div class="toc-ring-text">
                            <span class="toc-pct" style="color:${c}">${s.pct}%</span>
                            <span class="toc-count">${s.completed}/${s.total}</span>
                        </div>
                    </div>
                    <div class="toc-label">${meta[p].label}</div>
                </div>`;
        }).join('');

        // ── Period Sub-Nav ────────────────────────────────────────────────
        const subNavHTML = TaskManager.PERIODS.map(p => `
            <button class="tasks-period-btn ${p === period ? 'active' : ''}"
                    onclick="window.appUI.switchPeriod('${p}')">
                ${meta[p].icon} <span class="period-label">${meta[p].label}</span>
            </button>`).join('');

        // ── Task List ─────────────────────────────────────────────────────
        let taskListHTML;
        if (tasks.length === 0) {
            taskListHTML = `
                <div class="tasks-empty">
                    <span class="tasks-empty-icon">${meta[period].icon}</span>
                    No ${meta[period].label.toLowerCase()} tasks yet.<br>
                    Add your first task above to get started!
                </div>`;
        } else {
            taskListHTML = `<div class="task-list">` + tasks.map(t => {
                const hasCounter = t.targetCount && t.targetCount > 0;
                const cur = t.currentCount || 0;
                const tgt = t.targetCount || 1;
                const countPct = hasCounter ? Math.min(100, Math.round((cur / tgt) * 100)) : (t.completed ? 100 : 0);
                const countColor = countPct >= 100 ? '#10b981' : countPct >= 50 ? '#f59e0b' : COLORS[period];

                return `
                <div class="task-item ${t.completed ? 'done' : ''}" id="taskrow-${t.id}">
                    <div class="task-checkbox ${t.completed ? 'checked' : ''}"
                         onclick="window.appUI.toggleTask('${period}','${t.id}')">
                        ${t.completed ? '✓' : ''}
                    </div>
                    <div style="flex:1;min-width:0;">
                        <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;">
                            <span class="task-text ${t.completed ? 'done-text' : ''}">${this._escapeHtml(t.text)}</span>
                            ${hasCounter ? `
                                <div style="display:flex;align-items:center;gap:6px;flex-shrink:0;">
                                    <button class="btn btn-secondary btn-sm" style="padding:2px 8px;font-size:11px;border-radius:4px;" onclick="window.appUI.stepTaskCount('${period}','${t.id}', -1)">-1</button>
                                    <span style="font-size:13px;font-weight:800;color:${countColor};font-family:var(--font-heading);">${cur}/${tgt}</span>
                                    <button class="btn btn-primary btn-sm" style="padding:2px 8px;font-size:11px;border-radius:4px;" onclick="window.appUI.stepTaskCount('${period}','${t.id}', 1)">+1</button>
                                </div>
                            ` : ''}
                        </div>
                        ${hasCounter ? `
                            <div style="height:6px;background:rgba(255,255,255,0.08);border-radius:999px;margin-top:6px;overflow:hidden;">
                                <div style="height:100%;width:${countPct}%;background:${countColor};border-radius:999px;transition:width 0.3s ease;"></div>
                            </div>
                        ` : ''}
                    </div>
                    <button class="task-delete-btn" onclick="window.appUI.deleteTask('${period}','${t.id}')" title="Delete">✕</button>
                </div>`;
            }).join('') + `</div>`;
        }

        // ── History Bar Chart ─────────────────────────────────────────────
        const history = stats.history;
        let historyHTML;
        if (history.length === 0) {
            historyHTML = `<div style="color:var(--text-muted);font-size:13px;text-align:center;padding:20px 0;">
                Completion history will appear after your first period resets.</div>`;
        } else {
            const maxVal = Math.max(...history.map(h => h.total), 1);
            const bars = history.slice(0, 12).reverse().map(h => {
                const heightPct = Math.max(4, h.pct);
                const c = h.pct >= 80 ? '#10b981' : h.pct >= 50 ? '#f59e0b' : '#ef4444';
                const shortLabel = period === 'daily'   ? h.periodStart.slice(5) :
                                   period === 'weekly'  ? h.periodStart.slice(5) :
                                   period === 'monthly' ? h.periodStart.slice(0,7) :
                                   h.periodStart.slice(0,4);
                return `
                    <div class="history-bar-col">
                        <div class="history-bar" style="height:${heightPct}%;background:${c};"
                             data-tip="${shortLabel}: ${h.pct}% (${h.completed}/${h.total})"></div>
                        <span class="history-bar-label">${shortLabel}</span>
                    </div>`;
            }).join('');
            historyHTML = `<div class="history-bar-chart">${bars}</div>`;
        }

        // ── Computed analytics ────────────────────────────────────────────
        const avgPct = history.length
            ? Math.round(history.reduce((a,h) => a + h.pct, 0) / history.length)
            : stats.pct;
        const bestPct = history.length
            ? Math.max(...history.map(h => h.pct), stats.pct)
            : stats.pct;
        const totalCompleted = history.reduce((a,h) => a + h.completed, 0) + stats.completed;

        // ── Full HTML ─────────────────────────────────────────────────────
        root.innerHTML = `
            <div style="margin-bottom:24px;">
                <h2 style="font-family:var(--font-heading);font-size:24px;font-weight:800;">✅ Tasks & Goals Tracker</h2>
                <p style="font-size:13px;color:var(--text-muted);margin-top:4px;">
                    Daily, weekly, monthly, and yearly checklists — tasks auto-reset each period.
                </p>
            </div>

            <!-- Overview Cards -->
            <div class="tasks-overview">${overviewHTML}</div>

            <!-- Period Sub-Nav -->
            <div class="tasks-period-nav">${subNavHTML}</div>

            <!-- Main content: checklist + analytics -->
            <div class="tasks-main-grid">

                <!-- Checklist Panel -->
                <div class="tasks-checklist-panel">
                    <div class="tasks-panel-header">
                        <div>
                            <div class="tasks-panel-title" style="color:${COLORS[period]}">
                                ${meta[period].icon} ${meta[period].label} Tasks
                            </div>
                            <div class="tasks-period-date">${stats.periodLabel} · ${meta[period].resetLabel}</div>
                        </div>
                        <div class="tasks-progress-summary">
                            <div class="tasks-pct-big" style="color:${COLORS[period]}">${stats.pct}%</div>
                            <div class="tasks-done-label">${stats.completed}/${stats.total} done</div>
                        </div>
                    </div>

                    <div class="tasks-progress-bar-bg">
                        <div class="tasks-progress-bar-fill"
                             style="width:${stats.pct}%;background:${COLORS[period]};"></div>
                    </div>

                    <!-- Add task -->
                    <div class="task-add-row">
                        <input class="task-add-input" id="task-add-input-${period}"
                               placeholder="Add a new ${meta[period].label.toLowerCase()} task..."
                               style="--task-accent:${COLORS[period]}"
                               onkeydown="if(event.key==='Enter') window.appUI.addTask('${period}')">
                        <button class="task-add-btn" style="background:${COLORS[period]}"
                                onclick="window.appUI.addTask('${period}')">+</button>
                    </div>

                    ${taskListHTML}
                </div>

                <!-- Analytics Panel -->
                <div class="tasks-analytics-panel">

                    <div class="tasks-analytics-card">
                        <div class="tasks-analytics-title">📊 ${meta[period].label} Stats</div>
                        <div class="tasks-stat-row">
                            <span class="tasks-stat-key">This period</span>
                            <span class="tasks-stat-val" style="color:${COLORS[period]}">${stats.pct}%</span>
                        </div>
                        <div class="tasks-stat-row">
                            <span class="tasks-stat-key">Average (all time)</span>
                            <span class="tasks-stat-val">${avgPct}%</span>
                        </div>
                        <div class="tasks-stat-row">
                            <span class="tasks-stat-key">Best period</span>
                            <span class="tasks-stat-val" style="color:#10b981">${bestPct}%</span>
                        </div>
                        <div class="tasks-stat-row">
                            <span class="tasks-stat-key">Total completed</span>
                            <span class="tasks-stat-val">${totalCompleted}</span>
                        </div>
                        <div class="tasks-stat-row">
                            <span class="tasks-stat-key">Periods tracked</span>
                            <span class="tasks-stat-val">${history.length + 1}</span>
                        </div>
                    </div>

                    <div class="tasks-analytics-card">
                        <div class="tasks-analytics-title">📈 Completion History</div>
                        ${historyHTML}
                    </div>

                    <div class="tasks-analytics-card">
                        <div class="tasks-analytics-title">🎯 All Periods Overview</div>
                        ${TaskManager.PERIODS.map(p => {
                            const s = allStats[p];
                            const c = COLORS[p];
                            return `
                                <div class="tasks-stat-row">
                                    <span class="tasks-stat-key">${meta[p].icon} ${meta[p].label}</span>
                                    <div style="display:flex;align-items:center;gap:8px;">
                                        <div style="width:70px;height:5px;background:rgba(255,255,255,0.07);border-radius:999px;overflow:hidden;">
                                            <div style="height:100%;width:${s.pct}%;background:${c};border-radius:999px;"></div>
                                        </div>
                                        <span class="tasks-stat-val" style="color:${c};font-size:13px;">${s.pct}%</span>
                                    </div>
                                </div>`;
                        }).join('')}
                    </div>

                </div>
            </div>
        `;

        // Auto-focus input
        setTimeout(() => {
            document.getElementById(`task-add-input-${period}`)?.focus();
        }, 50);
    },

    switchPeriod(period) {
        this.activePeriod = period;
        this.renderTasksTab();
    },

    addTask(period) {
        const input = document.getElementById(`task-add-input-${period}`);
        if (!input || !input.value.trim()) return;
        const ok = TaskManager.addTask(period, input.value);
        if (ok) {
            input.value = '';
            XPSystem.earn('new_goal'); // +2 XP per task added
            this.renderTasksTab();
        }
    },

    toggleTask(period, taskId) {
        const res = TaskManager.toggleTask(period, taskId);
        if (res.completed) {
            XPSystem.earn('goal_milestone'); // +10 XP per task completed
            if (res.rollups && res.rollups.length > 0) {
                const names = res.rollups.map(r => `${r.period} (${r.currentCount}/${r.targetCount || ''})`).join(', ');
                this.showToast(`Task completed! 🔗 Auto-synced to ${names} (+10 XP)`, 'success');
            } else {
                this.showToast('Task completed! (+10 XP)', 'success');
            }
        }
        this.renderTasksTab();
    },

    stepTaskCount(period, taskId, delta) {
        const task = TaskManager.incrementTaskCount(period, taskId, delta);
        if (task && task.completed) {
            XPSystem.earn('goal_milestone'); // +10 XP
            this.showToast(`🎯 Goal completed: ${task.text}! (+10 XP)`, 'success');
        }
        this.renderTasksTab();
    },

    deleteTask(period, taskId) {
        TaskManager.deleteTask(period, taskId);
        this.renderTasksTab();
    },

    _escapeHtml(str) {
        return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    },

    // ─── TODAY'S FOCUS TAB ────────────────────────────────────────────────────
    renderFocusTab() {
        const root = document.getElementById('focus-root');
        if (!root) return;

        const items = TodaysFocus.getData();
        const stats = TodaysFocus.getStats();

        const itemsHTML = items.length === 0
            ? `<div style="text-align:center;padding:50px 20px;color:var(--text-muted);">
                <div style="font-size:42px;margin-bottom:12px;">⚡</div>
                <div style="font-family:var(--font-heading);font-size:20px;font-weight:700;color:white;">No focus items for today</div>
                <div style="font-size:13px;margin-top:6px;">Add non-recurring tasks you want to accomplish today (e.g. Buy groceries, Call Mom, Finish DBMS assignment).</div>
            </div>`
            : items.map(item => `
                <div class="focus-item-row ${item.completed ? 'completed' : ''}">
                    <div style="display:flex;align-items:center;gap:12px;flex:1;">
                        <input type="checkbox" ${item.completed ? 'checked' : ''}
                               onclick="window.appUI.toggleFocusItem('${item.id}')"
                               style="width:18px;height:18px;cursor:pointer;accent-color:#06b6d4;">
                        <span style="font-size:15px;color:white;font-weight:500;">${this._escapeHtml(item.text)}</span>
                    </div>
                    <button class="btn btn-secondary btn-sm" style="padding:4px 8px;font-size:12px;color:#ef4444;"
                            onclick="window.appUI.deleteFocusItem('${item.id}')">✕</button>
                </div>`).join('');

        root.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;flex-wrap:wrap;gap:16px;">
            <div>
                <h2 style="font-family:var(--font-heading);font-size:24px;font-weight:800;">⚡ Today's Focus</h2>
                <p style="font-size:13px;color:var(--text-muted);margin-top:4px;">Non-recurring important tasks for today. Resets daily.</p>
            </div>
            <div style="display:flex;align-items:center;gap:16px;">
                <div style="text-align:right;">
                    <div style="font-family:var(--font-heading);font-size:22px;font-weight:800;color:#06b6d4;">${stats.completed}/${stats.total}</div>
                    <div style="font-size:11px;color:var(--text-muted);">completed today</div>
                </div>
            </div>
        </div>

        <div class="focus-card" style="margin-bottom:20px;">
            <form onsubmit="window.appUI.addFocusItem(event)" style="display:flex;gap:10px;">
                <input type="text" id="field-focus-input" class="form-control" placeholder="Add a task for today (e.g. Buy groceries, Call Mom)..." required style="flex:1;">
                <button type="submit" class="btn btn-primary">+ Add Focus</button>
            </form>
        </div>

        <div class="glass-panel">
            <div class="dashboard-widget-title"><span>📋 Today's Tasks</span><span style="font-size:12px;color:var(--text-muted);">${stats.pct}% done</span></div>
            ${itemsHTML}
        </div>
        `;
    },

    addFocusItem(e) {
        e.preventDefault();
        const input = document.getElementById('field-focus-input');
        if (!input || !input.value.trim()) return;
        TodaysFocus.addItem(input.value);
        input.value = '';
        XPSystem.earn('new_goal'); // +2 XP
        this.showToast('Today\'s Focus item added! (+2 XP)', 'success');
        this.renderFocusTab();
    },

    toggleFocusItem(id) {
        const item = TodaysFocus.toggleItem(id);
        if (item && item.completed) {
            XPSystem.earn('habit_check'); // +3 XP
            this.showToast(`✓ "${item.text}" completed! (+3 XP)`, 'success');
        }
        this.renderFocusTab();
    },

    deleteFocusItem(id) {
        TodaysFocus.deleteItem(id);
        this.showToast('Item removed.', 'info');
        this.renderFocusTab();
    },

    // ─── MILESTONE GOALS V2 TAB ───────────────────────────────────────────────
    renderGoalsV2Tab() {
        const root = document.getElementById('goals-v2-root');
        if (!root) return;

        const catFilter = this._goalsV2CatFilter || 'all';
        this._goalsV2CatFilter = catFilter;

        const weeklyGoals = MilestoneGoalsV2.getGoals('weekly', catFilter);
        const monthlyGoals = MilestoneGoalsV2.getGoals('monthly', catFilter);
        const yearlyGoals = MilestoneGoalsV2.getGoals('yearly', catFilter);

        const wStats = MilestoneGoalsV2.getStats('weekly');
        const mStats = MilestoneGoalsV2.getStats('monthly');
        const yStats = MilestoneGoalsV2.getStats('yearly');

        const totalAll = wStats.total + mStats.total + yStats.total;
        const completedAll = wStats.completed + mStats.completed + yStats.completed;
        const overallPct = totalAll > 0 ? Math.round((completedAll / totalAll) * 100) : 0;

        const cats = MilestoneGoalsV2.CATEGORIES;

        // Category filter buttons
        const catFilterHTML = `
            <button class="cat-filter-btn ${catFilter === 'all' ? 'active' : ''}" onclick="window.appUI.switchGoalsV2Cat('all')">All Categories</button>
            ${Object.entries(cats).map(([k, meta]) => `
                <button class="cat-filter-btn ${catFilter === k ? 'active' : ''}" onclick="window.appUI.switchGoalsV2Cat('${k}')">
                    ${meta.icon} ${meta.label}
                </button>
            `).join('')}`;

        // Helper to render goal cards list for a period
        const renderGoalCardsList = (goals, period, periodLabel) => {
            if (goals.length === 0) {
                return `
                <div style="text-align:center; padding:30px 20px; color:var(--text-muted);" class="glass-panel">
                    <div style="font-size:28px;margin-bottom:6px;">🎯</div>
                    <div style="font-size:14px;font-weight:600;color:white;">No ${period} goals ${catFilter !== 'all' ? `in ${cats[catFilter]?.label || catFilter}` : ''}</div>
                    <button class="btn btn-secondary btn-sm" style="margin-top:10px;font-size:11px;" onclick="window.appUI.openModal('modal-add-goal-v2')">+ Add ${periodLabel}</button>
                </div>`;
            }
            return `<div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(300px, 1fr));gap:16px;">` +
            goals.map(g => {
                const catMeta = cats[g.category] || cats.personal;
                const hasCounter = g.targetCount && g.targetCount > 0;
                const cur = g.currentCount || 0;
                const tgt = g.targetCount || 1;
                const pct = hasCounter ? Math.min(100, Math.round((cur / tgt) * 100)) : (g.completed ? 100 : 0);
                const color = pct >= 100 ? '#10b981' : pct >= 50 ? '#f59e0b' : catMeta.color;

                return `
                <div class="goal-milestone-card ${g.completed ? 'completed' : ''}">
                    <div>
                        <div class="goal-card-top">
                            <div>
                                <span class="category-badge cat-${g.category}">${catMeta.icon} ${catMeta.label}</span>
                                <div class="goal-card-title" style="margin-top:8px;">${this._escapeHtml(g.title)}</div>
                            </div>
                            <div style="text-align:right;">
                                ${hasCounter ? `
                                    <div class="goal-progress-num" style="color:${color}">${cur}<span style="font-size:13px;color:var(--text-muted);">/${tgt}</span></div>
                                    <div style="font-size:11px;font-weight:700;color:${color}">${pct}%</div>
                                ` : `
                                    <button class="btn btn-sm ${g.completed ? 'btn-secondary' : 'btn-primary'}" onclick="window.appUI.toggleGoalV2('${period}','${g.id}')">
                                        ${g.completed ? '✓ Done' : 'Mark Done'}
                                    </button>
                                `}
                            </div>
                        </div>

                        ${hasCounter ? `
                            <div class="goal-progress-bar-bg">
                                <div class="goal-progress-bar-fill" style="width:${pct}%;background:${color};"></div>
                            </div>
                            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
                                <div style="display:flex;gap:6px;">
                                    <button class="btn btn-secondary btn-sm" style="padding:2px 8px;font-size:11px;" onclick="window.appUI.stepGoalV2('${period}','${g.id}', -1)">-1</button>
                                    <button class="btn btn-primary btn-sm" style="padding:2px 8px;font-size:11px;" onclick="window.appUI.stepGoalV2('${period}','${g.id}', 1)">+1 Progress</button>
                                </div>
                                <span style="font-size:11px;color:var(--text-muted);">${tgt - cur > 0 ? `${tgt - cur} remaining` : '🎉 Milestone Achieved!'}</span>
                            </div>
                        ` : ''}

                        ${g.notes ? `
                            <div class="goal-notes-box">
                                📝 <strong>Plan:</strong> ${this._escapeHtml(g.notes)}
                            </div>
                        ` : ''}
                    </div>

                    <div class="goal-card-footer" style="margin-top:14px;padding-top:10px;border-top:1px solid rgba(255,255,255,0.05);">
                        <span>${g.deadline ? `⏰ Due: ${g.deadline}` : `Created: ${g.createdAt}`}</span>
                        <button style="background:none;border:none;color:var(--text-muted);cursor:pointer;font-size:12px;" onclick="window.appUI.deleteGoalV2('${period}','${g.id}')" title="Delete Goal">✕ Delete</button>
                    </div>
                </div>`;
            }).join('') + `</div>`;
        };

        root.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;flex-wrap:wrap;gap:16px;">
            <div>
                <h2 style="font-family:var(--font-heading);font-size:24px;font-weight:800;">🎯 Milestone Goals</h2>
                <p style="font-size:13px;color:var(--text-muted);margin-top:4px;">Weekly, Monthly, and Yearly goals in one single unified view with auto-syncing progress.</p>
            </div>
            <button class="btn btn-primary" onclick="window.appUI.openModal('modal-add-goal-v2')">+ Create Milestone Goal</button>
        </div>

        <!-- Embedded Analytics Header -->
        <div class="glass-panel" style="margin-bottom:24px;padding:20px;background:linear-gradient(135deg, rgba(6,182,212,0.1), rgba(139,92,246,0.1));border:1px solid rgba(255,255,255,0.1);">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;flex-wrap:wrap;gap:12px;">
                <div style="font-family:var(--font-heading);font-size:16px;font-weight:700;color:white;">📈 Milestone Progress Analytics</div>
                <div style="font-size:12px;font-weight:700;color:#06b6d4;">Overall: ${completedAll}/${totalAll} (${overallPct}%)</div>
            </div>

            <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(200px, 1fr));gap:16px;">
                <div style="background:rgba(0,0,0,0.2);padding:12px 16px;border-radius:12px;border:1px solid rgba(255,255,255,0.05);">
                    <div style="display:flex;justify-content:space-between;font-size:12px;color:var(--text-muted);margin-bottom:6px;">
                        <span>📅 Weekly Goals</span>
                        <span style="font-weight:700;color:white;">${wStats.completed}/${wStats.total} (${wStats.pct}%)</span>
                    </div>
                    <div style="height:6px;background:rgba(255,255,255,0.1);border-radius:999px;overflow:hidden;">
                        <div style="height:100%;width:${wStats.pct}%;background:#06b6d4;border-radius:999px;"></div>
                    </div>
                </div>

                <div style="background:rgba(0,0,0,0.2);padding:12px 16px;border-radius:12px;border:1px solid rgba(255,255,255,0.05);">
                    <div style="display:flex;justify-content:space-between;font-size:12px;color:var(--text-muted);margin-bottom:6px;">
                        <span>🗓️ Monthly Goals</span>
                        <span style="font-weight:700;color:white;">${mStats.completed}/${mStats.total} (${mStats.pct}%)</span>
                    </div>
                    <div style="height:6px;background:rgba(255,255,255,0.1);border-radius:999px;overflow:hidden;">
                        <div style="height:100%;width:${mStats.pct}%;background:#8b5cf6;border-radius:999px;"></div>
                    </div>
                </div>

                <div style="background:rgba(0,0,0,0.2);padding:12px 16px;border-radius:12px;border:1px solid rgba(255,255,255,0.05);">
                    <div style="display:flex;justify-content:space-between;font-size:12px;color:var(--text-muted);margin-bottom:6px;">
                        <span>🏆 Yearly Goals</span>
                        <span style="font-weight:700;color:white;">${yStats.completed}/${yStats.total} (${yStats.pct}%)</span>
                    </div>
                    <div style="height:6px;background:rgba(255,255,255,0.1);border-radius:999px;overflow:hidden;">
                        <div style="height:100%;width:${yStats.pct}%;background:#f59e0b;border-radius:999px;"></div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Category Filter Bar -->
        <div class="category-filter-bar" style="margin-bottom:24px;">
            ${catFilterHTML}
        </div>

        <!-- Section 1: Weekly Goals -->
        <div style="margin-bottom:32px;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
                <h3 style="font-family:var(--font-heading);font-size:18px;font-weight:700;color:white;display:flex;align-items:center;gap:8px;">
                    📅 Weekly Goals <span style="font-size:12px;font-weight:600;color:var(--text-muted);">(${weeklyGoals.length})</span>
                </h3>
            </div>
            ${renderGoalCardsList(weeklyGoals, 'weekly', 'Weekly Goal')}
        </div>

        <!-- Section 2: Monthly Goals -->
        <div style="margin-bottom:32px;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
                <h3 style="font-family:var(--font-heading);font-size:18px;font-weight:700;color:white;display:flex;align-items:center;gap:8px;">
                    🗓️ Monthly Goals <span style="font-size:12px;font-weight:600;color:var(--text-muted);">(${monthlyGoals.length})</span>
                </h3>
            </div>
            ${renderGoalCardsList(monthlyGoals, 'monthly', 'Monthly Goal')}
        </div>

        <!-- Section 3: Yearly Goals -->
        <div style="margin-bottom:32px;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
                <h3 style="font-family:var(--font-heading);font-size:18px;font-weight:700;color:white;display:flex;align-items:center;gap:8px;">
                    🏆 Yearly Goals <span style="font-size:12px;font-weight:600;color:var(--text-muted);">(${yearlyGoals.length})</span>
                </h3>
            </div>
            ${renderGoalCardsList(yearlyGoals, 'yearly', 'Yearly Goal')}
        </div>
        `;
    },

    switchGoalsV2Period(period) {
        this._goalsV2Period = period;
        this.renderGoalsV2Tab();
    },

    switchGoalsV2Cat(category) {
        this._goalsV2CatFilter = category;
        this.renderGoalsV2Tab();
    },

    handleAddGoalV2(e) {
        e.preventDefault();
        const title    = document.getElementById('field-goalv2-title')?.value;
        const period   = document.getElementById('field-goalv2-period')?.value || 'yearly';
        const target   = document.getElementById('field-goalv2-target')?.value;
        const category = document.getElementById('field-goalv2-category')?.value || 'personal';
        const deadline = document.getElementById('field-goalv2-deadline')?.value;
        const notes    = document.getElementById('field-goalv2-notes')?.value;

        if (!title) return;

        MilestoneGoalsV2.addGoal(period, title, target, category, deadline, notes);
        XPSystem.earn('new_goal'); // +2 XP
        this.closeModal('modal-add-goal-v2');
        e.target.reset();

        this.showToast(`🎯 Milestone Goal "${title}" created! (+2 XP)`, 'success');
        this.renderGoalsV2Tab();
    },

    toggleGoalV2(period, id) {
        const goal = MilestoneGoalsV2.toggleGoal(period, id);
        if (goal && goal.completed) {
            XPSystem.earn('goal_milestone'); // +10 XP
            this.showToast(`🎉 Goal completed: ${goal.title}! (+10 XP)`, 'success');
        }
        this.renderGoalsV2Tab();
    },

    stepGoalV2(period, id, delta) {
        const goal = MilestoneGoalsV2.stepGoalV2(period, id, delta);
        if (goal && goal.completed) {
            XPSystem.earn('goal_milestone'); // +10 XP
            this.showToast(`🏆 Milestone Achieved: ${goal.title}! (+10 XP)`, 'success');
        }
        this.renderGoalsV2Tab();
    },

    deleteGoalV2(period, id) {
        MilestoneGoalsV2.deleteGoal(period, id);
        this.showToast('Goal removed.', 'info');
        this.renderGoalsV2Tab();
    },

    quickLogCoding(type, count = 1) {
        CodingDashboard.logProblem(type, count);
        XPSystem.earn('habit_check'); // +3 XP per coding problem logged

        // Auto sync to milestone goals
        const kw = type === 'leetcode' ? 'leetcode' : 'a2z';
        MilestoneGoalsV2.syncProgressFromKeyword(kw, count);

        this.showToast(`💻 +${count} ${type === 'leetcode' ? 'LeetCode' : 'Striver A2Z'} problem logged! (+3 XP)`, 'success');
        this.renderDashboard(Storage.getSubjects(), Storage.getGoals(), TimetableManager.getData());
    },

    openEditCodingTargetsModal() {
        const stats = CodingDashboard.getData();
        const lcInput = document.getElementById('field-coding-lc-target');
        const a2zInput = document.getElementById('field-coding-a2z-target');
        const goalInput = document.getElementById('field-coding-daily-goal');

        if (lcInput) lcInput.value = stats.leetcodeTarget || '';
        if (a2zInput) a2zInput.value = stats.a2zTarget || '';
        if (goalInput) goalInput.value = stats.dailyDsaGoal || '';

        this.openModal('modal-edit-coding-targets');
    },

    handleSaveCodingTargets(e) {
        e.preventDefault();
        const lcTarget = document.getElementById('field-coding-lc-target')?.value;
        const a2zTarget = document.getElementById('field-coding-a2z-target')?.value;
        const dailyGoal = document.getElementById('field-coding-daily-goal')?.value;

        CodingDashboard.setTargets(lcTarget, a2zTarget, dailyGoal);
        this.closeModal('modal-edit-coding-targets');
        this.showToast('💻 Coding targets saved successfully!', 'success');
        this.renderDashboard(Storage.getSubjects(), Storage.getGoals(), TimetableManager.getData());
    },

    renderAnalyticsTab(subjects, goals) {
        const root = document.getElementById('analytics-root');
        if (!root) return;

        root.innerHTML = `
            <div style="margin-bottom:24px;">
                <h2 style="font-family:var(--font-heading);font-size:24px;font-weight:800;">📈 Analytics & Insights</h2>
                <p style="font-size:13px;color:var(--text-muted);margin-top:4px;">Visual breakdown of your productivity, habits, task completion, and academic performance.</p>
            </div>

            <!-- Row 1: Weekly XP + Monthly Activity Trend -->
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:20px;">
                <div class="glass-panel">
                    <div class="dashboard-widget-title"><span>⚡ Weekly Productivity (XP)</span><span style="font-size:12px;color:var(--text-muted);">Last 7 days</span></div>
                    <div id="chart-weekly-xp" style="padding:10px 0;"></div>
                </div>
                <div class="glass-panel">
                    <div class="dashboard-widget-title"><span>📊 30-Day Activity Trend</span></div>
                    <div id="chart-monthly-trend" style="padding:10px 0;"></div>
                    <div style="font-size:11px;color:var(--text-muted);text-align:center;">Score = habits + attendance×2 + XP/10</div>
                </div>
            </div>

            <!-- Row 2: Task Completion Rings -->
            <div class="glass-panel" style="margin-bottom:20px;">
                <div class="dashboard-widget-title"><span>🎯 Task Completion Rates</span></div>
                <div id="chart-task-rings" style="padding:10px 0;"></div>
            </div>

            <!-- Row 3: Habit Consistency + Attendance Overview -->
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">
                <div class="glass-panel">
                    <div class="dashboard-widget-title"><span>🔥 Habit Consistency</span><span style="font-size:12px;color:var(--text-muted);">30-Day Rate</span></div>
                    <div id="chart-habit-consistency" style="padding:10px 0;"></div>
                </div>
                <div class="glass-panel">
                    <div class="dashboard-widget-title"><span>🎓 Subject Attendance vs Target</span></div>
                    <div id="analytics-bar-chart" style="padding:10px 0;"></div>
                </div>
            </div>
        `;

        const habits = HabitManager.getData();
        AnalyticsV2.renderWeeklyChart('chart-weekly-xp');
        AnalyticsV2.renderMonthlyChart('chart-monthly-trend');
        AnalyticsV2.renderGoalRings('chart-task-rings');
        AnalyticsV2.renderHabitConsistency('chart-habit-consistency', habits);
        AnalyticsEngine.renderSubjectBarChart('analytics-bar-chart', subjects);
    },

    renderCalendarTab() {
        const habits = HabitManager.getData();
        CalendarRenderer.render('calendar-root', habits);
    },

    // Actions
    logAttendance(subjectId, status) {
        const subjects = Storage.getSubjects();
        const subject = subjects.find(s => s.id === subjectId);
        if (!subject) return;

        const date = new Date().toISOString().split('T')[0];
        if (!subject.logs) subject.logs = [];

        if (status === 'present') {
            subject.attended = (subject.attended || 0) + 1;
            subject.total = (subject.total || 0) + 1;
            XPSystem.earn('attendance_present');
        } else if (status === 'absent') {
            subject.total = (subject.total || 0) + 1;
            XPSystem.earn('attendance_absent');
        } else if (status === 'cancel') {
            // cancelled class — no attendance change, no XP
        }

        subject.logs.push({ id: 'log-' + Date.now(), date, status });
        Storage.saveSubjects(subjects);

        const xpMsg = status === 'present' ? ' (+5 XP)' : status === 'absent' ? ' (+1 XP)' : '';
        this.showToast(`Logged ${status.toUpperCase()} for ${subject.name}${xpMsg}`, 'success');
        this.renderAll();
    },

    quickLogAttendance(subjectId, status) {
        this.logAttendance(subjectId, status);
    },

    undoLastLog(subjectId) {
        const subjects = Storage.getSubjects();
        const subject = subjects.find(s => s.id === subjectId);
        if (!subject || !subject.logs || subject.logs.length === 0) {
            this.showToast('No recent attendance log to undo.', 'info');
            return;
        }

        const lastLog = subject.logs.pop();
        if (lastLog.status === 'present') {
            subject.attended = Math.max(0, subject.attended - 1);
            subject.total = Math.max(0, subject.total - 1);
        } else if (lastLog.status === 'absent') {
            subject.total = Math.max(0, subject.total - 1);
        }

        Storage.saveSubjects(subjects);
        this.showToast(`Undid last log for ${subject.name}`, 'info');
        this.renderAll();
    },

    handleAddSubject(e) {
        e.preventDefault();
        const name = document.getElementById('field-subj-name').value.trim();
        const code = document.getElementById('field-subj-code').value.trim();
        const prof = document.getElementById('field-subj-prof').value.trim();
        const target = Number(document.getElementById('field-subj-target').value) || 75;

        if (!name) return;

        const subjects = Storage.getSubjects();
        const colors = ['#06b6d4', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899', '#3b82f6'];
        const randomColor = colors[subjects.length % colors.length];

        const newSubject = {
            id: 'subj-' + Date.now(),
            name,
            code: code || 'CS101',
            professor: prof || '',
            targetPercentage: target,
            attended: 0,
            total: 0,
            color: randomColor,
            logs: []
        };

        subjects.push(newSubject);
        Storage.saveSubjects(subjects);
        XPSystem.earn('new_subject');

        this.closeModal('modal-add-subject');
        e.target.reset();
        this.showToast(`Subject ${name} added! (+2 XP)`, 'success');
        this.renderAll();
    },

    deleteSubject(subjectId) {
        let subjects = Storage.getSubjects();
        const subject = subjects.find(s => s.id === subjectId);
        subjects = subjects.filter(s => s.id !== subjectId);
        Storage.saveSubjects(subjects);
        this.showToast(`Subject ${subject ? subject.name : ''} deleted.`, 'info');
        this.renderAll();
    },

    updateGoalCounter(goalId, delta) {
        const goals = Storage.getGoals();
        const goal = goals.find(g => g.id === goalId);
        if (!goal) return;

        goal.current = Math.max(0, (goal.current || 0) + delta);
        Storage.saveGoals(goals);
        this.renderAll();
    },

    toggleHabit(goalId) {
        const goals = Storage.getGoals();
        const goal = goals.find(g => g.id === goalId);
        if (!goal) return;

        const today = new Date().toISOString().split('T')[0];
        const wasDoneToday = goal.lastCompleted === today;
        const updatedGoal = GoalsCalc.toggleStreakToday(goal);
        const index = goals.findIndex(g => g.id === goalId);
        goals[index] = updatedGoal;

        Storage.saveGoals(goals);

        if (!wasDoneToday) {
            XPSystem.earn('habit_check');
            this.showToast(`✅ ${goal.title} checked! (+3 XP)`, 'success');
        } else {
            this.showToast(`Unchecked: ${goal.title}`, 'info');
        }
        this.renderAll();
    },

    toggleSubtask(goalId, subtaskId) {
        const goals = Storage.getGoals();
        const goal = goals.find(g => g.id === goalId);
        if (!goal || !goal.subtasks) return;

        const subtask = goal.subtasks.find(s => s.id === subtaskId);
        if (subtask) {
            subtask.completed = !subtask.completed;
            Storage.saveGoals(goals);
            this.renderAll();
        }
    },

    handleAddGoal(e) {
        e.preventDefault();
        const title    = document.getElementById('field-goal-title').value.trim();
        const category = document.getElementById('field-goal-category').value;
        const type     = document.getElementById('field-goal-type').value;
        const target   = Number(document.getElementById('field-goal-target').value) || 10;
        const priority = document.getElementById('field-goal-priority').value;
        const description = document.getElementById('field-goal-desc').value.trim();

        if (!title) return;

        const goals = Storage.getGoals();
        const newGoal = {
            id: 'goal-' + Date.now(),
            title,
            category,
            type,
            priority,
            description,
            createdAt: new Date().toISOString().split('T')[0]
        };

        if (type === 'counter') {
            newGoal.current = 0;
            newGoal.target = target;
            newGoal.unit = 'Units';
        } else if (type === 'streak') {
            newGoal.streak = 0;
            newGoal.bestStreak = 0;
            newGoal.history = [];
        } else if (type === 'checklist') {
            newGoal.subtasks = [
                { id: 'st-1', text: 'Step 1: Planning', completed: false },
                { id: 'st-2', text: 'Step 2: Execution', completed: false }
            ];
        }

        goals.push(newGoal);
        Storage.saveGoals(goals);
        XPSystem.earn('new_goal');

        this.closeModal('modal-add-goal');
        e.target.reset();
        this.showToast(`Life goal created! (+2 XP)`, 'success');
        this.renderAll();
    },

    deleteGoal(goalId) {
        let goals = Storage.getGoals();
        const goal = goals.find(g => g.id === goalId);
        goals = goals.filter(g => g.id !== goalId);
        Storage.saveGoals(goals);
        this.showToast(`Goal ${goal ? goal.title : ''} deleted.`, 'info');
        this.renderAll();
    },

    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) modal.classList.add('active');
    },

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) modal.classList.remove('active');
    },

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            bottom: 24px;
            right: 24px;
            background: #1e293b;
            color: white;
            border: 1px solid var(--border-glow);
            padding: 12px 20px;
            border-radius: var(--radius-md);
            font-size: 14px;
            font-weight: 500;
            z-index: 2000;
            box-shadow: 0 10px 25px rgba(0,0,0,0.5);
            transition: all 0.3s ease;
        `;
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(10px)';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
};
