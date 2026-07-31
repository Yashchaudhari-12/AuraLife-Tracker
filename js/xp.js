/**
 * XP System — Gamification Engine
 * Tracks experience points, levels, achievements, and daily activity logs.
 */

export const XPSystem = {

    LEVELS: [
        { level: 1, xp: 0,    name: 'Rookie',    icon: '🌱', color: '#6b7280' },
        { level: 2, xp: 100,  name: 'Learner',   icon: '📖', color: '#10b981' },
        { level: 3, xp: 250,  name: 'Achiever',  icon: '🎯', color: '#06b6d4' },
        { level: 4, xp: 500,  name: 'Dedicated', icon: '💪', color: '#8b5cf6' },
        { level: 5, xp: 1000, name: 'Expert',    icon: '⚡', color: '#f59e0b' },
        { level: 6, xp: 2000, name: 'Master',    icon: '🔥', color: '#ef4444' },
        { level: 7, xp: 3500, name: 'Legend',    icon: '🏆', color: '#f97316' },
        { level: 8, xp: 5000, name: 'Elite',     icon: '💎', color: '#ec4899' },
    ],

    ACHIEVEMENTS: [
        { id: 'first_class',    icon: '📚', title: 'Scholar',        desc: 'Log your first attendance',         rarity: 'common'   },
        { id: 'first_goal',     icon: '🎯', title: 'Goal Setter',    desc: 'Add your first goal',               rarity: 'common'   },
        { id: 'habit_checker',  icon: '✅', title: 'Habit Checker',  desc: 'Complete a habit for the first time', rarity: 'common'  },
        { id: 'streak_3',       icon: '🔥', title: '3-Day Streak',   desc: '3 consecutive habit days',          rarity: 'uncommon' },
        { id: 'streak_7',       icon: '🔥', title: 'Week Warrior',   desc: 'Maintain a 7-day habit streak',     rarity: 'rare'     },
        { id: 'streak_30',      icon: '💯', title: 'Iron Will',      desc: 'Maintain a 30-day habit streak',    rarity: 'epic'     },
        { id: 'xp_100',         icon: '⭐', title: 'Rising Star',    desc: 'Earn 100 XP',                       rarity: 'common'   },
        { id: 'xp_500',         icon: '💎', title: 'Power User',     desc: 'Earn 500 XP',                       rarity: 'rare'     },
        { id: 'xp_1000',        icon: '🌟', title: 'Elite Grinder',  desc: 'Earn 1,000 XP',                     rarity: 'epic'     },
        { id: 'subjects_5',     icon: '📊', title: 'Data Nerd',      desc: 'Track 5+ subjects',                 rarity: 'uncommon' },
        { id: 'goals_10',       icon: '🏆', title: 'Goal Crusher',   desc: 'Add 10+ goals',                     rarity: 'rare'     },
        { id: 'consistent',     icon: '🗓️', title: 'Consistent',     desc: 'Log activity 7 different days',     rarity: 'uncommon' },
    ],

    XP_RATES: {
        attendance_present:  5,
        attendance_absent:   1,
        attendance_cancel:   0,
        new_goal:            2,
        new_subject:         2,
        habit_check:         3,
        goal_milestone:      10,
    },

    RARITY_COLORS: {
        common:   { bg: 'rgba(107,114,128,0.15)', border: 'rgba(107,114,128,0.3)', text: '#9ca3af' },
        uncommon: { bg: 'rgba(16,185,129,0.15)',  border: 'rgba(16,185,129,0.3)',  text: '#34d399' },
        rare:     { bg: 'rgba(6,182,212,0.15)',   border: 'rgba(6,182,212,0.3)',   text: '#67e8f9' },
        epic:     { bg: 'rgba(139,92,246,0.15)',  border: 'rgba(139,92,246,0.3)',  text: '#c4b5fd' },
    },

    // ─── Storage ────────────────────────────────────────────────────────────

    getProfile() {
        try {
            const data = JSON.parse(localStorage.getItem('auralife_xp') || 'null');
            return {
                total: (data && typeof data.total === 'number') ? data.total : 0,
                achievements: (data && Array.isArray(data.achievements)) ? data.achievements : []
            };
        } catch(e) {
            return { total: 0, achievements: [] };
        }
    },

    saveProfile(p) { localStorage.setItem('auralife_xp', JSON.stringify(p)); },

    getActivityLog() {
        try { return JSON.parse(localStorage.getItem('auralife_activity_log') || '{}'); }
        catch(e) { return {}; }
    },

    saveActivityLog(log) { localStorage.setItem('auralife_activity_log', JSON.stringify(log)); },

    todayKey() { return new Date().toISOString().split('T')[0]; },

    // ─── Level Helpers ───────────────────────────────────────────────────────

    getCurrentLevel(totalXP) {
        let current = this.LEVELS[0];
        for (const lvl of this.LEVELS) {
            if (totalXP >= lvl.xp) current = lvl;
            else break;
        }
        return current;
    },

    getNextLevel(totalXP) {
        return this.LEVELS.find(lvl => lvl.xp > totalXP) || null;
    },

    getXPProgress(totalXP) {
        const current = this.getCurrentLevel(totalXP);
        const next = this.getNextLevel(totalXP);
        if (!next) return { pct: 100, xpInLevel: totalXP - current.xp, xpNeeded: 0 };
        const xpInLevel = totalXP - current.xp;
        const xpNeeded  = next.xp - current.xp;
        return { pct: Math.round((xpInLevel / xpNeeded) * 100), xpInLevel, xpNeeded };
    },

    // ─── Earn XP ─────────────────────────────────────────────────────────────

    earn(action) {
        const amount = this.XP_RATES[action] || 0;
        if (amount === 0) return 0;

        const profile = this.getProfile();
        const prevLevel = this.getCurrentLevel(profile.total);
        profile.total += amount;
        const newLevel = this.getCurrentLevel(profile.total);

        // Update daily log
        const log = this.getActivityLog();
        const today = this.todayKey();
        if (!log[today]) log[today] = { attendanceLogged: 0, goalsCompleted: 0, habitsChecked: 0, xpEarned: 0, notes: '' };
        log[today].xpEarned += amount;
        if (action === 'attendance_present' || action === 'attendance_absent') log[today].attendanceLogged++;
        if (action === 'goal_milestone') log[today].goalsCompleted++;
        if (action === 'habit_check') log[today].habitsChecked++;
        this.saveActivityLog(log);

        // Level up notification
        if (newLevel.level > prevLevel.level) {
            setTimeout(() => {
                if (window.appUI) window.appUI.showToast(
                    `🎉 LEVEL UP! You're now ${newLevel.icon} ${newLevel.name} (Level ${newLevel.level})!`, 'success');
            }, 400);
        }

        this._checkAchievements(profile);
        this.saveProfile(profile);

        return amount;
    },

    // ─── Achievements ────────────────────────────────────────────────────────

    _checkAchievements(profile) {
        let subjects = [], goals = [];
        try { subjects = JSON.parse(localStorage.getItem('auralife_subjects') || '[]'); } catch(e){}
        try { goals    = JSON.parse(localStorage.getItem('auralife_goals')    || '[]'); } catch(e){}

        const totalLogs  = subjects.reduce((a, s) => a + (s.logs?.length || 0), 0);
        const maxStreak  = goals.length ? Math.max(...goals.map(g => g.streak || 0)) : 0;
        const activeDays = Object.keys(this.getActivityLog()).length;

        const checks = {
            first_class:   totalLogs >= 1,
            first_goal:    goals.length >= 1,
            habit_checker: goals.some(g => g.type === 'streak' && (g.streak || 0) >= 1),
            streak_3:      maxStreak >= 3,
            streak_7:      maxStreak >= 7,
            streak_30:     maxStreak >= 30,
            xp_100:        profile.total >= 100,
            xp_500:        profile.total >= 500,
            xp_1000:       profile.total >= 1000,
            subjects_5:    subjects.length >= 5,
            goals_10:      goals.length >= 10,
            consistent:    activeDays >= 7,
        };

        for (const [id, condition] of Object.entries(checks)) {
            if (condition && !profile.achievements.includes(id)) {
                profile.achievements.push(id);
                const ach = this.ACHIEVEMENTS.find(a => a.id === id);
                if (ach) setTimeout(() => {
                    if (window.appUI) window.appUI.showToast(
                        `🏆 Achievement: ${ach.icon} ${ach.title} — ${ach.desc}`, 'success');
                }, 700);
            }
        }
    },

    // ─── Today's Summary ─────────────────────────────────────────────────────

    getTodaySummary() {
        const log = this.getActivityLog();
        return log[this.todayKey()] || { attendanceLogged: 0, goalsCompleted: 0, habitsChecked: 0, xpEarned: 0 };
    },

    getTotalActiveDays() {
        return Object.keys(this.getActivityLog()).length;
    },
};
