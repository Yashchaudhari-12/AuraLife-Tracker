/**
 * TaskManager — Daily / Weekly / Monthly / Yearly Checklist & Smart Auto-Sync Engine
 *
 * Automatically syncs progress from Daily tasks and Habits to Weekly, Monthly, and Yearly goals.
 * Uses topic classification (Coding, Study, Fitness) and keyword matching so zero manual entry is needed.
 */

export const TaskManager = {

    PERIODS: ['daily', 'weekly', 'monthly', 'yearly'],

    PERIOD_META: {
        daily:   { label: 'Daily',   icon: '☀️',  resetLabel: 'Resets at midnight',       color: '#06b6d4' },
        weekly:  { label: 'Weekly',  icon: '📅',  resetLabel: 'Resets every Monday',      color: '#8b5cf6' },
        monthly: { label: 'Monthly', icon: '🗓️',  resetLabel: 'Resets on the 1st',        color: '#f59e0b' },
        yearly:  { label: 'Yearly',  icon: '🏆',  resetLabel: 'Resets on Jan 1st',        color: '#10b981' },
    },

    TOPIC_GROUPS: {
        coding:  ['leetcode', 'question', 'problem', 'code', 'dsa', 'algo', 'python', 'cpp', 'java', 'js', 'striver', 'practice', 'contest', 'commit', 'repo', 'project'],
        study:   ['read', 'book', 'page', 'study', 'chapter', 'learn', 'revision', 'notes', 'college', 'gpa', 'exam', 'lecture'],
        fitness: ['workout', 'gym', 'run', 'pushup', 'exercise', 'water', 'walk', 'sleep', 'meditation', 'diet', 'cardio', 'health'],
    },

    // ─── Storage ────────────────────────────────────────────────────────────

    getData() {
        try {
            return JSON.parse(localStorage.getItem('auralife_tasks') || 'null') || this._defaultData();
        } catch(e) { return this._defaultData(); }
    },

    saveData(data) {
        localStorage.setItem('auralife_tasks', JSON.stringify(data));
    },

    _defaultData() {
        return {
            daily:   { tasks: [], resetDate: null, history: [] },
            weekly:  { tasks: [], resetDate: null, history: [] },
            monthly: { tasks: [], resetDate: null, history: [] },
            yearly:  { tasks: [], resetDate: null, history: [] },
        };
    },

    // ─── Topic & Keyword Intelligence ────────────────────────────────────────

    parseTaskMeta(text) {
        let targetCount = null;
        const numMatch = text.match(/(\d+)/);
        if (numMatch) {
            const num = parseInt(numMatch[1], 10);
            if (num > 1) {
                targetCount = num;
            } else if (text.toLowerCase().includes('1 ')) {
                targetCount = 1;
            }
        }
        return { targetCount, currentCount: 0 };
    },

    extractKeywords(text) {
        const stopwords = new Set([
            'solve','read','complete','finish','make','build','with','from','every',
            'day','week','month','year','days','daily','everyday','want','have','wrote',
            'will','would','should','to','a','an','the','in','on','at','for','and','or'
        ]);

        return text.toLowerCase()
            .replace(/[^a-z0-9\s]/g, '')
            .split(/\s+/)
            .map(w => w.replace(/(s|es|ing|ed)$/, ''))
            .filter(w => w.length >= 2 && !stopwords.has(w));
    },

    detectTopics(text) {
        const words = this.extractKeywords(text);
        const topics = new Set();

        for (const [topic, topicWords] of Object.entries(this.TOPIC_GROUPS)) {
            if (words.some(w => topicWords.some(tw => tw.startsWith(w) || w.startsWith(tw)))) {
                topics.add(topic);
            }
        }
        return Array.from(topics);
    },

    isTaskMatch(sourceText, targetText) {
        const srcKeywords = this.extractKeywords(sourceText);
        const tgtKeywords = this.extractKeywords(targetText);

        // 1. Direct keyword / stem overlap
        const directMatch = srcKeywords.some(k => tgtKeywords.includes(k));
        if (directMatch) return true;

        // 2. Topic group overlap (e.g. LeetCode / problem / question both in Coding)
        const srcTopics = this.detectTopics(sourceText);
        const tgtTopics = this.detectTopics(targetText);
        const topicMatch = srcTopics.some(t => tgtTopics.includes(t));
        if (topicMatch) return true;

        return false;
    },

    // ─── Period Start Dates ──────────────────────────────────────────────────

    getPeriodStart(period) {
        const now = new Date();
        now.setHours(0, 0, 0, 0);

        if (period === 'daily') {
            return now.toISOString().split('T')[0];
        }
        if (period === 'weekly') {
            const dow = now.getDay();
            const monday = new Date(now);
            monday.setDate(now.getDate() - (dow === 0 ? 6 : dow - 1));
            return monday.toISOString().split('T')[0];
        }
        if (period === 'monthly') {
            return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
        }
        if (period === 'yearly') {
            return `${now.getFullYear()}-01-01`;
        }
        return now.toISOString().split('T')[0];
    },

    getPeriodLabel(period, resetDate) {
        if (!resetDate) return '';
        const d = new Date(resetDate);
        if (period === 'daily') return d.toLocaleDateString('en-IN', { weekday: 'long', month: 'short', day: 'numeric' });
        if (period === 'weekly') {
            const end = new Date(d);
            end.setDate(d.getDate() + 6);
            return `${d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })} – ${end.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}`;
        }
        if (period === 'monthly') return d.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
        if (period === 'yearly') return `${d.getFullYear()}`;
        return '';
    },

    // ─── Auto-Reset & Migration ──────────────────────────────────────────────

    checkAndReset(data, period) {
        const pd = data[period];
        const currentStart = this.getPeriodStart(period);

        if (pd.resetDate !== currentStart) {
            const completed = pd.tasks.filter(t => t.completed).length;
            const total = pd.tasks.length;
            if (total > 0) {
                pd.history.unshift({
                    periodStart: pd.resetDate || currentStart,
                    completed,
                    total,
                    pct: Math.round((completed / total) * 100),
                });
                if (pd.history.length > 26) pd.history.length = 26;
            }
            pd.tasks.forEach(t => {
                t.completed = false;
                if (period !== 'yearly') {
                    t.currentCount = 0;
                }
            });
            pd.resetDate = currentStart;
        }
        return data;
    },

    checkAllResets() {
        let data = this.getData();
        for (const p of this.PERIODS) data = this.checkAndReset(data, p);
        this.saveData(data);
        return data;
    },

    // ─── Automatic Progress Rollup ───────────────────────────────────────────

    rollupProgress(sourceText, delta) {
        let data = this.getData();
        const updatedTasks = [];

        ['weekly', 'monthly', 'yearly'].forEach(period => {
            const targetTasks = data[period].tasks;
            const counterTasks = targetTasks.filter(t => t.targetCount && t.targetCount > 1);

            targetTasks.forEach(t => {
                // Match if direct/topic match OR if there's only 1 counter task in that higher period
                const isMatch = this.isTaskMatch(sourceText, t.text) || (counterTasks.length === 1 && t.targetCount > 1);

                if (isMatch) {
                    if (t.targetCount) {
                        t.currentCount = Math.max(0, (t.currentCount || 0) + delta);
                        t.completed = t.currentCount >= t.targetCount;
                    } else {
                        if (delta > 0 && !t.completed) {
                            t.currentCount = (t.currentCount || 0) + 1;
                        } else if (delta < 0 && t.currentCount > 0) {
                            t.currentCount = Math.max(0, t.currentCount - 1);
                        }
                    }
                    updatedTasks.push({ period, text: t.text, currentCount: t.currentCount, targetCount: t.targetCount });
                }
            });
        });

        this.saveData(data);
        return updatedTasks;
    },

    // ─── CRUD ────────────────────────────────────────────────────────────────

    addTask(period, text) {
        const trimmed = text.trim();
        if (!trimmed) return false;
        let data = this.getData();
        data = this.checkAndReset(data, period);

        const { targetCount, currentCount } = this.parseTaskMeta(trimmed);

        data[period].tasks.push({
            id: 'task-' + Date.now(),
            text: trimmed,
            completed: false,
            targetCount,
            currentCount,
            createdAt: new Date().toISOString().split('T')[0],
        });
        this.saveData(data);
        return true;
    },

    toggleTask(period, taskId) {
        let data = this.getData();
        data = this.checkAndReset(data, period);
        const task = data[period].tasks.find(t => t.id === taskId);
        let rollups = [];

        if (task) {
            task.completed = !task.completed;

            if (task.targetCount) {
                task.currentCount = task.completed ? task.targetCount : 0;
            }

            if (period === 'daily') {
                const delta = task.completed ? 1 : -1;
                rollups = this.rollupProgress(task.text, delta);
            }
        }
        this.saveData(data);
        return { completed: task ? task.completed : false, task, rollups };
    },

    incrementTaskCount(period, taskId, delta = 1) {
        let data = this.getData();
        data = this.checkAndReset(data, period);
        const task = data[period].tasks.find(t => t.id === taskId);
        if (task) {
            task.currentCount = Math.max(0, (task.currentCount || 0) + delta);
            if (task.targetCount) {
                task.completed = task.currentCount >= task.targetCount;
            }
            if (period === 'daily') {
                this.rollupProgress(task.text, delta);
            }
        }
        this.saveData(data);
        return task;
    },

    deleteTask(period, taskId) {
        let data = this.getData();
        data[period].tasks = data[period].tasks.filter(t => t.id !== taskId);
        this.saveData(data);
    },

    // ─── Analytics & Retrieval ───────────────────────────────────────────────

    getStats(period, data = null) {
        if (!data) data = this.checkAllResets();
        const pd = data[period];
        const completed = pd.tasks.filter(t => t.completed).length;
        const total = pd.tasks.length;
        const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
        const periodLabel = this.getPeriodLabel(period, pd.resetDate);
        return { completed, total, pct, history: pd.history, periodLabel };
    },

    getAllStats() {
        const data = this.checkAllResets();
        const stats = {};
        for (const p of this.PERIODS) stats[p] = this.getStats(p, data);
        return stats;
    },

    getTasks(period) {
        const data = this.checkAllResets();
        const tasks = data[period].tasks;
        let modified = false;

        tasks.forEach(t => {
            if (t.targetCount === undefined || t.targetCount === null) {
                const meta = this.parseTaskMeta(t.text);
                if (meta.targetCount) {
                    t.targetCount = meta.targetCount;
                    t.currentCount = t.currentCount || (t.completed ? meta.targetCount : 0);
                    modified = true;
                }
            }
        });

        if (modified) this.saveData(data);
        return tasks;
    },
};
