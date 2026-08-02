import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, AlertTriangle, CheckCircle, Sparkles, RefreshCw, Clock, Moon, Utensils, Award, ArrowRight, Settings } from 'lucide-react';
import { validateSchedule, autoFixSchedule, getStoredSchedulingPreferences, ScheduleHealthReport } from '../utils/schedulingIntelligence';
import { TimeBlock } from '../plannerStorage';

interface ScheduleHealthCardProps {
  dayName: string;
  focusBlocks: TimeBlock[];
  onApplyFixedBlocks?: (fixedBlocks: TimeBlock[]) => void;
  onOpenPreferences?: () => void;
}

export function ScheduleHealthCard({
  dayName,
  focusBlocks,
  onApplyFixedBlocks,
  onOpenPreferences,
}: ScheduleHealthCardProps) {
  const [report, setReport] = useState<ScheduleHealthReport>(() =>
    validateSchedule(dayName, focusBlocks)
  );
  const [prefs, setPrefs] = useState(() => getStoredSchedulingPreferences());
  const [fixedSuccessMessage, setFixedSuccessMessage] = useState<string | null>(null);

  const reevaluate = () => {
    const currentPrefs = getStoredSchedulingPreferences();
    setPrefs(currentPrefs);
    setReport(validateSchedule(dayName, focusBlocks, currentPrefs));
  };

  useEffect(() => {
    reevaluate();
    const handleUpdate = () => reevaluate();
    window.addEventListener('auralife_preferences_updated', handleUpdate);
    window.addEventListener('auralife_schedule_updated', handleUpdate);
    return () => {
      window.removeEventListener('auralife_preferences_updated', handleUpdate);
      window.removeEventListener('auralife_schedule_updated', handleUpdate);
    };
  }, [dayName, focusBlocks]);

  const handleAcceptSuggestion = () => {
    const { fixedBlocks, fixedCount } = autoFixSchedule(dayName, focusBlocks, prefs);
    if (onApplyFixedBlocks && fixedCount > 0) {
      onApplyFixedBlocks(fixedBlocks);
      setFixedSuccessMessage(`Successfully rescheduled ${fixedCount} focus session(s) to sustainable library & evening windows!`);
      setTimeout(() => setFixedSuccessMessage(null), 4000);
    }
  };

  const getScoreBadgeColor = (score: number) => {
    if (score >= 90) return 'from-emerald-500 to-teal-600 text-slate-950';
    if (score >= 75) return 'from-cyan-500 to-blue-600 text-slate-950';
    return 'from-amber-500 to-red-500 text-slate-950';
  };

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900/90 p-6 shadow-2xl backdrop-blur-2xl space-y-5">
      <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -left-16 -bottom-16 h-48 w-48 rounded-full bg-violet-500/10 blur-3xl pointer-events-none" />

      {/* HEADER BAR */}
      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-500 to-emerald-400 font-bold text-slate-950 shadow-lg shadow-cyan-500/20">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black tracking-tight text-white">Schedule Health Intelligence</h2>
              <span className="rounded-full bg-cyan-500/10 border border-cyan-400/30 px-2.5 py-0.5 text-[10px] font-extrabold uppercase text-cyan-300">
                Sustainable OS
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Validating {dayName}&apos;s schedule for sleep preservation, meals, commute, and deep work limits.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Overall Score</p>
            <div className={`inline-flex items-center gap-1.5 rounded-2xl bg-gradient-to-r ${getScoreBadgeColor(report.overallScore)} px-4 py-1 text-lg font-black shadow-md`}>
              <Award className="h-4 w-4" />
              <span>{report.overallScore}%</span>
            </div>
          </div>

          {onOpenPreferences && (
            <button
              type="button"
              onClick={onOpenPreferences}
              className="p-2.5 rounded-2xl border border-white/10 bg-slate-800 text-slate-300 hover:text-white hover:border-cyan-400 transition"
              title="Configure Scheduling Preferences"
            >
              <Settings className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* SUCCESS OVERLAY NOTIFICATION */}
      <AnimatePresence>
        {fixedSuccessMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-xs font-bold text-emerald-300 flex items-center justify-between"
          >
            <span className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
              {fixedSuccessMessage}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* WARNING SUGGESTIONS BANNER (If sleep or constraint is violated) */}
      <AnimatePresence>
        {report.warnings.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 space-y-3"
          >
            {report.warnings.map((warn) => (
              <div key={warn.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-0.5">
                  <p className="font-extrabold text-amber-300 flex items-center gap-1.5">
                    <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 animate-bounce" />
                    {warn.message}
                  </p>
                  <p className="text-slate-200 font-medium">{warn.suggestionText}</p>
                </div>

                <button
                  type="button"
                  onClick={handleAcceptSuggestion}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-400 px-4 py-2 text-xs font-black text-slate-950 hover:bg-amber-300 transition shadow-md shadow-amber-500/20 whitespace-nowrap active:scale-95"
                >
                  <Sparkles className="h-3.5 w-3.5 fill-slate-950" />
                  <span>[Accept Suggestion]</span>
                </button>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* HEALTH STATUS INDICATORS GRID */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {report.checks.map((check) => {
          const isSafe = check.status === 'SAFE';
          return (
            <div
              key={check.id}
              className={`rounded-2xl border p-3.5 space-y-1.5 transition ${
                isSafe
                  ? 'border-emerald-500/20 bg-emerald-500/5 hover:border-emerald-500/30'
                  : 'border-amber-500/30 bg-amber-500/10'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className={`h-2.5 w-2.5 rounded-full ${isSafe ? 'bg-emerald-400' : 'bg-amber-400 animate-ping'}`} />
                <p className={`text-xs font-black uppercase tracking-wider ${isSafe ? 'text-emerald-300' : 'text-amber-300'}`}>
                  {check.label}
                </p>
              </div>
              <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                {check.detail}
              </p>
            </div>
          );
        })}
      </div>

      {/* SUSTAINABILITY COACH SUMMARY FOOTER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-400 pt-2 border-t border-white/5 font-mono">
        <span className="flex items-center gap-2">
          <Moon className="h-3.5 w-3.5 text-cyan-400" />
          Target Sleep: <strong className="text-white">{prefs.sleepTargetHours} Hours</strong> ({prefs.preferredBedtime} to {prefs.preferredWakeupTime})
        </span>
        <span className="flex items-center gap-2">
          <Utensils className="h-3.5 w-3.5 text-violet-400" />
          Meals: <strong className="text-white">Lunch {prefs.lunchStartTime} • Dinner {prefs.dinnerStartTime}</strong>
        </span>
        <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
          <CheckCircle className="h-3.5 w-3.5" />
          Optimized for Daily Consistency
        </span>
      </div>
    </div>
  );
}
