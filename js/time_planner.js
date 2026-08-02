/**
 * TimePlanner — Productivity module for scheduling focus sessions,
 * priority blocks, and weekly daily rhythm tracking.
 */

export const TimePlanner = {
    STORAGE_KEY: 'auralife_time_planner',

    getData() {
        const raw = localStorage.getItem(this.STORAGE_KEY);
        if (!raw) return this._defaultData();
        try {
            const parsed = JSON.parse(raw);
            return Object.assign(this._defaultData(), parsed);
        } catch (_) {
            return this._defaultData();
        }
    },

    saveData(data) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    },

    _defaultData() {
        return {
            focusBlocks: [],
            dailyRoutines: [
                { id: 'routine-morning', title: 'Morning Planning', status: 'pending', note: 'Review today’s goals and set 3 priorities.' },
                { id: 'routine-afternoon', title: 'Deep Work Block', status: 'pending', note: 'Focus on your highest-impact task.' },
                { id: 'routine-evening', title: 'Reflection & Wind-down', status: 'pending', note: 'Capture wins, risks, and next steps.' }
            ],
            weeklyReview: { lastReviewed: null, completed: false },
        };
    },

    addFocusBlock(block) {
        const data = this.getData();
        data.focusBlocks.unshift({
            id: `focus-${Date.now()}`,
            title: block.title,
            durationMins: block.durationMins,
            category: block.category,
            status: 'planned',
            createdAt: new Date().toISOString(),
        });
        this.saveData(data);
        return data.focusBlocks;
    },

    toggleFocusBlockStatus(blockId) {
        const data = this.getData();
        const block = data.focusBlocks.find(b => b.id === blockId);
        if (!block) return;
        block.status = block.status === 'planned' ? 'completed' : 'planned';
        this.saveData(data);
        return block;
    },

    deleteFocusBlock(blockId) {
        const data = this.getData();
        data.focusBlocks = data.focusBlocks.filter(b => b.id !== blockId);
        this.saveData(data);
        return data.focusBlocks;
    },

    completeRoutine(routineId) {
        const data = this.getData();
        const routine = data.dailyRoutines.find(r => r.id === routineId);
        if (!routine) return;
        routine.status = routine.status === 'completed' ? 'pending' : 'completed';
        this.saveData(data);
        return routine;
    },

    markWeeklyReviewDone() {
        const data = this.getData();
        data.weeklyReview.completed = !data.weeklyReview.completed;
        data.weeklyReview.lastReviewed = new Date().toISOString();
        this.saveData(data);
        return data.weeklyReview;
    },

    getMetrics() {
        const data = this.getData();
        const totalBlocks = data.focusBlocks.length;
        const completedBlocks = data.focusBlocks.filter(b => b.status === 'completed').length;
        const totalRoutines = data.dailyRoutines.length;
        const completedRoutines = data.dailyRoutines.filter(r => r.status === 'completed').length;
        const totalDuration = data.focusBlocks.reduce((sum, block) => sum + (block.durationMins || 0), 0);
        return {
            totalBlocks,
            completedBlocks,
            totalRoutines,
            completedRoutines,
            totalDuration,
            routineCompletionRate: totalRoutines > 0 ? Math.round((completedRoutines / totalRoutines) * 100) : 0,
        };
    },

    resetDailyRoutines() {
        const data = this.getData();
        data.dailyRoutines = data.dailyRoutines.map(r => ({ ...r, status: 'pending' }));
        this.saveData(data);
    }
};
