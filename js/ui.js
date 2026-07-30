/**
 * UI Renderer and Event Controller
 */

import { Storage } from './storage.js';
import { AttendanceCalc } from './attendance.js';
import { GoalsCalc } from './goals.js';
import { TimetableManager } from './timetable.js';
import { AnalyticsEngine } from './analytics.js';

export const UIController = {
    currentTab: 'dashboard',
    activeGoalFilter: 'all',

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

        // Global Event Delegation for Dynamic Buttons
        document.addEventListener('click', (e) => {
            const btn = e.target.closest('[data-action]');
            if (!btn) return;

            const action = btn.dataset.action;
            const id = btn.dataset.id;
            const extra = btn.dataset.extra;

            if (action === 'log-attendance') {
                this.logAttendance(id, extra);
            } else if (action === 'quick-log-attendance') {
                this.quickLogAttendance(id, extra);
            } else if (action === 'undo-log') {
                this.undoLastLog(id);
            } else if (action === 'delete-subject') {
                this.deleteSubject(id);
            } else if (action === 'update-counter') {
                this.updateGoalCounter(id, parseInt(extra, 10));
            } else if (action === 'toggle-habit') {
                this.toggleHabit(id);
            } else if (action === 'delete-goal') {
                this.deleteGoal(id);
            } else if (action === 'open-modal') {
                this.openModal(id);
            }
        });
    },

    clearAllData() {
        if (!confirm('Are you sure you want to clear all subjects, attendance records, and goals?')) return;
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
        } else if (this.currentTab === 'attendance') {
            this.renderAttendanceTab(subjects);
        } else if (this.currentTab === 'goals') {
            this.renderGoalsTab(goals);
        } else if (this.currentTab === 'timetable') {
            this.renderTimetableTab(timetable, subjects);
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
        const { overallPercentage } = AttendanceCalc.calculateOverallAttendance(subjects);
        const { overallProgressPct } = GoalsCalc.calculateOverallGoalsStats(goals);
        const todaySchedule = TimetableManager.getTodaySchedule(timetable, subjects);

        const lifeScore = subjects.length === 0 && goals.length === 0 ? 100 : Math.round((overallPercentage * 0.5) + (overallProgressPct * 0.5));

        const lifeScoreVal = document.getElementById('dash-life-score-val');
        if (lifeScoreVal) lifeScoreVal.textContent = lifeScore;
        AnalyticsEngine.renderLifeScoreRing('dash-life-score-ring-container', lifeScore);

        // Render Today's Classes List
        const todayContainer = document.getElementById('dash-today-classes-list');
        if (todayContainer) {
            if (todaySchedule.length === 0) {
                todayContainer.innerHTML = `<div style="color: var(--text-muted); padding: 12px 0;">🎉 No classes scheduled for today! Click '+ Add Subject' to start tracking.</div>`;
            } else {
                todayContainer.innerHTML = todaySchedule.map(slot => `
                    <div class="quick-class-item">
                        <div>
                            <div class="class-info-name">${slot.subject.name} (${slot.subject.code})</div>
                            <div class="class-info-meta">⏰ ${slot.time} • 📍 ${slot.room}</div>
                        </div>
                        <div class="class-actions">
                            <button class="btn btn-sm btn-present" data-action="quick-log-attendance" data-id="${slot.subject.id}" data-extra="present" onclick="window.appUI.quickLogAttendance('${slot.subject.id}', 'present')">Present</button>
                            <button class="btn btn-sm btn-absent" data-action="quick-log-attendance" data-id="${slot.subject.id}" data-extra="absent" onclick="window.appUI.quickLogAttendance('${slot.subject.id}', 'absent')">Absent</button>
                        </div>
                    </div>
                `).join('');
            }
        }

        // Render Habit Streaks List
        const habitsContainer = document.getElementById('dash-habits-list');
        if (habitsContainer) {
            const habitGoals = goals.filter(g => g.type === 'streak');
            if (habitGoals.length === 0) {
                habitsContainer.innerHTML = `<div style="color: var(--text-muted); padding: 12px 0;">No habits configured yet. Click '+ Add Goal' to create coding or fitness habits!</div>`;
            } else {
                const today = new Date().toISOString().split('T')[0];
                habitsContainer.innerHTML = habitGoals.map(h => {
                    const isDoneToday = h.lastCompleted === today;
                    return `
                        <div class="habit-item">
                            <div>
                                <div class="habit-title">${h.title}</div>
                                <span class="streak-pill">🔥 ${h.streak || 0} Day Streak</span>
                            </div>
                            <button class="btn btn-sm ${isDoneToday ? 'btn-secondary' : 'btn-primary'}" 
                                    data-action="toggle-habit" data-id="${h.id}"
                                    onclick="window.appUI.toggleHabit('${h.id}')">
                                ${isDoneToday ? '✓ Done Today' : 'Mark Done'}
                            </button>
                        </div>
                    `;
                }).join('');
            }
        }

        // Render Quick Subject Overview Cards
        const subOverviewContainer = document.getElementById('dash-subject-overview-list');
        if (subOverviewContainer) {
            if (subjects.length === 0) {
                subOverviewContainer.innerHTML = `<div style="color: var(--text-muted); padding: 12px 0;">No subjects added yet.</div>`;
            } else {
                subOverviewContainer.innerHTML = subjects.slice(0, 3).map(s => {
                    const stats = AttendanceCalc.calculateStats(s.attended, s.total, s.targetPercentage);
                    return `
                        <div style="margin-bottom: 12px; background: rgba(255,255,255,0.02); padding: 12px; border-radius: var(--radius-md); border: 1px solid var(--border-glass);">
                            <div style="display: flex; justify-content: space-between; font-size: 13px; font-weight: 600; margin-bottom: 4px;">
                                <span>${s.name}</span>
                                <span style="color: ${stats.statusColor};">${stats.percentage}%</span>
                            </div>
                            <div class="progress-bar-bg">
                                <div class="progress-bar-fill" style="width: ${stats.percentage}%; background: ${stats.statusColor};"></div>
                            </div>
                            <div style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">${stats.message}</div>
                        </div>
                    `;
                }).join('');
            }
        }
    },

    renderAttendanceTab(subjects = Storage.getSubjects()) {
        const container = document.getElementById('attendance-subjects-grid');
        if (!container) return;

        if (subjects.length === 0) {
            container.innerHTML = `
                <div class="glass-panel" style="grid-column: 1 / -1; text-align: center; padding: 60px;">
                    <h3>No Subjects Added Yet</h3>
                    <p style="color: var(--text-muted); margin-top: 8px; margin-bottom: 20px;">Add your college subjects to track attendance and calculate safe bunks.</p>
                    <button class="btn btn-primary" data-action="open-modal" data-id="modal-add-subject" onclick="window.appUI.openModal('modal-add-subject')">+ Add Your First Subject</button>
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
                        <button class="btn-attendance btn-present" data-action="log-attendance" data-id="${s.id}" data-extra="present" onclick="window.appUI.logAttendance('${s.id}', 'present')">+ Present</button>
                        <button class="btn-attendance btn-absent" data-action="log-attendance" data-id="${s.id}" data-extra="absent" onclick="window.appUI.logAttendance('${s.id}', 'absent')">+ Absent</button>
                        <button class="btn-attendance btn-cancel" data-action="log-attendance" data-id="${s.id}" data-extra="cancel" onclick="window.appUI.logAttendance('${s.id}', 'cancel')">Cancelled</button>
                    </div>

                    <div style="display: flex; justify-content: space-between; margin-top: 16px; padding-top: 12px; border-top: 1px solid var(--border-glass);">
                        <button class="btn btn-sm btn-secondary" data-action="undo-log" data-id="${s.id}" onclick="window.appUI.undoLastLog('${s.id}')">↩ Undo</button>
                        <button class="btn btn-sm btn-danger" data-action="delete-subject" data-id="${s.id}" onclick="window.appUI.deleteSubject('${s.id}')">🗑️ Delete</button>
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
                    <button class="btn btn-primary" data-action="open-modal" data-id="modal-add-goal" onclick="window.appUI.openModal('modal-add-goal')">+ Create Your First Goal</button>
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
                            <button class="btn btn-sm btn-secondary" data-action="update-counter" data-id="${g.id}" data-extra="-1" onclick="window.appUI.updateGoalCounter('${g.id}', -1)">- 1</button>
                            <span class="goal-counter-val">${g.current}</span>
                            <button class="btn btn-sm btn-primary" data-action="update-counter" data-id="${g.id}" data-extra="1" onclick="window.appUI.updateGoalCounter('${g.id}', 1)">+ 1</button>
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
                                data-action="toggle-habit" data-id="${g.id}"
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
                        <button class="btn btn-sm btn-danger" data-action="delete-goal" data-id="${g.id}" onclick="window.appUI.deleteGoal('${g.id}')">🗑️ Delete</button>
                    </div>
                </div>
            `;
        }).join('');
    },

    renderTimetableTab(timetable, subjects) {
        const container = document.getElementById('timetable-grid-container');
        if (!container) return;

        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
        const currentDay = TimetableManager.getCurrentDayName();

        container.innerHTML = days.map(day => {
            const slots = timetable[day] || [];
            const isToday = day === currentDay;

            return `
                <div class="timetable-day-col">
                    <div class="timetable-day-header ${isToday ? 'today' : ''}">
                        <span>${day}</span>
                        ${isToday ? '<span class="badge badge-safe">Today</span>' : ''}
                    </div>
                    ${slots.length === 0 ? '<div style="font-size: 12px; color: var(--text-dim); padding: 12px 0;">No classes scheduled</div>' : ''}
                    ${slots.map(slot => {
                        const subj = subjects.find(s => s.id === slot.subjectId) || { name: 'Unknown', color: '#6b7280' };
                        return `
                            <div class="timetable-slot-card" style="--slot-color: ${subj.color || '#06b6d4'};">
                                <div class="slot-time">⏰ ${slot.time}</div>
                                <div class="slot-subject">${subj.name}</div>
                                <div class="slot-room">📍 ${slot.room || 'N/A'}</div>
                            </div>
                        `;
                    }).join('')}
                </div>
            `;
        }).join('');
    },

    renderAnalyticsTab(subjects, goals) {
        AnalyticsEngine.renderSubjectBarChart('analytics-bar-chart', subjects);
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
        } else if (status === 'absent') {
            subject.total = (subject.total || 0) + 1;
        }

        subject.logs.push({ id: 'log-' + Date.now(), date, status });
        Storage.saveSubjects(subjects);

        this.showToast(`Logged ${status.toUpperCase()} for ${subject.name}`, 'success');
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

        this.closeModal('modal-add-subject');
        e.target.reset();
        this.showToast(`Subject ${name} added!`, 'success');
        this.renderAll();
    },

    deleteSubject(subjectId) {
        if (!confirm('Are you sure you want to delete this subject?')) return;
        let subjects = Storage.getSubjects();
        subjects = subjects.filter(s => s.id !== subjectId);
        Storage.saveSubjects(subjects);
        this.showToast('Subject deleted.', 'info');
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

        const updatedGoal = GoalsCalc.toggleStreakToday(goal);
        const index = goals.findIndex(g => g.id === goalId);
        goals[index] = updatedGoal;

        Storage.saveGoals(goals);
        this.showToast(`Updated streak for ${goal.title}`, 'success');
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
        const title = document.getElementById('field-goal-title').value.trim();
        const category = document.getElementById('field-goal-category').value;
        const type = document.getElementById('field-goal-type').value;
        const target = Number(document.getElementById('field-goal-target').value) || 10;
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

        this.closeModal('modal-add-goal');
        e.target.reset();
        this.showToast(`Life goal created!`, 'success');
        this.renderAll();
    },

    deleteGoal(goalId) {
        if (!confirm('Are you sure you want to delete this goal?')) return;
        let goals = Storage.getGoals();
        goals = goals.filter(g => g.id !== goalId);
        Storage.saveGoals(goals);
        this.showToast('Goal deleted.', 'info');
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
