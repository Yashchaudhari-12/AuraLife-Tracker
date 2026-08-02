import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Clock, ArrowRight, Sparkles, CheckCircle, RefreshCw, Layers, Calendar, BookOpen, Code2, GitBranch } from 'lucide-react';
import { getScheduleSlotsForDay, detectFreeWindows, getTodayDayName } from '../utils/auralifeData';
import { FreeWindow } from '../types/auralife';

interface FreeTimeDetectorProps {
  onStartSession: (window: FreeWindow) => void;
  onAddToFocusBlock?: (window: FreeWindow) => void;
  selectedDayProp?: string;
  onSelectDay?: (day: string) => void;
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;

export function FreeTimeDetector({ onStartSession, onAddToFocusBlock, selectedDayProp, onSelectDay }: FreeTimeDetectorProps) {
  const actualToday = getTodayDayName();
  const [selectedDay, setSelectedDay] = useState<string>(selectedDayProp || actualToday);
  const [windows, setWindows] = useState<FreeWindow[]>([]);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [addedIds, setAddedIds] = useState<Record<string, boolean>>({});

  // Sync prop if provided
  useEffect(() => {
    if (selectedDayProp) {
      setSelectedDay(selectedDayProp);
    }
  }, [selectedDayProp]);

  const refreshWindows = () => {
    const slots = getScheduleSlotsForDay(selectedDay);
    const detected = detectFreeWindows(slots, selectedDay);
    setWindows(detected);
    if (selectedIdx >= detected.length) {
      setSelectedIdx(0);
    }
  };

  useEffect(() => {
    refreshWindows();
    const handleUpdate = () => refreshWindows();
    window.addEventListener('auralife_schedule_updated', handleUpdate);
    const interval = setInterval(refreshWindows, 2000);
    return () => {
      window.removeEventListener('auralife_schedule_updated', handleUpdate);
      clearInterval(interval);
    };
  }, [selectedDay]);

  const slots = getScheduleSlotsForDay(selectedDay);
  const currentWindow = windows[selectedIdx] || windows[0];

  const hours = currentWindow ? Math.floor(currentWindow.durationMinutes / 60) : 0;
  const mins = currentWindow ? currentWindow.durationMinutes % 60 : 0;
  const durationText = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-3xl border border-cyan-500/30 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 shadow-2xl shadow-cyan-500/10 space-y-5"
    >
      <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -left-12 -bottom-12 h-40 w-40 rounded-full bg-violet-500/10 blur-3xl pointer-events-none" />

      {/* Header Bar */}
      <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-400/40 bg-cyan-400/10 px-3 py-1 text-xs font-black uppercase tracking-wider text-cyan-300">
            <Zap className="h-3.5 w-3.5 fill-cyan-400 text-cyan-400 animate-pulse" />
            REAL-TIME SCHEDULE ANALYSIS ENGINE
          </span>
          <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-400">
            {selectedDay} • {slots.length} Classes/Slots • {windows.length} Free {windows.length === 1 ? 'Window' : 'Windows'}
          </span>
        </div>

        <button
          type="button"
          onClick={refreshWindows}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-cyan-300 transition"
          title="Re-analyze schedule slots"
        >
          <RefreshCw className="h-3.5 w-3.5 text-cyan-400" />
          <span>Sync Gaps</span>
        </button>
      </div>

      {/* Interactive Day Selection Tabs */}
      <div className="flex overflow-x-auto gap-1.5 p-1 rounded-2xl bg-slate-900/90 border border-white/5 scrollbar-none">
        {DAYS.map((day) => {
          const isToday = day === actualToday;
          const isSelected = day === selectedDay;
          const daySlotsCount = getScheduleSlotsForDay(day).length;

          return (
            <button
              key={day}
              type="button"
              onClick={() => {
                setSelectedDay(day);
                setSelectedIdx(0);
                if (onSelectDay) onSelectDay(day);
              }}
              className={`relative flex items-center gap-1.5 whitespace-nowrap rounded-xl px-3 py-2 text-xs font-bold transition-all ${
                isSelected
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-black shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <Calendar className="h-3.5 w-3.5" />
              <span>{day.substring(0, 3)}</span>
              {isToday && (
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[9px] font-extrabold ${
                    isSelected ? 'bg-slate-950 text-cyan-300' : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                  }`}
                >
                  TODAY
                </span>
              )}
              <span className={`text-[10px] font-mono ${isSelected ? 'text-slate-900 font-bold' : 'text-slate-500'}`}>
                ({daySlotsCount})
              </span>
            </button>
          );
        })}
      </div>

      {/* Visual Day Schedule & Gap Timeline Strip */}
      <div className="p-3 rounded-2xl bg-slate-900/80 border border-white/5 space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-400 font-medium">
          <span className="flex items-center gap-1.5 text-cyan-300 font-extrabold uppercase tracking-wider">
            <BookOpen className="h-3.5 w-3.5" />
            {selectedDay} Class Schedule Breakdown ({slots.length} Classes)
          </span>
          <span className="text-slate-400 font-mono">
            {slots.length > 0 ? `${slots[0].startTime} ➔ ${slots[slots.length - 1].endTime}` : 'No Classes'}
          </span>
        </div>

        <div className="flex overflow-x-auto items-center gap-2 py-1 scrollbar-none text-xs">
          {slots.length === 0 ? (
            <span className="text-slate-500 italic text-xs">
              No scheduled classes on {selectedDay}. Entire day available for focus work.
            </span>
          ) : (
            slots.map((slot, idx) => (
              <React.Fragment key={slot.id || idx}>
                <div className="flex items-center gap-1.5 rounded-xl border border-indigo-500/30 bg-indigo-500/10 px-2.5 py-1 text-slate-200 whitespace-nowrap font-medium">
                  <span className="font-mono text-[11px] text-indigo-300 font-bold">{slot.startTime}–{slot.endTime}</span>
                  <span className="font-bold text-white bg-indigo-500/20 px-1.5 py-0.5 rounded text-[10px]">
                    {slot.subject?.code || slot.subject?.name}
                  </span>
                </div>
                {idx < slots.length - 1 && (
                  <span className="text-slate-600 font-bold">➔</span>
                )}
              </React.Fragment>
            ))
          )}
        </div>
      </div>

      {/* Free Window Tabs for the Selected Day */}
      {windows.length > 1 && (
        <div className="flex overflow-x-auto gap-2 p-1 rounded-2xl bg-slate-900/60 border border-white/5 scrollbar-none">
          {windows.map((win, idx) => {
            const h = Math.floor(win.durationMinutes / 60);
            const m = win.durationMinutes % 60;
            const dur = h > 0 ? `${h}h${m > 0 ? ` ${m}m` : ''}` : `${m}m`;
            const isSel = idx === selectedIdx;

            return (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedIdx(idx)}
                className={`flex items-center gap-2 whitespace-nowrap rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                  isSel
                    ? 'bg-cyan-400 text-slate-950 font-extrabold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                <Clock className="h-3.5 w-3.5" />
                <span>Gap {idx + 1}: {win.startTime}–{win.endTime} ({dur})</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Main Selected Window Detail Card */}
      {currentWindow ? (
        <AnimatePresence mode="wait">
          <motion.div
            key={`${selectedDay}-${selectedIdx}`}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between"
          >
            <div className="space-y-3 flex-1">
              <div className="flex items-baseline gap-3 flex-wrap">
                <h3 className="text-3xl font-black text-white tracking-tight">{durationText}</h3>
                <span className="text-sm font-semibold text-cyan-400 bg-cyan-500/10 border border-cyan-400/20 px-3 py-1 rounded-lg">
                  Free Window on {selectedDay}: {currentWindow.startTime} to {currentWindow.endTime}
                </span>
              </div>

              <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-4 backdrop-blur-md space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-extrabold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                    <Layers className="h-3.5 w-3.5" />
                    Calculated Focus Opportunity
                  </span>
                  <span className="text-[11px] text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                    Confidence: {currentWindow.confidence}
                  </span>
                </div>

                <p className="text-base font-bold text-white">{currentWindow.suggestedTopic}</p>
                <p className="text-xs text-slate-300 bg-slate-950/60 p-2.5 rounded-xl border border-white/5">
                  <strong>Schedule & DSA Insight:</strong> {currentWindow.suggestedGoal}
                </p>

                {/* Synced DSA Repo & LeetCode Badges */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {currentWindow.dsaRepoSync && (
                    <span className="inline-flex items-center gap-1.5 rounded-xl border border-violet-500/30 bg-violet-500/10 px-2.5 py-1 text-[11px] font-bold text-violet-300">
                      <GitBranch className="h-3.5 w-3.5 text-violet-400" />
                      DSA Repo: {currentWindow.dsaRepoSync}
                    </span>
                  )}
                  {currentWindow.leetcodeSync && (
                    <span className="inline-flex items-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-[11px] font-bold text-amber-300">
                      <Code2 className="h-3.5 w-3.5 text-amber-400" />
                      LeetCode: {currentWindow.leetcodeSync}
                    </span>
                  )}
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-slate-400 border-t border-white/5 pt-2.5">
                  <span className="flex items-center gap-1.5 font-medium text-slate-300">
                    <Clock className="h-3.5 w-3.5 text-cyan-400" />
                    Recommended Study Duration: {Math.floor(currentWindow.estimatedCompletionMinutes / 60)}h {currentWindow.estimatedCompletionMinutes % 60}m
                  </span>
                  <span>•</span>
                  <span className="text-cyan-300 font-bold">
                    Analyzed from {slots.length} class slots on {selectedDay}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 min-w-[210px] shrink-0">
              <button
                type="button"
                onClick={() => onStartSession(currentWindow)}
                className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3.5 text-sm font-bold text-slate-950 transition hover:from-cyan-400 hover:to-blue-500 shadow-lg shadow-cyan-500/25 active:scale-95"
              >
                <Sparkles className="h-4 w-4" />
                <span>Start Library Session</span>
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
                  className={`inline-flex items-center justify-center gap-2 rounded-2xl border px-5 py-3 text-xs font-semibold transition ${
                    addedIds[`${selectedDay}-${selectedIdx}`]
                      ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                      : 'border-white/10 bg-slate-900/80 text-slate-200 hover:border-cyan-400/50 hover:bg-slate-800'
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
          </motion.div>
        </AnimatePresence>
      ) : (
        <div className="py-6 text-center text-slate-400">No free time windows found for {selectedDay}.</div>
      )}
    </motion.div>
  );
}

