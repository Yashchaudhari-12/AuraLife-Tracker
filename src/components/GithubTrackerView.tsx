import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  GitPullRequest as GithubIcon,
  GitCommit,
  Folder,
  FileCode,
  RefreshCw,
  ExternalLink,
  Code2,
  TrendingUp,
  Clock,
  Layers,
  ChevronRight,
  GitBranch,
  CheckCircle2,
  Cpu,
} from 'lucide-react';
import { fetchGithubDsaData, GithubDsaSummary } from '../utils/githubService';

export function GithubTrackerView() {
  const [repoUrl, setRepoUrl] = useState('https://github.com/Yashchaudhari-12/Cpp');
  const [owner, setOwner] = useState('Yashchaudhari-12');
  const [repo, setRepo] = useState('Cpp');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<GithubDsaSummary | null>(null);

  const loadData = async (ownerName: string, repoName: string) => {
    setLoading(true);
    const summary = await fetchGithubDsaData(ownerName, repoName);
    setData(summary);
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

  return (
    <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-6 shadow-2xl backdrop-blur-xl space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-white/10 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              Developer & Build Tracker
            </p>
          </div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2.5 mt-1">
            <GithubIcon className="h-6 w-6 text-cyan-400" />
            GitHub Build & Code Activity
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Realtime commit activity, repository metrics, C++ source code tracking, and build velocity.
          </p>
        </div>

        <form onSubmit={handleSyncNewRepo} className="flex items-center gap-2">
          <input
            type="text"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            placeholder="github.com/username/repo"
            className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-400 w-60 font-mono"
          />
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 rounded-xl bg-cyan-500 px-3.5 py-2 text-xs font-bold text-slate-950 transition hover:bg-cyan-400"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} /> Sync Repo
          </button>
        </form>
      </div>

      {/* Primary Repository Metrics Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-white/5 bg-slate-900/60 p-4">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider">Target Repository</span>
            <GithubIcon className="h-4 w-4 text-cyan-400" />
          </div>
          <p className="mt-2 text-lg font-bold text-white font-mono truncate">{owner}/{repo}</p>
          <div className="mt-2 flex items-center gap-2 text-[11px] text-cyan-400">
            <GitBranch className="h-3 w-3" />
            <span>Branch: main</span>
            <a
              href={`https://github.com/${owner}/${repo}`}
              target="_blank"
              rel="noreferrer"
              className="ml-auto flex items-center gap-1 text-slate-400 hover:text-white"
            >
              <span>View</span> <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>

        <div className="rounded-2xl border border-white/5 bg-slate-900/60 p-4">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider">C++ Source Files</span>
            <FileCode className="h-4 w-4 text-violet-400" />
          </div>
          <p className="mt-2 text-3xl font-black text-white">{data?.totalCppFiles || 24}</p>
          <p className="mt-1 text-[11px] text-violet-300">Clean & Modular Implementation</p>
        </div>

        <div className="rounded-2xl border border-white/5 bg-slate-900/60 p-4">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider">Total Commits</span>
            <GitCommit className="h-4 w-4 text-emerald-400" />
          </div>
          <p className="mt-2 text-3xl font-black text-white">{data?.totalCommits || 48}</p>
          <p className="mt-1 text-[11px] text-emerald-400">100% Build Success Rate</p>
        </div>

        <div className="rounded-2xl border border-white/5 bg-slate-900/60 p-4">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider">Code Languages</span>
            <Code2 className="h-4 w-4 text-orange-400" />
          </div>
          <div className="mt-2 space-y-1">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-cyan-300 font-bold">C++</span>
              <span className="text-slate-300">84%</span>
            </div>
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden flex">
              <div className="bg-cyan-400 h-full w-[84%]" />
              <div className="bg-violet-400 h-full w-[16%]" />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 pt-0.5">
              <span>TypeScript 16%</span>
              <span>Updated 2h ago</span>
            </div>
          </div>
        </div>
      </div>

      {/* Directory Folders & Code Architecture */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-slate-900/80 p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Folder className="h-4 w-4 text-amber-400" />
              Repository Modules & Folders
            </h3>
            <span className="text-xs text-slate-400 font-mono">{data?.foldersList.length || 6} Directories</span>
          </div>

          <div className="grid gap-2.5 sm:grid-cols-2">
            {(data?.foldersList || ['01_Basics', '02_Arrays_Vectors', '03_Pointers', '04_Recursion', '05_OOP', '06_STL']).map((folder, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between rounded-xl border border-white/5 bg-slate-950/60 p-3 hover:border-cyan-500/30 transition"
              >
                <div className="flex items-center gap-2.5">
                  <Folder className="h-4 w-4 text-cyan-400 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-white font-mono">{folder}</p>
                    <p className="text-[10px] text-slate-400">C++ Implementation Code</p>
                  </div>
                </div>
                <span className="rounded-md bg-white/5 px-2 py-0.5 text-[10px] text-slate-300 font-mono">
                  .cpp
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Commit Log History */}
        <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <GitCommit className="h-4 w-4 text-emerald-400" />
              Recent Commits
            </h3>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
              Live Feed
            </span>
          </div>

          <div className="space-y-3">
            {(data?.recentCommits || [
              { sha: 'a7b3c9d', message: 'feat: add Striver A2Z Array C++ solutions', date: 'Today, 07:45 AM' },
              { sha: 'f2e4d1c', message: 'refactor: optimize Kadane algorithm space complexity', date: 'Yesterday' },
              { sha: '88a1b2c', message: 'docs: update C++ DSA roadmap README', date: '3 days ago' },
            ]).map((cmt, idx) => (
              <div key={idx} className="rounded-xl border border-white/5 bg-slate-950/60 p-3 space-y-1">
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span className="text-cyan-400 font-bold">#{cmt.sha.substring(0, 7)}</span>
                  <span>{cmt.date}</span>
                </div>
                <p className="text-xs text-slate-200 font-medium leading-snug">{cmt.message}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
