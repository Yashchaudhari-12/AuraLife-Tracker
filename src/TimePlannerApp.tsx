import React, { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { loadPlannerData, savePlannerData, TimePlannerState } from './plannerStorage';
import { DashboardView } from './components/DashboardView';
import { AttendanceIntelligence } from './components/AttendanceIntelligence';
import { TodayTimeline } from './components/TodayTimeline';
import { FreeTimeDetector } from './components/FreeTimeDetector';
import { SmartFocusBlocks } from './components/SmartFocusBlocks';
import { DailyMission } from './components/DailyMission';
import { LibraryMode } from './components/LibraryMode';
import { GithubDsaTracker } from './components/GithubDsaTracker';
import { LeetCodeTracker } from './components/LeetCodeTracker';
import { GithubTrackerView } from './components/GithubTrackerView';
import { TodayProgressGauges } from './components/TodayProgressGauges';
import { WeeklyHeatmap } from './components/WeeklyHeatmap';
import { TimeIntelligenceCards } from './components/TimeIntelligenceCards';
import { SettingsView } from './components/SettingsView';
import { FreeWindow } from './types/auralife';
import { getTodayDayName } from './utils/auralifeData';
import {
  RefreshCw,
  LayoutDashboard,
  Clock,
  Target,
  Library,
  Activity,
  Zap,
  Flame,
  Calendar,
  Code2,
  GitPullRequest as Github,
  GraduationCap,
  BrainCircuit,
  Settings,
} from 'lucide-react';

export function TimePlannerApp() {
  const initialState = useMemo(() => loadPlannerData(), []);
  const actualToday = useMemo(() => getTodayDayName(), []);
  const [selectedDay, setSelectedDay] = useState<string>(actualToday);
  const [state, setState] = useState<TimePlannerState>(initialState);
  const [selectedFreeWindow, setSelectedFreeWindow] = useState<FreeWindow | null>(null);
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'attendance' | 'schedule' | 'planner' | 'dsa' | 'leetcode' | 'github' | 'analytics' | 'settings'
  >('dashboard');
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const saveState = (next: TimePlannerState) => {
    setState(next);
    savePlannerData(next);
  };

  const handleAddFocusBlock = (
    title: string,
    durationMinutes: number,
    category: string,
    difficulty?: 'Easy' | 'Medium' | 'Hard',
    startTime?: string,
    endTime?: string
  ) => {
    const next: TimePlannerState = {
      ...state,
      focusBlocks: [
        {
          id: `block-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
          title,
          durationMinutes,
          category,
          completed: false,
          createdAt: new Date().toISOString(),
          startTime,
          endTime,
        },
        ...state.focusBlocks,
      ],
    };
    saveState(next);
  };

  const handleEditFocusBlock = (
    id: string,
    updates: { title?: string; durationMinutes?: number; category?: string; startTime?: string; endTime?: string }
  ) => {
    saveState({
      ...state,
      focusBlocks: state.focusBlocks.map((block) =>
        block.id === id ? { ...block, ...updates } : block
      ),
    });
  };

  const handleToggleFocusBlock = (id: string) => {
    saveState({
      ...state,
      focusBlocks: state.focusBlocks.map((block) =>
        block.id === id ? { ...block, completed: !block.completed } : block
      ),
    });
  };

  const handleDeleteFocusBlock = (id: string) => {
    saveState({
      ...state,
      focusBlocks: state.focusBlocks.filter((block) => block.id !== id),
    });
  };

  const handleStartFreeWindowSession = (window: FreeWindow) => {
    setSelectedFreeWindow(window);
    setActiveTab('planner');
  };

  const handleAddFreeWindowToFocus = (window: FreeWindow) => {
    handleAddFocusBlock(
      window.suggestedTopic,
      window.estimatedCompletionMinutes,
      'DSA',
      undefined,
      window.startTime,
      window.endTime
    );
  };

  const completedBlocksCount = state.focusBlocks.filter((b) => b.completed).length;
  const totalBlocksCount = state.focusBlocks.length;
  const deepWorkMins = state.focusBlocks
    .filter((b) => b.completed)
    .reduce((sum, b) => sum + b.durationMinutes, 0);

  const navigationTabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: 'Today' },
    { id: 'attendance', label: 'Attendance', icon: GraduationCap, badge: '75%' },
    { id: 'schedule', label: 'Schedule', icon: Calendar, badge: 'Classes' },
    { id: 'planner', label: 'Time Planner', icon: Target, badge: 'Live Now' },
    { id: 'dsa', label: 'DSA', icon: BrainCircuit, badge: 'C++ A2Z' },
    { id: 'leetcode', label: 'LeetCode', icon: Code2, badge: 'Daily' },
    { id: 'github', label: 'GitHub', icon: Github, badge: 'Builds' },
    { id: 'analytics', label: 'Analytics', icon: Activity, badge: 'Trends' },
    { id: 'settings', label: 'Settings', icon: Settings, badge: 'Config' },
  ] as const;

  return (
    <div className="min-h-screen bg-[#070a12] p-3 sm:p-6 lg:p-8 text-slate-100 space-y-6 font-sans antialiased selection:bg-cyan-500 selection:text-slate-950">
      {/* 1. EXECUTIVE APPLICATION BRANDING HEADER */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900/80 p-6 sm:p-8 shadow-2xl backdrop-blur-2xl">
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -left-24 -bottom-24 h-72 w-72 rounded-full bg-violet-500/10 blur-3xl pointer-events-none" />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-400/40 bg-cyan-500/10 px-3 py-1 text-[11px] font-extrabold uppercase tracking-widest text-cyan-300">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-ping" />
                AURA TIME INTELLIGENCE OS v2.0
              </span>
              <span className="rounded-full border border-white/10 bg-slate-950/60 px-3 py-1 text-xs font-mono font-bold text-slate-300">
                {currentTime || '00:00:00 AM'}
              </span>
            </div>

            <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
              AuraLife Planner
            </h1>
            <p className="max-w-2xl text-xs sm:text-sm text-slate-400 leading-relaxed">
              Focused, minimal product architecture. Designed for college lectures, deep work, DSA practice, and attendance tracking.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setActiveTab('planner')}
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 via-cyan-500 to-emerald-500 px-5 py-3.5 text-xs font-black uppercase tracking-wider text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:opacity-95 active:scale-95"
            >
              <Zap className="h-4 w-4 fill-slate-950" />
              <span>Launch Focus Session</span>
            </button>

            <button
              type="button"
              onClick={() => saveState(loadPlannerData())}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-900 px-4 py-3.5 text-xs font-bold text-slate-300 transition hover:border-cyan-400 hover:text-white"
            >
              <RefreshCw className="h-4 w-4 text-cyan-400" />
              <span>Reset State</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. STANDALONE NAVIGATION BAR */}
      <div className="flex overflow-x-auto rounded-2xl border border-white/10 bg-slate-900/90 p-1.5 backdrop-blur-xl scrollbar-none">
        {navigationTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`relative flex items-center gap-2.5 whitespace-nowrap rounded-xl px-4 py-3 text-xs font-bold transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-500/20 via-violet-500/20 to-slate-800 text-white border border-cyan-500/40 shadow-lg'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
              <span>{tab.label}</span>
              {tab.badge && (
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                    isActive
                      ? 'bg-cyan-400 text-slate-950'
                      : 'bg-slate-800 text-slate-400 border border-white/5'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 3. DYNAMIC PAGE CONTENT VIEWS */}
      <AnimatePresence mode="wait">
        {/* PAGE 1: DASHBOARD */}
        {activeTab === 'dashboard' && (
          <motion.div
            key="page-dashboard"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <DashboardView
              state={state}
              onNavigate={(tab) => setActiveTab(tab as typeof activeTab)}
              onStartFocus={() => setActiveTab('planner')}
            />
          </motion.div>
        )}

        {/* PAGE 2: ATTENDANCE */}
        {activeTab === 'attendance' && (
          <motion.div
            key="page-attendance"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <AttendanceIntelligence />
          </motion.div>
        )}

        {/* PAGE 3: SCHEDULE */}
        {activeTab === 'schedule' && (
          <motion.div
            key="page-schedule"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <TodayTimeline selectedDayProp={selectedDay} onSelectDay={setSelectedDay} />
          </motion.div>
        )}

        {/* PAGE 4: TIME PLANNER (What should I do RIGHT NOW?) */}
        {activeTab === 'planner' && (
          <motion.div
            key="page-planner"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-8"
          >
            {/* 1. Today's Schedule Snapshot */}
            <TodayTimeline selectedDayProp={selectedDay} onSelectDay={setSelectedDay} />

            {/* 2. Today's Mission */}
            <DailyMission />

            {/* 3. Free Window Intelligence */}
            <FreeTimeDetector
              selectedDayProp={selectedDay}
              onSelectDay={setSelectedDay}
              onStartSession={handleStartFreeWindowSession}
              onAddToFocusBlock={handleAddFreeWindowToFocus}
            />

            {/* 4. Today's Focus Blocks */}
            <SmartFocusBlocks
              blocks={state.focusBlocks}
              onAddBlock={handleAddFocusBlock}
              onEditBlock={handleEditFocusBlock}
              onToggleBlock={handleToggleFocusBlock}
              onDeleteBlock={handleDeleteFocusBlock}
            />

            {/* 5. Library Mode */}
            <LibraryMode initialWindow={selectedFreeWindow} />
          </motion.div>
        )}

        {/* PAGE 5: DSA */}
        {activeTab === 'dsa' && (
          <motion.div
            key="page-dsa"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <GithubDsaTracker onAddFocusBlock={handleAddFocusBlock} />
          </motion.div>
        )}

        {/* PAGE 6: LEETCODE */}
        {activeTab === 'leetcode' && (
          <motion.div
            key="page-leetcode"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <LeetCodeTracker onAddFocusBlock={handleAddFocusBlock} />
          </motion.div>
        )}

        {/* PAGE 7: GITHUB */}
        {activeTab === 'github' && (
          <motion.div
            key="page-github"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <GithubTrackerView />
          </motion.div>
        )}

        {/* PAGE 8: ANALYTICS */}
        {activeTab === 'analytics' && (
          <motion.div
            key="page-analytics"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-8"
          >
            <TodayProgressGauges
              deepWorkMinutes={deepWorkMins > 0 ? deepWorkMins : 200}
              focusScore={92}
              completedTasksCount={completedBlocksCount}
              totalTasksCount={totalBlocksCount > 0 ? totalBlocksCount : 5}
              streakDays={14}
              remainingStudyMinutes={120}
            />
            <WeeklyHeatmap />
            <TimeIntelligenceCards />
          </motion.div>
        )}

        {/* PAGE 9: SETTINGS */}
        {activeTab === 'settings' && (
          <motion.div
            key="page-settings"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <SettingsView />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
