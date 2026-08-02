import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, ShieldCheck, CheckCircle2, Info, ArrowRight, Layers } from 'lucide-react';
import {
  getStoredDayMode,
  getStoredSubjects,
  getStoredTimetable,
  getTodayDayName,
  calculateAttendanceStats,
} from '../utils/auralifeData';
import { DayMode } from '../types/auralife';

interface AttendanceImpactCardProps {
  dayName?: string;
  modeOverride?: DayMode;
}

export function AttendanceImpactCard({ dayName, modeOverride }: AttendanceImpactCardProps) {
  const [mode, setMode] = useState<DayMode>(() => modeOverride || getStoredDayMode());
  const currentDay = dayName || getTodayDayName();

  useEffect(() => {
    const handleUpdate = () => {
      setMode(modeOverride || getStoredDayMode());
    };
    window.addEventListener('auralife_daymode_updated', handleUpdate);
    window.addEventListener('auralife_schedule_updated', handleUpdate);
    return () => {
      window.removeEventListener('auralife_daymode_updated', handleUpdate);
      window.removeEventListener('auralife_schedule_updated', handleUpdate);
    };
  }, [modeOverride]);

  if (mode !== 'Library Day' && mode !== 'Home Study Day') {
    return null;
  }

  const subjects = getStoredSubjects();
  const timetable = getStoredTimetable();
  const todaySlots = timetable[currentDay] || [];

  // Count theory slots today by subject
  const theorySlotsBySubj: Record<string, number> = {};
  todaySlots.forEach((slot) => {
    if (slot.type === 'theory' || !slot.type) {
      theorySlotsBySubj[slot.subjectId] = (theorySlotsBySubj[slot.subjectId] || 0) + 1;
    }
  });

  const impactedList = subjects
    .map((sub) => {
      const missed = theorySlotsBySubj[sub.id] || 0;
      if (missed === 0) return null;

      const currentPct = sub.total > 0 ? Math.round((sub.attended / sub.total) * 100) : 100;
      const newTotal = sub.total + missed;
      const projectedPct = Math.round((sub.attended / newTotal) * 100);

      let status: 'green' | 'yellow' | 'red' = 'green';
      if (projectedPct < 75) status = 'red';
      else if (projectedPct < 80) status = 'yellow';

      return {
        subject: sub,
        missedClasses: missed,
        currentPct,
        projectedPct,
        status,
      };
    })
    .filter(Boolean);

  const isHomeStudy = mode === 'Home Study Day';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border p-5 shadow-xl space-y-4 ${
        impactedList.some((i) => i?.status === 'red')
          ? 'border-red-500/30 bg-gradient-to-br from-slate-950 via-red-950/20 to-slate-950'
          : 'border-amber-500/30 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950'
      }`}
    >
      <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-3 flex-wrap">
        <div className="flex items-center gap-2">
          {impactedList.some((i) => i?.status === 'red') ? (
            <AlertTriangle className="h-5 w-5 text-red-400 animate-pulse shrink-0" />
          ) : (
            <ShieldCheck className="h-5 w-5 text-amber-400 shrink-0" />
          )}
          <div>
            <h4 className="text-sm font-black text-white uppercase tracking-wider">
              Attendance Impact Analysis ({mode})
            </h4>
            <p className="text-xs text-slate-400">
              {isHomeStudy
                ? 'Full day home study skips theory lectures.'
                : 'Library mode replaces theory lectures with self-study.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-emerald-300">
          <CheckCircle2 className="h-3.5 w-3.5" />
          <span>Labs Remain Protected</span>
        </div>
      </div>

      {impactedList.length === 0 ? (
        <p className="text-xs text-slate-400 italic">
          No theory lectures scheduled for {currentDay}. Attendance is 100% safe!
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {impactedList.map((item) => {
            if (!item) return null;
            const { subject, missedClasses, currentPct, projectedPct, status } = item;

            const badgeStyles =
              status === 'red'
                ? 'border-red-500/30 bg-red-500/10 text-red-400'
                : status === 'yellow'
                ? 'border-amber-500/30 bg-amber-500/10 text-amber-300'
                : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300';

            return (
              <div
                key={subject.id}
                className="rounded-xl border border-white/10 bg-slate-900/80 p-3 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-white text-sm">{subject.code}</span>
                  <span className={`px-2 py-0.5 rounded-md border font-black text-[10px] ${badgeStyles}`}>
                    {status === 'red' ? 'CRITICAL <75%' : status === 'yellow' ? 'WARNING <80%' : 'SAFE ≥80%'}
                  </span>
                </div>

                <p className="text-slate-300">
                  Skipping today's {missedClasses} theory class{missedClasses > 1 ? 'es' : ''} will reduce{' '}
                  <strong className="text-white">{subject.name}</strong> attendance:
                </p>

                <div className="flex items-center gap-2 font-mono font-bold text-sm bg-slate-950 p-2 rounded-lg border border-white/5">
                  <span className="text-slate-400">{currentPct}%</span>
                  <ArrowRight className="h-3.5 w-3.5 text-slate-500" />
                  <span className={status === 'red' ? 'text-red-400' : status === 'yellow' ? 'text-amber-300' : 'text-emerald-300'}>
                    {projectedPct}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
