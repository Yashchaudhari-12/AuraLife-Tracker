/**
 * Storage Utility for AuraLife Tracker
 * Handles local storage persistence, feature data, and export/import
 */

const STORAGE_KEYS = {
    SUBJECTS: 'auralife_subjects', GOALS: 'auralife_goals', TIMETABLE: 'auralife_timetable',
    TASKS: 'auralife_tasks', TODAYS_FOCUS: 'auralife_todays_focus', FOCUS_DATE: 'auralife_focus_date',
    MILESTONE_GOALS: 'auralife_milestone_goals_v2', HABITS: 'auralife_habits_v2',
    CODING_STATS: 'auralife_coding_stats_v1', XP: 'auralife_xp', ACTIVITY_LOG: 'auralife_activity_log',
    CALENDAR_NOTES: 'auralife_cal_notes', LOGS: 'auralife_logs', SETTINGS: 'auralife_settings'
};
const FEATURE_KEYS = Object.values(STORAGE_KEYS);
const DEFAULT_TIMETABLE = { Monday: [], Tuesday: [], Wednesday: [], Thursday: [], Friday: [], Saturday: [], Sunday: [] };

function readJSON(key, fallback) {
    const data = localStorage.getItem(key);
    if (!data) return fallback;
    try { return JSON.parse(data); }
    catch (e) { console.error(`Failed to parse ${key} from storage`, e); return fallback; }
}

export const Storage = {
    _syncTimer: null,
    _scheduleSync() {
        if (!window.appCloud) return;
        clearTimeout(this._syncTimer);
        this._syncTimer = setTimeout(() => window.appCloud.syncAllDataToCloud(), 3000);
    },
    getSubjects() { return readJSON(STORAGE_KEYS.SUBJECTS, []); },
    saveSubjects(subjects) { localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(subjects)); this._scheduleSync(); },
    _saveSubjectsLocal(subjects) { localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(subjects)); },
    getGoals() { return readJSON(STORAGE_KEYS.GOALS, []); },
    saveGoals(goals) { localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals)); this._scheduleSync(); },
    _saveGoalsLocal(goals) { localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals)); },
    getTimetable() { return readJSON(STORAGE_KEYS.TIMETABLE, DEFAULT_TIMETABLE); },
    saveTimetable(timetable) { localStorage.setItem(STORAGE_KEYS.TIMETABLE, JSON.stringify(timetable)); this._scheduleSync(); },
    _saveTimetableLocal(timetable) { localStorage.setItem(STORAGE_KEYS.TIMETABLE, JSON.stringify(timetable)); },
    getFeatureData() {
        const data = {};
        FEATURE_KEYS.forEach(key => {
            const value = localStorage.getItem(key);
            if (value !== null) {
                try { data[key] = JSON.parse(value); } catch (e) { console.error(`Skipping invalid stored data for ${key}`, e); }
            }
        });
        data[STORAGE_KEYS.SUBJECTS] = this.getSubjects();
        data[STORAGE_KEYS.GOALS] = this.getGoals();
        data[STORAGE_KEYS.TIMETABLE] = this.getTimetable();
        return data;
    },
    applyFeatureData(data) {
        if (!data || typeof data !== 'object') return;
        FEATURE_KEYS.forEach(key => {
            if (Object.prototype.hasOwnProperty.call(data, key)) localStorage.setItem(key, JSON.stringify(data[key]));
        });
    },
    clearAll() { FEATURE_KEYS.forEach(key => localStorage.removeItem(key)); this._scheduleSync(); },
    exportData() {
        const exportObj = { version: '2.0', exportedAt: new Date().toISOString(), subjects: this.getSubjects(), goals: this.getGoals(), timetable: this.getTimetable(), data: this.getFeatureData() };
        const dataStr = 'data:application/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportObj, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.href = dataStr;
        downloadAnchor.download = `auralife_backup_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(downloadAnchor); downloadAnchor.click(); downloadAnchor.remove();
    },
    importData(jsonData) {
        try {
            const parsed = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
            if (!parsed || typeof parsed !== 'object') throw new Error('Backup must be a JSON object');
            if (parsed.data) this.applyFeatureData(parsed.data);
            if (parsed.subjects) this.saveSubjects(parsed.subjects);
            if (parsed.goals) this.saveGoals(parsed.goals);
            if (parsed.timetable) this.saveTimetable(parsed.timetable);
            this._scheduleSync();
            return true;
        } catch (e) { console.error('Invalid backup JSON format', e); return false; }
    }
};
