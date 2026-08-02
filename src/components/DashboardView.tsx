import React from 'react';
import { motion } from 'framer-motion';
import {
  Clock,
  Zap,
  GraduationCap,
  Target,
  Flame,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  BrainCircuit,
  Calendar,
  Layers,
  Code2,
} from 'lucide-react';
import { getOverallAttendanceStats, getTodayDayName, getScheduleSlotsForDay } from '../utils/auralifeData';
import { TimePlannerState } from '../plannerStorage';

interface DashboardViewProps {
  state: TimePlannerState;
  onNavigate: (tabId: string) => void;
  onStartFocus: () => void;
}

export function DashboardView({ state, onNavigate, onStartFocus }: DashboardViewProps) {
  const attendanceStats = getOverallAttendanceStats();
  const todayDay = getTodayDayName();
  const todayClasses = getScheduleSlotsForDay(todayDay);

  const completedBlocks = state.focusBlocks.filter((b) => b.completed).length;
  const totalBlocks = state.focusBlocks.length;
  const deepWorkMins = state.focusBlocks
    .filter((b) => b.completed)
    .reduce((sum, b) => sum + b.durationMinutes, 0);

  return (
    <div className="space-y-6">
      {/* 1. EXECUTIVE TODAY HERO CARD */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-slate-950/90 p-6 sm:p-8 shadow-2xl backdrop-blur-2xl">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-violet-500/10 blur-3xl pointer-events-none" />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
                Today's Live Intelligence Dashboard
              </span>
            </div>

            <h2 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl">
              What is happening today
            </h2>

            <p className="max-w-xl text-xs sm:text-sm text-slate-400 leading-relaxed">
              You have <strong className="text-white">{todayClasses.length} lectures</strong> scheduled today on {todayDay}.
              Your overall attendance is <strong className="text-cyan-300">{attendanceStats.percentage}%</strong>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => onNavigate('planner')}
              className="inline-flex items-center gap-2 rounded-2xl bg-cyan-500 px-5 py-3 text-xs font-bold text-slate-950 hover:bg-cyan-400 transition shadow-lg shadow-cyan-500/20"
            >
              <Target className="h-4 w-4" />
              <span>Open Time Planner</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>

            <button
              type="button"
              onClick={onStartFocus}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-900 px-5 py-3 text-xs font-bold text-white hover:border-violet-400 transition"
            >
              <Zap className="h-4 w-4 text-violet-400 fill-violet-400" />
              <span>Library Focus Mode</span>
            </button>
          </div>
        </div>

        {/* Executive Overview Ribbon */}
        <div className="mt-6 grid grid-cols-2 gap-3 border-t border-white/10 pt-6 lg:grid-cols-4">
          <div className="rounded-2xl border border-white/5 bg-slate-900/60 p-3.5">
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Classes Today</p>
            <p className="mt-1 text-2xl font-black text-white">{todayClasses.length} Slots</p>
            <p className="text-[10px] text-slate-400">08:45 AM - 04:30 PM</p>
          </div>

          <div className="rounded-2xl border border-white/5 bg-slate-950/60 p-3.5">
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Attendance</p>
            <p className="mt-1 text-2xl font-black text-cyan-300">{attendanceStats.percentage}%</p>
            <p className="text-[10px] text-cyan-400/80">Safe & Above Target</p>
          </div>

          <div className="rounded-2xl border border-white/5 bg-slate-950/60 p-3.5">
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Focus Completed</p>
            <p className="mt-1 text-2xl font-black text-violet-300">{completedBlocks}/{totalBlocks || 1}</p>
            <p className="text-[10px] text-violet-400/80">{deepWorkMins} mins Deep Work</p>
          </div>

          <div className="rounded-2xl border border-white/5 bg-slate-950/60 p-3.5">
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Streak</p>
            <p className="mt-1 text-2xl font-black text-orange-400 flex items-center gap-1">
              <Flame className="h-5 w-5 fill-orange-400 text-orange-400" /> 14 Days
            </p>
            <p className="text-[10px] text-orange-400/80">Continuous Focus</p>
          </div>
        </div>
      </div>

      {/* 2. TODAY'S SCHEDULE SNAPSHOT & CORE SHORTCUTS */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Classes Snapshot */}
        <div className="lg:col-span-2 rounded-3xl border border-white/10 bg-slate-950/80 p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Today's Class Schedule ({todayDay})
              </p>
              <h3 className="text-lg font-bold text-white flex items-center gap-2 mt-0.5">
                <Calendar className="h-5 w-5 text-cyan-400" />
                Lecture Sequence
              </h3>
            </div>

            <button
              type="button"
              onClick={() => onNavigate('schedule')}
              className="inline-flex items-center gap-1 text-xs font-bold text-cyan-400 hover:text-cyan-300"
            >
              <span>Full Schedule</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {todayClasses.map((slot, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-2xl border border-white/5 bg-slate-900/60 p-3.5 transition hover:border-cyan-500/30"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-300 font-mono text-xs font-bold">
                    {i + 1}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">{slot.subject?.name || 'Class'}</span>
                      <span className="rounded bg-white/5 px-2 py-0.5 text-[10px] font-mono text-cyan-300">
                        {slot.subject?.code}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Room {slot.roomNumber || 'CR-302'} • {slot.subject?.professor || 'Department Faculty'}
                    </p>
                  </div>
                </div>

                <div className="text-right font-mono text-xs font-bold text-slate-300">
                  {slot.startTime} – {slot.endTime}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Launch Cards */}
        <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-6 space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 border-b border-white/10 pb-3">
            Quick Actions
          </h3>

          <div className="space-y-3">
            <button
              type="button"
              onClick={() => onNavigate('planner')}
              className="w-full text-left rounded-2xl border border-cyan-500/20 bg-slate-900 p-4 transition hover:border-cyan-400/50 hover:bg-slate-900/90 group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-cyan-300 font-bold text-xs">
                  <Target className="h-4 w-4" />
                  <span>Time Planner</span>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-500 group-hover:text-cyan-300 transition-transform group-hover:translate-x-1" />
              </div>
              <p className="mt-1 text-xs text-slate-400">Execute current tasks, free window focus, and focus blocks.</p>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('attendance')}
              className="w-full text-left rounded-2xl border border-white/5 bg-slate-900/60 p-4 transition hover:border-violet-400/40 hover:bg-slate-900 group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-violet-300 font-bold text-xs">
                  <GraduationCap className="h-4 w-4" />
                  <span>Attendance Check</span>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-500 group-hover:text-violet-300 transition-transform group-hover:translate-x-1" />
              </div>
              <p className="mt-1 text-xs text-slate-400">Calculate safe skips & recover missing attendance percentage.</p>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('dsa')}
              className="w-full text-left rounded-2xl border border-white/5 bg-slate-900/60 p-4 transition hover:border-emerald-400/40 hover:bg-slate-900 group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs">
                  <BrainCircuit className="h-4 w-4" />
                  <span>DSA & LeetCode</span>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-500 group-hover:text-emerald-300 transition-transform group-hover:translate-x-1" />
              </div>
              <p className="mt-1 text-xs text-slate-400">Practice Striver's A2Z C++ Sheet & solve Daily LeetCode.</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
