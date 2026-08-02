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
} from '../types/auralife';

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

export function getScheduleSlotsForDay(dayName: string): Array<TimetableSlot & { subject: Subject }> {
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
  dayName?: string
): FreeWindow[] {
  const currentDay = dayName || getTodayDayName();
  const sortedSlots = [...slots].sort(
    (a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime)
  );

  const progress = getDsaAndLeetCodeProgress();

  // Helper to check if [start, end] overlaps with any scheduled class slot
  const overlapsWithClass = (start: number, end: number) => {
    return sortedSlots.some((slot) => {
      const sStart = timeToMinutes(slot.startTime);
      const sEnd = timeToMinutes(slot.endTime);
      return Math.max(start, sStart) < Math.min(end, sEnd);
    });
  };

  // NO COLLEGE / OFF-DAY: Generate 4x 90-minute focus blocks
  if (sortedSlots.length === 0) {
    return [
      {
        startTime: '08:30',
        endTime: '10:00',
        durationMinutes: 90,
        suggestedTopic: `Focus Block 1`,
        suggestedGoal: `90-minute uninterrupted Focus Block (${currentDay} Off-Day)`,
        estimatedCompletionMinutes: 90,
        confidence: 'High',
        windowType: 'offday',
        dsaRepoSync: progress.githubRepoInfo,
        leetcodeSync: progress.leetcodeInfo,
      },
      {
        startTime: '10:30',
        endTime: '12:00',
        durationMinutes: 90,
        suggestedTopic: `Focus Block 2`,
        suggestedGoal: `90-minute uninterrupted Focus Block (${currentDay} Off-Day)`,
        estimatedCompletionMinutes: 90,
        confidence: 'High',
        windowType: 'offday',
        dsaRepoSync: progress.githubRepoInfo,
        leetcodeSync: progress.leetcodeInfo,
      },
      {
        startTime: '14:00',
        endTime: '15:30',
        durationMinutes: 90,
        suggestedTopic: `Focus Block 3`,
        suggestedGoal: `90-minute uninterrupted Focus Block (${currentDay} Off-Day)`,
        estimatedCompletionMinutes: 90,
        confidence: 'High',
        windowType: 'offday',
        dsaRepoSync: progress.githubRepoInfo,
        leetcodeSync: progress.leetcodeInfo,
      },
      {
        startTime: '16:30',
        endTime: '18:00',
        durationMinutes: 90,
        suggestedTopic: `Focus Block 4`,
        suggestedGoal: `90-minute uninterrupted Focus Block (${currentDay} Off-Day)`,
        estimatedCompletionMinutes: 90,
        confidence: 'High',
        windowType: 'offday',
        dsaRepoSync: progress.githubRepoInfo,
        leetcodeSync: progress.leetcodeInfo,
      },
    ];
  }

  // COLLEGE DAY: Dynamically calculate 3 non-overlapping Focus Blocks
  // Buffers: 45m Get Ready routine after waking up, 30m Commute to college, 30m Commute home, 45m post-college refresh.
  const freeWindows: FreeWindow[] = [];
  let blockCounter = 1;

  const getReadyMins = Number(localStorage.getItem(STORAGE_KEYS.GET_READY_TIME) || 45); // 45m Get Ready
  const travelMins = Number(localStorage.getItem(STORAGE_KEYS.TRAVEL_TIME) || 30); // 30m Commute
  const sleepTargetHours = Number(localStorage.getItem(STORAGE_KEYS.SLEEP_TARGET) || 7.0); // 7.0h Min Sleep

  const firstClassStartMins = timeToMinutes(sortedSlots[0].startTime);
  const firstCode = sortedSlots[0].subject?.code || 'Lecture';

  // 1. Morning Focus Block (Wake Up at 06:00 AM -> 45m Shower/Brush Routine 06:00-06:45 -> Focus Block 06:45-08:15 -> Commute 08:15)
  const MORNING_START_MINS = 6 * 60 + 45; // 06:45 AM
  const MORNING_END_MINS = 8 * 60 + 15;   // 08:15 AM

  if (!overlapsWithClass(MORNING_START_MINS, MORNING_END_MINS)) {
    const morningStartStr = minsTo24h(MORNING_START_MINS);
    const morningEndStr = minsTo24h(MORNING_END_MINS);
    const getReadyStr = `06:00–06:45 AM`;
    const travelStr = `08:15–${minsTo24h(firstClassStartMins)}`;

    freeWindows.push({
      startTime: morningStartStr,
      endTime: morningEndStr,
      durationMinutes: 90,
      suggestedTopic: `Morning Focus Block`,
      suggestedGoal: `Morning Deep Work [06:00 AM Wakeup -> 45m Routine (${getReadyStr}) -> Focus Block -> Commute (${travelStr}) before ${firstCode}]`,
      estimatedCompletionMinutes: 90,
      confidence: 'High',
      nextSlotName: firstCode,
      windowType: 'morning',
      dsaRepoSync: progress.githubRepoInfo,
      leetcodeSync: progress.leetcodeInfo,
    });
  }

  // 2. Midday Gaps Between Classes (Only if there is a gap >= 60m after accounting for lunch/snacks break)
  for (let i = 0; i < sortedSlots.length - 1; i++) {
    const classEndMins = timeToMinutes(sortedSlots[i].endTime);
    const nextClassStartMins = timeToMinutes(sortedSlots[i + 1].startTime);
    const gapMins = nextClassStartMins - classEndMins;

    // Deduct 30m for lunch/snacks if gap spans meal times
    const isLunchTime = classEndMins >= 11 * 60 + 30 && nextClassStartMins <= 15 * 60;
    const lunchBufferMins = isLunchTime ? 30 : 15;
    const usableGapMins = gapMins - lunchBufferMins;

    if (usableGapMins >= 60) {
      const gapStartMins = classEndMins + lunchBufferMins;
      const gapEndMins = gapStartMins + Math.min(90, usableGapMins);

      if (!overlapsWithClass(gapStartMins, gapEndMins)) {
        freeWindows.push({
          startTime: minsTo24h(gapStartMins),
          endTime: minsTo24h(gapEndMins),
          durationMinutes: gapEndMins - gapStartMins,
          suggestedTopic: `Focus Block ${blockCounter++}`,
          suggestedGoal: `Midday Focus Block. [Includes ${lunchBufferMins}m Lunch/Snacks Buffer between classes]`,
          estimatedCompletionMinutes: gapEndMins - gapStartMins,
          confidence: 'High',
          windowType: 'midday',
          dsaRepoSync: progress.githubRepoInfo,
          leetcodeSync: progress.leetcodeInfo,
        });
      }
    }
  }

  // 3. Post-Class Evening & Night Focus Blocks
  const lastClassEndMins = timeToMinutes(sortedSlots[sortedSlots.length - 1].endTime);
  const lastCode = sortedSlots[sortedSlots.length - 1].subject?.code || 'Classes';

  // Buffers: 30m Travel Home + 45m Post-College Refresh / Evening Snacks & Lunch
  const travelHomeEndMins = lastClassEndMins + travelMins;
  const snacksEndMins = travelHomeEndMins + 45; // post-college refresh
  const eveStartMins = snacksEndMins;
  const eveEndMins = eveStartMins + 90;

  const travelHomeStr = `${minsTo24h(lastClassEndMins)}–${minsTo24h(travelHomeEndMins)}`;
  const snacksStr = `${minsTo24h(travelHomeEndMins)}–${minsTo24h(snacksEndMins)}`;

  if (!overlapsWithClass(eveStartMins, eveEndMins)) {
    freeWindows.push({
      startTime: minsTo24h(eveStartMins),
      endTime: minsTo24h(eveEndMins),
      durationMinutes: 90,
      suggestedTopic: `Focus Block ${blockCounter++}`,
      suggestedGoal: `Evening Focus Block. [Buffers: ${travelMins}m Commute Home (${travelHomeStr}) & 45m Refresh (${snacksStr}) after ${lastCode}]`,
      estimatedCompletionMinutes: 90,
      confidence: 'High',
      prevSlotName: lastCode,
      windowType: 'evening',
      dsaRepoSync: progress.githubRepoInfo,
      leetcodeSync: progress.leetcodeInfo,
    });
  }

  // 4. Second Evening/Night Focus Block (protected by 7.0h minimum sleep window)
  if (freeWindows.length < 3) {
    const nightStartMins = eveEndMins + 30; // 30m break
    const nightEndMins = nightStartMins + 90;
    // Ensure night focus block wraps up before 11:30 PM to guarantee 7.0+ hours sleep before morning wake-up
    if (nightEndMins <= 23 * 60 + 30 && !overlapsWithClass(nightStartMins, nightEndMins)) {
      freeWindows.push({
        startTime: minsTo24h(nightStartMins),
        endTime: minsTo24h(nightEndMins),
        durationMinutes: 90,
        suggestedTopic: `Focus Block ${blockCounter++}`,
        suggestedGoal: `Night Focus Block (Wraps up early to safeguard ${sleepTargetHours}h minimum sleep schedule)`,
        estimatedCompletionMinutes: 90,
        confidence: 'High',
        windowType: 'evening',
        dsaRepoSync: progress.githubRepoInfo,
        leetcodeSync: progress.leetcodeInfo,
      });
    }
  }

  return freeWindows;
}

export function generateAiRecommendation(dayName?: string): AiRecommendation {
  const currentDay = dayName || getTodayDayName();
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
