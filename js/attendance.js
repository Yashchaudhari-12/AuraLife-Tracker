/**
 * Attendance Intelligence & Bunk Calculator
 */

export const AttendanceCalc = {
    calculateStats(attended, total, targetPercentage = 75) {
        if (total === 0) {
            return {
                percentage: 100,
                status: 'SAFE',
                statusColor: '#10b981',
                safeBunks: 0,
                requiredClasses: 0,
                message: 'No classes held yet.'
            };
        }

        const percentage = Number(((attended / total) * 100).toFixed(1));
        const targetDecimal = targetPercentage / 100;

        let safeBunks = 0;
        let requiredClasses = 0;
        let status = 'SAFE';
        let statusColor = '#10b981'; // Green
        let message = '';

        if (percentage >= targetPercentage) {
            // Formula for safe bunks: A / (T + B) >= P => B <= (A / P) - T
            const maxTotalAllowed = Math.floor(attended / targetDecimal);
            safeBunks = Math.max(0, maxTotalAllowed - total);

            if (safeBunks === 0) {
                message = 'On target. Cannot skip any class without dropping below target.';
                status = 'SAFE';
                statusColor = '#10b981';
            } else {
                message = `✨ You can safely bunk ${safeBunks} class${safeBunks > 1 ? 'es' : ''}!`;
                status = 'SAFE';
                statusColor = '#10b981';
            }
        } else {
            // Formula for recovery: (A + R) / (T + R) >= P => R >= (P*T - A) / (1 - P)
            const needed = Math.ceil((targetDecimal * total - attended) / (1 - targetDecimal));
            requiredClasses = Math.max(0, needed);

            if (percentage < targetPercentage - 5) {
                status = 'CRITICAL DANGER';
                statusColor = '#ef4444'; // Red
            } else {
                status = 'BORDERLINE';
                statusColor = '#f59e0b'; // Amber
            }

            message = `⚠️ Attend ${requiredClasses} consecutive class${requiredClasses > 1 ? 'es' : ''} to reach ${targetPercentage}%.`;
        }

        return {
            percentage,
            status,
            statusColor,
            safeBunks,
            requiredClasses,
            message
        };
    },

    calculateOverallAttendance(subjects) {
        if (!subjects || subjects.length === 0) {
            return { totalAttended: 0, totalClasses: 0, overallPercentage: 100 };
        }
        const totalAttended = subjects.reduce((acc, s) => acc + (s.attended || 0), 0);
        const totalClasses = subjects.reduce((acc, s) => acc + (s.total || 0), 0);
        const overallPercentage = totalClasses > 0 ? Number(((totalAttended / totalClasses) * 100).toFixed(1)) : 100;

        return { totalAttended, totalClasses, overallPercentage };
    }
};
