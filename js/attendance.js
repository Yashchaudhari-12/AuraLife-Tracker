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

            message = requiredClasses > 0
                ? `⚠️ Attend the next ${requiredClasses} class${requiredClasses > 1 ? 'es' : ''} in a row to reach ${targetPercentage}%.`
                : `⚠️ You need to attend the next class to reach ${targetPercentage}%.`;
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

    calculateSubjectAttendance(subject) {
        const isLab = this.getSubjectType(subject) === 'lab';
        const labAttended = isLab ? (subject.labAttended ?? subject.attended ?? 0) : 0;
        const labTotal = isLab ? (subject.labTotal ?? subject.total ?? 0) : 0;
        const theoryAttended = isLab ? 0 : (subject.theoryAttended ?? subject.attended ?? 0);
        const theoryTotal = isLab ? 0 : (subject.theoryTotal ?? subject.total ?? 0);
        const labPercentage = labTotal > 0 ? Number(((labAttended / labTotal) * 100).toFixed(1)) : null;
        const theoryPercentage = theoryTotal > 0 ? Number(((theoryAttended / theoryTotal) * 100).toFixed(1)) : null;
        const totalAttended = labAttended + theoryAttended;
        const totalClasses = labTotal + theoryTotal;
        const percentage = totalClasses > 0
            ? Number(((totalAttended / totalClasses) * 100).toFixed(1))
            : 0;

        return {
            type: isLab ? 'lab' : 'theory',
            labAttended, labTotal, labPercentage,
            theoryAttended, theoryTotal, theoryPercentage,
            totalAttended, totalClasses, percentage
        };
    },

    getSubjectType(subject) {
        const subjectText = `${subject.name || ''} ${subject.code || ''}`;
        return /(^|[^a-z])(dsal|oopl)([^a-z]|$)/i.test(subjectText) ? 'lab' : 'theory';
    },

    calculateOverallAttendance(subjects) {
        if (!subjects || subjects.length === 0) {
            return { labAttended: 0, labTotal: 0, theoryAttended: 0, theoryTotal: 0, totalAttended: 0, totalClasses: 0, labPercentage: null, theoryPercentage: null, overallPercentage: 0 };
        }
        const totals = subjects.reduce((acc, subject) => {
            const stats = this.calculateSubjectAttendance(subject);
            acc.labAttended += stats.labAttended;
            acc.labTotal += stats.labTotal;
            acc.theoryAttended += stats.theoryAttended;
            acc.theoryTotal += stats.theoryTotal;
            acc.totalAttended += stats.labAttended + stats.theoryAttended;
            acc.totalClasses += stats.labTotal + stats.theoryTotal;
            return acc;
        }, { labAttended: 0, labTotal: 0, theoryAttended: 0, theoryTotal: 0, totalAttended: 0, totalClasses: 0 });
        const labPercentage = totals.labTotal > 0 ? Number(((totals.labAttended / totals.labTotal) * 100).toFixed(1)) : null;
        const theoryPercentage = totals.theoryTotal > 0 ? Number(((totals.theoryAttended / totals.theoryTotal) * 100).toFixed(1)) : null;
        const overallPercentage = labPercentage !== null && theoryPercentage !== null
            ? Number(((labPercentage + theoryPercentage) / 2).toFixed(1))
            : labPercentage !== null
                ? labPercentage
                : theoryPercentage !== null
                    ? theoryPercentage
                    : 0;

        return { ...totals, labPercentage, theoryPercentage, overallPercentage };
    }
};
