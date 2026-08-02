import { Subject, TimetableSlot, FreeWindow } from '../types/auralife';
import { TimeBlock } from '../plannerStorage';
import { timeToMinutes, minutesToFormattedTime, getScheduleSlotsForDay, getStoredSubjects, calculateAttendanceStats } from './auralifeData';

export interface SchedulingPreferences {
  sleepTargetHours: number; // 6.5, 7, 7.5, 8
  preferredBedtime: string; // e.g. "23:30" (11:30 PM)
  preferredWakeupTime: string; // e.g. "07:15" (7:15 AM)
  morningDeepWorkEnabled: boolean; // default: false
  maxFocusBlocksPerDay: number; // default: 3
  preferredStudyLocation: 'Home' | 'Library' | 'Anywhere'; // default: 'Library'
  preferredStudyStrategy: 'Morning Person' | 'Evening Person' | 'Library First' | 'Home First' | 'Flexible';
  preferredDeepWorkDuration: number; // 45, 60, 90, 120
  lunchStartTime: string; // "12:30"
  lunchEndTime: string; // "13:30"
  dinnerStartTime: string; // "20:00"
  dinnerEndTime: string; // "21:00"
  commuteTimeMins: number; // 30
}

export const DEFAULT_SCHEDULING_PREFERENCES: SchedulingPreferences = {
  sleepTargetHours: 7.5,
  preferredBedtime: '23:30',
  preferredWakeupTime: '07:15',
  morningDeepWorkEnabled: false,
  maxFocusBlocksPerDay: 3,
  preferredStudyLocation: 'Library',
  preferredStudyStrategy: 'Library First',
  preferredDeepWorkDuration: 90,
  lunchStartTime: '12:30',
  lunchEndTime: '13:30',
  dinnerStartTime: '20:00',
  dinnerEndTime: '21:00',
  commuteTimeMins: 30,
};

const STORAGE_KEY_PREFS = 'auralife_scheduling_preferences';

export function getStoredSchedulingPreferences(): SchedulingPreferences {
  if (typeof window === 'undefined') return DEFAULT_SCHEDULING_PREFERENCES;
  const raw = localStorage.getItem(STORAGE_KEY_PREFS);
  if (!raw) return DEFAULT_SCHEDULING_PREFERENCES;
  try {
    return { ...DEFAULT_SCHEDULING_PREFERENCES, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SCHEDULING_PREFERENCES;
  }
}

export function saveStoredSchedulingPreferences(prefs: SchedulingPreferences) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY_PREFS, JSON.stringify(prefs));
  window.dispatchEvent(new CustomEvent('auralife_preferences_updated'));
}

export interface ScheduleHealthCheck {
  id: string;
  label: string; // e.g. "Sleep Protected"
  status: 'SAFE' | 'WARNING' | 'CRITICAL';
  detail: string;
}

export interface ScheduleWarningSuggestion {
  id: string;
  blockId?: string;
  blockTitle?: string;
  message: string; // "⚠ Sleep target not met."
  suggestionText: string; // "Move Focus Block 1 to your 1:15 PM library window?"
  targetStartTime?: string;
  targetEndTime?: string;
}

export interface ScheduleHealthReport {
  overallScore: number; // 0-100
  sleepProtected: boolean;
  labsCovered: boolean;
  attendanceSafe: boolean;
  mealsScheduled: boolean;
  commuteIncluded: boolean;
  focusBlockCount: number;
  maxFocusBlockLimit: number;
  checks: ScheduleHealthCheck[];
  warnings: ScheduleWarningSuggestion[];
}

/**
 * Validate schedule against user preferences and hard constraints
 */
export function validateSchedule(
  dayName: string,
  focusBlocks: TimeBlock[],
  prefs: SchedulingPreferences = getStoredSchedulingPreferences()
): ScheduleHealthReport {
  const slots = getScheduleSlotsForDay(dayName);
  const wakeupMins = timeToMinutes(prefs.preferredWakeupTime); // e.g. 7:15 AM = 435 mins
  const bedtimeMins = timeToMinutes(prefs.preferredBedtime); // e.g. 23:30 = 1410 mins
  const lunchStart = timeToMinutes(prefs.lunchStartTime);
  const lunchEnd = timeToMinutes(prefs.lunchEndTime);
  const dinnerStart = timeToMinutes(prefs.dinnerStartTime);
  const dinnerEnd = timeToMinutes(prefs.dinnerEndTime);

  // Calculate actual sleep hours available
  const nightSleepMins = (1440 - bedtimeMins) + wakeupMins;
  const actualSleepHours = Number((nightSleepMins / 60).toFixed(1));

  let sleepProtected = true;
  let mealsScheduled = true;
  let commuteIncluded = true;
  let labsCovered = true;
  let attendanceSafe = true;
  const warnings: ScheduleWarningSuggestion[] = [];

  // Check 1: Sleep Protection
  let sleepViolationReason = '';
  focusBlocks.forEach((block) => {
    if (!block.startTime) return;
    const bStart = timeToMinutes(block.startTime);
    const bEnd = block.endTime ? timeToMinutes(block.endTime) : bStart + block.durationMinutes;

    // Is it in sleep window? (between bedtime and wakeup)
    if (bStart < wakeupMins || bStart >= bedtimeMins || bEnd > bedtimeMins) {
      sleepProtected = false;
      sleepViolationReason = `Focus block "${block.title}" (${block.startTime}) starts before preferred wake time (${prefs.preferredWakeupTime}) or past bedtime.`;
      warnings.push({
        id: `sleep-warn-${block.id}`,
        blockId: block.id,
        blockTitle: block.title,
        message: '⚠ Sleep target not met.',
        suggestionText: `Move Focus Block "${block.title}" to your 1:15 PM library window or 6:30 PM evening window?`,
        targetStartTime: '13:15',
        targetEndTime: '14:45',
      });
    }

    // Check Morning Deep Work setting
    if (!prefs.morningDeepWorkEnabled && bStart < 540) { // before 9:00 AM
      if (sleepProtected) { // don't duplicate warning if already caught in sleep
        warnings.push({
          id: `morn-warn-${block.id}`,
          blockId: block.id,
          blockTitle: block.title,
          message: '⚠ Morning session scheduled while Morning Deep Work is disabled.',
          suggestionText: `Reschedule "${block.title}" to an afternoon library or evening session?`,
          targetStartTime: '13:15',
          targetEndTime: '14:45',
        });
      }
    }
  });

  // Check 2: Meals Overlap
  focusBlocks.forEach((block) => {
    if (!block.startTime) return;
    const bStart = timeToMinutes(block.startTime);
    const bEnd = block.endTime ? timeToMinutes(block.endTime) : bStart + block.durationMinutes;

    const overlapsLunch = Math.max(bStart, lunchStart) < Math.min(bEnd, lunchEnd);
    const overlapsDinner = Math.max(bStart, dinnerStart) < Math.min(bEnd, dinnerEnd);

    if (overlapsLunch || overlapsDinner) {
      mealsScheduled = false;
      const mealName = overlapsLunch ? 'Lunch' : 'Dinner';
      warnings.push({
        id: `meal-warn-${block.id}`,
        blockId: block.id,
        blockTitle: block.title,
        message: `⚠ Focus Block overlaps with ${mealName}.`,
        suggestionText: `Shift "${block.title}" past ${mealName} time to protect your nutrition routine?`,
        targetStartTime: overlapsLunch ? '14:00' : '21:00',
        targetEndTime: overlapsLunch ? '15:30' : '22:00',
      });
    }
  });

  // Check 3: Commute & Class Overlap
  if (slots.length > 0) {
    const firstClassStart = timeToMinutes(slots[0].startTime);
    const lastClassEnd = timeToMinutes(slots[slots.length - 1].endTime);
    const morningCommuteStart = firstClassStart - prefs.commuteTimeMins;
    const eveningCommuteEnd = lastClassEnd + prefs.commuteTimeMins;

    focusBlocks.forEach((block) => {
      if (!block.startTime) return;
      const bStart = timeToMinutes(block.startTime);
      const bEnd = block.endTime ? timeToMinutes(block.endTime) : bStart + block.durationMinutes;

      // Check if block overlaps with college commute
      const overlapsCommute = (bStart >= morningCommuteStart && bStart < firstClassStart) || (bStart >= lastClassEnd && bStart < eveningCommuteEnd);
      if (overlapsCommute) {
        commuteIncluded = false;
        warnings.push({
          id: `commute-warn-${block.id}`,
          blockId: block.id,
          blockTitle: block.title,
          message: '⚠ Focus Block conflicts with college commute time.',
          suggestionText: `Move "${block.title}" after arriving at college or home?`,
          targetStartTime: '18:30',
          targetEndTime: '20:00',
        });
      }
    });
  }

  // Check 4: Labs & Attendance
  const subjects = getStoredSubjects();
  const criticalSubjects = subjects.filter((s) => calculateAttendanceStats(s).status === 'CRITICAL');
  if (criticalSubjects.length > 0) {
    attendanceSafe = false;
  }

  // Calculate Overall Score
  let score = 100;
  if (!sleepProtected) score -= 25;
  if (!mealsScheduled) score -= 15;
  if (!commuteIncluded) score -= 10;
  if (focusBlocks.length > prefs.maxFocusBlocksPerDay) score -= 15;
  if (!attendanceSafe) score -= 10;
  score = Math.max(40, score);

  const checks: ScheduleHealthCheck[] = [
    {
      id: 'sleep',
      label: 'Sleep Protected',
      status: sleepProtected ? 'SAFE' : 'CRITICAL',
      detail: sleepProtected ? `${actualSleepHours}h Target Sleep Intact (${prefs.preferredBedtime} - ${prefs.preferredWakeupTime})` : 'Violated by early or late focus session',
    },
    {
      id: 'labs',
      label: 'Labs Covered',
      status: labsCovered ? 'SAFE' : 'WARNING',
      detail: 'Mandatory practical sessions protected',
    },
    {
      id: 'attendance',
      label: 'Attendance Safe',
      status: attendanceSafe ? 'SAFE' : 'WARNING',
      detail: attendanceSafe ? 'All subjects above 75% target' : `${criticalSubjects.length} subject(s) in critical recovery zone`,
    },
    {
      id: 'meals',
      label: 'Meals Scheduled',
      status: mealsScheduled ? 'SAFE' : 'WARNING',
      detail: mealsScheduled ? 'Lunch & Dinner windows protected' : 'Focus session conflicts with meal window',
    },
    {
      id: 'blocks',
      label: `${focusBlocks.length} Deep Work Sessions`,
      status: focusBlocks.length <= prefs.maxFocusBlocksPerDay ? 'SAFE' : 'WARNING',
      detail: `Within ${prefs.maxFocusBlocksPerDay} max daily block limit`,
    },
  ];

  return {
    overallScore: score,
    sleepProtected,
    labsCovered,
    attendanceSafe,
    mealsScheduled,
    commuteIncluded,
    focusBlockCount: focusBlocks.length,
    maxFocusBlockLimit: prefs.maxFocusBlocksPerDay,
    checks,
    warnings,
  };
}

/**
 * Automatically regenerates or relocates violating focus blocks to safe, sustainable windows.
 */
export function autoFixSchedule(
  dayName: string,
  focusBlocks: TimeBlock[],
  prefs: SchedulingPreferences = getStoredSchedulingPreferences()
): { fixedBlocks: TimeBlock[]; fixedCount: number } {
  const report = validateSchedule(dayName, focusBlocks, prefs);
  if (report.warnings.length === 0) {
    return { fixedBlocks: focusBlocks, fixedCount: 0 };
  }

  const wakeupMins = timeToMinutes(prefs.preferredWakeupTime);
  const bedtimeMins = timeToMinutes(prefs.preferredBedtime);
  const lunchStart = timeToMinutes(prefs.lunchStartTime);
  const lunchEnd = timeToMinutes(prefs.lunchEndTime);
  const dinnerStart = timeToMinutes(prefs.dinnerStartTime);
  const dinnerEnd = timeToMinutes(prefs.dinnerEndTime);

  // Compliant target slots (Priority 4: Library window 1:15 PM - 2:45 PM, Priority 5: Evening 6:30 PM - 8:00 PM, 9:00 PM - 10:00 PM)
  const safeWindows = [
    { start: '13:15', end: '14:45' }, // 1:15 PM - 2:45 PM (Library)
    { start: '18:30', end: '20:00' }, // 6:30 PM - 8:00 PM (Home)
    { start: '21:00', end: '22:30' }, // 9:00 PM - 10:30 PM (Evening)
  ];

  let fixedCount = 0;
  let windowIdx = 0;

  const fixedBlocks = focusBlocks.map((block) => {
    if (!block.startTime) return block;
    const bStart = timeToMinutes(block.startTime);

    // Is sleep or morning or meal violated?
    const isSleepViolated = bStart < wakeupMins || bStart >= bedtimeMins;
    const isMorningDisabledViolated = !prefs.morningDeepWorkEnabled && bStart < 540;
    const isMealViolated = (bStart >= lunchStart && bStart < lunchEnd) || (bStart >= dinnerStart && bStart < dinnerEnd);

    if (isSleepViolated || isMorningDisabledViolated || isMealViolated) {
      fixedCount++;
      const targetSlot = safeWindows[windowIdx % safeWindows.length];
      windowIdx++;
      return {
        ...block,
        startTime: targetSlot.start,
        endTime: targetSlot.end,
      };
    }
    return block;
  });

  return { fixedBlocks, fixedCount };
}
