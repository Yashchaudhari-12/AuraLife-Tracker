import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Clock, ArrowRight, Sparkles, CheckCircle, Info, GitBranch, Code2, Compass, BookOpen, Coffee, Car, Moon, Activity } from 'lucide-react';
import { getScheduleSlotsForDay, detectFreeWindows, getTodayDayName, getNextBestAction, NextBestAction } from '../utils/auralifeData';
import { FreeWindow } from '../types/auralife';

interface FreeTimeDetectorProps {
  onStartSession: (window: FreeWindow) => void;
  onAddToFocusBlock?: (window: FreeWindow) => void;
  selectedDayProp?: string;
  onSelectDay?: (day: string) => void;
}

export function FreeTimeDetector({
  onStartSession,
  onAddToFocusBlock,
  selectedDayProp,
}: FreeTimeDetectorProps) {
  const actualToday = getTodayDayName();
  const selectedDay = selectedDayProp || actualToday;
  const [windows, setWindows] = useState<FreeWindow[]>([]);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [addedIds, setAddedIds] = useState<Record<string, boolean>>({});
  const [bestAction, setBestAction] = useState<NextBestAction | null>(null);

  const refreshWindows = () => {
    const slots = getScheduleSlotsForDay(selectedDay);
    const detected = detectFreeWindows(slots, selectedDay);
    setWindows(detected);
    if (selectedIdx >= detected.length) {
      setSelectedIdx(0);
    }
    setBestAction(getNextBestAction(selectedDay));
  };

  useEffect(() => {
    refreshWindows();
    const handleUpdate = () => refreshWindows();
    window.addEventListener('auralife_schedule_updated', handleUpdate);
    window.addEventListener('auralife_daymode_updated', handleUpdate);
    const interval = setInterval(refreshWindows, 2000);
    return () => {
      window.removeEventListener('auralife_schedule_updated', handleUpdate);
      window.removeEventListener('auralife_daymode_updated', handleUpdate);
      clearInterval(interval);
    };
  }, [selectedDay]);

  const currentWindow = windows[selectedIdx] || windows[0];

  const getCategoryIcon = (category?: string) => {
    switch (category) {
      case 'library': return <BookOpen className="h-4 w-4 text-cyan-400" />;
      case 'class':
      case 'lab': return <Activity className="h-4 w-4 text-blue-400" />;
      case 'meal': return <Coffee className="h-4 w-4 text-amber-400" />;
      case 'commute': return <Car className="h-4 w-4 text-purple-400" />;
      case 'rest': return <Moon className="h-4 w-4 text-indigo-400" />;
      default: return <Compass className="h-4 w-4 text-emerald-400" />;
    }
  };

  if (!currentWindow || windows.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 text-center sm:text-left flex items-center justify-between gap-4 flex-wrap"
      >
        <div className="flex items-center gap-3 text-amber-300 font-bold text-sm">
          <Info className="h-5 w-5 text-amber-400 shrink-0" />
          <span>Today's schedule is lecture-heavy on {selectedDay}. Focus on attending classes today. Resume deep work this evening.</span>
        </div>
        <span className="text-xs text-slate-400 font-mono">
          All gaps strictly reserved for meals, commutes, or class transitions (&lt;60 mins).
        </span>
      </motion.div>
    );
  }

  const hours = Math.floor(currentWindow.durationMinutes / 60);
  const mins = currentWindow.durationMinutes % 60;
  const durationText = hours > 0 ? `${hours}h ${mins}m (${currentWindow.durationMinutes} mins)` : `${mins} mins`;

  const reasons = currentWindow.reasons && currentWindow.reasons.length > 0 ? currentWindow.reasons : [
    `${currentWindow.durationMinutes}-minute uninterrupted window on ${selectedDay}`,
    'Fits your preferred study duration',
    'No conflict with meals or sleep schedule',
    'Completes today\'s DSA & LeetCode goal'
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-3xl border border-cyan-500/30 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-5 sm:p-6 shadow-2xl shadow-cyan-500/10 space-y-4"
    >
      <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-cyan-500/10 blur-2xl pointer-events-none" />

      {/* Top Real-time Smart Decision Engine Header */}
      {bestAction && (
        <div className="rounded-2xl border border-cyan-400/20 bg-cyan-500/5 p-3.5 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-400/30 shrink-0">
              {getCategoryIcon(bestAction.category)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400">
                  Smart Decision Engine • Right Now
                </span>
                <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded-full border border-white/10">
                  {bestAction.timeWindow}
                </span>
              </div>
              <p className="text-sm font-black text-white">{bestAction.actionTitle}</p>
              <p className="text-xs text-slate-300 font-medium">{bestAction.actionDetails}</p>
            </div>
          </div>
        </div>
      )}

      {/* Recommended Action Selector Header */}
      <div className="flex items-center justify-between gap-2 flex-wrap border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-cyan-400 fill-cyan-400 animate-pulse" />
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-cyan-400">
            Next Recommended Action
          </h3>
        </div>
        
        {windows.length > 1 && (
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-400 font-medium mr-1">Recommended Block:</span>
            {windows.map((win, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedIdx(idx)}
                className={`px-2.5 py-1 rounded-lg text-xs font-extrabold transition ${
                  idx === selectedIdx
                    ? 'bg-cyan-400 text-slate-950'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-white/10'
                }`}
              >
                {win.startTime}–{win.endTime}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Content Info Card */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-3 flex-1">
          {/* Time & Duration */}
          <div className="flex items-baseline gap-3 flex-wrap">
            <span className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {currentWindow.startTime} – {currentWindow.endTime}
            </span>
            <span className="rounded-full bg-cyan-500/15 border border-cyan-400/30 px-3 py-1 text-xs font-black text-cyan-300">
              {durationText}
            </span>
          </div>

          {/* Recommended Activity */}
          <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-4 space-y-2">
            <p className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
              Recommended Activity
            </p>
            <p className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-cyan-400 shrink-0" />
              <span>{currentWindow.suggestedTopic}: {currentWindow.suggestedGoal}</span>
            </p>

            {/* Why Chosen Explanation Bullet List */}
            <div className="mt-3 pt-3 border-t border-white/5 space-y-1.5">
              <p className="text-[11px] font-extrabold uppercase tracking-widest text-cyan-400">
                Recommended because:
              </p>
              <ul className="space-y-1.5 text-xs text-slate-300 font-medium">
                {reasons.map((reason, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Synced BADGES */}
            {(currentWindow.dsaRepoSync || currentWindow.leetcodeSync) && (
              <div className="flex flex-wrap gap-2 pt-2">
                {currentWindow.dsaRepoSync && (
                  <span className="inline-flex items-center gap-1.5 rounded-xl border border-violet-500/30 bg-violet-500/10 px-2.5 py-0.5 text-[11px] font-bold text-violet-300">
                    <GitBranch className="h-3.5 w-3.5 text-violet-400" />
                    DSA: {currentWindow.dsaRepoSync}
                  </span>
                )}
                {currentWindow.leetcodeSync && (
                  <span className="inline-flex items-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-bold text-amber-300">
                    <Code2 className="h-3.5 w-3.5 text-amber-400" />
                    LeetCode: {currentWindow.leetcodeSync}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row lg:flex-col gap-3 min-w-[200px] shrink-0">
          <button
            type="button"
            onClick={() => onStartSession(currentWindow)}
            className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-3.5 text-sm font-extrabold text-slate-950 transition hover:from-cyan-400 hover:to-blue-500 shadow-lg shadow-cyan-500/20 active:scale-95"
          >
            <Clock className="h-4 w-4" />
            <span>Start Session</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>

          {onAddToFocusBlock && (
            <button
              type="button"
              onClick={() => {
                onAddToFocusBlock(currentWindow);
                setAddedIds({ ...addedIds, [`${selectedDay}-${selectedIdx}`]: true });
              }}
              disabled={addedIds[`${selectedDay}-${selectedIdx}`]}
              className={`inline-flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-xs font-bold transition ${
                addedIds[`${selectedDay}-${selectedIdx}`]
                  ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                  : 'border-white/10 bg-slate-900 text-slate-200 hover:border-cyan-400/50 hover:bg-slate-800'
              }`}
            >
              {addedIds[`${selectedDay}-${selectedIdx}`] ? (
                <>
                  <CheckCircle className="h-3.5 w-3.5 text-emerald-400" /> Added to Focus Blocks
                </>
              ) : (
                '+ Add to Focus Blocks'
              )}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
