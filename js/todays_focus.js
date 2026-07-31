/**
 * TodaysFocus — Non-recurring Daily Important Tasks
 * Replaces old Daily Goals with non-recurring focus items.
 */
export const TodaysFocus = {
    STORAGE_KEY: 'auralife_todays_focus', DATE_KEY: 'auralife_focus_date',
    getData() {
        this.checkReset();
        try { return JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '[]'); }
        catch (e) { console.error('Failed to read focus items', e); return []; }
    },
    saveData(items) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(items));
        if (window.appStorage) window.appStorage._scheduleSync();
    },
    todayStr() { return new Date().toISOString().split('T')[0]; },
    checkReset() {
        const lastDate = localStorage.getItem(this.DATE_KEY), today = this.todayStr();
        if (lastDate !== today) {
            const items = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '[]');
            this.saveData(items.filter(i => !i.completed));
            localStorage.setItem(this.DATE_KEY, today);
        }
    },
    addItem(text) {
        const trimmed = text.trim(); if (!trimmed) return null;
        const items = this.getData();
        const newItem = { id: 'focus-' + Date.now(), text: trimmed, completed: false, createdAt: this.todayStr() };
        items.push(newItem); this.saveData(items); return newItem;
    },
    toggleItem(id) {
        const items = this.getData(), item = items.find(i => i.id === id);
        if (item) { item.completed = !item.completed; this.saveData(items); }
        return item;
    },
    deleteItem(id) { this.saveData(this.getData().filter(i => i.id !== id)); },
    getStats() {
        const items = this.getData(), total = items.length, completed = items.filter(i => i.completed).length;
        return { total, completed, pct: total > 0 ? Math.round((completed / total) * 100) : 0 };
    }
};
