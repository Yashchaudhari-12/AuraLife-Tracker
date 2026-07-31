/**
 * Migration Engine — AuraLife Architecture Refactor
 * Safely migrates legacy daily tasks to Today's Focus, and weekly/monthly/yearly tasks to Milestone Goals V2.
 * Preserves habits, attendance, XP, calendar notes, and history.
 */

export const DataMigration = {
    MIGRATION_KEY: 'auralife_migration_v2_done',

    runIfNeeded() {
        if (localStorage.getItem(this.MIGRATION_KEY)) return;

        try {
            // 1. Migrate daily tasks -> Today's Focus
            const legacyTasks = JSON.parse(localStorage.getItem('auralife_tasks') || '{}');

            if (legacyTasks.daily && Array.isArray(legacyTasks.daily.tasks)) {
                const existingFocus = JSON.parse(localStorage.getItem('auralife_todays_focus') || '[]');
                const existingIds = new Set(existingFocus.map(f => f.id));

                legacyTasks.daily.tasks.forEach(t => {
                    if (!existingIds.has(t.id)) {
                        existingFocus.push({
                            id: t.id || 'focus-' + Date.now() + Math.random().toString(36).substr(2, 4),
                            text: t.text,
                            completed: !!t.completed,
                            createdAt: t.createdAt || new Date().toISOString().split('T')[0],
                        });
                    }
                });
                localStorage.setItem('auralife_todays_focus', JSON.stringify(existingFocus));
            }

            // 2. Migrate weekly, monthly, yearly tasks -> Milestone Goals V2
            const existingGoals = JSON.parse(localStorage.getItem('auralife_milestone_goals_v2') || 'null') || {
                weekly: [],
                monthly: [],
                yearly: [],
            };

            ['weekly', 'monthly', 'yearly'].forEach(period => {
                if (legacyTasks[period] && Array.isArray(legacyTasks[period].tasks)) {
                    const existingIds = new Set((existingGoals[period] || []).map(g => g.id));

                    legacyTasks[period].tasks.forEach(t => {
                        if (!existingIds.has(t.id)) {
                            // Extract targetCount e.g. "150 LeetCode problems" -> 150
                            const numMatch = t.text.match(/(\d+)/);
                            const targetCount = t.targetCount || (numMatch ? parseInt(numMatch[1], 10) : null);
                            const category = this._guessCategory(t.text);

                            existingGoals[period].push({
                                id: t.id || 'goal-' + Date.now() + Math.random().toString(36).substr(2, 4),
                                title: t.text,
                                targetCount: targetCount && targetCount > 1 ? targetCount : null,
                                currentCount: t.currentCount || (t.completed ? (targetCount || 1) : 0),
                                completed: !!t.completed,
                                category: category,
                                deadline: t.deadline || null,
                                notes: t.notes || '',
                                createdAt: t.createdAt || new Date().toISOString().split('T')[0],
                            });
                        }
                    });
                }
            });

            localStorage.setItem('auralife_milestone_goals_v2', JSON.stringify(existingGoals));
            localStorage.setItem(this.MIGRATION_KEY, 'true');
            console.log('✅ AuraLife V2 Data Migration completed successfully!');
        } catch (e) {
            console.error('Migration notice:', e);
        }
    },

    _guessCategory(text) {
        const lower = text.toLowerCase();
        if (lower.includes('leetcode') || lower.includes('a2z') || lower.includes('code') || lower.includes('dsa') || lower.includes('algo') || lower.includes('project') || lower.includes('web')) return 'coding';
        if (lower.includes('college') || lower.includes('cgpa') || lower.includes('exam') || lower.includes('dbms') || lower.includes('os') || lower.includes('assignment')) return 'college';
        if (lower.includes('gym') || lower.includes('workout') || lower.includes('water') || lower.includes('run') || lower.includes('fitness')) return 'fitness';
        if (lower.includes('money') || lower.includes('internship') || lower.includes('stipend') || lower.includes('buy')) return 'finance';
        if (lower.includes('family') || lower.includes('mom') || lower.includes('dad') || lower.includes('call')) return 'family';
        return 'personal';
    }
};
