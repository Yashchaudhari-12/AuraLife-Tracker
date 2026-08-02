export type TimeBlock = {
  id: string;
  title: string;
  durationMinutes: number;
  category: string;
  completed: boolean;
  createdAt: string;
  startTime?: string;
  endTime?: string;
};

export type RoutineItem = {
  id: string;
  title: string;
  note: string;
  completed: boolean;
};

export type WeeklyReview = {
  lastReviewed: string | null;
  completed: boolean;
};

export type TimePlannerState = {
  focusBlocks: TimeBlock[];
  dailyRoutines: RoutineItem[];
  weeklyReview: WeeklyReview;
};

const STORAGE_KEY = 'auralife_time_planner_react';

const DEFAULT_FOCUS_BLOCKS: TimeBlock[] = [
  {
    id: 'block-library-default',
    title: 'Library Session: Concept & Revision',
    durationMinutes: 90,
    category: 'Library',
    completed: false,
    createdAt: new Date().toISOString(),
    startTime: '13:15',
    endTime: '14:45',
  },
  {
    id: 'block-home-default',
    title: 'Home Session: DSA Practice & Project',
    durationMinutes: 90,
    category: 'Home',
    completed: false,
    createdAt: new Date().toISOString(),
    startTime: '18:30',
    endTime: '20:00',
  },
  {
    id: 'block-leetcode-default',
    title: 'Daily LeetCode: Problem Solving Sprint',
    durationMinutes: 90,
    category: 'Coding',
    completed: false,
    createdAt: new Date().toISOString(),
    startTime: '21:00',
    endTime: '22:30',
  },
];

const DEFAULT_STATE: TimePlannerState = {
  focusBlocks: DEFAULT_FOCUS_BLOCKS,
  dailyRoutines: [
    { id: 'routine-morning', title: 'Morning Planning', note: 'Review today’s goals and set 3 priorities.', completed: false },
    { id: 'routine-afternoon', title: 'Deep Work Block', note: 'Focus on your highest-impact task.', completed: false },
    { id: 'routine-evening', title: 'Reflection & Wind-down', note: 'Capture wins, risks, and next steps.', completed: false },
  ],
  weeklyReview: { lastReviewed: null, completed: false },
};

export function loadPlannerData(): TimePlannerState {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return DEFAULT_STATE;
  try {
    const parsed = JSON.parse(raw) as Partial<TimePlannerState>;
    const loadedBlocks = Array.isArray(parsed.focusBlocks) && parsed.focusBlocks.length > 0
      ? parsed.focusBlocks
      : DEFAULT_FOCUS_BLOCKS;
    return {
      ...DEFAULT_STATE,
      ...parsed,
      focusBlocks: loadedBlocks,
      dailyRoutines: Array.isArray(parsed.dailyRoutines) ? parsed.dailyRoutines : DEFAULT_STATE.dailyRoutines,
      weeklyReview: parsed.weeklyReview || DEFAULT_STATE.weeklyReview,
    };
  } catch {
    return DEFAULT_STATE;
  }
}

export function savePlannerData(state: TimePlannerState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
