/**
 * Life & Skill Goals Utility Module
 */

export const GoalsCalc = {
    calculateGoalProgress(goal) {
        if (goal.type === 'counter') {
            const current = goal.current || 0;
            const target = goal.target || 1;
            const pct = Math.min(100, Math.round((current / target) * 100));
            return {
                percentage: pct,
                isCompleted: current >= target,
                label: `${current} / ${target} ${goal.unit || ''}`
            };
        } else if (goal.type === 'checklist') {
            const subtasks = goal.subtasks || [];
            if (subtasks.length === 0) return { percentage: 0, isCompleted: false, label: '0 / 0 Subtasks' };
            const completedCount = subtasks.filter(s => s.completed).length;
            const pct = Math.round((completedCount / subtasks.length) * 100);
            return {
                percentage: pct,
                isCompleted: completedCount === subtasks.length,
                label: `${completedCount} / ${subtasks.length} Done`
            };
        } else if (goal.type === 'streak') {
            const streak = goal.streak || 0;
            const today = new Date().toISOString().split('T')[0];
            const isCompletedToday = goal.lastCompleted === today;
            return {
                percentage: Math.min(100, streak * 5), // Visual bar representation
                isCompleted: isCompletedToday,
                label: `${streak} Day Streak 🔥`
            };
        }
        return { percentage: 0, isCompleted: false, label: '' };
    },

    calculateOverallGoalsStats(goals) {
        if (!goals || goals.length === 0) return { totalGoals: 0, completedGoals: 0, activeStreaks: 0, overallProgressPct: 100 };

        let totalProgress = 0;
        let completedCount = 0;
        let activeStreaks = 0;

        goals.forEach(g => {
            const progress = this.calculateGoalProgress(g);
            totalProgress += progress.percentage;
            if (progress.isCompleted) completedCount++;
            if (g.type === 'streak' && g.streak > 0) activeStreaks++;
        });

        const overallProgressPct = Math.round(totalProgress / goals.length);

        return {
            totalGoals: goals.length,
            completedGoals: completedCount,
            activeStreaks,
            overallProgressPct
        };
    },

    toggleStreakToday(goal) {
        const today = new Date().toISOString().split('T')[0];
        const isCompletedToday = goal.lastCompleted === today;

        let newStreak = goal.streak || 0;
        let newHistory = Array.isArray(goal.history) ? [...goal.history] : [];
        let lastCompleted = goal.lastCompleted;

        if (isCompletedToday) {
            // Uncheck today
            newStreak = Math.max(0, newStreak - 1);
            newHistory = newHistory.filter(d => d !== today);
            lastCompleted = newHistory.length > 0 ? newHistory[newHistory.length - 1] : null;
        } else {
            // Check today
            newStreak += 1;
            newHistory.push(today);
            lastCompleted = today;
        }

        const bestStreak = Math.max(goal.bestStreak || 0, newStreak);

        return {
            ...goal,
            streak: newStreak,
            bestStreak,
            lastCompleted,
            history: newHistory
        };
    }
};
