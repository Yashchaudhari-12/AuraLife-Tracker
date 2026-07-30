/**
 * Storage Utility for AuraLife Tracker
 * Handles local storage persistence and export/import
 */

const STORAGE_KEYS = {
    SUBJECTS: 'auralife_subjects',
    GOALS: 'auralife_goals',
    TIMETABLE: 'auralife_timetable',
    LOGS: 'auralife_logs',
    SETTINGS: 'auralife_settings'
};

const DEFAULT_SUBJECTS = [];
const DEFAULT_GOALS = [];
const DEFAULT_TIMETABLE = {
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
    Saturday: [],
    Sunday: []
};

export const Storage = {
    getSubjects() {
        const data = localStorage.getItem(STORAGE_KEYS.SUBJECTS);
        if (!data) {
            return DEFAULT_SUBJECTS;
        }
        try {
            return JSON.parse(data);
        } catch (e) {
            console.error('Failed to parse subjects from storage', e);
            return DEFAULT_SUBJECTS;
        }
    },

    saveSubjects(subjects) {
        localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(subjects));
        if (window.appCloud) window.appCloud.syncAllDataToCloud();
    },

    getGoals() {
        const data = localStorage.getItem(STORAGE_KEYS.GOALS);
        if (!data) {
            return DEFAULT_GOALS;
        }
        try {
            return JSON.parse(data);
        } catch (e) {
            console.error('Failed to parse goals from storage', e);
            return DEFAULT_GOALS;
        }
    },

    saveGoals(goals) {
        localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
        if (window.appCloud) window.appCloud.syncAllDataToCloud();
    },

    getTimetable() {
        const data = localStorage.getItem(STORAGE_KEYS.TIMETABLE);
        if (!data) {
            return DEFAULT_TIMETABLE;
        }
        try {
            return JSON.parse(data);
        } catch (e) {
            console.error('Failed to parse timetable from storage', e);
            return DEFAULT_TIMETABLE;
        }
    },

    saveTimetable(timetable) {
        localStorage.setItem(STORAGE_KEYS.TIMETABLE, JSON.stringify(timetable));
        if (window.appCloud) window.appCloud.syncAllDataToCloud();
    },

    clearAll() {
        localStorage.removeItem(STORAGE_KEYS.SUBJECTS);
        localStorage.removeItem(STORAGE_KEYS.GOALS);
        localStorage.removeItem(STORAGE_KEYS.TIMETABLE);
        if (window.appCloud) window.appCloud.syncAllDataToCloud();
    },

    exportData() {
        const exportObj = {
            version: '1.0',
            exportedAt: new Date().toISOString(),
            subjects: this.getSubjects(),
            goals: this.getGoals(),
            timetable: this.getTimetable()
        };
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", `auralife_backup_${new Date().toISOString().split('T')[0]}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
    },

    importData(jsonData) {
        try {
            const parsed = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
            if (parsed.subjects) this.saveSubjects(parsed.subjects);
            if (parsed.goals) this.saveGoals(parsed.goals);
            if (parsed.timetable) this.saveTimetable(parsed.timetable);
            return true;
        } catch (e) {
            console.error('Invalid backup JSON format', e);
            return false;
        }
    }
};
