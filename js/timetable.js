/**
 * Timetable & Daily Schedule Intelligence
 */

export const TimetableManager = {
    DAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],

    getCurrentDayName() {
        const d = new Date();
        return this.DAYS[d.getDay()];
    },

    getTodaySchedule(timetable, subjects) {
        const dayName = this.getCurrentDayName();
        const rawSchedule = timetable[dayName] || [];

        return rawSchedule.map(slot => {
            const subject = subjects.find(s => s.id === slot.subjectId) || { name: 'Unknown Subject', code: '---', color: '#6b7280' };
            return {
                ...slot,
                subject
            };
        });
    }
};
