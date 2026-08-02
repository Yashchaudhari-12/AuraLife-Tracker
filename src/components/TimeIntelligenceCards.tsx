import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, Coffee, Zap, Navigation, Clock, Moon, Edit3, SunMedium, Sparkles } from 'lucide-react';
import { STORAGE_KEYS } from '../utils/auralifeData';

export function TimeIntelligenceCards() {
  const [travelMins, setTravelMins] = useState(() => {
    return Number(localStorage.getItem(STORAGE_KEYS.TRAVEL_TIME) || 30);
  });

  const [getReadyMins, setGetReadyMins] = useState(() => {
    return Number(localStorage.getItem(STORAGE_KEYS.GET_READY_TIME) || 45);
  });

  const [sleepHours, setSleepHours] = useState(() => {
    return Number(localStorage.getItem(STORAGE_KEYS.SLEEP_TARGET) || 7.0);
  });

  const [isEditing, setIsEditing] = useState(false);

  const savePreferences = () => {
    localStorage.setItem(STORAGE_KEYS.TRAVEL_TIME, String(travelMins));
    localStorage.setItem(STORAGE_KEYS.GET_READY_TIME, String(getReadyMins));
    localStorage.setItem(STORAGE_KEYS.SLEEP_TARGET, String(sleepHours));
    setIsEditing(false);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('auralife_schedule_updated'));
    }
  };

  const metrics = [
    {
      label: 'Get Ready Routine',
      value: `${getReadyMins}m`,
      sub: 'Post wake-up prep',
      icon: SunMedium,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10 border-amber-500/20',
    },
    {
      label: 'Travel / Commute',
      value: `${travelMins}m`,
      sub: 'One-way college transit',
      icon: Navigation,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10 border-blue-500/20',
    },
    {
      label: 'Sleep Target',
      value: `${sleepHours}h`,
      sub: 'Minimum required sleep',
      icon: Moon,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10 border-purple-500/20',
    },
    {
      label: 'Total College Hours',
      value: '5h 30m',
      sub: '5 Scheduled Classes',
      icon: GraduationCap,
      color: 'text-violet-400',
      bgColor: 'bg-violet-500/10 border-violet-500/20',
    },
    {
      label: "Today's Free Time",
      value: '2h 45m',
      sub: '3 Available Windows',
      icon: Coffee,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/10 border-cyan-500/20',
    },
    {
      label: 'Deep Work Target',
      value: '3h 20m',
      sub: 'High Efficiency Focus',
      icon: Zap,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10 border-emerald-500/20',
    },
  ];

  return (
    <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-6 shadow-2xl backdrop-blur-xl space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            Time Budget Matrix
          </p>
          <h2 className="text-2xl font-bold text-white">Time Intelligence & Daily Routine</h2>
        </div>
        <button
          type="button"
          onClick={() => setIsEditing(!isEditing)}
          className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:border-cyan-400 transition"
        >
          <Edit3 className="h-3.5 w-3.5 text-cyan-400" />
          <span>{isEditing ? 'Close Settings' : 'Adjust Daily Routine'}</span>
        </button>
      </div>

      {isEditing && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="rounded-2xl border border-cyan-500/30 bg-slate-900/90 p-4 space-y-3 text-xs"
        >
          <div className="flex items-center gap-2 text-cyan-300 font-bold">
            <Sparkles className="h-4 w-4 text-cyan-400" />
            <span>Personal Routine & Sleep Parameters</span>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <label className="space-y-1 block">
              <span className="text-slate-300">Get Ready Duration (minutes):</span>
              <input
                type="number"
                value={getReadyMins}
                onChange={(e) => setGetReadyMins(Number(e.target.value))}
                className="w-full rounded-xl border border-white/10 bg-slate-950 p-2 text-white outline-none focus:border-cyan-400"
              />
              <span className="text-[10px] text-slate-400 block">Morning prep post wake-up (e.g. 45m)</span>
            </label>
            <label className="space-y-1 block">
              <span className="text-slate-300">Commute / Travel Time (minutes):</span>
              <input
                type="number"
                value={travelMins}
                onChange={(e) => setTravelMins(Number(e.target.value))}
                className="w-full rounded-xl border border-white/10 bg-slate-950 p-2 text-white outline-none focus:border-cyan-400"
              />
              <span className="text-[10px] text-slate-400 block">One-way travel to college (e.g. 30m)</span>
            </label>
            <label className="space-y-1 block">
              <span className="text-slate-300">Minimum Sleep Target (hours):</span>
              <input
                type="number"
                step="0.5"
                value={sleepHours}
                onChange={(e) => setSleepHours(Number(e.target.value))}
                className="w-full rounded-xl border border-white/10 bg-slate-950 p-2 text-white outline-none focus:border-cyan-400"
              />
              <span className="text-[10px] text-slate-400 block">Guaranteed recovery sleep (e.g. 7.0h min)</span>
            </label>
          </div>
          <button
            type="button"
            onClick={savePreferences}
            className="rounded-xl bg-cyan-500 px-4 py-2 font-bold text-slate-950 hover:bg-cyan-400 transition"
          >
            Save Preferences
          </button>
        </motion.div>
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
        {metrics.map((m, idx) => {
          const Icon = m.icon;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04 }}
              className="rounded-2xl border border-white/5 bg-slate-900/60 p-4 space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-400">{m.label}</span>
                <div className={`p-1.5 rounded-lg border ${m.bgColor}`}>
                  <Icon className={`h-4 w-4 ${m.color}`} />
                </div>
              </div>
              <p className="text-2xl font-black text-white">{m.value}</p>
              <p className="text-[10px] text-slate-400">{m.sub}</p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
