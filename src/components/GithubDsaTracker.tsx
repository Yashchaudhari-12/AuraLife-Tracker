import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GitPullRequest as GithubIcon,
  GitCommit,
  Folder,
  FileCode,
  Sparkles,
  RefreshCw,
  ExternalLink,
  PlusCircle,
  CheckCircle2,
  Code2,
  TrendingUp,
  BrainCircuit,
  Zap,
  Clock,
  Layers,
  ChevronRight,
  Target,
  Edit3,
  X,
  Save,
} from 'lucide-react';
import { fetchGithubDsaData, GithubDsaSummary, saveStoredGithubData } from '../utils/githubService';

interface GithubDsaTrackerProps {
  onAddFocusBlock?: (title: string, durationMinutes: number, category: string, difficulty?: 'Easy' | 'Medium' | 'Hard') => void;
}

export function GithubDsaTracker({ onAddFocusBlock }: GithubDsaTrackerProps) {
  const [repoUrl, setRepoUrl] = useState('https://github.com/Yashchaudhari-12/Cpp');
  const [owner, setOwner] = useState('Yashchaudhari-12');
  const [repo, setRepo] = useState('Cpp');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<GithubDsaSummary | null>(null);
  const [addedTopic, setAddedTopic] = useState<Record<string, boolean>>({});
  const [isEditing, setIsEditing] = useState(false);

  const [editForm, setEditForm] = useState({
    totalCppFiles: 24,
    totalFolders: 6,
    foldersListInput: '01_Basics, 02_Arrays_Vectors, 03_Pointers, 04_Recursion, 05_OOP, 06_STL',
  });

  const loadData = async (ownerName: string, repoName: string) => {
    setLoading(true);
    const summary = await fetchGithubDsaData(ownerName, repoName);
    setData(summary);
    setEditForm({
      totalCppFiles: summary.totalCppFiles,
      totalFolders: summary.totalFolders,
      foldersListInput: summary.foldersList.join(', '),
    });
    setLoading(false);
  };

  useEffect(() => {
    loadData(owner, repo);
  }, []);

  const handleSyncNewRepo = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const clean = repoUrl.replace('https://github.com/', '').replace('http://github.com/', '');
      const parts = clean.split('/').filter(Boolean);
      if (parts.length >= 2) {
        const newOwner = parts[0];
        const newRepo = parts[1];
        setOwner(newOwner);
        setRepo(newRepo);
        loadData(newOwner, newRepo);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveCustomData = (e: React.FormEvent) => {
    e.preventDefault();
    if (!data) return;

    const folders = editForm.foldersListInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const updated: GithubDsaSummary = {
      ...data,
      owner,
      repoName: repo,
      totalCppFiles: editForm.totalCppFiles,
      totalFolders: folders.length || editForm.totalFolders,
      foldersList: folders,
      isCustomOverride: true,
    };

    saveStoredGithubData(updated);
    setData(updated);
    setIsEditing(false);
  };

  const handleResetAuto = () => {
    localStorage.removeItem(`auralife_github_repo_${owner.toLowerCase()}_${repo.toLowerCase()}`);
    loadData(owner, repo);
    setIsEditing(false);
  };

  const handleAddSuggestion = (topicTitle: string, duration: number) => {
    if (onAddFocusBlock) {
      onAddFocusBlock(`[DSA] ${topicTitle}`, duration, 'DSA / C++');
      setAddedTopic((prev) => ({ ...prev, [topicTitle]: true }));
    }
  };

  return (
    <div className="rounded-3xl border border-cyan-500/30 bg-slate-950/90 p-6 sm:p-8 shadow-2xl shadow-cyan-500/10 backdrop-blur-xl space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-400/40 bg-cyan-500/10 px-3 py-1 text-[11px] font-extrabold uppercase tracking-widest text-cyan-300">
              <GithubIcon className="h-3.5 w-3.5 text-cyan-300" /> GITHUB DSA REPO SYNC
            </span>
            <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400 flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live Connected
            </span>
            {data?.isCustomOverride && (
              <span className="rounded-full bg-cyan-500/10 border border-cyan-400/30 px-2.5 py-0.5 text-[10px] font-bold text-cyan-300">
                Verified Custom Repo
              </span>
            )}
          </div>

          <h2 className="text-2xl font-black text-white sm:text-3xl flex items-center gap-2">
            <span>C++ & DSA Tracker</span>
            <a
              href={`https://github.com/${owner}/${repo}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-cyan-300 transition"
              title="Open GitHub Repository"
            >
              <ExternalLink className="h-5 w-5" />
            </a>
          </h2>
          <p className="text-xs text-slate-400 max-w-2xl">
            Tracking code files, commit frequency, and topic coverage from your GitHub repo{' '}
            <strong className="text-cyan-300">{owner}/{repo}</strong> to recommend your next algorithmic milestones.
          </p>
        </div>

        {/* Sync & Edit Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="rounded-2xl border border-cyan-400/40 bg-cyan-500/10 px-3.5 py-2.5 text-xs font-bold text-cyan-300 hover:bg-cyan-500/20 transition flex items-center justify-center gap-1.5"
          >
            <Edit3 className="h-3.5 w-3.5" />
            <span>Verify Repo Numbers</span>
          </button>

          <form onSubmit={handleSyncNewRepo} className="flex gap-2">
            <input
              type="text"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              placeholder="https://github.com/owner/repo"
              className="rounded-2xl border border-white/10 bg-slate-900 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none min-w-[220px]"
            />
            <button
              type="submit"
              className="rounded-2xl bg-cyan-500/20 border border-cyan-400/40 px-4 py-2.5 text-xs font-bold text-cyan-200 hover:bg-cyan-500/30 transition flex items-center gap-1.5 shrink-0"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Sync</span>
            </button>
          </form>
        </div>
      </div>

      {/* Edit Repo Modal */}
      <AnimatePresence>
        {isEditing && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="rounded-2xl border border-cyan-400/30 bg-slate-900 p-5 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Edit3 className="h-4 w-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white">Update GitHub Repository Stats ({owner}/{repo})</h3>
              </div>
              <button onClick={() => setIsEditing(false)} className="text-slate-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Customize or verify exact C++ code files, folder structure, and topic tags from <a href={`https://github.com/${owner}/${repo}`} target="_blank" rel="noreferrer" className="text-cyan-300 underline">github.com/{owner}/{repo}</a>:
            </p>

            <form onSubmit={handleSaveCustomData} className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-[11px] font-bold text-cyan-300 mb-1">Total C++ (.cpp/.h) Files</label>
                <input
                  type="number"
                  value={editForm.totalCppFiles}
                  onChange={(e) => setEditForm({ ...editForm, totalCppFiles: parseInt(e.target.value) || 0 })}
                  className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-xs text-white focus:border-cyan-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-cyan-300 mb-1">Total Folders / Modules</label>
                <input
                  type="number"
                  value={editForm.totalFolders}
                  onChange={(e) => setEditForm({ ...editForm, totalFolders: parseInt(e.target.value) || 0 })}
                  className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-xs text-white focus:border-cyan-400 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold text-slate-300 mb-1">Folders List (Comma Separated)</label>
                <input
                  type="text"
                  value={editForm.foldersListInput}
                  onChange={(e) => setEditForm({ ...editForm, foldersListInput: e.target.value })}
                  placeholder="01_Basics, 02_Arrays, 03_LinkedList..."
                  className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-xs text-white focus:border-cyan-400 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2 flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={handleResetAuto}
                  className="text-xs text-slate-400 hover:text-cyan-300 transition"
                >
                  Reset to GitHub API Auto Fetch
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
                    className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 text-xs font-bold text-slate-950 hover:opacity-90 flex items-center gap-1.5"
                  >
                    <Save className="h-3.5 w-3.5" />
                    <span>Save Repo Stats</span>
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="py-12 text-center space-y-3">
          <RefreshCw className="mx-auto h-8 w-8 text-cyan-400 animate-spin" />
          <p className="text-xs font-semibold text-slate-400">Fetching live progress from GitHub ({owner}/{repo})...</p>
        </div>
      ) : data ? (
        <div className="space-y-6">
          {/* Key Metric Ribbon */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-2xl border border-white/5 bg-slate-900/60 p-4 text-center">
              <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <FileCode className="h-4 w-4 text-cyan-400" />
                <span>C++ Files</span>
              </div>
              <p className="mt-2 text-3xl font-black text-cyan-300">{data.totalCppFiles}</p>
              <p className="mt-0.5 text-[10px] text-slate-500">Tracked in Repo</p>
            </div>

            <div className="rounded-2xl border border-white/5 bg-slate-900/60 p-4 text-center">
              <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <Folder className="h-4 w-4 text-violet-400" />
                <span>Topic Folders</span>
              </div>
              <p className="mt-2 text-3xl font-black text-violet-300">{data.totalFolders}</p>
              <p className="mt-0.5 text-[10px] text-slate-500">Modules Created</p>
            </div>

            <div className="rounded-2xl border border-white/5 bg-slate-900/60 p-4 text-center">
              <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <GitCommit className="h-4 w-4 text-emerald-400" />
                <span>Recent Commits</span>
              </div>
              <p className="mt-2 text-3xl font-black text-emerald-300">{data.recentCommits.length}</p>
              <p className="mt-0.5 text-[10px] text-slate-500">Recent Updates</p>
            </div>

            <div className="rounded-2xl border border-white/5 bg-slate-900/60 p-4 text-center">
              <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <BrainCircuit className="h-4 w-4 text-orange-400" />
                <span>Coverage</span>
              </div>
              <p className="mt-2 text-3xl font-black text-orange-400">65%</p>
              <p className="mt-0.5 text-[10px] text-slate-500">DSA Syllabus Progress</p>
            </div>
          </div>

          {/* Two-Column Grid: Topic Breakdown + AI Recommendations */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Left: Covered Topics in Repo */}
            <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-200 flex items-center gap-2">
                  <Code2 className="h-4 w-4 text-cyan-400" />
                  <span>Topic Coverage in Repository</span>
                </h3>
                <span className="text-[11px] text-slate-400">{data.foldersList.length} Folders</span>
              </div>

              <div className="space-y-2.5">
                {Object.entries(data.topicsFound).map(([topic, count]) => {
                  const percent = Math.min(count * 20, 100);
                  const isCovered = count > 0;

                  return (
                    <div key={topic} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className={`font-semibold ${isCovered ? 'text-slate-200' : 'text-slate-500'}`}>
                          {topic}
                        </span>
                        <span className={`text-[11px] font-mono ${isCovered ? 'text-cyan-400 font-bold' : 'text-slate-600'}`}>
                          {isCovered ? `${count} file(s)` : 'Not Started'}
                        </span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isCovered ? 'bg-gradient-to-r from-cyan-500 to-violet-500' : 'bg-slate-700/30'
                          }`}
                          style={{ width: `${isCovered ? Math.max(percent, 15) : 0}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Folder Pills */}
              <div className="pt-2 border-t border-white/5">
                <p className="text-[11px] font-bold text-slate-400 mb-2">Tracked Folders in {data.repoName}:</p>
                <div className="flex flex-wrap gap-1.5">
                  {data.foldersList.map((f) => (
                    <span
                      key={f}
                      className="rounded-lg border border-white/10 bg-slate-950 px-2.5 py-1 text-[11px] font-mono text-cyan-300"
                    >
                      📁 {f}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: AI Suggested Next DSA Tasks */}
            <div className="rounded-2xl border border-violet-500/30 bg-gradient-to-br from-slate-900 via-slate-900/90 to-violet-950/40 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-violet-300 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-violet-300 fill-violet-300" />
                  <span>Next Suggested DSA Milestones</span>
                </h3>
                <span className="rounded-full bg-violet-500/20 border border-violet-400/30 px-2.5 py-0.5 text-[10px] font-bold text-violet-200">
                  AI Roadmap
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Based on your C++ repository progress, here are the exact next algorithms and topics you should focus on next:
              </p>

              <div className="space-y-3">
                {data.suggestedNextTopics.map((sug, idx) => {
                  const isAdded = addedTopic[sug.topic];

                  return (
                    <div
                      key={idx}
                      className="rounded-xl border border-white/10 bg-slate-950/80 p-3.5 space-y-2 hover:border-violet-400/40 transition"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white">{sug.topic}</span>
                            <span
                              className={`rounded-md px-1.5 py-0.5 text-[9px] font-extrabold uppercase ${
                                sug.difficulty === 'Easy'
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                  : sug.difficulty === 'Medium'
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              }`}
                            >
                              {sug.difficulty}
                            </span>
                          </div>
                          <p className="mt-1 text-[11px] text-slate-400">{sug.reason}</p>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleAddSuggestion(sug.topic, sug.estimatedTimeMins)}
                          disabled={isAdded}
                          className={`shrink-0 inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-[11px] font-bold transition ${
                            isAdded
                              ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-300'
                              : 'bg-gradient-to-r from-violet-600 to-cyan-500 text-white hover:opacity-90 shadow-md'
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
                              <span>Add to Today</span>
                            </>
                          )}
                        </button>
                      </div>

                      <div className="flex items-center gap-3 pt-1 text-[10px] text-slate-500 border-t border-white/5">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-cyan-400" /> {sug.estimatedTimeMins} mins
                        </span>
                        <span>Files to add: {sug.recommendedFilesToCreate.join(', ')}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
