import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Library, Play, Pause, Square, CheckCircle, Award, Sparkles, X, Clock } from 'lucide-react';
import { FreeWindow, LibrarySessionStats } from '../types/auralife';

interface LibraryModeProps {
  initialWindow?: FreeWindow | null;
  onSessionComplete?: (stats: LibrarySessionStats) => void;
}

export function LibraryMode({ initialWindow, onSessionComplete }: LibraryModeProps) {
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [sessionTitle, setSessionTitle] = useState('DSA Deep Focus & LeetCode Sprint');
  const [targetMins, setTargetMins] = useState(45);
  const [elapsedSecs, setElapsedSecs] = useState(0);
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);
  const [showSummary, setShowSummary] = useState(false);
  const [summaryStats, setSummaryStats] = useState<LibrarySessionStats | null>(null);

  const defaultTasks = [
    'Solve LeetCode Problem #1 (Kadane)',
    'Solve LeetCode Problem #2 (Subarray Sum)',
    'Review Time & Space Complexities',
  ];

  // If initialWindow is passed, update session title & target
  useEffect(() => {
    if (initialWindow) {
      setSessionTitle(initialWindow.suggestedTopic);
      setTargetMins(initialWindow.estimatedCompletionMinutes || 45);
      setIsActive(true);
      setIsPaused(false);
      setElapsedSecs(0);
    }
  }, [initialWindow]);

  // Timer interval
  useEffect(() => {
    let interval: any = null;
    if (isActive && !isPaused) {
      interval = setInterval(() => {
        setElapsedSecs((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, isPaused]);

  const handleStart = () => {
    setIsActive(true);
    setIsPaused(false);
    setElapsedSecs(0);
    setCompletedTasks([]);
  };

  const handleTogglePause = () => {
    setIsPaused(!isPaused);
  };

  const handleFinish = () => {
    const focusMinutes = Math.max(1, Math.round(elapsedSecs / 60));
    const tasksDone = completedTasks.length;
    const focusScore = Math.min(100, Math.round((focusMinutes / targetMins) * 100 + tasksDone * 10));
    const xp = focusMinutes * 5 + tasksDone * 25;

    const stats: LibrarySessionStats = {
      durationMinutes: focusMinutes,
      tasksCompleted: tasksDone,
      focusScore,
      xpEarned: xp,
      completedAt: new Date().toISOString(),
    };

    setSummaryStats(stats);
    setIsActive(false);
    setShowSummary(true);

    if (onSessionComplete) {
      onSessionComplete(stats);
    }
  };

  const toggleTask = (task: string) => {
    if (completedTasks.includes(task)) {
      setCompletedTasks(completedTasks.filter((t) => t !== task));
    } else {
      setCompletedTasks([...completedTasks, task]);
    }
  };

  const formatTimer = (totalSecs: number) => {
    const m = Math.floor(totalSecs / 60);
    const s = totalSecs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const remainingSecs = Math.max(0, targetMins * 60 - elapsedSecs);

  return (
    <div className="rounded-3xl border border-violet-500/30 bg-slate-950/90 p-6 shadow-2xl shadow-violet-500/10 backdrop-blur-xl space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-violet-400 animate-ping" />
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-400">
              Quiet Environment
            </p>
          </div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2 mt-1">
            <Library className="h-6 w-6 text-violet-400" />
            Library Mode
          </h2>
        </div>

        {!isActive && (
          <button
            type="button"
            onClick={handleStart}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-cyan-500 px-6 py-3 text-xs font-bold text-white transition hover:from-violet-500 hover:to-cyan-400 shadow-lg shadow-violet-500/20 active:scale-95"
          >
            <Play className="h-4 w-4 fill-white" />
            <span>Start Library Session</span>
          </button>
        )}
      </div>

      {/* Active Session Full View */}
      {isActive ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-2xl border border-cyan-500/40 bg-slate-900/90 p-6 space-y-6 shadow-2xl"
        >
          <div className="flex flex-col items-center justify-center text-center space-y-2">
            <span className="rounded-full bg-cyan-500/10 border border-cyan-500/30 px-3 py-1 text-xs font-bold uppercase tracking-widest text-cyan-300">
              SESSION IN PROGRESS
            </span>
            <h3 className="text-xl font-extrabold text-white">{sessionTitle}</h3>

            {/* Giant Digital Timer Display */}
            <div className="my-4 text-6xl font-black font-mono tracking-tight text-white drop-shadow-[0_0_25px_rgba(6,182,212,0.4)]">
              {formatTimer(elapsedSecs)}
            </div>

            <p className="text-xs text-slate-400">
              Remaining Target Time: <strong className="text-cyan-300">{formatTimer(remainingSecs)}</strong>
            </p>
          </div>

          {/* Checklist */}
          <div className="rounded-xl border border-white/5 bg-slate-950/60 p-4 space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Session Checklist
            </p>
            <div className="space-y-2">
              {defaultTasks.map((t, idx) => {
                const isChecked = completedTasks.includes(t);
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => toggleTask(t)}
                    className={`flex w-full items-center gap-3 rounded-xl border p-3 text-xs text-left transition ${
                      isChecked
                        ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                        : 'border-white/5 bg-slate-900 text-slate-200 hover:border-cyan-400/40'
                    }`}
                  >
                    <CheckCircle
                      className={`h-4 w-4 shrink-0 ${isChecked ? 'text-emerald-400 fill-emerald-400/20' : 'text-slate-600'}`}
                    />
                    <span className={isChecked ? 'line-through text-slate-400' : ''}>{t}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleTogglePause}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-800 px-5 py-3 text-xs font-bold text-slate-200 hover:border-cyan-400"
            >
              {isPaused ? <Play className="h-4 w-4 text-cyan-400" /> : <Pause className="h-4 w-4 text-amber-400" />}
              <span>{isPaused ? 'Resume Session' : 'Pause Session'}</span>
            </button>

            <button
              type="button"
              onClick={handleFinish}
              className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500 px-6 py-3 text-xs font-bold text-slate-950 transition hover:bg-emerald-400 shadow-lg shadow-emerald-500/20"
            >
              <Square className="h-4 w-4 fill-slate-950" />
              <span>Finish Session</span>
            </button>
          </div>
        </motion.div>
      ) : (
        <div className="rounded-2xl border border-white/5 bg-slate-900/60 p-6 flex flex-col items-center justify-center text-center space-y-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-400">
            <Clock className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-bold text-white">Ready for a Deep Study Session?</h3>
          <p className="max-w-md text-xs text-slate-400">
            Library Mode sets up a distractor-free focus zone with live timer tracking, micro-checklist logging, and XP rewards.
          </p>
        </div>
      )}

      {/* Completion Summary Modal */}
      <AnimatePresence>
        {showSummary && summaryStats && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative w-full max-w-md rounded-3xl border border-cyan-500/30 bg-slate-900 p-6 shadow-2xl space-y-6 text-white"
            >
              <button
                type="button"
                onClick={() => setShowSummary(false)}
                className="absolute right-4 top-4 text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="text-center space-y-2">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <Award className="h-8 w-8" />
                </div>
                <h3 className="text-2xl font-black text-white">Library Session Complete!</h3>
                <p className="text-xs text-slate-400">Great job! Here is your focus session breakdown.</p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="rounded-2xl bg-slate-950 p-4 border border-white/5">
                  <p className="text-[10px] uppercase tracking-wider text-slate-400">Focus Time</p>
                  <p className="mt-1 text-2xl font-black text-cyan-300">{summaryStats.durationMinutes} mins</p>
                </div>
                <div className="rounded-2xl bg-slate-950 p-4 border border-white/5">
                  <p className="text-[10px] uppercase tracking-wider text-slate-400">Tasks Completed</p>
                  <p className="mt-1 text-2xl font-black text-violet-300">{summaryStats.tasksCompleted}</p>
                </div>
                <div className="rounded-2xl bg-slate-950 p-4 border border-white/5">
                  <p className="text-[10px] uppercase tracking-wider text-slate-400">Focus Score</p>
                  <p className="mt-1 text-2xl font-black text-emerald-300">{summaryStats.focusScore}%</p>
                </div>
                <div className="rounded-2xl bg-slate-950 p-4 border border-white/5">
                  <p className="text-[10px] uppercase tracking-wider text-slate-400">XP Earned</p>
                  <p className="mt-1 text-2xl font-black text-amber-300">+{summaryStats.xpEarned} XP</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowSummary(false)}
                className="w-full rounded-2xl bg-cyan-500 py-3.5 text-xs font-bold text-slate-950 hover:bg-cyan-400"
              >
                Save & Continue
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
