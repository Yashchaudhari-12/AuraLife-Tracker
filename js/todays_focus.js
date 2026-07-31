/**
 * TodaysFocus — Non-recurring Daily Important Tasks
 * Replaces old Daily Goals with non-recurring focus items (Buy groceries, Call Mom, Finish DBMS assignment).
 * Auto-resets daily at midnight.
 */

export const TodaysFocus = {
    STORAGE_KEY: 'auralife_todays_focus',
    DATE_KEY: 'auralife_focus_date',

    getData() {
        this.checkReset();
        try {
            return JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '[]');
        } catch (e) {
            return [];
        }
    },

    saveData(items) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(items));
    },

    todayStr() {
        return new Date().toISOString().split('T')[0];
    },

    checkReset() {
        const lastDate = localStorage.getItem(this.DATE_KEY);
        const today = this.todayStr();

        if (lastDate !== today) {
            // Keep uncompleted tasks or start fresh
            const items = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '[]');
            const pending = items.filter(i => !i.completed); // Unfinished items rollover, completed clear out
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(pending));
            localStorage.setItem(this.DATE_KEY, today);
        }
    },

    addItem(text) {
        const trimmed = text.trim();
        if (!trimmed) return null;
        const items = this.getData();
        const newItem = {
            id: 'focus-' + Date.now(),
            text: trimmed,
            completed: false,
            createdAt: this.todayStr(),
        };
        items.push(newItem);
        this.saveData(items);
        return newItem;
    },

    toggleItem(id) {
        const items = this.getData();
        const item = items.find(i => i.id === id);
        if (item) {
            item.completed = !item.completed;
            this.saveData(items);
        }
        return item;
    },

    deleteItem(id) {
        const items = this.getData().filter(i => i.id !== id);
        this.saveData(items);
    },

    getStats() {
        const items = this.getData();
        const total = items.length;
        const completed = items.filter(i => i.completed).length;
        const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
        return { total, completed, pct };
    }
};
