import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Library,
  Home,
  Clock,
  Sparkles,
  BookOpen,
  Code2,
  CheckCircle2,
  Utensils,
  Moon,
  Sun,
  Laptop,
  ArrowRight,
  Flame,
  Hourglass,
  CalendarDays,
} from 'lucide-react';
import {
  getStoredDayMode,
  getStoredDailyPriority,
  getStoredTimetable,
  getTodayDayName,
  timeToMinutes,
  minutesToFormattedTime,
} from '../utils/auralifeData';
import { getStoredSchedulingPreferences } from '../utils/schedulingIntelligence';
import { DayMode } from '../types/auralife';
import { TimeBlock } from '../plannerStorage';

interface SpecializedDayPlansProps {
  dayName?: string;
  focusBlocks?: TimeBlock[];
}

export function LibraryDayPlanCard({ dayName }: { dayName?: string }) {
  const currentDay = dayName || getTodayDayName();
  const priority = getStoredDailyPriority();
  const prefs = getStoredSchedulingPreferences();

  // Preserved labs today
  const timetable = getStoredTimetable();
  const todaySlots = timetable[currentDay] || [];
  const todayLabs = todaySlots.filter((s) => s.type === 'lab');

  const libraryBlocks = [
    {
      time: '09:30–11:00',
      durationMinutes: 90,
      topic: `${priority === 'DSA' ? 'A2Z Sheet DSA' : priority === 'College Revision' ? 'OOP & COA Theory' : 'Algorithm Mastery'}`,
      goal: 'Solve 3 Medium level pattern problems in quiet library room',
      category: 'Coding',
      estimatedCompletion: '11:00 AM',
    },
    {
      time: '11:30–13:00',
      durationMinutes: 90,
      topic: `${priority === 'LeetCode' ? 'LeetCode Daily Challenge & Contest Problems' : priority === 'AuraLife Development' ? 'AuraLife Architecture & Engine' : 'LeetCode Medium Sprint'}`,
      goal: 'Deep problem solving & code review before lunch',
      category: 'Practice',
      estimatedCompletion: '01:00 PM',
    },
    {
      time: '14:00–15:30',
      durationMinutes: 90,
      topic: `${priority === 'College Revision' ? 'College Revision & Lab Preparation' : 'Full-Stack Feature Build & Debugging'}`,
      goal: 'Project architecture review & system integration',
      category: 'Project',
      estimatedCompletion: '03:30 PM',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl border border-cyan-500/30 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 shadow-2xl space-y-5"
    >
      <div className="flex items-center justify-between border-b border-white/10 pb-4 flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-500/15 border border-cyan-400/30 text-cyan-300 font-bold">
            <Library className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-black text-white tracking-tight uppercase">
              Today's Library Plan ({currentDay})
            </h3>
            <p className="text-xs text-slate-400">
              Campus Library Focus Mode • Priority: <strong className="text-cyan-300">{priority}</strong>
            </p>
          </div>
        </div>

        {todayLabs.length > 0 && (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            <span>{todayLabs.length} Preserved Lab(s) Attended</span>
          </div>
        )}
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {libraryBlocks.map((block, idx) => (
          <div
            key={idx}
            className="rounded-2xl border border-white/10 bg-slate-900/90 p-4 space-y-3 relative overflow-hidden group hover:border-cyan-400/40 transition"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-cyan-400 font-mono tracking-tight">
                {block.time}
              </span>
              <span className="rounded-full bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-0.5 text-[10px] font-bold text-cyan-300">
                Est: {block.estimatedCompletion}
              </span>
            </div>

            <div>
              <p className="text-sm font-bold text-white flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                <span>{block.topic}</span>
              </p>
              <p className="text-xs text-slate-400 mt-1">{block.goal}</p>
            </div>

            <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span>{block.durationMinutes} minutes deep work</span>
              <span className="text-cyan-300 font-bold">High Focus</span>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

export function HomeDayPlanCard({ dayName }: { dayName?: string }) {
  const currentDay = dayName || getTodayDayName();
  const priority = getStoredDailyPriority();
  const prefs = getStoredSchedulingPreferences();

  const homeSequence = [
    { time: prefs.preferredWakeupTime || '07:15', title: 'Wake Up & Hydrate', type: 'routine', icon: Sun },
    { time: '07:30–08:00', title: 'Breakfast & Mindset Routine', type: 'meal', icon: Utensils },
    {
      time: '08:00–09:30',
      title: `Block 1: Morning Deep Work (${priority === 'College Revision' ? 'College Subject Revision' : 'DSA A2Z Sprint'})`,
      type: 'focus',
      icon: Code2,
      duration: '90m',
    },
    {
      time: '10:00–11:30',
      title: `Block 2: Algorithm Deep Dive (${priority === 'LeetCode' ? 'LeetCode Daily Challenge' : 'Pattern Solving'})`,
      type: 'focus',
      icon: Laptop,
      duration: '90m',
    },
    { time: `${prefs.lunchStartTime || '12:30'}–${prefs.lunchEndTime || '13:30'}`, title: 'Lunch Window & Power Nap', type: 'meal', icon: Utensils },
    {
      time: '14:00–15:30',
      title: `Block 3: Afternoon Sprint (${priority === 'AuraLife Development' ? 'AuraLife Feature Development' : 'System Design'})`,
      type: 'focus',
      icon: Sparkles,
      duration: '90m',
    },
    {
      time: '17:30–19:00',
      title: `Block 4: Evening Deep Work (${priority === 'College Revision' ? 'Exam Revision & Practice' : 'A2Z Sheet Review'})`,
      type: 'focus',
      icon: BookOpen,
      duration: '90m',
    },
    { time: `${prefs.dinnerStartTime || '20:00'}–${prefs.dinnerEndTime || '21:00'}`, title: 'Dinner Window', type: 'meal', icon: Utensils },
    { time: prefs.preferredBedtime || '23:30', title: 'Bedtime & Recovery', type: 'sleep', icon: Moon },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl border border-violet-500/30 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 shadow-2xl space-y-5"
    >
      <div className="flex items-center justify-between border-b border-white/10 pb-4 flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-500/15 border border-violet-400/30 text-violet-300 font-bold">
            <Home className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-black text-white tracking-tight uppercase">
              Today's Home Plan ({currentDay})
            </h3>
            <p className="text-xs text-slate-400">
              Structured Home OS • Priority: <strong className="text-violet-300">{priority}</strong>
            </p>
          </div>
        </div>
        <span className="rounded-xl border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-xs font-bold text-violet-300">
          Timetable Paused • Zero Commute
        </span>
      </div>

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
        {homeSequence.map((item, idx) => {
          const Icon = item.icon;
          const isFocus = item.type === 'focus';

          return (
            <div
              key={idx}
              className={`rounded-2xl border p-3.5 space-y-2 flex flex-col justify-between ${
                isFocus
                  ? 'border-violet-500/40 bg-slate-900 text-white shadow-lg shadow-violet-500/10'
                  : 'border-white/5 bg-slate-950/60 text-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold font-mono text-violet-400">{item.time}</span>
                <Icon className={`h-4 w-4 ${isFocus ? 'text-violet-400' : 'text-slate-500'}`} />
              </div>
              <p className="text-xs font-bold leading-snug">{item.title}</p>
              {item.duration && (
                <span className="text-[10px] font-mono text-slate-400 font-semibold">{item.duration} session</span>
              )}
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

function CoffeeIcon(props: { className?: string }) {
  return <Clock {...props} />;
}

export function FutureContextBanner({ dayName, focusBlocks = [] }: SpecializedDayPlansProps) {
  const currentDay = dayName || getTodayDayName();
  const timetable = getStoredTimetable();
  const todaySlots = timetable[currentDay] || [];
  const prefs = getStoredSchedulingPreferences();

  const now = new Date();
  const currentMins = now.getHours() * 60 + now.getMinutes();

  // Next Class
  const futureSlots = todaySlots
    .filter((s) => timeToMinutes(s.startTime) > currentMins)
    .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));

  const nextClass = futureSlots[0];
  const nextLab = futureSlots.find((s) => s.type === 'lab');

  // Next Meal
  const lunchMins = timeToMinutes(prefs.lunchStartTime || '12:30');
  const dinnerMins = timeToMinutes(prefs.dinnerStartTime || '20:00');
  let nextMeal = 'Lunch (12:30 PM)';
  if (currentMins >= lunchMins && currentMins < dinnerMins) {
    nextMeal = 'Dinner (8:00 PM)';
  } else if (currentMins >= dinnerMins) {
    nextMeal = 'Breakfast (Tomorrow)';
  }

  // Next Focus Block
  const sortedBlocks = [...focusBlocks]
    .filter((b) => b.startTime && timeToMinutes(b.startTime) > currentMins)
    .sort((a, b) => timeToMinutes(a.startTime!) - timeToMinutes(b.startTime!));

  const nextFocusBlock = sortedBlocks[0];

  // Remaining Study Time Today
  const totalFocusMins = focusBlocks.reduce((acc, b) => acc + (b.durationMinutes || 60), 0);
  const remainingStudyHours = (totalFocusMins / 60).toFixed(1);

  // Remaining Free Time Today
  const bedtimeMins = timeToMinutes(prefs.preferredBedtime || '23:30');
  const remainingMinsToday = Math.max(0, bedtimeMins - currentMins);
  const remainingHoursFree = (remainingMinsToday / 60).toFixed(1);

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/90 p-4 shadow-lg backdrop-blur-xl space-y-3">
      <div className="flex items-center justify-between border-b border-white/5 pb-2">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400 flex items-center gap-1.5">
          <Hourglass className="h-3.5 w-3.5 text-cyan-400" />
          Real-Time Context & Next Up
        </span>
        <span className="text-xs font-mono text-slate-400">
          Now: <strong className="text-white">{minutesToFormattedTime(currentMins)}</strong>
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-xs">
        {/* Next Class */}
        <div className="rounded-xl border border-white/5 bg-slate-900/60 p-2.5">
          <span className="text-[10px] text-slate-400 block font-bold uppercase">Next Class</span>
          <span className="font-extrabold text-white block truncate mt-0.5">
            {nextClass ? `${nextClass.startTime} (${nextClass.room || 'Class'})` : 'None Remaining'}
          </span>
        </div>

        {/* Next Lab */}
        <div className="rounded-xl border border-white/5 bg-slate-900/60 p-2.5">
          <span className="text-[10px] text-slate-400 block font-bold uppercase">Next Lab</span>
          <span className="font-extrabold text-emerald-300 block truncate mt-0.5">
            {nextLab ? `${nextLab.startTime} (${nextLab.room || 'Lab'})` : 'No Labs Left'}
          </span>
        </div>

        {/* Next Meal */}
        <div className="rounded-xl border border-white/5 bg-slate-900/60 p-2.5">
          <span className="text-[10px] text-slate-400 block font-bold uppercase">Next Meal</span>
          <span className="font-extrabold text-amber-300 block truncate mt-0.5">{nextMeal}</span>
        </div>

        {/* Next Focus Block */}
        <div className="rounded-xl border border-white/5 bg-slate-900/60 p-2.5">
          <span className="text-[10px] text-slate-400 block font-bold uppercase">Next Focus Block</span>
          <span className="font-extrabold text-cyan-300 block truncate mt-0.5">
            {nextFocusBlock ? `${nextFocusBlock.startTime} - ${nextFocusBlock.title}` : 'None Scheduled'}
          </span>
        </div>

        {/* Remaining Study Time */}
        <div className="rounded-xl border border-white/5 bg-slate-900/60 p-2.5">
          <span className="text-[10px] text-slate-400 block font-bold uppercase">Study Time Planned</span>
          <span className="font-extrabold text-violet-300 block truncate mt-0.5">
            {remainingStudyHours} hrs ({focusBlocks.length} blocks)
          </span>
        </div>

        {/* Remaining Free Time Today */}
        <div className="rounded-xl border border-white/5 bg-slate-900/60 p-2.5">
          <span className="text-[10px] text-slate-400 block font-bold uppercase">Day Awake Window</span>
          <span className="font-extrabold text-cyan-400 block truncate mt-0.5">
            {remainingHoursFree} hrs until bedtime
          </span>
        </div>
      </div>
    </div>
  );
}
