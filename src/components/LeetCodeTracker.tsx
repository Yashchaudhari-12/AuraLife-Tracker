import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Code2,
  Trophy,
  Target,
  Zap,
  ExternalLink,
  RefreshCw,
  CheckCircle2,
  TrendingUp,
  PlusCircle,
  Flame,
  Award,
  Sparkles,
  BrainCircuit,
  Search,
  Edit3,
  X,
  Save,
} from 'lucide-react';
import { fetchLeetCodeProfile, LeetCodeStats, saveStoredLeetCodeStats } from '../utils/leetcodeService';

interface LeetCodeTrackerProps {
  onAddFocusBlock?: (title: string, durationMinutes: number, category: string, difficulty?: 'Easy' | 'Medium' | 'Hard') => void;
}

export function LeetCodeTracker({ onAddFocusBlock }: LeetCodeTrackerProps) {
  const [usernameInput, setUsernameInput] = useState('YashChaudhari12');
  const [activeUsername, setActiveUsername] = useState('YashChaudhari12');
  const [stats, setStats] = useState<LeetCodeStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [addedTasks, setAddedTasks] = useState<Record<string, boolean>>({});
  const [isEditing, setIsEditing] = useState(false);

  // Form states for manual sync
  const [editForm, setEditForm] = useState({
    easySolved: 58,
    mediumSolved: 48,
    hardSolved: 9,
    acceptanceRate: 64,
    ranking: 184200,
    reputation: 75,
  });

  const loadProfile = async (user: string) => {
    setLoading(true);
    const data = await fetchLeetCodeProfile(user);
    setStats(data);
    setEditForm({
      easySolved: data.easySolved,
      mediumSolved: data.mediumSolved,
      hardSolved: data.hardSolved,
      acceptanceRate: data.acceptanceRate,
      ranking: data.ranking,
      reputation: data.reputation,
    });
    setLoading(false);
  };

  useEffect(() => {
    loadProfile(activeUsername);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (usernameInput.trim()) {
      setActiveUsername(usernameInput.trim());
      loadProfile(usernameInput.trim());
    }
  };

  const handleSaveCustomStats = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stats) return;

    const totalSolved = editForm.easySolved + editForm.mediumSolved + editForm.hardSolved;
    const updated: LeetCodeStats = {
      ...stats,
      username: activeUsername,
      totalSolved,
      easySolved: editForm.easySolved,
      mediumSolved: editForm.mediumSolved,
      hardSolved: editForm.hardSolved,
      acceptanceRate: editForm.acceptanceRate,
      ranking: editForm.ranking,
      reputation: editForm.reputation,
      isCustomOverride: true,
    };

    saveStoredLeetCodeStats(updated);
    setStats(updated);
    setIsEditing(false);
  };

  const handleResetAuto = () => {
    localStorage.removeItem(`auralife_leetcode_stats_${activeUsername.toLowerCase()}`);
    loadProfile(activeUsername);
    setIsEditing(false);
  };

  const handleAddTask = (title: string, durationMins: number, difficulty: 'Easy' | 'Medium' | 'Hard') => {
    if (onAddFocusBlock) {
      onAddFocusBlock(`[LeetCode] ${title}`, durationMins, 'LeetCode', difficulty);
      setAddedTasks((prev) => ({ ...prev, [title]: true }));
    }
  };

  const dailyRecommendations = [
    {
      title: '3 Sum & 2 Pointer Strategy',
      slug: '3sum',
      difficulty: 'Medium' as const,
      estimatedMinutes: 45,
      category: 'Arrays & Two Pointers',
    },
    {
      title: 'Course Schedule (Graph Cycle Detection)',
      slug: 'course-schedule',
      difficulty: 'Medium' as const,
      estimatedMinutes: 50,
      category: 'Graphs & Topological Sort',
    },
    {
      title: 'Coin Change (Dynamic Programming)',
      slug: 'coin-change',
      difficulty: 'Hard' as const,
      estimatedMinutes: 60,
      category: 'Dynamic Programming',
    },
  ];

  return (
    <div className="rounded-3xl border border-amber-500/30 bg-slate-950/90 p-6 sm:p-8 shadow-2xl shadow-amber-500/10 backdrop-blur-xl space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/40 bg-amber-500/10 px-3 py-1 text-[11px] font-extrabold uppercase tracking-widest text-amber-300">
              <Code2 className="h-3.5 w-3.5 text-amber-300" /> LEETCODE PROFILE INTEGRATION
            </span>
            <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400 flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> Profile Synced
            </span>
            {stats?.isCustomOverride && (
              <span className="rounded-full bg-cyan-500/10 border border-cyan-400/30 px-2.5 py-0.5 text-[10px] font-bold text-cyan-300">
                Verified Custom Numbers
              </span>
            )}
          </div>

          <h2 className="text-2xl font-black text-white sm:text-3xl flex items-center gap-2">
            <span>LeetCode Analytics & Problem Hub</span>
            <a
              href={`https://leetcode.com/u/${activeUsername}/`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-amber-300 transition"
              title="Open LeetCode Profile"
            >
              <ExternalLink className="h-5 w-5" />
            </a>
          </h2>
          <p className="text-xs text-slate-400 max-w-2xl">
            Live metrics, question difficulty split, ranking, and AI target problem recommendations for{' '}
            <strong className="text-amber-300">@{activeUsername}</strong>.
          </p>
        </div>

        {/* Username Search + Edit Controls */}
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="rounded-2xl border border-amber-400/40 bg-amber-500/10 px-3.5 py-2.5 text-xs font-bold text-amber-300 hover:bg-amber-500/20 transition flex items-center justify-center gap-1.5"
          >
            <Edit3 className="h-3.5 w-3.5" />
            <span>Set Exact Numbers</span>
          </button>

          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1 min-w-[180px]">
              <Search className="absolute left-3 top-3 h-3.5 w-3.5 text-slate-500" />
              <input
                type="text"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                placeholder="LeetCode username..."
                className="w-full rounded-2xl border border-white/10 bg-slate-900 pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="rounded-2xl bg-amber-500/20 border border-amber-400/40 px-3.5 py-2.5 text-xs font-bold text-amber-200 hover:bg-amber-500/30 transition flex items-center gap-1 shrink-0"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Fetch</span>
            </button>
          </form>
        </div>
      </div>

      {/* Edit Stats Modal */}
      <AnimatePresence>
        {isEditing && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="rounded-2xl border border-amber-400/30 bg-slate-900 p-5 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Edit3 className="h-4 w-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white">Update Verified LeetCode Statistics (@{activeUsername})</h3>
              </div>
              <button
                onClick={() => setIsEditing(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Enter your exact solved numbers from <a href={`https://leetcode.com/u/${activeUsername}/`} target="_blank" rel="noreferrer" className="text-amber-300 underline">leetcode.com/u/{activeUsername}/</a> to keep your tracker 100% accurate:
            </p>

            <form onSubmit={handleSaveCustomStats} className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-[11px] font-bold text-emerald-400 mb-1">Easy Solved</label>
                <input
                  type="number"
                  value={editForm.easySolved}
                  onChange={(e) => setEditForm({ ...editForm, easySolved: parseInt(e.target.value) || 0 })}
                  className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-xs text-white focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-amber-400 mb-1">Medium Solved</label>
                <input
                  type="number"
                  value={editForm.mediumSolved}
                  onChange={(e) => setEditForm({ ...editForm, mediumSolved: parseInt(e.target.value) || 0 })}
                  className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-xs text-white focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-rose-400 mb-1">Hard Solved</label>
                <input
                  type="number"
                  value={editForm.hardSolved}
                  onChange={(e) => setEditForm({ ...editForm, hardSolved: parseInt(e.target.value) || 0 })}
                  className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-xs text-white focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">Acceptance Rate (%)</label>
                <input
                  type="number"
                  value={editForm.acceptanceRate}
                  onChange={(e) => setEditForm({ ...editForm, acceptanceRate: parseFloat(e.target.value) || 0 })}
                  className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-xs text-white focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">Global Ranking</label>
                <input
                  type="number"
                  value={editForm.ranking}
                  onChange={(e) => setEditForm({ ...editForm, ranking: parseInt(e.target.value) || 0 })}
                  className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-xs text-white focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">Reputation Pts</label>
                <input
                  type="number"
                  value={editForm.reputation}
                  onChange={(e) => setEditForm({ ...editForm, reputation: parseInt(e.target.value) || 0 })}
                  className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-xs text-white focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-3 flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={handleResetAuto}
                  className="text-xs text-slate-400 hover:text-amber-300 transition"
                >
                  Reset to Auto API
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="rounded-xl border border-white/10 px-4 py-2 text-xs text-slate-300 hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2 text-xs font-bold text-slate-950 hover:opacity-90 flex items-center gap-1.5"
                  >
                    <Save className="h-3.5 w-3.5" />
                    <span>Save Exact Stats</span>
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="py-12 text-center space-y-3">
          <RefreshCw className="mx-auto h-8 w-8 text-amber-400 animate-spin" />
          <p className="text-xs font-semibold text-slate-400">Fetching LeetCode stats for @{activeUsername}...</p>
        </div>
      ) : stats ? (
        <div className="space-y-6">
          {/* Main Stats Ribbon */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-2xl border border-white/5 bg-slate-900/60 p-4 text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 h-16 w-16 bg-amber-500/10 rounded-full blur-xl pointer-events-none" />
              <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <Trophy className="h-4 w-4 text-amber-400" />
                <span>Total Solved</span>
              </div>
              <p className="mt-2 text-3xl font-black text-amber-300">{stats.totalSolved}</p>
              <p className="mt-0.5 text-[10px] text-slate-500">Out of {stats.totalQuestions} questions</p>
            </div>

            <div className="rounded-2xl border border-white/5 bg-slate-900/60 p-4 text-center">
              <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <TrendingUp className="h-4 w-4 text-cyan-400" />
                <span>Global Rank</span>
              </div>
              <p className="mt-2 text-3xl font-black text-cyan-300">#{stats.ranking.toLocaleString()}</p>
              <p className="mt-0.5 text-[10px] text-slate-500">Top ~12% Globally</p>
            </div>

            <div className="rounded-2xl border border-white/5 bg-slate-900/60 p-4 text-center">
              <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <Target className="h-4 w-4 text-emerald-400" />
                <span>Acceptance</span>
              </div>
              <p className="mt-2 text-3xl font-black text-emerald-300">{stats.acceptanceRate}%</p>
              <p className="mt-0.5 text-[10px] text-slate-500">Accuracy Score</p>
            </div>

            <div className="rounded-2xl border border-white/5 bg-slate-900/60 p-4 text-center">
              <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <Award className="h-4 w-4 text-violet-400" />
                <span>Reputation</span>
              </div>
              <p className="mt-2 text-3xl font-black text-violet-300">{stats.reputation}</p>
              <p className="mt-0.5 text-[10px] text-slate-500">{stats.contributionPoints} Contribution Pts</p>
            </div>
          </div>

          {/* Difficulty Distribution Bars */}
          <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-5 space-y-4">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-300 flex items-center justify-between">
              <span>Problem Difficulty Breakdown</span>
              <span className="text-[11px] font-normal text-slate-400">Targeting Balanced Mastery</span>
            </h3>

            <div className="grid gap-4 sm:grid-cols-3">
              {/* Easy */}
              <div className="rounded-xl border border-emerald-500/20 bg-slate-950 p-3.5 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-extrabold text-emerald-400">Easy</span>
                  <span className="font-mono text-slate-300 font-bold">{stats.easySolved} / {stats.totalEasy}</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-emerald-400 rounded-full"
                    style={{ width: `${Math.min((stats.easySolved / 150) * 100, 100)}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-500">Solid foundational speed</p>
              </div>

              {/* Medium */}
              <div className="rounded-xl border border-amber-500/20 bg-slate-950 p-3.5 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-extrabold text-amber-400">Medium</span>
                  <span className="font-mono text-slate-300 font-bold">{stats.mediumSolved} / {stats.totalMedium}</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full"
                    style={{ width: `${Math.min((stats.mediumSolved / 150) * 100, 100)}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-500">Primary interview focus zone</p>
              </div>

              {/* Hard */}
              <div className="rounded-xl border border-rose-500/20 bg-slate-950 p-3.5 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-extrabold text-rose-400">Hard</span>
                  <span className="font-mono text-slate-300 font-bold">{stats.hardSolved} / {stats.totalHard}</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-rose-400 rounded-full"
                    style={{ width: `${Math.min((stats.hardSolved / 50) * 100, 100)}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-500">Advanced competitive edge</p>
              </div>
            </div>
          </div>

          {/* Bottom Grid: Daily Recommended LeetCode Goals + Recent Submissions */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Daily Recommended LeetCode Tasks */}
            <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-br from-slate-900 via-slate-900/90 to-amber-950/30 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-amber-300 flex items-center gap-2">
                  <BrainCircuit className="h-4 w-4 text-amber-400" />
                  <span>Recommended LeetCode Practice</span>
                </h3>
                <span className="rounded-full bg-amber-500/20 border border-amber-400/30 px-2.5 py-0.5 text-[10px] font-bold text-amber-200">
                  Target Today
                </span>
              </div>

              <div className="space-y-3">
                {dailyRecommendations.map((rec) => {
                  const isAdded = addedTasks[rec.title];

                  return (
                    <div
                      key={rec.title}
                      className="rounded-xl border border-white/10 bg-slate-950/80 p-3.5 space-y-2 hover:border-amber-400/40 transition"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <a
                              href={`https://leetcode.com/problems/${rec.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs font-bold text-white hover:text-amber-300 transition flex items-center gap-1"
                            >
                              <span>{rec.title}</span>
                              <ExternalLink className="h-3 w-3 text-slate-500" />
                            </a>
                            <span
                              className={`rounded-md px-1.5 py-0.5 text-[9px] font-extrabold uppercase ${
                                rec.difficulty === 'Medium'
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              }`}
                            >
                              {rec.difficulty}
                            </span>
                          </div>
                          <p className="mt-1 text-[11px] text-slate-400">{rec.category}</p>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleAddTask(rec.title, rec.estimatedMinutes, rec.difficulty)}
                          disabled={isAdded}
                          className={`shrink-0 inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-[11px] font-bold transition ${
                            isAdded
                              ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-300'
                              : 'bg-gradient-to-r from-amber-500 to-violet-600 text-slate-950 font-black hover:opacity-90 shadow-md'
                          }`}
                        >
                          {isAdded ? (
                            <>
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              <span>Added</span>
                            </>
                          ) : (
                            <>
                              <PlusCircle className="h-3.5 w-3.5" />
                              <span>Add to Focus</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent Submissions Activity */}
            <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-5 space-y-4">
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-200 flex items-center gap-2">
                <Zap className="h-4 w-4 text-cyan-400" />
                <span>Recent Accepted Submissions</span>
              </h3>

              <div className="space-y-2.5">
                {stats.recentSubmission && stats.recentSubmission.length > 0 ? (
                  stats.recentSubmission.map((sub, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-xl border border-white/5 bg-slate-950 p-3 text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                        <div>
                          <a
                            href={`https://leetcode.com/problems/${sub.titleSlug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-bold text-white hover:text-amber-300 transition"
                          >
                            {sub.title}
                          </a>
                          <p className="text-[10px] text-slate-500">{sub.timestamp}</p>
                        </div>
                      </div>

                      <span className="rounded-lg bg-slate-800 px-2 py-1 text-[10px] font-mono font-bold text-cyan-300 uppercase">
                        {sub.lang}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 py-4 text-center">No recent submissions logged.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

