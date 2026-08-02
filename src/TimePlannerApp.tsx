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
import { ScheduleHealthCard } from './components/ScheduleHealthCard';
import { DayModeSelector } from './components/DayModeSelector';
import { DailyPrioritySelector } from './components/DailyPrioritySelector';
import { AttendanceImpactCard } from './components/AttendanceImpactCard';
import { LibraryDayPlanCard, HomeDayPlanCard, FutureContextBanner } from './components/SpecializedDayPlans';
import { FreeWindow } from './types/auralife';
import { getTodayDayName, getOverallAttendanceStats, getStoredDayMode } from './utils/auralifeData';
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
  Menu,
  X,
  ChevronRight,
  Sparkles,
  ShieldCheck,
  User,
} from 'lucide-react';

export function TimePlannerApp() {
  const initialState = useMemo(() => loadPlannerData(), []);
  const actualToday = useMemo(() => getTodayDayName(), []);
  const overallStats = useMemo(() => getOverallAttendanceStats(), []);
  const [selectedDay, setSelectedDay] = useState<string>(actualToday);
  const [state, setState] = useState<TimePlannerState>(initialState);
  const [selectedFreeWindow, setSelectedFreeWindow] = useState<FreeWindow | null>(null);
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'attendance' | 'schedule' | 'planner' | 'dsa' | 'leetcode' | 'github' | 'analytics' | 'settings'
  >('dashboard');
  const [currentTime, setCurrentTime] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentDayMode, setCurrentDayMode] = useState<string>(() => getStoredDayMode());

  useEffect(() => {
    const handleModeUpdate = () => {
      setCurrentDayMode(getStoredDayMode());
    };
    window.addEventListener('auralife_daymode_updated', handleModeUpdate);
    window.addEventListener('auralife_schedule_updated', handleModeUpdate);
    return () => {
      window.removeEventListener('auralife_daymode_updated', handleModeUpdate);
      window.removeEventListener('auralife_schedule_updated', handleModeUpdate);
    };
  }, []);

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

  const handleApplyFixedBlocks = (fixedBlocks: typeof state.focusBlocks) => {
    saveState({
      ...state,
      focusBlocks: fixedBlocks,
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
    { id: 'attendance', label: 'College Attendance', icon: GraduationCap, badge: `${overallStats.percentage}%` },
    { id: 'schedule', label: 'Schedule & Timetable', icon: Calendar, badge: 'Classes' },
    { id: 'planner', label: 'Time Planner', icon: Target, badge: 'Live Now' },
    { id: 'dsa', label: 'DSA Practice', icon: BrainCircuit, badge: 'C++ A2Z' },
    { id: 'leetcode', label: 'LeetCode Tracker', icon: Code2, badge: 'Daily' },
    { id: 'github', label: 'GitHub Sync', icon: Github, badge: 'Builds' },
    { id: 'analytics', label: 'Analytics & Trends', icon: Activity, badge: 'Trends' },
    { id: 'settings', label: 'Settings', icon: Settings, badge: 'Config' },
  ] as const;

  const handleTabChange = (tabId: typeof activeTab) => {
    setActiveTab(tabId);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#070a12] text-slate-100 font-sans antialiased selection:bg-cyan-500 selection:text-slate-950 flex flex-col md:flex-row min-w-full">
      {/* MOBILE HEADER (Only visible on screens < md) */}
      <div className="md:hidden flex items-center justify-between p-4 bg-slate-950/90 border-b border-white/10 sticky top-0 z-50 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center font-black text-slate-950 text-sm shadow-md shadow-cyan-500/20">
            AL
          </div>
          <div>
            <h1 className="text-base font-black tracking-tight text-white leading-none">AuraLife</h1>
            <p className="text-[10px] text-cyan-400 font-semibold mt-0.5">Time Intelligence OS</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2.5 rounded-xl border border-white/10 bg-slate-900 text-slate-200 hover:text-white"
        >
          {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* MOBILE BACKDROP DRAWER */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* LEFT SIDEBAR NAVIGATION */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-50 h-screen w-64 bg-slate-950/95 border-r border-white/10 p-5 flex flex-col justify-between backdrop-blur-2xl transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="space-y-6 overflow-y-auto scrollbar-none">
          {/* BRAND LOGO HEADER */}
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-cyan-500 via-violet-500 to-emerald-400 p-0.5 shadow-lg shadow-cyan-500/20">
                <div className="h-full w-full rounded-[14px] bg-slate-950 flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-cyan-400" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h1 className="text-lg font-black tracking-tight text-white">AuraLife</h1>
                  <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">Time OS v2.0</p>
              </div>
            </div>
          </div>

          {/* QUICK USER STATS CARD */}
          <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-3.5 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">College Attendance</span>
              <span className={`font-black ${overallStats.percentage >= 75 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {overallStats.percentage}%
              </span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-full rounded-full ${overallStats.percentage >= 75 ? 'bg-emerald-400' : 'bg-amber-400'}`}
                style={{ width: `${Math.min(100, overallStats.percentage)}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pt-1">
              <span className="flex items-center gap-1">
                <Flame className="h-3.5 w-3.5 text-amber-400 fill-amber-400" /> 14d streak
              </span>
              <span className="text-cyan-400 font-semibold">{currentDayMode}</span>
            </div>
          </div>

          {/* SIDEBAR NAVIGATION ITEMS */}
          <nav className="space-y-1.5">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-3 pb-1">
              Navigation
            </p>
            {navigationTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleTabChange(tab.id as typeof activeTab)}
                  className={`w-full flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-500/20 via-violet-500/10 to-transparent text-white border-l-4 border-cyan-400 bg-cyan-500/10 shadow-sm shadow-cyan-500/10'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-white/5 border-l-4 border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`h-4 w-4 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                    <span>{tab.label}</span>
                  </div>
                  {tab.badge && (
                    <span
                      className={`rounded-full px-2 py-0.5 text-[9px] font-extrabold ${
                        isActive
                          ? 'bg-cyan-400 text-slate-950'
                          : 'bg-slate-900 text-slate-400 border border-white/10'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* SIDEBAR FOOTER ACTION */}
        <div className="pt-4 border-t border-white/10 space-y-3">
          <button
            type="button"
            onClick={() => handleTabChange('planner')}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 px-4 py-3 text-xs font-black uppercase tracking-wider text-slate-950 shadow-lg shadow-cyan-500/20 hover:opacity-95 active:scale-95 transition"
          >
            <Zap className="h-4 w-4 fill-slate-950" />
            <span>Focus Session</span>
          </button>
          <div className="flex items-center justify-between text-[11px] text-slate-500 px-1 font-mono">
            <span>{currentTime || '10:00 AM'}</span>
            <span className="text-cyan-400 font-bold">{selectedDay}</span>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 overflow-x-hidden min-w-0 max-w-7xl mx-auto w-full">
        {/* TOP EXECUTIVE BANNER */}
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
                AuraLife Workspace
              </h1>
              <p className="max-w-2xl text-xs sm:text-sm text-slate-400 leading-relaxed">
                Focused, minimal product architecture. Designed for college lectures, deep work, DSA practice, and attendance tracking.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => handleTabChange('planner')}
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 via-cyan-500 to-emerald-500 px-5 py-3.5 text-xs font-black uppercase tracking-wider text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:opacity-95 active:scale-95"
              >
                <Zap className="h-4 w-4 fill-slate-950" />
                <span>Focus Session</span>
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

        {/* DYNAMIC PAGE CONTENT VIEWS */}
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
              <ScheduleHealthCard
                dayName={selectedDay}
                focusBlocks={state.focusBlocks}
                onApplyFixedBlocks={handleApplyFixedBlocks}
                onOpenPreferences={() => handleTabChange('settings')}
              />
              <DashboardView
                state={state}
                onNavigate={(tab) => handleTabChange(tab as typeof activeTab)}
                onStartFocus={() => handleTabChange('planner')}
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
              <DayModeSelector />
              <DailyPrioritySelector />
              <FutureContextBanner dayName={selectedDay} focusBlocks={state.focusBlocks} />
              <AttendanceImpactCard dayName={selectedDay} />
              {currentDayMode === 'Library Day' && <LibraryDayPlanCard dayName={selectedDay} />}
              {currentDayMode === 'Home Study Day' && <HomeDayPlanCard dayName={selectedDay} />}
              <FreeTimeDetector
                selectedDayProp={selectedDay}
                onSelectDay={setSelectedDay}
                onStartSession={handleStartFreeWindowSession}
                onAddToFocusBlock={handleAddFreeWindowToFocus}
              />
              <ScheduleHealthCard
                dayName={selectedDay}
                focusBlocks={state.focusBlocks}
                onApplyFixedBlocks={handleApplyFixedBlocks}
                onOpenPreferences={() => handleTabChange('settings')}
              />
              <TodayTimeline selectedDayProp={selectedDay} onSelectDay={setSelectedDay} />
            </motion.div>
          )}

          {/* PAGE 4: TIME PLANNER */}
          {activeTab === 'planner' && (
            <motion.div
              key="page-planner"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              <DayModeSelector />
              <DailyPrioritySelector />
              <FutureContextBanner dayName={selectedDay} focusBlocks={state.focusBlocks} />
              <AttendanceImpactCard dayName={selectedDay} />
              {currentDayMode === 'Library Day' && <LibraryDayPlanCard dayName={selectedDay} />}
              {currentDayMode === 'Home Study Day' && <HomeDayPlanCard dayName={selectedDay} />}
              <FreeTimeDetector
                selectedDayProp={selectedDay}
                onSelectDay={setSelectedDay}
                onStartSession={handleStartFreeWindowSession}
                onAddToFocusBlock={handleAddFreeWindowToFocus}
              />
              <ScheduleHealthCard
                dayName={selectedDay}
                focusBlocks={state.focusBlocks}
                onApplyFixedBlocks={handleApplyFixedBlocks}
                onOpenPreferences={() => handleTabChange('settings')}
              />
              <TodayTimeline selectedDayProp={selectedDay} onSelectDay={setSelectedDay} />
              <DailyMission />
              <SmartFocusBlocks
                blocks={state.focusBlocks}
                onAddBlock={handleAddFocusBlock}
                onEditBlock={handleEditFocusBlock}
                onToggleBlock={handleToggleFocusBlock}
                onDeleteBlock={handleDeleteFocusBlock}
              />
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
      </main>
    </div>
  );
}

