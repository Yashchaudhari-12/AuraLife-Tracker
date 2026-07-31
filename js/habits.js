/**
 * HabitManager — Daily Non-Negotiable Habit Tracker
 * Tracks streaks, best streaks, and 365-day history for each habit.
 * Habits are checked daily — no resets, just continuous tracking.
 */

export const HabitManager = {

    PRESET_EMOJIS: ['😴','💧','🏋️','📚','🧘','🚶','🍎','☀️','📝','💊','💻','📖','🏃','🥗','🧹','🎵','✍️','🧠','🌿','🛁','🎯','💪','🧃','🫁','🧊','🌅','🎨','🎸','🏊','🚴'],
    PRESET_COLORS: ['#06b6d4','#8b5cf6','#10b981','#f59e0b','#ef4444','#ec4899','#3b82f6','#f97316','#84cc16','#a855f7'],

    // ─── Storage ─────────────────────────────────────────────────────────────

    getData() {
        try { return JSON.parse(localStorage.getItem('auralife_habits_v2') || '[]'); }
        catch(e) { return []; }
    },

    saveData(habits) {
        localStorage.setItem('auralife_habits_v2', JSON.stringify(habits));
        if (window.appStorage) window.appStorage._scheduleSync();
    },

    todayKey() { return new Date().toISOString().split('T')[0]; },

    // ─── Calculations ─────────────────────────────────────────────────────────

    calculateStreak(history) {
        if (!history || history.length === 0) return 0;
        const set   = new Set(history);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const todayStr     = today.toISOString().split('T')[0];
        const yesterday    = new Date(today.getTime() - 86400000);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        // Streak is broken if neither today nor yesterday is in history
        if (!set.has(todayStr) && !set.has(yesterdayStr)) return 0;

        let cursor = new Date(today);
        // If today not checked yet, start counting from yesterday
        if (!set.has(todayStr)) cursor.setDate(cursor.getDate() - 1);

        let streak = 0;
        while (set.has(cursor.toISOString().split('T')[0])) {
            streak++;
            cursor.setDate(cursor.getDate() - 1);
        }
        return streak;
    },

    getCompletionRate(history, days = 30) {
        if (!history || history.length === 0) return 0;
        const set = new Set(history);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        let done = 0;
        for (let i = 0; i < days; i++) {
            const d = new Date(today);
            d.setDate(today.getDate() - i);
            if (set.has(d.toISOString().split('T')[0])) done++;
        }
        return Math.round((done / days) * 100);
    },

    getLast14Days(history) {
        const set   = new Set(history || []);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const result = [];
        for (let i = 13; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(today.getDate() - i);
            const key = d.toISOString().split('T')[0];
            result.push({ date: key, done: set.has(key), isToday: i === 0 });
        }
        return result;
    },

    isCheckedToday(habit) {
        return (habit.history || []).includes(this.todayKey());
    },

    getTodayStats(habits) {
        const done  = habits.filter(h => this.isCheckedToday(h)).length;
        const total = habits.length;
        const pct   = total > 0 ? Math.round((done / total) * 100) : 0;
        return { done, total, pct };
    },

    // ─── CRUD ─────────────────────────────────────────────────────────────────

    addHabit(name, icon, color) {
        const habits = this.getData();
        habits.push({
            id: 'habit-' + Date.now(),
            name: name.trim(),
            icon: icon || '⭐',
            color: color || '#06b6d4',
            history: [],
            streak: 0,
            bestStreak: 0,
            createdAt: this.todayKey(),
        });
        this.saveData(habits);
    },

    toggleToday(habitId) {
        const habits = this.getData();
        const habit  = habits.find(h => h.id === habitId);
        if (!habit) return null;

        const today = this.todayKey();
        if (!habit.history) habit.history = [];

        if (habit.history.includes(today)) {
            habit.history = habit.history.filter(d => d !== today);
        } else {
            habit.history.push(today);
            if (habit.history.length > 365) habit.history = habit.history.slice(-365);
        }

        habit.streak     = this.calculateStreak(habit.history);
        habit.bestStreak = Math.max(habit.streak, habit.bestStreak || 0);
        this.saveData(habits);
        return habit;
    },

    deleteHabit(habitId) {
        const habits = this.getData().filter(h => h.id !== habitId);
        this.saveData(habits);
    },

    reorderUp(habitId) {
        const habits = this.getData();
        const i = habits.findIndex(h => h.id === habitId);
        if (i > 0) { [habits[i-1], habits[i]] = [habits[i], habits[i-1]]; }
        this.saveData(habits);
    },
};
