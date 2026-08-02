export interface Subject {
  id: string;
  name: string;
  code: string;
  color?: string;
  attended: number;
  total: number;
  theoryAttended?: number;
  theoryTotal?: number;
  labAttended?: number;
  labTotal?: number;
  targetPercent?: number;
}

export interface TimetableSlot {
  id: string;
  subjectId: string;
  startTime: string; // e.g. "09:15"
  endTime: string;   // e.g. "10:10"
  room?: string;
  type?: 'theory' | 'lab';
}

export type TimetableSchedule = Record<string, TimetableSlot[]>;

export interface MilestoneGoal {
  id: string;
  title: string;
  category: 'coding' | 'college' | 'fitness' | 'finance' | 'personal' | 'family';
  currentCount?: number;
  targetCount?: number;
  completed: boolean;
  deadline?: string;
  notes?: string;
}

export interface FocusBlock {
  id: string;
  title: string;
  durationMinutes: number;
  category: string;
  completed: boolean;
  createdAt: string;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  goalSubtasks?: string[];
}

export interface DailyMissionTask {
  id: string;
  text: string;
  completed: boolean;
  category?: 'coding' | 'attendance' | 'project' | 'general';
}

export interface FreeWindow {
  startTime: string;
  endTime: string;
  durationMinutes: number;
  suggestedTopic: string;
  suggestedGoal: string;
  estimatedCompletionMinutes: number;
  confidence: 'High' | 'Medium';
  prevSlotName?: string;
  nextSlotName?: string;
  windowType?: 'morning' | 'midday' | 'evening' | 'offday';
  dsaRepoSync?: string;
  leetcodeSync?: string;
  reasons?: string[];
}

export interface AiRecommendation {
  contextSummary: string;
  tasks: Array<{ text: string; estimatedMinutes: number; category: string }>;
  totalEstimatedMinutes: number;
  priority: 'High' | 'Medium' | 'Normal';
  reasoning: string;
}

export interface HeatmapDay {
  date: string; // YYYY-MM-DD
  hours: number;
  tasksCount: number;
  score: number; // 0-100
  intensity: 0 | 1 | 2 | 3 | 4;
}

export interface LibrarySessionStats {
  durationMinutes: number;
  tasksCompleted: number;
  focusScore: number;
  xpEarned: number;
  completedAt: string;
}
