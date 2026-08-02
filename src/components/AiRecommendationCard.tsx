import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, CheckCircle, Clock, ArrowUpRight, Flame, Layers } from 'lucide-react';
import { generateAiRecommendation } from '../utils/auralifeData';

interface AiRecommendationCardProps {
  onApplyRecommendation: (tasks: Array<{ text: string; estimatedMinutes: number; category: string }>) => void;
}

export function AiRecommendationCard({ onApplyRecommendation }: AiRecommendationCardProps) {
  const [recommendation] = useState(() => generateAiRecommendation());
  const [applied, setApplied] = useState(false);

  const handleApply = () => {
    onApplyRecommendation(recommendation.tasks);
    setApplied(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative overflow-hidden rounded-3xl border border-violet-500/30 bg-slate-950/90 p-6 shadow-2xl shadow-violet-500/10 backdrop-blur-xl"
    >
      <div className="absolute right-0 top-0 h-48 w-48 bg-gradient-to-br from-violet-600/20 via-cyan-500/10 to-transparent blur-3xl pointer-events-none" />

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-3 flex-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-400/40 bg-gradient-to-r from-violet-500/20 to-cyan-500/20 px-3 py-1 text-xs font-extrabold uppercase tracking-widest text-violet-300">
              <Sparkles className="h-3.5 w-3.5 fill-violet-300 text-violet-300" /> AURA RECOMMENDATION
            </span>
            <span className="rounded-full bg-violet-500/10 border border-violet-500/20 px-2.5 py-0.5 text-xs font-semibold text-violet-400">
              Priority: {recommendation.priority}
            </span>
          </div>

          <h2 className="text-xl font-bold text-white leading-snug">
            {recommendation.contextSummary}
          </h2>

          <div className="mt-4 grid gap-2 sm:grid-cols-3">
            {recommendation.tasks.map((task, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2.5 rounded-2xl border border-white/5 bg-slate-900/80 p-3 text-xs text-slate-200 transition hover:border-violet-400/30"
              >
                <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-violet-500/20 text-[10px] font-bold text-violet-300">
                  {idx + 1}
                </div>
                <div>
                  <p className="font-semibold text-slate-100">{task.text}</p>
                  <p className="mt-1 text-[11px] text-slate-400">
                    {task.category} • {task.estimatedMinutes} mins
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end gap-3 justify-between min-w-[180px]">
          <div className="text-left lg:text-right text-xs text-slate-400">
            <p className="uppercase tracking-wider text-[10px] text-slate-500">Est. Total Time</p>
            <p className="text-2xl font-black text-white">{recommendation.totalEstimatedMinutes} mins</p>
          </div>

          <button
            type="button"
            onClick={handleApply}
            disabled={applied}
            className={`w-full inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3.5 text-xs font-bold transition shadow-lg ${
              applied
                ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 cursor-default'
                : 'bg-gradient-to-r from-violet-600 to-cyan-500 text-white hover:from-violet-500 hover:to-cyan-400 shadow-violet-500/20 active:scale-95'
            }`}
          >
            {applied ? (
              <>
                <CheckCircle className="h-4 w-4 text-emerald-400" />
                <span>Added to Focus Blocks</span>
              </>
            ) : (
              <>
                <Layers className="h-4 w-4" />
                <span>Accept & Add to Today</span>
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
