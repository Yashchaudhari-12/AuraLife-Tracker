import React, { useState } from 'react';
import { Settings, Save, Clock, GraduationCap, GitPullRequest, Code2, RotateCcw, ShieldCheck, Check } from 'lucide-react';

export function SettingsView() {
  const [wakeUpTime, setWakeUpTime] = useState('06:00');
  const [getReadyMins, setGetReadyMins] = useState(45);
  const [travelMins, setTravelMins] = useState(30);
  const [minAttendance, setMinAttendance] = useState(75);
  const [githubRepo, setGithubRepo] = useState('https://github.com/Yashchaudhari-12/Cpp');
  const [leetcodeUsername, setLeetcodeUsername] = useState('Yashchaudhari-12');
  const [dailyFocusTarget, setDailyFocusTarget] = useState(180);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('auralife_settings', JSON.stringify({
      wakeUpTime,
      getReadyMins,
      travelMins,
      minAttendance,
      githubRepo,
      leetcodeUsername,
      dailyFocusTarget,
    }));
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleResetData = () => {
    if (window.confirm('Are you sure you want to reset planner local data? Custom focus blocks will be restored to defaults.')) {
      localStorage.removeItem('auralife_planner_data');
      localStorage.removeItem('auralife_settings');
      window.location.reload();
    }
  };

  return (
    <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-6 shadow-2xl backdrop-blur-xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            System Preferences
          </p>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2.5 mt-1">
            <Settings className="h-6 w-6 text-cyan-400" />
            AuraLife Time Planner Configuration
          </h2>
        </div>
        {savedSuccess && (
          <div className="flex items-center gap-2 rounded-xl bg-emerald-500/20 border border-emerald-500/30 px-3.5 py-1.5 text-xs font-bold text-emerald-300">
            <Check className="h-4 w-4" /> Preferences Saved!
          </div>
        )}
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Section 1: Morning Routine & Schedule Timing */}
          <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-white/5 pb-3">
              <Clock className="h-4 w-4 text-cyan-400" />
              Morning Routine & Schedule Settings
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Morning Wake-Up Alarm</label>
                <input
                  type="text"
                  value={wakeUpTime}
                  onChange={(e) => setWakeUpTime(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-white outline-none focus:border-cyan-400 font-mono"
                />
                <p className="text-[10px] text-slate-500 mt-1">Default 06:00 AM wakeup schedule.</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Shower & Brush (mins)</label>
                  <input
                    type="number"
                    value={getReadyMins}
                    onChange={(e) => setGetReadyMins(Number(e.target.value))}
                    className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-white outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">College Commute (mins)</label>
                  <input
                    type="number"
                    value={travelMins}
                    onChange={(e) => setTravelMins(Number(e.target.value))}
                    className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-white outline-none focus:border-cyan-400"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: College & Academic Targets */}
          <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-white/5 pb-3">
              <GraduationCap className="h-4 w-4 text-violet-400" />
              Academic & Attendance Criteria
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Minimum Target Attendance (%)</label>
                <input
                  type="number"
                  value={minAttendance}
                  onChange={(e) => setMinAttendance(Number(e.target.value))}
                  className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-white outline-none focus:border-cyan-400"
                />
                <p className="text-[10px] text-slate-500 mt-1">College policy threshold (Default: 75%).</p>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Daily Deep Work Target (mins)</label>
                <input
                  type="number"
                  value={dailyFocusTarget}
                  onChange={(e) => setDailyFocusTarget(Number(e.target.value))}
                  className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-white outline-none focus:border-cyan-400"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Integrations & API Profiles */}
          <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5 space-y-4 md:col-span-2">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-white/5 pb-3">
              <GitPullRequest className="h-4 w-4 text-emerald-400" />
              GitHub & LeetCode Integrations
            </h3>

            <div className="grid gap-4 sm:grid-cols-2 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">GitHub C++ DSA Repository</label>
                <input
                  type="text"
                  value={githubRepo}
                  onChange={(e) => setGithubRepo(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-white outline-none focus:border-cyan-400 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">LeetCode Profile Username</label>
                <input
                  type="text"
                  value={leetcodeUsername}
                  onChange={(e) => setLeetcodeUsername(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-white outline-none focus:border-cyan-400 font-mono"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/10 pt-5">
          <button
            type="button"
            onClick={handleResetData}
            className="inline-flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-xs font-bold text-red-400 hover:bg-red-500/20 transition"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Reset Local Data
          </button>

          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-6 py-2.5 text-xs font-bold text-slate-950 hover:bg-cyan-400 transition"
          >
            <Save className="h-4 w-4" /> Save Preferences
          </button>
        </div>
      </form>
    </div>
  );
}
