import {
  Subject,
  TimetableSlot,
  TimetableSchedule,
  MilestoneGoal,
  FocusBlock,
  DailyMissionTask,
  FreeWindow,
  AiRecommendation,
  HeatmapDay,
  DayMode,
} from '../types/auralife';
import { getStoredSchedulingPreferences } from './schedulingIntelligence';

export function getStoredDayMode(): DayMode {
  try {
    const val = localStorage.getItem('auralife_day_mode');
    if (
      val &&
      ['College Day', 'Library Day', 'Home Study Day', 'Holiday', 'Sick Leave', 'Exam Day'].includes(val)
    ) {
      return val as DayMode;
    }
  } catch (e) {
    console.error(e);
  }
  return 'College Day';
}

export function saveStoredDayMode(mode: DayMode) {
  try {
    localStorage.setItem('auralife_day_mode', mode);
    window.dispatchEvent(new CustomEvent('auralife_daymode_updated', { detail: mode }));
    window.dispatchEvent(new CustomEvent('auralife_schedule_updated'));
  } catch (e) {
    console.error(e);
  }
}

export type DailyPriority = 'DSA' | 'LeetCode' | 'AuraLife Development' | 'College Revision' | 'Mixed';

export function getStoredDailyPriority(): DailyPriority {
  try {
    const val = localStorage.getItem('auralife_daily_priority');
    if (val && ['DSA', 'LeetCode', 'AuraLife Development', 'College Revision', 'Mixed'].includes(val)) {
      return val as DailyPriority;
    }
  } catch (e) {
    console.error(e);
  }
  return 'DSA';
}

export function saveStoredDailyPriority(priority: DailyPriority) {
  try {
    localStorage.setItem('auralife_daily_priority', priority);
    window.dispatchEvent(new CustomEvent('auralife_priority_updated', { detail: priority }));
    window.dispatchEvent(new CustomEvent('auralife_schedule_updated'));
  } catch (e) {
    console.error(e);
  }
}

export const STORAGE_KEYS = {
  SUBJECTS: 'auralife_subjects',
  TIMETABLE: 'auralife_timetable',
  MILESTONE_GOALS: 'auralife_milestone_goals_v2',
  TODAYS_FOCUS: 'auralife_todays_focus',
  TIME_PLANNER: 'auralife_time_planner_react',
  ACTIVITY_LOG: 'auralife_activity_log',
  TRAVEL_TIME: 'auralife_travel_time_mins',
  GET_READY_TIME: 'auralife_get_ready_mins',
  SLEEP_TARGET: 'auralife_sleep_target_hours',
};

// Default subjects if user hasn't added any yet
export const DEFAULT_SUBJECTS: Subject[] = [
  {
    id: 'subj-dsa',
    name: 'Data Structures & Algorithms',
    code: 'DSA',
    attended: 14,
    total: 18,
    targetPercent: 75,
  },
  {
    id: 'subj-coa',
    name: 'Computer Organization & Arch',
    code: 'COA',
    attended: 14,
    total: 16,
    targetPercent: 75,
  },
  {
    id: 'subj-oop',
    name: 'Object Oriented Programming',
    code: 'OOP',
    attended: 12,
    total: 15,
    targetPercent: 75,
  },
  {
    id: 'subj-emmd',
    name: 'Engineering Math & Discrete Systems',
    code: 'EMMD',
    attended: 13,
    total: 15,
    targetPercent: 75,
  },
  {
    id: 'subj-dsal',
    name: 'DSA Lab (Practicals)',
    code: 'DSAL',
    attended: 7,
    total: 8,
    targetPercent: 75,
  },
  {
    id: 'subj-oopl',
    name: 'OOP Lab (Practicals)',
    code: 'OOPL',
    attended: 7,
    total: 8,
    targetPercent: 75,
  },
];

// Default timetable for weekdays & weekends
export const DEFAULT_TIMETABLE: TimetableSchedule = {
  Monday: [
    { id: 'slot-m1', subjectId: 'subj-dsa', startTime: '09:15', endTime: '10:10', room: 'LH-101', type: 'theory' },
    { id: 'slot-m2', subjectId: 'subj-coa', startTime: '10:10', endTime: '11:05', room: 'LH-102', type: 'theory' },
    { id: 'slot-m3', subjectId: 'subj-oop', startTime: '11:15', endTime: '12:10', room: 'LH-104', type: 'theory' },
    { id: 'slot-m4', subjectId: 'subj-emmd', startTime: '12:10', endTime: '13:05', room: 'LH-105', type: 'theory' },
    { id: 'slot-m5', subjectId: 'subj-dsal', startTime: '14:00', endTime: '16:00', room: 'CS-LAB2', type: 'lab' },
  ],
  Tuesday: [
    { id: 'slot-t1', subjectId: 'subj-coa', startTime: '09:15', endTime: '10:10', room: 'LH-102', type: 'theory' },
    { id: 'slot-t2', subjectId: 'subj-dsa', startTime: '10:10', endTime: '11:05', room: 'LH-101', type: 'theory' },
    { id: 'slot-t3', subjectId: 'subj-emmd', startTime: '11:15', endTime: '12:10', room: 'LH-105', type: 'theory' },
    { id: 'slot-t4', subjectId: 'subj-oop', startTime: '14:00', endTime: '16:00', room: 'CS-LAB1', type: 'lab' },
  ],
  Wednesday: [
    { id: 'slot-w1', subjectId: 'subj-dsa', startTime: '09:15', endTime: '10:10', room: 'LH-101', type: 'theory' },
    { id: 'slot-w2', subjectId: 'subj-oop', startTime: '10:10', endTime: '11:05', room: 'LH-104', type: 'theory' },
    { id: 'slot-w3', subjectId: 'subj-coa', startTime: '11:15', endTime: '12:10', room: 'LH-102', type: 'theory' },
    { id: 'slot-w4', subjectId: 'subj-emmd', startTime: '13:00', endTime: '14:00', room: 'LH-105', type: 'theory' },
  ],
  Thursday: [
    { id: 'slot-th1', subjectId: 'subj-emmd', startTime: '09:15', endTime: '10:10', room: 'LH-105', type: 'theory' },
    { id: 'slot-th2', subjectId: 'subj-dsa', startTime: '10:10', endTime: '11:05', room: 'LH-101', type: 'theory' },
    { id: 'slot-th3', subjectId: 'subj-dsal', startTime: '11:15', endTime: '13:15', room: 'CS-LAB2', type: 'lab' },
    { id: 'slot-th4', subjectId: 'subj-coa', startTime: '14:00', endTime: '15:00', room: 'LH-102', type: 'theory' },
  ],
  Friday: [
    { id: 'slot-f1', subjectId: 'subj-oop', startTime: '09:15', endTime: '10:10', room: 'LH-104', type: 'theory' },
    { id: 'slot-f2', subjectId: 'subj-coa', startTime: '10:10', endTime: '11:05', room: 'LH-102', type: 'theory' },
    { id: 'slot-f3', subjectId: 'subj-dsa', startTime: '11:15', endTime: '12:10', room: 'LH-101', type: 'theory' },
  ],
  Saturday: [
    { id: 'slot-sat1', subjectId: 'subj-dsa', startTime: '10:00', endTime: '12:00', room: 'Home Study', type: 'self' },
    { id: 'slot-sat2', subjectId: 'subj-oop', startTime: '14:00', endTime: '16:00', room: 'Project Lab', type: 'self' },
  ],
  Sunday: [
    { id: 'slot-sun1', subjectId: 'subj-dsa', startTime: '09:30', endTime: '11:30', room: 'Home Focus Studio', type: 'self' },
    { id: 'slot-sun2', subjectId: 'subj-oop', startTime: '12:00', endTime: '13:30', room: 'System Architecture', type: 'self' },
    { id: 'slot-sun3', subjectId: 'subj-coa', startTime: '15:30', endTime: '17:30', room: 'Revision & A2Z Sprint', type: 'self' },
  ],
};

export function getStoredSubjects(): Subject[] {
  const raw = localStorage.getItem(STORAGE_KEYS.SUBJECTS);
  if (!raw) return DEFAULT_SUBJECTS;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_SUBJECTS;
  } catch {
    return DEFAULT_SUBJECTS;
  }
}

export function getStoredTimetable(): TimetableSchedule {
  const raw = localStorage.getItem(STORAGE_KEYS.TIMETABLE);
  if (!raw) return DEFAULT_TIMETABLE;
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? { ...DEFAULT_TIMETABLE, ...parsed } : DEFAULT_TIMETABLE;
  } catch {
    return DEFAULT_TIMETABLE;
  }
}

export function saveStoredTimetable(tt: TimetableSchedule) {
  localStorage.setItem(STORAGE_KEYS.TIMETABLE, JSON.stringify(tt));
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('auralife_schedule_updated'));
  }
}

export function getTodayDayName(): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[new Date().getDay()];
}

export function getScheduleSlotsForDay(
  dayName: string,
  modeOverride?: DayMode
): Array<TimetableSlot & { subject: Subject }> {
  const mode = modeOverride || getStoredDayMode();

  // Non-college day modes ignore college timetable
  if (mode === 'Home Study Day' || mode === 'Holiday' || mode === 'Sick Leave' || mode === 'Exam Day') {
    return [];
  }

  const timetable = getStoredTimetable();
  const subjects = getStoredSubjects();
  let slots = timetable[dayName] || DEFAULT_TIMETABLE[dayName] || [];

  return slots
    .map((slot) => {
      const subject = subjects.find((s) => s.id === slot.subjectId) || {
        id: slot.subjectId || 'subj-gen',
        name: slot.type === 'self' ? 'Self Study Block' : 'General Lecture',
        code: slot.type === 'self' ? 'SELF' : 'GEN',
        attended: 10,
        total: 10,
      };
      return { ...slot, subject };
    })
    .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));
}

export function getTodayScheduleSlots(): Array<TimetableSlot & { subject: Subject }> {
  return getScheduleSlotsForDay(getTodayDayName());
}

export function timeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

export function minutesToFormattedTime(totalMins: number): string {
  const hours = Math.floor(totalMins / 60);
  const mins = totalMins % 60;
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 === 0 ? 12 : hours % 12;
  return `${displayHours}:${mins.toString().padStart(2, '0')} ${period}`;
}

export function calculateAttendanceStats(subject: Subject) {
  const target = subject.targetPercent || 75;
  const attended = subject.attended || 0;
  const total = subject.total || 0;
  if (total === 0) {
    return { percentage: 100, status: 'SAFE' as const, safeBunks: 0, requiredClasses: 0, message: 'No classes held yet.' };
  }
  const percentage = Number(((attended / total) * 100).toFixed(1));
  if (percentage >= target) {
    const maxTotal = Math.floor(attended / (target / 100));
    const safeBunks = Math.max(0, maxTotal - total);
    return {
      percentage,
      status: 'SAFE' as const,
      safeBunks,
      requiredClasses: 0,
      message: safeBunks > 0 ? `Safe to bunk ${safeBunks} class${safeBunks > 1 ? 'es' : ''}` : 'On target threshold',
    };
  } else {
    const needed = Math.ceil((target * total - 100 * attended) / (100 - target));
    const requiredClasses = Math.max(1, needed);
    const status = percentage < target - 10 ? ('CRITICAL' as const) : ('WARNING' as const);
    return {
      percentage,
      status,
      safeBunks: 0,
      requiredClasses,
      message: `Attend next ${requiredClasses} consecutive class${requiredClasses > 1 ? 'es' : ''} to recover`,
    };
  }
}

export function saveStoredSubjects(subjects: Subject[]) {
  localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(subjects));
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('auralife_subjects_updated'));
  }
}

export function markTodayLecturesAttended(dayName?: string): { updatedCount: number; subjectCodes: string[] } {
  const targetDay = dayName || getTodayDayName();
  const daySlots = WEEKLY_TIMETABLE[targetDay] || [];

  const scheduledCodes = Array.from(
    new Set(
      daySlots
        .map((slot) => slot.subject?.code)
        .filter((code): code is string => Boolean(code))
    )
  );

  if (scheduledCodes.length === 0) {
    return { updatedCount: 0, subjectCodes: [] };
  }

  const subjects = getStoredSubjects();
  const updated = subjects.map((subj) => {
    if (scheduledCodes.includes(subj.code)) {
      return {
        ...subj,
        attended: (subj.attended || 0) + 1,
        total: (subj.total || 0) + 1,
      };
    }
    return subj;
  });

  saveStoredSubjects(updated);
  return { updatedCount: scheduledCodes.length, subjectCodes: scheduledCodes };
}

export function isLabSubject(subject: Subject): boolean {
  const code = (subject.code || '').toUpperCase();
  const name = (subject.name || '').toLowerCase();
  return (
    code === 'OOPL' ||
    code === 'DSAL' ||
    code.endsWith('L') ||
    name.includes('lab') ||
    (subject.labTotal !== undefined && subject.labTotal > 0)
  );
}

export function getOverallAttendanceStats() {
  const subjects = getStoredSubjects();

  const theorySubjects = subjects.filter((s) => !isLabSubject(s));
  const labSubjects = subjects.filter((s) => isLabSubject(s));

  const theoryAttended = theorySubjects.reduce((sum, s) => sum + (s.attended || 0), 0);
  const theoryTotal = theorySubjects.reduce((sum, s) => sum + (s.total || 0), 0);
  const theoryPercentage = theoryTotal > 0 ? Number(((theoryAttended / theoryTotal) * 100).toFixed(1)) : 100;

  const labAttended = labSubjects.reduce((sum, s) => sum + (s.attended || 0), 0);
  const labTotal = labSubjects.reduce((sum, s) => sum + (s.total || 0), 0);
  const labPercentage = labTotal > 0 ? Number(((labAttended / labTotal) * 100).toFixed(1)) : 100;

  let percentage = 100;
  if (theoryTotal > 0 && labTotal > 0) {
    percentage = Number(((theoryPercentage + labPercentage) / 2).toFixed(1));
  } else if (theoryTotal > 0) {
    percentage = theoryPercentage;
  } else if (labTotal > 0) {
    percentage = labPercentage;
  }

  const totalAttended = subjects.reduce((sum, s) => sum + (s.attended || 0), 0);
  const totalClasses = subjects.reduce((sum, s) => sum + (s.total || 0), 0);

  const criticalCount = subjects.filter((s) => calculateAttendanceStats(s).status === 'CRITICAL').length;
  const warningCount = subjects.filter((s) => calculateAttendanceStats(s).status === 'WARNING').length;

  return {
    totalAttended,
    totalClasses,
    theoryAttended,
    theoryTotal,
    theoryPercentage,
    labAttended,
    labTotal,
    labPercentage,
    percentage, // Average of Theory Attendance % & Labs Attendance %
    criticalCount,
    warningCount,
    atRiskCount: criticalCount + warningCount,
    subjectsCount: subjects.length,
  };
}

export const DAY_SPECIFIC_FOCUS_PLANS: Record<
  string,
  Array<{ topic: string; goal: string; badge: string }>
> = {
  Monday: [
    {
      topic: 'A2Z DSA Step 3: Two Pointers & Sliding Window',
      goal: 'Solve 2 LeetCode Mediums: Longest Substring Without Repeating Characters (#3) & 3Sum (#15). Sync to Cpp repo.',
      badge: 'A2Z DSA Sheet + LeetCode',
    },
    {
      topic: 'C++ Memory Management & Pointer Deep Dive',
      goal: 'Implement raw pointers vs smart pointers (std::unique_ptr, std::shared_ptr) in C++ repo.',
      badge: 'C++ Repo Sprint',
    },
    {
      topic: 'Binary Search on Rotated Sorted Arrays',
      goal: 'Solve 2 LeetCode Mediums: Search in Rotated Array (#33) & Koko Eating Bananas (#875).',
      badge: 'LeetCode Mediums',
    },
    {
      topic: 'Operating Systems & COA Core Concepts',
      goal: 'Revise Process Scheduling algorithms (FCFS, Round Robin) and CPU Cache levels for college tests.',
      badge: 'College Subject Review',
    },
  ],
  Tuesday: [
    {
      topic: 'A2Z DSA Step 4: String Algorithms & Substrings',
      goal: 'Solve 2 LeetCode Mediums: Longest Repeating Character Replacement (#424) & String to Integer atoi (#8).',
      badge: 'A2Z DSA Sheet + LeetCode',
    },
    {
      topic: 'Recursion & Backtracking - Subsets & Combinations',
      goal: 'Solve 2 Mediums: Subsets II (#90) & Combination Sum (#39). Push clean solution files to GitHub.',
      badge: 'LeetCode Sprint',
    },
    {
      topic: 'C++ Object-Oriented Programming (OOP) & Constructors',
      goal: 'Build OOP demo class hierarchy with virtual functions & copy constructors in C++ repo.',
      badge: 'C++ Repo Sprint',
    },
    {
      topic: 'Digital Logic & Microprocessors Revision',
      goal: 'Review 8086 register architecture & timing diagrams for upcoming college lab exams.',
      badge: 'College Subject Review',
    },
  ],
  Wednesday: [
    {
      topic: 'A2Z DSA Step 5: Linked Lists - Fast & Slow Pointers',
      goal: 'Solve 2 Mediums: Detect Cycle II (#142) & Reorder List (#143). Update C++ repo folder 05_LinkedList.',
      badge: 'A2Z DSA Sheet + LeetCode',
    },
    {
      topic: 'Bit Manipulation & Low-Level Math Tricks',
      goal: 'Solve 2 Mediums: Single Number II (#137) & Bitwise AND of Numbers Range (#201).',
      badge: 'LeetCode Sprint',
    },
    {
      topic: 'C++ Custom STL Containers & Fast I/O',
      goal: 'Build custom Vector template implementation in C++ and test performance against std::vector.',
      badge: 'C++ Repo Sprint',
    },
    {
      topic: 'Database Management Systems (DBMS) SQL Queries',
      goal: 'Practice SQL Joins, Group By, & B-Tree indexing concepts for DBMS course.',
      badge: 'College Subject Review',
    },
  ],
  Thursday: [
    {
      topic: 'A2Z DSA Step 7: Binary Trees & Traversals',
      goal: 'Solve 2 Mediums: Binary Tree Level Order (#102) & Zigzag Level Order Traversal (#103).',
      badge: 'A2Z DSA Sheet + LeetCode',
    },
    {
      topic: 'Monotonic Stacks & Queue Problems',
      goal: 'Solve 2 Mediums: Daily Temperatures (#739) & Next Greater Element II (#503).',
      badge: 'LeetCode Sprint',
    },
    {
      topic: 'Binary Search Trees (BST) & Validation',
      goal: 'Solve 2 Mediums: Validate BST (#98) & Kth Smallest Element in BST (#230). Commit to Cpp repo.',
      badge: 'C++ Repo Sprint',
    },
    {
      topic: 'Data Structures Lab Prep & Viva Questions',
      goal: 'Review time complexities of Heap, BST, and Hash Tables for college lab viva.',
      badge: 'College Subject Review',
    },
  ],
  Friday: [
    {
      topic: 'A2Z DSA Step 11: Heaps & Priority Queues',
      goal: 'Solve 2 Mediums: Kth Largest Element (#215) & Top K Frequent Elements (#347).',
      badge: 'A2Z DSA Sheet + LeetCode',
    },
    {
      topic: 'Greedy Algorithms & Interval Scheduling',
      goal: 'Solve 2 Mediums: Non-overlapping Intervals (#435) & Minimum Arrows to Burst Balloons (#452).',
      badge: 'LeetCode Sprint',
    },
    {
      topic: 'C++ Graph Adjacency List & BFS/DFS Implementation',
      goal: 'Write generic Graph class with BFS & DFS traversal functions in C++ repo.',
      badge: 'C++ Repo Sprint',
    },
    {
      topic: 'Operating Systems Semaphores & Deadlock Avoidance',
      goal: 'Study Producer-Consumer problem and Banker\'s algorithm for OS lecture review.',
      badge: 'College Subject Review',
    },
  ],
  Saturday: [
    {
      topic: 'A2Z DSA Step 13: Graph BFS/DFS & Topological Sort',
      goal: 'Solve 2 Mediums: Number of Islands (#200) & Course Schedule II (#210). Sync C++ code to GitHub.',
      badge: 'A2Z DSA Sheet + LeetCode',
    },
    {
      topic: 'Dynamic Programming - 1D & Grid DP',
      goal: 'Solve 2 Mediums: House Robber (#198) & Unique Paths (#62). Analyze time/space complexity.',
      badge: 'LeetCode Sprint',
    },
    {
      topic: 'C++ System Architecture & Build Automation',
      goal: 'Set up CMake build system & Google Test unit test runner for C++ repository.',
      badge: 'C++ Repo Sprint',
    },
    {
      topic: 'LeetCode Virtual Contest Speed Practice',
      goal: 'Complete 90-minute timed virtual contest solving 3 problems under contest pressure.',
      badge: 'LeetCode Virtual Contest',
    },
  ],
  Sunday: [
    {
      topic: 'A2Z DSA Step 16: DP on Subsets & Knapsack',
      goal: 'Solve 2 Mediums: Coin Change (#322) & Partition Equal Subset Sum (#416).',
      badge: 'A2Z DSA Sheet + LeetCode',
    },
    {
      topic: 'Disjoint Set Union (DSU) & Minimum Spanning Tree',
      goal: 'Solve 2 Mediums: Redundant Connection (#684) & Most Stones Removed (#947).',
      badge: 'LeetCode Sprint',
    },
    {
      topic: 'Weekly Academic Subject & Notes Consolidation',
      goal: 'Consolidate lecture notes across all 5 subjects and verify 75% attendance status.',
      badge: 'College Attendance Sync',
    },
    {
      topic: 'LeetCode Hard Problem Challenge & Code Refactoring',
      goal: 'Attempt 1 LeetCode Hard: Trapping Rain Water (#42) or Merge k Sorted Lists (#23).',
      badge: 'LeetCode Hard Challenge',
    },
  ],
};

function minsTo24h(mins: number): string {
  const normMins = Math.max(0, Math.min(23 * 60 + 59, mins));
  const h = Math.floor(normMins / 60);
  const m = normMins % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

export function getDsaAndLeetCodeProgress() {
  let githubRepoInfo = 'Yashchaudhari-12/Cpp: 24 C++ files';
  let leetcodeInfo = 'YashChaudhari12: 115 Solved (58E / 48M / 9H)';
  let completedTopics = ['01_Basics', '02_Arrays_Vectors', '03_Pointers'];

  try {
    const rawGh = localStorage.getItem('auralife_github_repo_yashchaudhari-12_cpp');
    if (rawGh) {
      const parsedGh = JSON.parse(rawGh);
      if (parsedGh.totalCppFiles) {
        githubRepoInfo = `${parsedGh.owner}/${parsedGh.repoName}: ${parsedGh.totalCppFiles} C++ files`;
      }
      if (parsedGh.foldersList && parsedGh.foldersList.length > 0) {
        completedTopics = parsedGh.foldersList;
      }
    }
  } catch (e) {
    console.error(e);
  }

  try {
    const rawLc = localStorage.getItem('auralife_leetcode_stats_yashchaudhari12');
    if (rawLc) {
      const parsedLc = JSON.parse(rawLc);
      if (parsedLc.totalSolved !== undefined) {
        leetcodeInfo = `${parsedLc.username}: ${parsedLc.totalSolved} Solved (${parsedLc.easySolved}E / ${parsedLc.mediumSolved}M / ${parsedLc.hardSolved}H)`;
      }
    }
  } catch (e) {
    console.error(e);
  }

  return {
    githubRepoInfo,
    leetcodeInfo,
    completedTopics,
  };
}

export function detectFreeWindows(
  slots: Array<TimetableSlot & { subject: Subject }>,
  dayName?: string,
  modeOverride?: DayMode
): FreeWindow[] {
  const currentDay = dayName || getTodayDayName();
  const dayMode = modeOverride || getStoredDayMode();

  const schedPrefs = getStoredSchedulingPreferences();
  const priority = getStoredDailyPriority();
  const wakeupMins = timeToMinutes(schedPrefs.preferredWakeupTime || '07:15');
  const bedtimeMins = timeToMinutes(schedPrefs.preferredBedtime || '23:30');
  const lunchStart = timeToMinutes(schedPrefs.lunchStartTime || '12:30');
  const lunchEnd = timeToMinutes(schedPrefs.lunchEndTime || '13:30');
  const dinnerStart = timeToMinutes(schedPrefs.dinnerStartTime || '20:00');
  const dinnerEnd = timeToMinutes(schedPrefs.dinnerEndTime || '21:00');
  const commuteMins = schedPrefs.commuteTimeMins || 30;
  const targetDuration = schedPrefs.preferredDeepWorkDuration || 90;
  const maxAllowed = schedPrefs.maxFocusBlocksPerDay || 3;

  // 1. SICK LEAVE MODE
  if (dayMode === 'Sick Leave') {
    return [
      {
        startTime: '16:00',
        endTime: '16:30',
        durationMinutes: 30,
        suggestedTopic: 'Light Reading & Health Recovery',
        suggestedGoal: 'Optional 30-min concept refresh (No heavy problem solving during Sick Leave)',
        estimatedCompletionMinutes: 30,
        confidence: 'High',
        windowType: 'midday',
        reasons: [
          'Sick Leave Active: Heavy coding sessions paused for health recovery',
          'Optional 30-minute light concept review',
          'Prioritizes rest, fluids, and sleep schedule',
        ],
      },
    ];
  }

  // 2. EXAM DAY MODE
  if (dayMode === 'Exam Day') {
    const start1 = wakeupMins + 60;
    const end1 = start1 + targetDuration;
    const start2 = 14 * 60 + 30; // 14:30
    const end2 = start2 + targetDuration;

    return [
      {
        startTime: minsTo24h(start1),
        endTime: minsTo24h(end1),
        durationMinutes: targetDuration,
        suggestedTopic: 'Exam Revision Block 1: Formulae & Core Concepts',
        suggestedGoal: 'High-weightage concept review & past year exam questions',
        estimatedCompletionMinutes: targetDuration,
        confidence: 'High',
        windowType: 'morning',
        reasons: [
          'Exam Day Mode: Exclusive focus on high-weightage subject syllabus',
          'Hides non-essential coding tasks to prevent cognitive overload',
          'Aligned with sleep and meal buffers for peak exam focus',
        ],
      },
      {
        startTime: minsTo24h(start2),
        endTime: minsTo24h(end2),
        durationMinutes: targetDuration,
        suggestedTopic: 'Exam Revision Block 2: Mock Test & Numerical Practice',
        suggestedGoal: 'Timed solving & high-probability question review',
        estimatedCompletionMinutes: targetDuration,
        confidence: 'High',
        windowType: 'midday',
        reasons: [
          'Midday exam practice sprint before final evening review',
          'Zero conflict with lunch break (12:30–13:30)',
          'Maximizes memory retention for upcoming exam',
        ],
      },
    ].slice(0, maxAllowed);
  }

  // 3. HOME STUDY DAY MODE
  if (dayMode === 'Home Study Day') {
    const morningStart = wakeupMins + 45; // e.g. 08:00
    const morningEnd = morningStart + targetDuration; // 09:30
    const block2Start = morningEnd + 30; // 10:00
    const block2End = block2Start + targetDuration; // 11:30
    const afternoonStart = 14 * 60; // 14:00
    const afternoonEnd = afternoonStart + targetDuration; // 15:30
    const eveningStart = 17 * 60 + 30; // 17:30
    const eveningEnd = eveningStart + targetDuration; // 19:00

    return [
      {
        startTime: minsTo24h(morningStart),
        endTime: minsTo24h(morningEnd),
        durationMinutes: targetDuration,
        suggestedTopic: 'Home Study Block 1: Morning Deep Work',
        suggestedGoal: `${targetDuration}-min uninterrupted DSA & problem solving sprint at home`,
        estimatedCompletionMinutes: targetDuration,
        confidence: 'High',
        windowType: 'morning',
        reasons: [
          'Home Study Day: Dedicated deep work session without campus commute',
          `Aligned with wake-up (${schedPrefs.preferredWakeupTime}) and morning routine`,
          'Zero lecture interruptions today',
          "Completes today's DSA & LeetCode goal",
        ],
      },
      {
        startTime: minsTo24h(block2Start),
        endTime: minsTo24h(block2End),
        durationMinutes: targetDuration,
        suggestedTopic: 'Home Study Block 2: Algorithm & Data Structure Deep Dive',
        suggestedGoal: 'Advanced problem patterns & complex testcase analysis',
        estimatedCompletionMinutes: targetDuration,
        confidence: 'High',
        windowType: 'morning',
        reasons: [
          'Pre-lunch focus block for uninterrupted problem solving',
          'Quiet environment for high-cognitive work',
          'Fits your target 90-min deep work duration',
        ],
      },
      {
        startTime: minsTo24h(afternoonStart),
        endTime: minsTo24h(afternoonEnd),
        durationMinutes: targetDuration,
        suggestedTopic: 'Home Study Block 3: System Architecture Sprint',
        suggestedGoal: 'Full-stack module development & system design',
        estimatedCompletionMinutes: targetDuration,
        confidence: 'High',
        windowType: 'midday',
        reasons: [
          'Midday home study block after lunch break (12:30–13:30)',
          'Quiet environment for complex coding tasks',
          'Fits your target deep work duration',
        ],
      },
      {
        startTime: minsTo24h(eveningStart),
        endTime: minsTo24h(eveningEnd),
        durationMinutes: targetDuration,
        suggestedTopic: 'Home Study Block 4: Evening Revision & LeetCode',
        suggestedGoal: 'Daily LeetCode Challenge & key subject consolidation',
        estimatedCompletionMinutes: targetDuration,
        confidence: 'High',
        windowType: 'evening',
        reasons: [
          'Evening revision session before dinner (20:00)',
          `Safeguards your ${schedPrefs.preferredBedtime || '23:30'} bedtime`,
          "Reinforces today's learning outcomes",
        ],
      },
    ];
  }

  // 4. HOLIDAY MODE
  if (dayMode === 'Holiday') {
    const block1Start = wakeupMins + 60; // 08:15
    const block1End = block1Start + targetDuration; // 09:45
    const block2Start = block1End + 30; // 10:15
    const block2End = block2Start + targetDuration; // 11:45
    const block3Start = 14 * 60 + 30; // 14:30
    const block3End = block3Start + targetDuration; // 16:00
    const block4Start = 17 * 60 + 30; // 17:30
    const block4End = block4Start + targetDuration; // 19:00

    return [
      {
        startTime: minsTo24h(block1Start),
        endTime: minsTo24h(block1End),
        durationMinutes: targetDuration,
        suggestedTopic: 'Holiday Focus Block 1: Algorithm Mastery',
        suggestedGoal: 'Uninterrupted holiday deep work on A2Z Sheet problems',
        estimatedCompletionMinutes: targetDuration,
        confidence: 'High',
        windowType: 'offday',
        reasons: [
          'Holiday Schedule: Full-day self-paced learning & skill growth',
          'Zero campus commute or class deadlines today',
          'Includes scheduled relaxation and meal breaks',
        ],
      },
      {
        startTime: minsTo24h(block2Start),
        endTime: minsTo24h(block2End),
        durationMinutes: targetDuration,
        suggestedTopic: 'Holiday Focus Block 2: LeetCode & Code Review',
        suggestedGoal: 'Solve 2 Mediums & optimize space/time complexity',
        estimatedCompletionMinutes: targetDuration,
        confidence: 'High',
        windowType: 'offday',
        reasons: [
          'Late morning focus sprint before lunch',
          'High cognitive capacity window',
          'Builds momentum for holiday learning',
        ],
      },
      {
        startTime: minsTo24h(block3Start),
        endTime: minsTo24h(block3End),
        durationMinutes: targetDuration,
        suggestedTopic: 'Holiday Focus Block 3: Full-Stack Project Work',
        suggestedGoal: 'Build & test major applet features',
        estimatedCompletionMinutes: targetDuration,
        confidence: 'High',
        windowType: 'offday',
        reasons: [
          'Afternoon project development block',
          'Fits preferred study duration',
          'Balanced with evening leisure time',
        ],
      },
      {
        startTime: minsTo24h(block4Start),
        endTime: minsTo24h(block4End),
        durationMinutes: targetDuration,
        suggestedTopic: 'Holiday Focus Block 4: System Architecture & Notes',
        suggestedGoal: 'Document key concepts, design patterns & revision notes',
        estimatedCompletionMinutes: targetDuration,
        confidence: 'High',
        windowType: 'offday',
        reasons: [
          'Pre-dinner evening consolidation session',
          'Protects bedtime & sleep recovery',
          'Completes 4 deep work sessions today',
        ],
      },
    ];
  }

  // 5. LIBRARY DAY OR COLLEGE DAY
  // For Library Day: theory classes skipped for library focus, labs preserved
  // For College Day: theory + labs attended
  const rawSlots = getStoredTimetable()[currentDay] || DEFAULT_TIMETABLE[currentDay] || [];

  // SPECIAL ENHANCED COLLEGE DAY ENGINE
  if (dayMode === 'College Day') {
    const sortedSlots = [...rawSlots].sort(
      (a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime)
    );

    const firstClassStart = sortedSlots.length > 0 ? timeToMinutes(sortedSlots[0].startTime) : 9 * 60;
    const lastClassEnd = sortedSlots.length > 0 ? timeToMinutes(sortedSlots[sortedSlots.length - 1].endTime) : 16 * 60 + 30;
    const reachHomeMins = Math.min(1440, lastClassEnd + commuteMins);

    const collegeWindows: FreeWindow[] = [];

    // Optional Morning Study (ONLY if explicitly enabled in preferences)
    if (schedPrefs.morningDeepWorkEnabled) {
      const morningStart = wakeupMins + 30;
      const morningEnd = morningStart + 60;
      const morningCommuteStart = firstClassStart - commuteMins;
      if (morningEnd <= morningCommuteStart) {
        collegeWindows.push({
          startTime: minsTo24h(morningStart),
          endTime: minsTo24h(morningEnd),
          durationMinutes: 60,
          suggestedTopic: 'Morning Prime: Fast Problem Solving',
          suggestedGoal: 'Warm-up with 1 LeetCode Medium / Quick Revision before college',
          estimatedCompletionMinutes: 60,
          confidence: 'High',
          windowType: 'morning',
          reasons: [
            'Morning Study is explicitly enabled in preferences',
            'Completed before morning commute to college',
            'Protects breakfast & routine window',
          ],
        });
      }
    }

    // Dynamic Block Content based on Today's Priority
    let b1Topic = 'Block 1: A2Z Sheet Problems';
    let b1Goal = 'Solve core topic problems on A2Z Sheet (Highest Priority)';
    let b2Topic = 'Block 2: LeetCode Daily';
    let b2Goal = 'Solve Daily LeetCode Challenge & review optimal complexity';
    let b3Topic = 'Block 3: Pattern Revision';
    let b3Goal = 'Revise algorithms, space/time complexities & weak patterns';

    if (priority === 'AuraLife Development') {
      b1Topic = 'Block 1: Feature Development';
      b1Goal = 'Build core applet features & user interfaces';
      b2Topic = 'Block 2: Bug Fixes & Architecture';
      b2Goal = 'Fix console warnings, edge cases & modular architecture';
      b3Topic = 'Block 3: Testing & Documentation';
      b3Goal = 'Verify build compilation, types & component flows';
    } else if (priority === 'College Revision') {
      b1Topic = 'Block 1: Subject Revision';
      b1Goal = 'Revise lecture notes & key subject concepts';
      b2Topic = 'Block 2: Assignments & Lab Manuals';
      b2Goal = 'Complete pending class assignments & lab reports';
      b3Topic = 'Block 3: Practice & Past Papers';
      b3Goal = 'Solve previous year questions & tutorial problems';
    } else if (priority === 'LeetCode') {
      b1Topic = 'Block 1: LeetCode Daily & Contest Review';
      b1Goal = 'Solve Daily LeetCode Challenge & review contest problems';
      b2Topic = 'Block 2: Medium/Hard Topic Practice';
      b2Goal = 'Practice 2 Medium/Hard problems on target topic';
      b3Topic = 'Block 3: Space & Time Complexity Review';
      b3Goal = 'Review optimal space/time complexities & dry-run solutions';
    } else if (priority === 'Mixed') {
      b1Topic = 'Block 1: Core DSA Problem';
      b1Goal = 'Solve primary DSA problem';
      b2Topic = 'Block 2: Applet Feature Build';
      b2Goal = 'Develop core applet features';
      b3Topic = 'Block 3: College Subject Revision';
      b3Goal = 'Review lecture notes & assignments';
    }

    // --- EVENING SCHEDULE ALLOCATION (AFTER COLLEGE & COMMUTE HOME) ---

    // BLOCK 1: Immediately after reaching home (90 minutes)
    const b1Start = reachHomeMins;
    const b1Duration = 90;
    const b1End = b1Start + b1Duration;

    collegeWindows.push({
      startTime: minsTo24h(b1Start),
      endTime: minsTo24h(b1End),
      durationMinutes: b1Duration,
      suggestedTopic: b1Topic,
      suggestedGoal: b1Goal,
      estimatedCompletionMinutes: b1Duration,
      confidence: 'High',
      windowType: 'evening',
      reasons: [
        'Block 1: Immediately after reaching home (College completed first)',
        `Dedicated to today's highest priority: ${priority}`,
        '90 minutes of uninterrupted deep focus',
      ],
    });

    // BREAK: 25 minutes
    const breakDuration = 25;
    let nextAvailable = b1End + breakDuration;

    // BLOCK 2: 90 minutes (Respecting Dinner Time)
    let b2Start = nextAvailable;
    let b2Duration = 90;
    let b2End = b2Start + b2Duration;

    // Adjust Block 2 around dinner if needed
    if (b2Start < dinnerStart && b2End > dinnerStart) {
      if (dinnerStart - b2Start >= 60) {
        b2Duration = dinnerStart - b2Start;
        b2End = dinnerStart;
        nextAvailable = dinnerEnd;
      } else {
        b2Start = dinnerEnd;
        b2End = b2Start + b2Duration;
        nextAvailable = b2End;
      }
    } else if (b2Start >= dinnerStart && b2Start < dinnerEnd) {
      b2Start = dinnerEnd;
      b2End = b2Start + b2Duration;
      nextAvailable = b2End;
    } else {
      nextAvailable = Math.max(b2End, dinnerEnd);
    }

    // Ensure Block 2 fits before bedtime
    if (b2End <= bedtimeMins) {
      collegeWindows.push({
        startTime: minsTo24h(b2Start),
        endTime: minsTo24h(b2End),
        durationMinutes: b2Duration,
        suggestedTopic: b2Topic,
        suggestedGoal: b2Goal,
        estimatedCompletionMinutes: b2Duration,
        confidence: 'High',
        windowType: 'evening',
        reasons: [
          'Block 2: Evening deep work session after college',
          'Protects dinner & evening decompression',
          `${b2Duration} minutes focused on secondary priority`,
        ],
      });
    } else {
      const maxB2 = Math.max(60, bedtimeMins - b2Start - 15);
      if (maxB2 >= 45) {
        b2End = b2Start + maxB2;
        collegeWindows.push({
          startTime: minsTo24h(b2Start),
          endTime: minsTo24h(b2End),
          durationMinutes: maxB2,
          suggestedTopic: b2Topic,
          suggestedGoal: b2Goal,
          estimatedCompletionMinutes: maxB2,
          confidence: 'High',
          windowType: 'evening',
          reasons: [
            'Block 2: Evening deep work session',
            'Adjusted duration to strictly protect sleep target',
          ],
        });
      }
    }

    // OPTIONAL BLOCK 3: 60-90 minutes (Light College Day)
    const b3Start = nextAvailable + 15; // 15m break buffer
    const availableForB3 = bedtimeMins - b3Start;

    if (availableForB3 >= 60) {
      const b3Duration = Math.min(90, Math.max(60, availableForB3));
      const b3End = b3Start + b3Duration;

      collegeWindows.push({
        startTime: minsTo24h(b3Start),
        endTime: minsTo24h(b3End),
        durationMinutes: b3Duration,
        suggestedTopic: b3Topic,
        suggestedGoal: b3Goal,
        estimatedCompletionMinutes: b3Duration,
        confidence: 'High',
        windowType: 'night',
        reasons: [
          'Optional Block 3: Light College Day opportunity',
          'Generated because sufficient time exists before bedtime',
          `Protects sleep target (${minsTo24h(bedtimeMins)})`,
        ],
      });
    }

    return collegeWindows;
  }

  // STANDARD GAP DETECTION FOR LIBRARY DAY / HOME STUDY DAY / HOLIDAYS
  const activeSlots = dayMode === 'Library Day' ? rawSlots.filter((s) => s.type === 'lab') : rawSlots;

  const sortedSlots = [...activeSlots].sort(
    (a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime)
  );

  interface Interval {
    start: number;
    end: number;
    label: string;
  }

  const occupied: Interval[] = [];

  // Sleep constraints
  occupied.push({ start: 0, end: wakeupMins, label: 'Sleep/Wakeup' });
  occupied.push({ start: bedtimeMins, end: 1440, label: 'Bedtime/Sleep' });

  // Meal times
  if (lunchEnd > lunchStart) {
    occupied.push({ start: lunchStart, end: lunchEnd, label: 'Lunch Break' });
  }
  if (dinnerEnd > dinnerStart) {
    occupied.push({ start: dinnerStart, end: dinnerEnd, label: 'Dinner Break' });
  }

  // College Timetable & Commutes
  if (rawSlots.length > 0) {
    const firstClassStart = timeToMinutes(rawSlots[0].startTime);
    const lastClassEnd = timeToMinutes(rawSlots[rawSlots.length - 1].endTime);

    // Morning commute to college
    const morningCommuteStart = Math.max(0, firstClassStart - commuteMins);
    occupied.push({ start: morningCommuteStart, end: firstClassStart, label: 'Commute to College' });

    // Evening commute home
    const eveningCommuteEnd = Math.min(1440, lastClassEnd + commuteMins);
    occupied.push({ start: lastClassEnd, end: eveningCommuteEnd, label: 'Commute Home' });

    // Active classes (In Library Day, only Labs are occupied)
    for (const slot of sortedSlots) {
      const sStart = timeToMinutes(slot.startTime);
      const sEnd = timeToMinutes(slot.endTime);
      if (sEnd > sStart) {
        occupied.push({
          start: sStart,
          end: sEnd,
          label: slot.room ? `Lab (${slot.room})` : 'Class',
        });
      }
    }

    if (!schedPrefs.morningDeepWorkEnabled) {
      occupied.push({ start: 0, end: firstClassStart, label: 'No Morning Study' });
    }
  }

  // Sort & Merge Occupied Intervals
  occupied.sort((a, b) => a.start - b.start);

  const merged: { start: number; end: number }[] = [];
  for (const interval of occupied) {
    if (interval.end <= interval.start) continue;
    if (merged.length === 0) {
      merged.push({ start: interval.start, end: interval.end });
    } else {
      const last = merged[merged.length - 1];
      if (interval.start <= last.end) {
        last.end = Math.max(last.end, interval.end);
      } else {
        merged.push({ start: interval.start, end: interval.end });
      }
    }
  }

  // Find Unoccupied Free Gaps
  const freeWindows: FreeWindow[] = [];

  for (let i = 0; i < merged.length - 1; i++) {
    const gapStart = merged[i].end;
    const gapEnd = merged[i + 1].start;
    const gapDuration = gapEnd - gapStart;

    if (gapDuration < 45) {
      continue;
    }

    const blockDuration = Math.min(targetDuration, gapDuration);
    const blockStart = gapStart;
    const blockEnd = blockStart + blockDuration;

    let windowType: 'morning' | 'midday' | 'evening' | 'offday' = 'midday';
    if (blockStart < 12 * 60) {
      windowType = rawSlots.length === 0 ? 'offday' : 'morning';
    } else if (blockStart >= 17 * 60) {
      windowType = 'evening';
    } else if (rawSlots.length === 0) {
      windowType = 'offday';
    }

    const startStr = minsTo24h(blockStart);
    const endStr = minsTo24h(blockEnd);

    const reasons = dayMode === 'Library Day'
      ? [
          'Library Day: Quiet focus window in campus library during theory lecture hours',
          'Labs preserved and attended on campus',
          '⚠️ Attendance impact: Bunking theory lectures lowers attendance by ~1.2%',
          `Fits your preferred study duration (${targetDuration} minutes)`,
        ]
      : [
          `${gapDuration}-minute uninterrupted window ${
            windowType === 'evening'
              ? 'after college'
              : windowType === 'morning'
              ? 'before college'
              : rawSlots.length === 0
              ? 'on off-day'
              : 'between classes'
          }`,
          `Fits your preferred study duration (${targetDuration} minutes)`,
          `No conflict with meals (${schedPrefs.lunchStartTime || '12:30'} lunch / ${
            schedPrefs.dinnerStartTime || '20:00'
          } dinner) or sleep`,
          "Completes today's DSA & LeetCode target",
        ];

    freeWindows.push({
      startTime: startStr,
      endTime: endStr,
      durationMinutes: blockDuration,
      suggestedTopic:
        dayMode === 'Library Day'
          ? 'Library Focus: A2Z Sheet & Deep Coding'
          : windowType === 'evening'
          ? 'Evening Focus Sprint: DSA & LeetCode'
          : windowType === 'morning'
          ? 'Morning Deep Work: Algorithms'
          : 'Free Window Study Block',
      suggestedGoal: 'Solve 2 Medium DSA problems & update daily notes',
      estimatedCompletionMinutes: blockDuration,
      confidence: 'High',
      windowType,
      reasons,
    });
  }

  return freeWindows.slice(0, maxAllowed);
}

export function generateAiRecommendation(dayName?: string, modeOverride?: DayMode): AiRecommendation {
  const currentDay = dayName || getTodayDayName();
  const dayMode = modeOverride || getStoredDayMode();

  if (dayMode === 'Sick Leave') {
    return {
      contextSummary: 'Sick Leave Active: Prioritizing health recovery. All heavy problem-solving sessions paused.',
      tasks: [
        { text: 'Rest, hydrate & sleep', estimatedMinutes: 120, category: 'Health' },
        { text: 'Optional 20-min light reading if feeling better', estimatedMinutes: 20, category: 'Revision' },
      ],
      totalEstimatedMinutes: 140,
      priority: 'Normal',
      reasoning: 'Health recovery takes top priority to resume peak focus tomorrow.',
    };
  }

  if (dayMode === 'Exam Day') {
    return {
      contextSummary: 'Exam Day Active: Hides non-essential coding tasks and focuses 100% on high-weightage exam syllabus.',
      tasks: [
        { text: 'Revise Core Subject Formulae & High-Weightage Topics', estimatedMinutes: 60, category: 'Exam' },
        { text: 'Solve Past 3 Years Exam Question Papers', estimatedMinutes: 60, category: 'Exam' },
        { text: 'Final Formula Sheet & Key Diagrams Review', estimatedMinutes: 30, category: 'Exam' },
      ],
      totalEstimatedMinutes: 150,
      priority: 'High',
      reasoning: 'Exclusive exam revision maximizes test scores and academic standing.',
    };
  }

  if (dayMode === 'Library Day') {
    return {
      contextSummary: 'Library Day Active: Theory lectures replaced with quiet campus library focus blocks. Labs attended.',
      tasks: [
        { text: 'Uninterrupted Library Study Block: A2Z Sheet DSA', estimatedMinutes: 90, category: 'Coding' },
        { text: 'Attend Scheduled College Lab Session', estimatedMinutes: 60, category: 'College' },
        { text: 'LeetCode Daily Challenge & Note Review', estimatedMinutes: 45, category: 'Coding' },
      ],
      totalEstimatedMinutes: 195,
      priority: 'High',
      reasoning: 'Library self-study combined with required lab attendance for optimal productivity.',
    };
  }

  if (dayMode === 'Home Study Day') {
    return {
      contextSummary: 'Home Study Day Active: College timetable paused. Structured home learning plan.',
      tasks: [
        { text: 'Morning Focus Sprint: Solve 3 LeetCode Mediums', estimatedMinutes: 90, category: 'Coding' },
        { text: 'Full-Stack Project Module Development', estimatedMinutes: 75, category: 'Project' },
        { text: 'Subject Consolidation & Key Note Review', estimatedMinutes: 45, category: 'Revision' },
      ],
      totalEstimatedMinutes: 210,
      priority: 'High',
      reasoning: 'Home study day eliminates commute time for longer, continuous deep work blocks.',
    };
  }

  if (dayMode === 'Holiday') {
    return {
      contextSummary: 'Holiday Active: Full-day deep work, project sprint, and relaxation plan.',
      tasks: [
        { text: 'Holiday Deep Work: A2Z Sheet Algorithms', estimatedMinutes: 90, category: 'Coding' },
        { text: 'Project Development & System Design', estimatedMinutes: 75, category: 'Project' },
        { text: 'Scheduled Relaxation & Evening Leisure', estimatedMinutes: 60, category: 'Personal' },
      ],
      totalEstimatedMinutes: 225,
      priority: 'High',
      reasoning: 'Holiday schedule provides balanced time for skill building and rest.',
    };
  }

  // Default College Day recommendation logic
  const isWeekend = currentDay === 'Sunday' || currentDay === 'Saturday';

  if (isWeekend) {
    return {
      contextSummary: `It's ${currentDay} (College Off Day)! Zero lecture obligations today. Perfect opportunity for an uninterrupted deep work sprint.`,
      tasks: [
        { text: 'Solve 3 LeetCode Medium/Hard Problems (Trees & DP)', estimatedMinutes: 90, category: 'Coding' },
        { text: 'Build core feature module for Full-Stack Project', estimatedMinutes: 75, category: 'Project' },
        { text: 'Weekly note consolidation & Monday class prep', estimatedMinutes: 45, category: 'Revision' },
      ],
      totalEstimatedMinutes: 210,
      priority: 'High',
      reasoning: 'Weekend off-days provide uninterrupted 3+ hour focus blocks for long-term career milestones.',
    };
  }

  const subjects = getStoredSubjects();
  const criticalSubj = subjects.find((s) => {
    const stats = calculateAttendanceStats(s);
    return stats.status === 'CRITICAL' || stats.status === 'WARNING';
  });

  if (criticalSubj) {
    const stats = calculateAttendanceStats(criticalSubj);
    return {
      contextSummary: `Your ${criticalSubj.name} attendance is currently at ${stats.percentage}% (${stats.message}). High priority focus required before next lecture!`,
      tasks: [
        { text: `Attend ${criticalSubj.code} lecture & revise core notes`, estimatedMinutes: 55, category: 'College' },
        { text: 'Solve 2 A2Z Sheet DSA Problems', estimatedMinutes: 45, category: 'Coding' },
        { text: 'Complete LeetCode Daily Challenge', estimatedMinutes: 30, category: 'Coding' },
      ],
      totalEstimatedMinutes: 130,
      priority: 'High',
      reasoning: `Attendance alert for ${criticalSubj.code} + 2 pending milestone goals.`,
    };
  }

  return {
    contextSummary: 'You have a 2.5 hour free window before your next class lab session.',
    tasks: [
      { text: 'Solve 2 A2Z Sheet DSA Problems', estimatedMinutes: 45, category: 'Coding' },
      { text: 'Complete LeetCode Daily Challenge', estimatedMinutes: 30, category: 'Coding' },
      { text: 'Revise Boyer-Moore Voting Algorithm', estimatedMinutes: 30, category: 'Revision' },
    ],
    totalEstimatedMinutes: 105,
    priority: 'High',
    reasoning: 'Optimal focus window detected between theory classes and evening lab.',
  };
}

export function getHeatmapData(): HeatmapDay[] {
  const days: HeatmapDay[] = [];
  const today = new Date();
  for (let i = 59; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];

    // Seed realistic sample data based on day index
    const isWeekend = d.getDay() === 0 || d.getDay() === 6;
    const seed = (i * 17 + d.getDay() * 3) % 10;
    const hours = isWeekend ? (seed > 4 ? 4.5 : 2.0) : seed > 2 ? Number((2.5 + (seed % 3) * 1.2).toFixed(1)) : 1.0;
    const tasksCount = Math.round(hours * 1.5);
    const score = Math.min(100, Math.round(hours * 22 + 10));

    let intensity: 0 | 1 | 2 | 3 | 4 = 0;
    if (hours > 4) intensity = 4;
    else if (hours >= 3) intensity = 3;
    else if (hours >= 2) intensity = 2;
    else if (hours > 0) intensity = 1;

    days.push({
      date: dateStr,
      hours,
      tasksCount,
      score,
      intensity,
    });
  }
  return days;
}

export function getDailyMissionTasks(): DailyMissionTask[] {
  const raw = localStorage.getItem(STORAGE_KEYS.TODAYS_FOCUS);
  if (!raw) {
    const defaults: DailyMissionTask[] = [
      { id: 'm1', text: 'Solve 2 A2Z Sheet Problems', completed: true, category: 'coding' },
      { id: 'm2', text: 'Complete Daily LeetCode Challenge', completed: true, category: 'coding' },
      { id: 'm3', text: 'Attend DSA & COA Lectures', completed: false, category: 'attendance' },
      { id: 'm4', text: 'Finish AuraLife Time Planner Integration', completed: false, category: 'project' },
    ];
    localStorage.setItem(STORAGE_KEYS.TODAYS_FOCUS, JSON.stringify(defaults));
    return defaults;
  }
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0
      ? parsed.map((item: any) => ({
          id: item.id || `m-${Date.now()}`,
          text: item.text || item.title || 'Task',
          completed: Boolean(item.completed),
          category: item.category || 'general',
        }))
      : [];
  } catch {
    return [];
  }
}

export function saveDailyMissionTasks(tasks: DailyMissionTask[]) {
  localStorage.setItem(STORAGE_KEYS.TODAYS_FOCUS, JSON.stringify(tasks));
}

export interface NextBestAction {
  actionTitle: string;
  actionDetails: string;
  category: 'class' | 'lab' | 'library' | 'study' | 'meal' | 'commute' | 'routine' | 'rest' | 'break';
  timeWindow: string;
  reasons: string[];
  isLectureHeavy?: boolean;
}

export function getNextBestAction(
  dayName?: string,
  modeOverride?: DayMode,
  currentMinsOverride?: number
): NextBestAction {
  const currentDay = dayName || getTodayDayName();
  const dayMode = modeOverride || getStoredDayMode();
  const priority = getStoredDailyPriority();
  const schedPrefs = getStoredSchedulingPreferences();

  const now = new Date();
  const currentMins =
    currentMinsOverride !== undefined
      ? currentMinsOverride
      : now.getHours() * 60 + now.getMinutes();

  const wakeupMins = timeToMinutes(schedPrefs.preferredWakeupTime || '07:15');
  const bedtimeMins = timeToMinutes(schedPrefs.preferredBedtime || '23:30');
  const lunchStart = timeToMinutes(schedPrefs.lunchStartTime || '12:30');
  const lunchEnd = timeToMinutes(schedPrefs.lunchEndTime || '13:30');
  const dinnerStart = timeToMinutes(schedPrefs.dinnerStartTime || '20:00');
  const dinnerEnd = timeToMinutes(schedPrefs.dinnerEndTime || '21:00');
  const commuteMins = schedPrefs.commuteDurationMinutes || 45;

  const rawSlots = getStoredTimetable()[currentDay] || DEFAULT_TIMETABLE[currentDay] || [];
  const sortedSlots = [...rawSlots].sort(
    (a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime)
  );

  // 1. SLEEP WINDOW
  if (currentMins < wakeupMins || currentMins >= bedtimeMins - 15) {
    return {
      actionTitle: 'Sleep & Night Recovery',
      actionDetails: `Target wakeup at ${minsTo24h(wakeupMins)}. Prioritize full rest & memory consolidation.`,
      category: 'rest',
      timeWindow: `${minsTo24h(currentMins)} – ${minsTo24h(wakeupMins)}`,
      reasons: [
        'Priority 1 in scheduling engine: Sleep & Recovery',
        'Essential for cognitive focus and problem-solving retention',
      ],
    };
  }

  // 2. MORNING ROUTINE
  if (currentMins >= wakeupMins && currentMins < wakeupMins + 30) {
    return {
      actionTitle: 'Morning Routine & Breakfast',
      actionDetails: `Hydrate & prepare for ${dayMode}. Today's Focus Priority: ${priority}`,
      category: 'routine',
      timeWindow: `${minsTo24h(wakeupMins)} – ${minsTo24h(wakeupMins + 30)}`,
      reasons: [
        'Priority 2 in scheduling engine: Morning Routine',
        `Prepares mind and body for today's ${priority} targets`,
      ],
    };
  }

  // 3. MEALS
  if (currentMins >= lunchStart && currentMins < lunchEnd) {
    return {
      actionTitle: 'Eat Lunch & Recharge',
      actionDetails: 'Nutritious lunch break with zero academic pressure',
      category: 'meal',
      timeWindow: `${minsTo24h(lunchStart)} – ${minsTo24h(lunchEnd)}`,
      reasons: [
        'Priority 6 in scheduling engine: Meals',
        'Restores blood glucose and mental energy for afternoon sessions',
      ],
    };
  }

  if (currentMins >= dinnerStart && currentMins < dinnerEnd) {
    return {
      actionTitle: 'Eat Dinner & Relaxation',
      actionDetails: 'Relaxing dinner window before evening focus session',
      category: 'meal',
      timeWindow: `${minsTo24h(dinnerStart)} – ${minsTo24h(dinnerEnd)}`,
      reasons: [
        'Priority 6 in scheduling engine: Meals',
        'Protects personal time and work-life balance',
      ],
    };
  }

  // 4. SICK LEAVE MODE
  if (dayMode === 'Sick Leave') {
    return {
      actionTitle: 'Rest & Recover (Sick Leave)',
      actionDetails: 'All heavy coding sessions paused. Hydrate & rest.',
      category: 'rest',
      timeWindow: 'All Day',
      reasons: ['Sick Leave active', 'Prioritizes physical health recovery'],
    };
  }

  // 5. COLLEGE DAY MODE
  if (dayMode === 'College Day' && sortedSlots.length > 0) {
    const firstClassStart = timeToMinutes(sortedSlots[0].startTime);
    const lastClassEnd = timeToMinutes(sortedSlots[sortedSlots.length - 1].endTime);
    const morningCommuteStart = Math.max(0, firstClassStart - commuteMins);
    const eveningCommuteEnd = Math.min(1440, lastClassEnd + commuteMins);

    // Morning Commute
    if (currentMins >= morningCommuteStart && currentMins < firstClassStart) {
      return {
        actionTitle: 'Commute to College',
        actionDetails: `Heading to campus for ${sortedSlots[0].subjectId} (${sortedSlots[0].startTime})`,
        category: 'commute',
        timeWindow: `${minsTo24h(morningCommuteStart)} – ${minsTo24h(firstClassStart)}`,
        reasons: [
          'Priority 3 in scheduling engine: Campus Commute',
          `Arrive early for ${sortedSlots[0].subjectId} class`,
        ],
      };
    }

    // Evening Commute
    if (currentMins >= lastClassEnd && currentMins < eveningCommuteEnd) {
      return {
        actionTitle: 'Travel Home from College',
        actionDetails: 'Evening commute back home after campus lectures & labs',
        category: 'commute',
        timeWindow: `${minsTo24h(lastClassEnd)} – ${minsTo24h(eveningCommuteEnd)}`,
        reasons: [
          'Priority 3 in scheduling engine: Campus Commute',
          'Decompress during travel',
        ],
      };
    }

    // Inside Class or Lab
    const currentSlot = sortedSlots.find(
      (s) => currentMins >= timeToMinutes(s.startTime) && currentMins < timeToMinutes(s.endTime)
    );

    if (currentSlot) {
      const isLab = currentSlot.type === 'lab';
      return {
        actionTitle: `Attend ${currentSlot.subjectId} ${isLab ? 'Lab' : 'Lecture'}`,
        actionDetails: `Room ${currentSlot.room || 'Classroom'} • ${isLab ? 'Mandatory Lab (Priority 5)' : 'Lecture (Priority 4)'}`,
        category: isLab ? 'lab' : 'class',
        timeWindow: `${currentSlot.startTime} – ${currentSlot.endTime}`,
        reasons: [
          isLab ? 'Mandatory lab attendance protected' : 'Subject attendance target ≥80%',
          'Engage actively in lecture concepts',
        ],
      };
    }

    // Break / Gap inside College
    if (currentMins >= firstClassStart && currentMins < lastClassEnd) {
      const nextClass = sortedSlots.find((s) => timeToMinutes(s.startTime) > currentMins);

      return {
        actionTitle: 'College in Session (Lectures & Labs)',
        actionDetails: nextClass
          ? `Attending campus classes (Next: ${nextClass.subjectId} at ${nextClass.startTime}). Deep work begins after returning home.`
          : `Attending college until ${minsTo24h(lastClassEnd)}. Deep work begins after returning home.`,
        category: 'class',
        timeWindow: `${minsTo24h(currentMins)} – ${minsTo24h(lastClassEnd)}`,
        isLectureHeavy: true,
        reasons: [
          'College hours protected — zero study blocks generated during college lectures',
          'Focus on attending classes & mandatory labs',
          `Deep Work Block 1 (${priority}) starts upon returning home`,
        ],
      };
    }

    // Evening at home (after college commute)
    if (currentMins >= eveningCommuteEnd && currentMins < dinnerStart) {
      let topic = 'Evening LeetCode Sprint';
      if (priority === 'AuraLife Development') topic = 'AuraLife Feature Development';
      else if (priority === 'College Revision') topic = 'Tomorrow\'s Subject Revision & Lab Prep';
      else if (priority === 'DSA') topic = 'A2Z Sheet Algorithm Sprint';

      return {
        actionTitle: `Start Evening Focus: ${topic}`,
        actionDetails: `Home deep work session on ${priority}`,
        category: 'study',
        timeWindow: `${minsTo24h(currentMins)} – ${minsTo24h(dinnerStart)}`,
        reasons: [
          'Evening study session (Priority 8)',
          'Zero commute pressure • Full focus environment',
          `Completes daily ${priority} target`,
        ],
      };
    }
  }

  // 6. DEFAULT FOCUS ACTION
  let topic = 'DSA & LeetCode Sprint';
  if (priority === 'AuraLife Development') topic = 'AuraLife Feature Development';
  else if (priority === 'College Revision') topic = 'College Subject Revision';

  return {
    actionTitle: `Start Focus Session: ${topic}`,
    actionDetails: `Uninterrupted deep work block • Priority: ${priority}`,
    category: 'study',
    timeWindow: `${minsTo24h(currentMins)} – ${minsTo24h(Math.min(bedtimeMins, currentMins + 90))}`,
    reasons: [
      `Optimized for ${dayMode}`,
      `Aligned with today's priority: ${priority}`,
      'No conflicts with meals or sleep schedule',
    ],
  };
}

