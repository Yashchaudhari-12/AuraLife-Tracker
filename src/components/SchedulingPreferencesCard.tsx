import React, { useState } from 'react';
import { Settings, Moon, Sun, Clock, Zap, MapPin, Coffee, Utensils, Save, Check, RotateCcw } from 'lucide-react';
import { SchedulingPreferences, getStoredSchedulingPreferences, saveStoredSchedulingPreferences, DEFAULT_SCHEDULING_PREFERENCES } from '../utils/schedulingIntelligence';

interface SchedulingPreferencesCardProps {
  onSaveSuccess?: () => void;
}

export function SchedulingPreferencesCard({ onSaveSuccess }: SchedulingPreferencesCardProps) {
  const [prefs, setPrefs] = useState<SchedulingPreferences>(getStoredSchedulingPreferences);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveStoredSchedulingPreferences(prefs);
    setSavedSuccess(true);
    if (onSaveSuccess) onSaveSuccess();
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleReset = () => {
    setPrefs(DEFAULT_SCHEDULING_PREFERENCES);
    saveStoredSchedulingPreferences(DEFAULT_SCHEDULING_PREFERENCES);
    setSavedSuccess(true);
    if (onSaveSuccess) onSaveSuccess();
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-3xl border border-white/10 bg-slate-900/90 p-6 shadow-2xl backdrop-blur-2xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-cyan-400">
            SUSTAINABILITY ENGINE
          </span>
          <h3 className="text-xl font-black text-white flex items-center gap-2 mt-0.5">
            <Settings className="h-5 w-5 text-cyan-400" />
            Scheduling Preferences
          </h3>
          <p className="text-xs text-slate-400">
            AuraLife acts as your smart coach — protecting sleep, routine, and preventing burnout.
          </p>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-2 rounded-xl bg-emerald-500/20 border border-emerald-500/30 px-3.5 py-1.5 text-xs font-bold text-emerald-300 animate-fade-in">
            <Check className="h-4 w-4" /> Preferences Saved!
          </div>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* 1. Sleep & Wake Routine */}
        <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4 space-y-4">
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-cyan-300 flex items-center gap-2 border-b border-white/5 pb-2">
            <Moon className="h-4 w-4 text-cyan-400" />
            Sleep Constraint & Wake Routine
          </h4>

          {/* Sleep Target Hours */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-200">Sleep Target (Hours)</label>
            <div className="grid grid-cols-4 gap-2 text-xs font-bold">
              {[6.5, 7, 7.5, 8].map((hours) => (
                <button
                  key={hours}
                  type="button"
                  onClick={() => setPrefs({ ...prefs, sleepTargetHours: hours })}
                  className={`py-2 rounded-xl border transition ${
                    prefs.sleepTargetHours === hours
                      ? 'border-cyan-400 bg-cyan-500/20 text-cyan-300 font-extrabold shadow-md'
                      : 'border-white/10 bg-slate-900 text-slate-400 hover:text-white'
                  }`}
                >
                  {hours} hrs
                </button>
              ))}
            </div>
          </div>

          {/* Bedtime & Wakeup Time */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Preferred Bedtime</label>
              <input
                type="text"
                value={prefs.preferredBedtime}
                onChange={(e) => setPrefs({ ...prefs, preferredBedtime: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-white outline-none focus:border-cyan-400 font-mono"
                placeholder="23:30"
              />
              <p className="text-[10px] text-slate-500 mt-1">24h format (e.g. 23:30 = 11:30 PM)</p>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Preferred Wake-up Time</label>
              <input
                type="text"
                value={prefs.preferredWakeupTime}
                onChange={(e) => setPrefs({ ...prefs, preferredWakeupTime: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-white outline-none focus:border-cyan-400 font-mono"
                placeholder="07:15"
              />
              <p className="text-[10px] text-slate-500 mt-1">24h format (e.g. 07:15 AM)</p>
            </div>
          </div>

          {/* Morning Deep Work Switch */}
          <div className="flex items-center justify-between rounded-xl border border-white/10 bg-slate-900/80 p-3 text-xs">
            <div>
              <p className="font-bold text-white">Morning Deep Work</p>
              <p className="text-[10px] text-slate-400">If disabled, no sessions are scheduled before college.</p>
            </div>
            <button
              type="button"
              onClick={() => setPrefs({ ...prefs, morningDeepWorkEnabled: !prefs.morningDeepWorkEnabled })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                prefs.morningDeepWorkEnabled ? 'bg-cyan-500' : 'bg-slate-700'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  prefs.morningDeepWorkEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* 2. Deep Work & Focus Constraints */}
        <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4 space-y-4">
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-violet-300 flex items-center gap-2 border-b border-white/5 pb-2">
            <Zap className="h-4 w-4 text-violet-400" />
            Deep Work & Focus Limits
          </h4>

          {/* Max Focus Blocks Per Day */}
          <div className="space-y-1.5 text-xs">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-200">Maximum Focus Blocks Per Day</label>
              <span className="text-cyan-400 font-mono font-bold text-sm">{prefs.maxFocusBlocksPerDay} Blocks</span>
            </div>
            <div className="grid grid-cols-4 gap-2 font-bold">
              {[2, 3, 4, 5].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setPrefs({ ...prefs, maxFocusBlocksPerDay: num })}
                  className={`py-2 rounded-xl border transition ${
                    prefs.maxFocusBlocksPerDay === num
                      ? 'border-violet-400 bg-violet-500/20 text-violet-300 font-extrabold shadow-md'
                      : 'border-white/10 bg-slate-900 text-slate-400 hover:text-white'
                  }`}
                >
                  {num} Max
                </button>
              ))}
            </div>
          </div>

          {/* Preferred Study Strategy */}
          <div className="space-y-1.5 text-xs">
            <label className="block font-bold text-slate-200">Preferred Study Strategy</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 font-bold">
              {(['Morning Person', 'Evening Person', 'Library First', 'Home First', 'Flexible'] as const).map((strat) => (
                <button
                  key={strat}
                  type="button"
                  onClick={() => setPrefs({ ...prefs, preferredStudyStrategy: strat })}
                  className={`py-2 px-2 rounded-xl border transition text-center truncate ${
                    prefs.preferredStudyStrategy === strat
                      ? 'border-cyan-400 bg-cyan-500/20 text-cyan-300 font-extrabold shadow-md'
                      : 'border-white/10 bg-slate-900 text-slate-400 hover:text-white'
                  }`}
                >
                  {strat}
                </button>
              ))}
            </div>
          </div>

          {/* Preferred Study Location */}
          <div className="space-y-1.5 text-xs">
            <label className="block font-bold text-slate-200">Preferred Study Location</label>
            <div className="grid grid-cols-3 gap-2 font-bold">
              {(['Home', 'Library', 'Anywhere'] as const).map((loc) => (
                <button
                  key={loc}
                  type="button"
                  onClick={() => setPrefs({ ...prefs, preferredStudyLocation: loc })}
                  className={`py-2 rounded-xl border transition flex items-center justify-center gap-1.5 ${
                    prefs.preferredStudyLocation === loc
                      ? 'border-cyan-400 bg-cyan-500/20 text-cyan-300 font-extrabold shadow-md'
                      : 'border-white/10 bg-slate-900 text-slate-400 hover:text-white'
                  }`}
                >
                  <MapPin className="h-3.5 w-3.5" />
                  <span>{loc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Preferred Deep Work Duration */}
          <div className="space-y-1.5 text-xs">
            <label className="block font-bold text-slate-200">Preferred Deep Work Duration</label>
            <div className="grid grid-cols-4 gap-2 font-bold">
              {[45, 60, 90, 120].map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => setPrefs({ ...prefs, preferredDeepWorkDuration: mins })}
                  className={`py-2 rounded-xl border transition ${
                    prefs.preferredDeepWorkDuration === mins
                      ? 'border-emerald-400 bg-emerald-500/20 text-emerald-300 font-extrabold shadow-md'
                      : 'border-white/10 bg-slate-900 text-slate-400 hover:text-white'
                  }`}
                >
                  {mins} min
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 3. Meals & Commute Routine */}
        <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4 space-y-4 md:col-span-2">
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-emerald-300 flex items-center gap-2 border-b border-white/5 pb-2">
            <Utensils className="h-4 w-4 text-emerald-400" />
            Meals & Commute Protection
          </h4>

          <div className="grid gap-4 sm:grid-cols-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Lunch Window</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={prefs.lunchStartTime}
                  onChange={(e) => setPrefs({ ...prefs, lunchStartTime: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-slate-900 px-2.5 py-1.5 text-white outline-none focus:border-cyan-400 font-mono text-center"
                  placeholder="12:30"
                />
                <span className="text-slate-500 font-bold">to</span>
                <input
                  type="text"
                  value={prefs.lunchEndTime}
                  onChange={(e) => setPrefs({ ...prefs, lunchEndTime: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-slate-900 px-2.5 py-1.5 text-white outline-none focus:border-cyan-400 font-mono text-center"
                  placeholder="13:30"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Dinner Window</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={prefs.dinnerStartTime}
                  onChange={(e) => setPrefs({ ...prefs, dinnerStartTime: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-slate-900 px-2.5 py-1.5 text-white outline-none focus:border-cyan-400 font-mono text-center"
                  placeholder="20:00"
                />
                <span className="text-slate-500 font-bold">to</span>
                <input
                  type="text"
                  value={prefs.dinnerEndTime}
                  onChange={(e) => setPrefs({ ...prefs, dinnerEndTime: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-slate-900 px-2.5 py-1.5 text-white outline-none focus:border-cyan-400 font-mono text-center"
                  placeholder="21:00"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Commute Time (mins)</label>
              <input
                type="number"
                value={prefs.commuteTimeMins}
                onChange={(e) => setPrefs({ ...prefs, commuteTimeMins: Number(e.target.value) })}
                className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-1.5 text-white outline-none focus:border-cyan-400 font-mono"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-white/10">
        <button
          type="button"
          onClick={handleReset}
          className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-400 hover:text-white transition"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Reset Defaults</span>
        </button>

        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-400 px-6 py-2.5 text-xs font-bold text-slate-950 hover:opacity-95 transition shadow-lg shadow-cyan-500/20"
        >
          <Save className="h-4 w-4" />
          <span>Save Preferences</span>
        </button>
      </div>
    </form>
  );
}
