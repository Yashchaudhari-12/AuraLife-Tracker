import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Code2, Cpu, Laptop, BookOpen, Layers, Target } from 'lucide-react';
import { getStoredDailyPriority, saveStoredDailyPriority } from '../utils/auralifeData';

export type DailyPriority = 'DSA' | 'LeetCode' | 'AuraLife Development' | 'College Revision' | 'Mixed';

interface PriorityOption {
  id: DailyPriority;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  badge: string;
  recommendationHint: string;
}

export const PRIORITY_OPTIONS: PriorityOption[] = [
  {
    id: 'DSA',
    label: 'DSA Sheet',
    icon: Code2,
    color: 'cyan',
    badge: 'A2Z Sheet',
    recommendationHint: 'Recommends A2Z Sheet problems, sliding window, DP & pattern revision',
  },
  {
    id: 'LeetCode',
    label: 'LeetCode',
    icon: Cpu,
    color: 'amber',
    badge: 'Daily Challenge',
    recommendationHint: 'Recommends Daily Challenge, contest review & medium/hard problems',
  },
  {
    id: 'AuraLife Development',
    label: 'AuraLife Dev',
    icon: Laptop,
    color: 'violet',
    badge: 'Applet Build',
    recommendationHint: 'Recommends feature development, UI polish, bug fixes & system architecture',
  },
  {
    id: 'College Revision',
    label: 'College Revision',
    icon: BookOpen,
    color: 'emerald',
    badge: 'Syllabus Focus',
    recommendationHint: 'Recommends OOP, COA, EMMD, lab manuals & past exam questions',
  },
  {
    id: 'Mixed',
    label: 'Mixed Sprint',
    icon: Layers,
    color: 'indigo',
    badge: 'Balanced OS',
    recommendationHint: 'Balanced mix of DSA, applet building, and college subject revision',
  },
];

export function DailyPrioritySelector() {
  const [priority, setPriority] = useState<DailyPriority>(() => getStoredDailyPriority());

  useEffect(() => {
    const handleUpdate = () => {
      setPriority(getStoredDailyPriority());
    };
    window.addEventListener('auralife_priority_updated', handleUpdate);
    return () => window.removeEventListener('auralife_priority_updated', handleUpdate);
  }, []);

  const handleSelect = (p: DailyPriority) => {
    setPriority(p);
    saveStoredDailyPriority(p);
  };

  const activeOption = PRIORITY_OPTIONS.find((o) => o.id === priority) || PRIORITY_OPTIONS[0];

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/80 p-4 shadow-xl backdrop-blur-xl space-y-3">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4 text-cyan-400" />
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-cyan-400">
            Today's Priority
          </h3>
        </div>
        <span className="text-[11px] text-slate-400 font-mono">
          Focus: <strong className="text-white">{activeOption.label}</strong>
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
        {PRIORITY_OPTIONS.map((opt) => {
          const isSelected = priority === opt.id;
          const Icon = opt.icon;

          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => handleSelect(opt.id)}
              className={`relative flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all ${
                isSelected
                  ? 'border-cyan-500/40 bg-slate-900 shadow-md text-white'
                  : 'border-white/5 bg-slate-900/40 text-slate-400 hover:border-white/20 hover:text-white'
              }`}
            >
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-lg shrink-0 ${
                  isSelected ? 'bg-cyan-500 text-slate-950 font-bold' : 'bg-white/5 text-slate-300'
                }`}
              >
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <span className="text-xs font-bold block truncate">{opt.label}</span>
                <span className="text-[10px] text-slate-400 block truncate">{opt.badge}</span>
              </div>
            </button>
          );
        })}
      </div>

      <div className="rounded-xl border border-white/5 bg-slate-900/60 px-3 py-2 text-[11px] text-slate-300 flex items-center gap-2">
        <span className="text-cyan-400 font-bold shrink-0">✔ Adapting Engine:</span>
        <span className="truncate">{activeOption.recommendationHint}</span>
      </div>
    </div>
  );
}
