import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GraduationCap,
  BookOpen,
  Home,
  Palmtree,
  HeartPulse,
  FileText,
  AlertTriangle,
  Sparkles,
  Info,
  CheckCircle2,
} from 'lucide-react';
import { DayMode } from '../types/auralife';
import { getStoredDayMode, saveStoredDayMode } from '../utils/auralifeData';

interface DayModeOption {
  mode: DayMode;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  tagline: string;
  badge: string;
  color: string;
  bgGradient: string;
  borderColor: string;
  textColor: string;
  activeBg: string;
  description: string;
  attendanceEffect?: string;
}

export const DAY_MODE_OPTIONS: DayOptionConfig[] = [
  {
    mode: 'College Day',
    label: 'College Day',
    icon: GraduationCap,
    tagline: 'Standard Timetable',
    badge: 'Campus & Classes',
    color: 'cyan',
    bgGradient: 'from-cyan-500/10 via-slate-900 to-slate-950',
    borderColor: 'border-cyan-500/30',
    textColor: 'text-cyan-400',
    activeBg: 'bg-cyan-500 text-slate-950 font-black',
    description: 'Follows your official college timetable. Generates focus blocks strictly during verified breaks between lectures, labs, and commute.',
    attendanceEffect: 'Safe: Attending all scheduled classes maintains default attendance.',
  },
  {
    mode: 'Library Day',
    label: 'Library Day',
    icon: BookOpen,
    tagline: 'On Campus Library',
    badge: 'Self-Study + Labs',
    color: 'blue',
    bgGradient: 'from-blue-500/10 via-slate-900 to-slate-950',
    borderColor: 'border-blue-500/30',
    textColor: 'text-blue-400',
    activeBg: 'bg-blue-500 text-slate-950 font-black',
    description: 'Studying in campus library instead of theory lectures. Theory class hours converted into library study blocks; lab sessions remain mandatory.',
    attendanceEffect: '⚠️ Attendance Impact: Skipping today’s theory lectures lowers overall attendance by ~1.2%. Labs remain attended.',
  },
  {
    mode: 'Home Study Day',
    label: 'Home Study Day',
    icon: Home,
    tagline: 'No College Commute',
    badge: 'Structured Home OS',
    color: 'indigo',
    bgGradient: 'from-indigo-500/10 via-slate-900 to-slate-950',
    borderColor: 'border-indigo-500/30',
    textColor: 'text-indigo-400',
    activeBg: 'bg-indigo-500 text-slate-950 font-black',
    description: 'Timetable paused for dedicated home study. Generates uninterrupted focus blocks respecting wake-up, meals, and bedtime.',
    attendanceEffect: 'Notice: Bunking full college day will affect attendance across today’s scheduled subjects.',
  },
  {
    mode: 'Holiday',
    label: 'Holiday',
    icon: Palmtree,
    tagline: 'Full-Day Deep Work',
    badge: 'Off-Day Focus',
    color: 'emerald',
    bgGradient: 'from-emerald-500/10 via-slate-900 to-slate-950',
    borderColor: 'border-emerald-500/30',
    textColor: 'text-emerald-400',
    activeBg: 'bg-emerald-500 text-slate-950 font-black',
    description: 'Full-day deep work, project sprint, and revision plan with scheduled meal and relaxation buffers.',
    attendanceEffect: 'College Off-Day: Zero attendance obligations today.',
  },
  {
    mode: 'Sick Leave',
    label: 'Sick Leave',
    icon: HeartPulse,
    tagline: 'Rest & Recovery',
    badge: 'Health First',
    color: 'rose',
    bgGradient: 'from-rose-500/10 via-slate-900 to-slate-950',
    borderColor: 'border-rose-500/30',
    textColor: 'text-rose-400',
    activeBg: 'bg-rose-500 text-slate-950 font-black',
    description: 'Intense study blocks cancelled for health recovery. Only optional 20-minute light reading suggested if feeling up to it.',
    attendanceEffect: 'Medical Leave: Ensure medical certificate is submitted to college office.',
  },
  {
    mode: 'Exam Day',
    label: 'Exam Day',
    icon: FileText,
    tagline: 'High-Impact Revision',
    badge: 'Syllabus Focus',
    color: 'amber',
    bgGradient: 'from-amber-500/10 via-slate-900 to-slate-950',
    borderColor: 'border-amber-500/30',
    textColor: 'text-amber-400',
    activeBg: 'bg-amber-500 text-slate-950 font-black',
    description: 'Hides unrelated coding recommendations and focuses 100% on core subject formulas, past year questions, and mock tests.',
    attendanceEffect: 'Exam Schedule: Attending exam session is critical for academic standing.',
  },
];

interface DayOptionConfig extends DayModeOption {}

interface DayModeSelectorProps {
  onModeChange?: (newMode: DayMode) => void;
}

export function DayModeSelector({ onModeChange }: DayModeSelectorProps) {
  const [activeMode, setActiveMode] = useState<DayMode>(() => getStoredDayMode());

  useEffect(() => {
    const handleUpdate = () => {
      setActiveMode(getStoredDayMode());
    };
    window.addEventListener('auralife_daymode_updated', handleUpdate);
    return () => window.removeEventListener('auralife_daymode_updated', handleUpdate);
  }, []);

  const handleSelect = (mode: DayMode) => {
    setActiveMode(mode);
    saveStoredDayMode(mode);
    if (onModeChange) onModeChange(mode);
  };

  const currentOption = DAY_MODE_OPTIONS.find((o) => o.mode === activeMode) || DAY_MODE_OPTIONS[0];
  const IconComponent = currentOption.icon;

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-slate-950/90 p-5 sm:p-6 shadow-2xl backdrop-blur-2xl space-y-4">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-cyan-400 animate-pulse" />
          <h2 className="text-xs font-black uppercase tracking-[0.2em] text-cyan-400">
            Day Mode System
          </h2>
        </div>
        <span className="text-[11px] font-mono text-slate-400">
          Dynamic Schedule & Focus Engine
        </span>
      </div>

      {/* Mode Buttons Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {DAY_MODE_OPTIONS.map((opt) => {
          const isSelected = activeMode === opt.mode;
          const Icon = opt.icon;

          return (
            <button
              key={opt.mode}
              type="button"
              onClick={() => handleSelect(opt.mode)}
              className={`relative flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition-all duration-200 ${
                isSelected
                  ? `${opt.borderColor} bg-slate-900 shadow-lg`
                  : 'border-white/5 bg-slate-900/40 text-slate-400 hover:border-white/20 hover:bg-slate-900/80 hover:text-white'
              }`}
            >
              {isSelected && (
                <motion.div
                  layoutId="activeDayModeGlow"
                  className={`absolute inset-0 rounded-2xl bg-gradient-to-b ${opt.bgGradient} opacity-50 pointer-events-none`}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}

              <div className="relative z-10 flex flex-col items-center gap-1.5">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-xl transition ${
                    isSelected
                      ? opt.activeBg
                      : 'bg-white/5 text-slate-300'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <span className={`text-xs font-bold block ${isSelected ? 'text-white' : ''}`}>
                    {opt.label}
                  </span>
                  <span className="text-[10px] text-slate-400 block font-medium">
                    {opt.tagline}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Mode Info & Reasoning Banner */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeMode}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.15 }}
          className={`relative overflow-hidden rounded-2xl border ${currentOption.borderColor} bg-gradient-to-r ${currentOption.bgGradient} p-4 space-y-2`}
        >
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-start gap-3">
              <div className={`p-2.5 rounded-xl bg-slate-950 border ${currentOption.borderColor} ${currentOption.textColor} shrink-0`}>
                <IconComponent className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                    <span>{currentOption.label} Active</span>
                  </h3>
                  <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider bg-white/10 ${currentOption.textColor} border border-white/10`}>
                    {currentOption.badge}
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {currentOption.description}
                </p>
              </div>
            </div>

            {currentOption.attendanceEffect && (
              <div className="flex items-center gap-2 rounded-xl bg-slate-950/80 border border-white/10 px-3 py-2 text-xs font-semibold shrink-0">
                {activeMode === 'Library Day' || activeMode === 'Home Study Day' ? (
                  <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                )}
                <span className={activeMode === 'Library Day' ? 'text-amber-300' : 'text-slate-300'}>
                  {currentOption.attendanceEffect}
                </span>
              </div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
