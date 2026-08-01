/**
 * MilestoneGoalsV2 — SaaS Milestone Goal Tracker (Weekly, Monthly, Yearly)
 * Focuses strictly on milestones with progress bars, achievement styling, category tags, deadlines, and notes.
 */

export const MilestoneGoalsV2 = {
    STORAGE_KEY: 'auralife_milestone_goals_v2',

    CATEGORIES: {
        coding:   { label: 'Coding',   icon: '💻', color: '#06b6d4' },
        college:  { label: 'College',  icon: '📚', color: '#8b5cf6' },
        fitness:  { label: 'Fitness',  icon: '🏋️', color: '#10b981' },
        finance:  { label: 'Finance',  icon: '💰', color: '#f59e0b' },
        personal: { label: 'Personal', icon: '🎨', color: '#ec4899' },
        family:   { label: 'Family',   icon: '🏠', color: '#3b82f6' },
    },

    getData() {
        try {
            const data = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || 'null') || this._defaultData();
            if (this._applyPeriodResets(data)) {
                localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
                if (window.appStorage) window.appStorage._scheduleSync();
            }
            return data;
        } catch (e) {
            return this._defaultData();
        }
    },

    saveData(data) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
        if (window.appStorage) window.appStorage._scheduleSync();
    },

    _defaultData() {
        return {
            weekly: [],
            monthly: [],
            yearly: [],
        };
    },

    _periodKey(period, date = new Date()) {
        const localDate = new Date(date);
        if (period === 'yearly') return String(localDate.getFullYear());
        if (period === 'monthly') {
            return `${localDate.getFullYear()}-${String(localDate.getMonth() + 1).padStart(2, '0')}`;
        }
        const monday = new Date(localDate);
        const daysSinceMonday = (monday.getDay() + 6) % 7;
        monday.setDate(monday.getDate() - daysSinceMonday);
        return `${monday.getFullYear()}-${String(monday.getMonth() + 1).padStart(2, '0')}-${String(monday.getDate()).padStart(2, '0')}`;
    },

    _formatDate(date) {
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    },

    _periodEndDate(period, periodKey = this._periodKey(period)) {
        if (period === 'weekly') {
            const start = new Date(`${periodKey}T00:00:00`);
            start.setDate(start.getDate() + 6);
            return this._formatDate(start);
        }
        if (period === 'monthly') {
            const [year, month] = periodKey.split('-').map(Number);
            return this._formatDate(new Date(year, month, 0));
        }
        return `${periodKey}-12-31`;
    },

    _periodResetDate(period, periodKey) {
        if (period === 'weekly') {
            const nextMonday = new Date(`${periodKey}T00:00:00`);
            nextMonday.setDate(nextMonday.getDate() + 7);
            return this._formatDate(nextMonday);
        }
        if (period === 'monthly') {
            const [year, month] = periodKey.split('-').map(Number);
            return this._formatDate(new Date(year, month, 1));
        }
        return `${Number(periodKey) + 1}-01-01`;
    },

    _applyPeriodResets(data) {
        let changed = false;
        ['weekly', 'monthly', 'yearly'].forEach(period => {
            const currentPeriodKey = this._periodKey(period);
            (data[period] || []).forEach(goal => {
                if (!goal.periodKey) {
                    goal.periodKey = currentPeriodKey;
                    changed = true;
                    return;
                }
                if (goal.periodKey === currentPeriodKey) return;
                if (!Array.isArray(goal.history)) goal.history = [];
                goal.history.push({
                    periodKey: goal.periodKey,
                    currentCount: goal.currentCount || 0,
                    targetCount: goal.targetCount || null,
                    completed: Boolean(goal.completed),
                    archivedAt: this._formatDate(new Date()),
                });
                if (goal.history.length > 60) goal.history = goal.history.slice(-60);
                goal.periodKey = currentPeriodKey;
                goal.currentCount = 0;
                goal.completed = false;
                changed = true;
            });
            (data[period] || []).forEach(goal => {
                if (goal.deadline === this._periodResetDate(period, goal.periodKey)) {
                    goal.deadline = this._periodEndDate(period, goal.periodKey);
                    changed = true;
                }
            });
        });
        return changed;
    },

    getGoals(period, categoryFilter = 'all') {
        const data = this.getData();
        const goals = data[period] || [];
        if (categoryFilter === 'all') return goals;
        return goals.filter(g => g.category === categoryFilter);
    },

    addGoal(period, title, targetCount = null, category = 'personal', deadline = null, notes = '') {
        const trimmed = title.trim();
        if (!trimmed) return null;

        // Auto parse number if targetCount not explicitly given
        if (!targetCount) {
            const numMatch = trimmed.match(/(\d+)/);
            if (numMatch) {
                const n = parseInt(numMatch[1], 10);
                if (n > 1) targetCount = n;
            }
        }

        const data = this.getData();
        if (!data[period]) data[period] = [];

        const newGoal = {
            id: 'goal-' + Date.now() + Math.random().toString(36).substr(2, 3),
            title: trimmed,
            targetCount: targetCount ? parseInt(targetCount, 10) : null,
            currentCount: 0,
            completed: false,
            category: category || 'personal',
            deadline: deadline || this._periodEndDate(period),
            notes: notes || '',
            createdAt: new Date().toISOString().split('T')[0],
            periodKey: this._periodKey(period),
            history: [],
        };

        data[period].push(newGoal);
        this.saveData(data);
        return newGoal;
    },

    _rollupGoalProgress(data, sourcePeriod, goalTitle, delta) {
        if (!goalTitle) return;
        const lowerTitle = goalTitle.toLowerCase();
        const targetPeriods = sourcePeriod === 'weekly' ? ['monthly', 'yearly'] : (sourcePeriod === 'monthly' ? ['yearly'] : []);

        targetPeriods.forEach(tgtPeriod => {
            (data[tgtPeriod] || []).forEach(g => {
                const tgtLower = g.title.toLowerCase();
                const isMatch = tgtLower.includes(lowerTitle) || lowerTitle.includes(tgtLower) ||
                    (lowerTitle.includes('leetcode') && tgtLower.includes('leetcode')) ||
                    (lowerTitle.includes('a2z') && tgtLower.includes('a2z')) ||
                    (lowerTitle.includes('dsa') && (tgtLower.includes('leetcode') || tgtLower.includes('a2z')));

                if (isMatch) {
                    if (g.targetCount) {
                        g.currentCount = Math.max(0, (g.currentCount || 0) + delta);
                        g.completed = g.currentCount >= g.targetCount;
                    } else if (delta > 0 && !g.completed) {
                        g.completed = true;
                    }
                }
            });
        });
    },

    toggleGoal(period, id) {
        const data = this.getData();
        const goal = (data[period] || []).find(g => g.id === id);
        if (goal) {
            goal.completed = !goal.completed;
            if (goal.targetCount) {
                goal.currentCount = goal.completed ? goal.targetCount : 0;
            }
            const delta = goal.completed ? 1 : -1;
            this._rollupGoalProgress(data, period, goal.title, delta);
            this.saveData(data);
        }
        return goal;
    },

    stepGoalCount(period, id, delta = 1) {
        const data = this.getData();
        const goal = (data[period] || []).find(g => g.id === id);
        if (goal) {
            goal.currentCount = Math.max(0, (goal.currentCount || 0) + delta);
            if (goal.targetCount) {
                goal.completed = goal.currentCount >= goal.targetCount;
            }
            this._rollupGoalProgress(data, period, goal.title, delta);
            this.saveData(data);
        }
        return goal;
    },

    stepGoalV2(period, id, delta = 1) {
        return this.stepGoalCount(period, id, delta);
    },

    updateGoalNotes(period, id, notes) {
        const data = this.getData();
        const goal = (data[period] || []).find(g => g.id === id);
        if (goal) {
            goal.notes = notes.trim();
            this.saveData(data);
        }
        return goal;
    },

    deleteGoal(period, id) {
        const data = this.getData();
        if (data[period]) {
            data[period] = data[period].filter(g => g.id !== id);
            this.saveData(data);
        }
    },

    markHistoricalComplete(period, goalId, historyIndex) {
        const data = this.getData();
        const goal = (data[period] || []).find(item => item.id === goalId);
        const record = goal?.history?.[historyIndex];
        if (!record) return null;
        record.completed = true;
        record.retroactive = true;
        record.currentCount = record.targetCount || 1;
        this.saveData(data);
        return record;
    },

    getStats(period) {
        const goals = this.getGoals(period, 'all');
        const total = goals.length;
        const completed = goals.filter(g => g.completed).length;
        const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
        return { total, completed, pct };
    },

    getProgressStats(period) {
        const goals = this.getGoals(period, 'all');
        const total = goals.reduce((sum, goal) => sum + (goal.targetCount > 0 ? goal.targetCount : 1), 0);
        const current = goals.reduce((sum, goal) => {
            if (goal.targetCount > 0) return sum + Math.max(0, goal.currentCount || 0);
            return sum + (goal.completed ? 1 : 0);
        }, 0);
        const pct = total > 0 ? Math.round((current / total) * 100) : 0;
        return { total, current, pct, goals: goals.length };
    },

    /** Syncs progress automatically from habits or coding check-ins */
    syncProgressFromKeyword(keyword, delta = 1) {
        const data = this.getData();
        const updated = [];
        const lowerKw = keyword.toLowerCase();

        ['weekly', 'monthly', 'yearly'].forEach(period => {
            (data[period] || []).forEach(g => {
                const titleLower = g.title.toLowerCase();
                const isMatch = titleLower.includes(lowerKw) ||
                    (lowerKw.includes('leetcode') && titleLower.includes('leetcode')) ||
                    (lowerKw.includes('a2z') && titleLower.includes('a2z')) ||
                    (lowerKw.includes('dsa') && (titleLower.includes('leetcode') || titleLower.includes('a2z')));

                if (isMatch) {
                    if (g.targetCount) {
                        g.currentCount = Math.max(0, (g.currentCount || 0) + delta);
                        g.completed = g.currentCount >= g.targetCount;
                    } else if (delta > 0 && !g.completed) {
                        g.currentCount = (g.currentCount || 0) + 1;
                    }
                    updated.push({ period, title: g.title, currentCount: g.currentCount, targetCount: g.targetCount });
                }
            });
        });

        this.saveData(data);
        return updated;
    }
};
