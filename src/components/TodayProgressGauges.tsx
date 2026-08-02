import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Flame, Target, CheckCircle2, Clock, Award, GraduationCap } from 'lucide-react';
import { getOverallAttendanceStats } from '../utils/auralifeData';

interface TodayProgressGaugesProps {
  deepWorkMinutes: number;
  focusScore: number;
  completedTasksCount: number;
  totalTasksCount: number;
  streakDays: number;
  remainingStudyMinutes: number;
}

export function TodayProgressGauges({
  deepWorkMinutes = 200,
  focusScore = 92,
  completedTasksCount = 5,
  totalTasksCount = 7,
  streakDays = 14,
  remainingStudyMinutes = 120,
}: TodayProgressGaugesProps) {
  const [stats, setStats] = useState(() => getOverallAttendanceStats());

  useEffect(() => {
    const handleUpdate = () => setStats(getOverallAttendanceStats());
    window.addEventListener('auralife_subjects_updated', handleUpdate);
    return () => window.removeEventListener('auralife_subjects_updated', handleUpdate);
  }, []);

  const actualAttendance = stats.percentage;

  const deepWorkHours = (deepWorkMinutes / 60).toFixed(1);

  // SVG circular progress math
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const focusOffset = circumference - (focusScore / 100) * circumference;
  const taskPercent = totalTasksCount > 0 ? (completedTasksCount / totalTasksCount) * 100 : 0;
  const taskOffset = circumference - (taskPercent / 100) * circumference;
  const attendanceOffset = circumference - (actualAttendance / 100) * circumference;

  return (
    <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-6 shadow-2xl backdrop-blur-xl">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            Realtime Analytics
          </p>
          <h2 className="mt-1 text-2xl font-bold text-white">Today's Progress</h2>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-3.5 py-1.5 text-xs font-bold text-orange-400">
          <Flame className="h-4 w-4 fill-orange-400 text-orange-400 animate-bounce" />
          <span>{streakDays} Day Streak</span>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {/* Gauge 1: Deep Work */}
        <div className="flex flex-col items-center justify-center rounded-2xl border border-white/5 bg-slate-900/60 p-4 text-center">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Deep Work</p>
          <p className="mt-2 text-3xl font-extrabold text-white">{deepWorkHours}h</p>
          <p className="mt-1 text-[11px] text-cyan-400">High Focus State</p>
        </div>

        {/* Gauge 2: Focus Score Circular Gauge */}
        <div className="flex flex-col items-center justify-center rounded-2xl border border-white/5 bg-slate-900/60 p-4 text-center">
          <div className="relative flex items-center justify-center">
            <svg className="h-20 w-20 transform -rotate-90">
              <circle
                cx="40"
                cy="40"
                r={radius}
                className="stroke-slate-800"
                strokeWidth="6"
                fill="transparent"
              />
              <motion.circle
                cx="40"
                cy="40"
                r={radius}
                className="stroke-cyan-400"
                strokeWidth="6"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: focusOffset }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            <span className="absolute text-base font-extrabold text-white">{focusScore}%</span>
          </div>
          <p className="mt-2 text-xs font-medium text-slate-400">Focus Score</p>
        </div>

        {/* Gauge 3: Tasks Completed Circular Gauge */}
        <div className="flex flex-col items-center justify-center rounded-2xl border border-white/5 bg-slate-900/60 p-4 text-center">
          <div className="relative flex items-center justify-center">
            <svg className="h-20 w-20 transform -rotate-90">
              <circle
                cx="40"
                cy="40"
                r={radius}
                className="stroke-slate-800"
                strokeWidth="6"
                fill="transparent"
              />
              <motion.circle
                cx="40"
                cy="40"
                r={radius}
                className="stroke-violet-400"
                strokeWidth="6"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: taskOffset }}
                transition={{ duration: 1.2, ease: 'easeOut', delay: 0.2 }}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            <span className="absolute text-sm font-extrabold text-white">
              {completedTasksCount}/{totalTasksCount}
            </span>
          </div>
          <p className="mt-2 text-xs font-medium text-slate-400">Tasks Completed</p>
        </div>

        {/* Gauge 4: Current Streak */}
        <div className="flex flex-col items-center justify-center rounded-2xl border border-white/5 bg-slate-900/60 p-4 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500/20 text-orange-400">
            <Award className="h-5 w-5" />
          </div>
          <p className="mt-2 text-2xl font-extrabold text-white">{streakDays} Days</p>
          <p className="mt-0.5 text-xs font-medium text-slate-400">Current Streak</p>
        </div>

        {/* Gauge 5: Synced Attendance Gauge */}
        <div className="flex flex-col items-center justify-center rounded-2xl border border-white/5 bg-slate-900/60 p-4 text-center">
          <div className="relative flex items-center justify-center">
            <svg className="h-20 w-20 transform -rotate-90">
              <circle
                cx="40"
                cy="40"
                r={radius}
                className="stroke-slate-800"
                strokeWidth="6"
                fill="transparent"
              />
              <motion.circle
                cx="40"
                cy="40"
                r={radius}
                className={actualAttendance >= 75 ? "stroke-emerald-400" : "stroke-amber-400"}
                strokeWidth="6"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: attendanceOffset }}
                transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            <span className="absolute text-sm font-extrabold text-white">
              {actualAttendance}%
            </span>
          </div>
          <p className="mt-2 text-xs font-medium text-slate-400">Actual Attendance</p>
        </div>
      </div>
    </div>
  );
}
