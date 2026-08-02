export type TimeBlock = {
  id: string;
  title: string;
  durationMinutes: number;
  category: string;
  completed: boolean;
  createdAt: string;
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

const DEFAULT_STATE: TimePlannerState = {
  focusBlocks: [],
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
    return {
      ...DEFAULT_STATE,
      ...parsed,
      focusBlocks: Array.isArray(parsed.focusBlocks) ? parsed.focusBlocks : DEFAULT_STATE.focusBlocks,
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
