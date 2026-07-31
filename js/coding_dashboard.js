/**
 * CodingDashboard — Tailored Engineering & DSA Prep Widget
 * Supports customizable user targets (LeetCode, A2Z Sheet, Daily DSA Goal) with zero hardcoded defaults.
 */

export const CodingDashboard = {
    STORAGE_KEY: 'auralife_coding_stats_v1',

    getData() {
        try {
            return JSON.parse(localStorage.getItem(this.STORAGE_KEY) || 'null') || this._defaultData();
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
            leetcodeTarget: 0,
            leetcodeCurrent: 0,
            a2zTarget: 0,
            a2zCurrent: 0,
            dailyDsaGoal: 'Set your daily goal...',
            history: {},
        };
    },

    setTargets(lcTarget, a2zTarget, dailyGoal) {
        const data = this.getData();
        if (lcTarget !== undefined && lcTarget !== null && lcTarget !== '') {
            data.leetcodeTarget = Math.max(0, parseInt(lcTarget, 10) || 0);
        }
        if (a2zTarget !== undefined && a2zTarget !== null && a2zTarget !== '') {
            data.a2zTarget = Math.max(0, parseInt(a2zTarget, 10) || 0);
        }
        if (dailyGoal !== undefined && dailyGoal !== null && dailyGoal !== '') {
            data.dailyDsaGoal = dailyGoal.trim();
        }
        this.saveData(data);
        return data;
    },

    todayStr() {
        return new Date().toISOString().split('T')[0];
    },

    logProblem(type, count = 1) { // type = 'leetcode' | 'a2z'
        const data = this.getData();
        const today = this.todayStr();

        if (!data.history) data.history = {};
        if (!data.history[today]) {
            data.history[today] = { leetcode: 0, a2z: 0 };
        }

        if (type === 'leetcode') {
            data.leetcodeCurrent = Math.max(0, data.leetcodeCurrent + count);
            data.history[today].leetcode = Math.max(0, (data.history[today].leetcode || 0) + count);
        } else if (type === 'a2z') {
            data.a2zCurrent = Math.max(0, data.a2zCurrent + count);
            data.history[today].a2z = Math.max(0, (data.history[today].a2z || 0) + count);
        }

        this.saveData(data);
        return data;
    },

    getCodingStreak() {
        const data = this.getData();
        const history = data.history || {};
        const dates = new Set(Object.keys(history).filter(d => (history[d].leetcode || 0) + (history[d].a2z || 0) > 0));

        const today = new Date();
        today.setHours(0,0,0,0);
        const todayStr = today.toISOString().split('T')[0];
        const yesterday = new Date(today.getTime() - 86400000);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        if (!dates.has(todayStr) && !dates.has(yesterdayStr)) return 0;

        let cursor = new Date(today);
        if (!dates.has(todayStr)) cursor.setDate(cursor.getDate() - 1);

        let streak = 0;
        while (dates.has(cursor.toISOString().split('T')[0])) {
            streak++;
            cursor.setDate(cursor.getDate() - 1);
        }
        return streak;
    },

    getProblemsThisWeek() {
        const data = this.getData();
        const history = data.history || {};
        const today = new Date();
        today.setHours(0,0,0,0);
        let count = 0;

        for (let i = 0; i < 7; i++) {
            const d = new Date(today);
            d.setDate(today.getDate() - i);
            const key = d.toISOString().split('T')[0];
            if (history[key]) {
                count += (history[key].leetcode || 0) + (history[key].a2z || 0);
            }
        }
        return count;
    }
};
