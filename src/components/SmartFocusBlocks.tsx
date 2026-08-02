import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus, Check, Trash2, Sparkles, Clock, Edit3, X, Save } from 'lucide-react';
import { TimeBlock } from '../plannerStorage';

interface SmartFocusBlocksProps {
  blocks: TimeBlock[];
  onAddBlock: (
    title: string,
    durationMinutes: number,
    category: string,
    difficulty?: 'Easy' | 'Medium' | 'Hard',
    startTime?: string,
    endTime?: string
  ) => void;
  onEditBlock?: (
    id: string,
    updates: { title?: string; durationMinutes?: number; category?: string; startTime?: string; endTime?: string }
  ) => void;
  onToggleBlock: (id: string) => void;
  onDeleteBlock: (id: string) => void;
}

const AI_SUGGESTED_BLOCKS = [
  {
    id: 'sug-morning',
    title: 'Morning Focus: DSA & Concept Practice',
    durationMinutes: 90,
    category: 'DSA',
    difficulty: 'Hard' as const,
    startTime: '06:45',
    endTime: '08:15',
    subtasks: ['06:00 Wakeup -> 45m Shower/Brush', '06:45-08:15 Deep Focus', '08:15 Commute'],
  },
  {
    id: 'sug-1',
    title: 'Solve Dutch National Flag & Review Kadane',
    durationMinutes: 90,
    category: 'DSA',
    difficulty: 'Medium' as const,
    startTime: '17:30',
    endTime: '19:00',
    subtasks: ['Sort Colors (LeetCode 75)', 'Maximum Subarray Variant'],
  },
  {
    id: 'sug-2',
    title: 'A2Z Sheet: Sliding Window & Two Pointers',
    durationMinutes: 60,
    category: 'Coding',
    difficulty: 'Medium' as const,
    startTime: '19:30',
    endTime: '20:30',
    subtasks: ['Longest Substring Without Repeating Chars', 'Fruit Into Baskets'],
  },
  {
    id: 'sug-3',
    title: 'COA & OOP Class Notes Revision Sprint',
    durationMinutes: 45,
    category: 'College',
    difficulty: 'Easy' as const,
    startTime: '21:00',
    endTime: '21:45',
    subtasks: ['Pipeline Hazards Review', 'Virtual Functions & Polymorphism'],
  },
];

export function SmartFocusBlocks({
  blocks,
  onAddBlock,
  onEditBlock,
  onToggleBlock,
  onDeleteBlock,
}: SmartFocusBlocksProps) {
  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState(90);
  const [category, setCategory] = useState('Focus');
  const [startTime, setStartTime] = useState('06:45');
  const [endTime, setEndTime] = useState('08:15');
  const [addedSugIds, setAddedSugIds] = useState<Record<string, boolean>>({});

  // Editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDuration, setEditDuration] = useState(45);
  const [editCategory, setEditCategory] = useState('');
  const [editStart, setEditStart] = useState('');
  const [editEnd, setEditEnd] = useState('');

  const handleCustomAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAddBlock(
      title.trim(),
      duration,
      category.trim() || 'Focus',
      undefined,
      startTime || undefined,
      endTime || undefined
    );
    setTitle('');
    setDuration(90);
    setCategory('Focus');
  };

  const handleAddSuggested = (sug: (typeof AI_SUGGESTED_BLOCKS)[0]) => {
    onAddBlock(sug.title, sug.durationMinutes, sug.category, sug.difficulty, sug.startTime, sug.endTime);
    setAddedSugIds((prev) => ({ ...prev, [sug.id]: true }));
  };

  const startEditingBlock = (block: TimeBlock) => {
    setEditingId(block.id);
    setEditTitle(block.title);
    setEditDuration(block.durationMinutes);
    setEditCategory(block.category);
    setEditStart(block.startTime || '');
    setEditEnd(block.endTime || '');
  };

  const saveEditBlock = (id: string) => {
    if (onEditBlock) {
      onEditBlock(id, {
        title: editTitle.trim(),
        durationMinutes: editDuration,
        category: editCategory.trim(),
        startTime: editStart || undefined,
        endTime: editEnd || undefined,
      });
    }
    setEditingId(null);
  };

  return (
    <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-6 shadow-2xl backdrop-blur-xl space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">
          Smart Execution
        </p>
        <h2 className="text-2xl font-bold text-white">Focus Blocks Engine</h2>
        <p className="mt-1 text-xs text-slate-400">
          Structured deep work sessions aligned to your goals and class breaks.
        </p>
      </div>

      {/* AI Suggested Focus Blocks Carousel / Grid */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-violet-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-violet-300">
            Suggested Focus Blocks
          </h3>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {AI_SUGGESTED_BLOCKS.map((sug) => {
            const isAdded = addedSugIds[sug.id];
            return (
              <div
                key={sug.id}
                className="flex flex-col justify-between rounded-2xl border border-violet-500/20 bg-slate-900/80 p-3.5 transition hover:border-violet-400/40"
              >
                <div>
                  <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400">
                    <span className="rounded-md bg-violet-500/20 px-2 py-0.5 text-violet-300">
                      {sug.category}
                    </span>
                    <span className="text-cyan-300 font-mono font-bold">{sug.startTime}–{sug.endTime}</span>
                  </div>

                  <h4 className="mt-2 text-xs font-bold text-white leading-snug">{sug.title}</h4>

                  <ul className="mt-2 space-y-1 text-[10px] text-slate-400">
                    {sug.subtasks.map((st, i) => (
                      <li key={i} className="flex items-center gap-1">
                        <span className="h-1 w-1 rounded-full bg-cyan-400 shrink-0" />
                        <span>{st}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-3 border-t border-white/5 pt-2.5">
                  <button
                    type="button"
                    onClick={() => handleAddSuggested(sug)}
                    disabled={isAdded}
                    className={`w-full rounded-xl py-1.5 px-2.5 text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                      isAdded
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-violet-600 text-white hover:bg-violet-500 shadow-md'
                    }`}
                  >
                    {isAdded ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-400" /> Added to Today
                      </>
                    ) : (
                      <>
                        <Plus className="h-3.5 w-3.5" /> Add to Today
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Form: Custom Focus Block */}
      <form onSubmit={handleCustomAdd} className="rounded-2xl border border-white/10 bg-slate-900/60 p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Create Custom Focus Block
          </h3>
          <span className="text-[10px] text-cyan-400 font-medium">Specify Start & End Times</span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title (e.g. Morning DSA Sprint)"
            className="rounded-xl border border-white/10 bg-slate-950/80 px-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-400 lg:col-span-2"
          />
          <input
            type="text"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            placeholder="Start (e.g. 06:45)"
            className="rounded-xl border border-white/10 bg-slate-950/80 px-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-400 font-mono"
          />
          <input
            type="text"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            placeholder="End (e.g. 08:15)"
            className="rounded-xl border border-white/10 bg-slate-950/80 px-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-400 font-mono"
          />
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Category (e.g. DSA)"
            className="rounded-xl border border-white/10 bg-slate-950/80 px-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-400"
          />
        </div>
        <div className="flex justify-between items-center text-[11px] text-slate-400">
          <span>Tip: Default morning focus block runs 06:45–08:15 AM after 06:00 AM wakeup routine.</span>
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 rounded-xl bg-cyan-500 px-5 py-2 text-xs font-bold text-slate-950 transition hover:bg-cyan-400"
          >
            <Plus className="h-4 w-4" /> Add Focus Block
          </button>
        </div>
      </form>

      {/* Active Focus Blocks List */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
          Today's Active Focus Blocks ({blocks.length})
        </h3>

        <AnimatePresence mode="popLayout">
          {blocks.length > 0 ? (
            <div className="space-y-2">
              {blocks.map((block) => {
                const isEditingThis = editingId === block.id;

                if (isEditingThis) {
                  return (
                    <motion.div
                      key={block.id}
                      layout
                      className="rounded-2xl border border-cyan-500/40 bg-slate-900 p-4 space-y-3 shadow-xl"
                    >
                      <div className="flex items-center justify-between text-xs font-bold text-cyan-300">
                        <span>Edit Focus Block Timings & Details</span>
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="text-slate-400 hover:text-white"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          placeholder="Title"
                          className="rounded-xl border border-white/10 bg-slate-950 p-2 text-xs text-white outline-none focus:border-cyan-400 lg:col-span-2"
                        />
                        <input
                          type="text"
                          value={editStart}
                          onChange={(e) => setEditStart(e.target.value)}
                          placeholder="Start Time (06:45)"
                          className="rounded-xl border border-white/10 bg-slate-950 p-2 text-xs text-white outline-none focus:border-cyan-400 font-mono"
                        />
                        <input
                          type="text"
                          value={editEnd}
                          onChange={(e) => setEditEnd(e.target.value)}
                          placeholder="End Time (08:15)"
                          className="rounded-xl border border-white/10 bg-slate-950 p-2 text-xs text-white outline-none focus:border-cyan-400 font-mono"
                        />
                        <input
                          type="number"
                          value={editDuration}
                          onChange={(e) => setEditDuration(Number(e.target.value))}
                          placeholder="Duration (mins)"
                          className="rounded-xl border border-white/10 bg-slate-950 p-2 text-xs text-white outline-none focus:border-cyan-400"
                        />
                      </div>

                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="rounded-xl border border-white/10 bg-slate-950 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => saveEditBlock(block.id)}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-cyan-500 px-4 py-1.5 text-xs font-bold text-slate-950 hover:bg-cyan-400"
                        >
                          <Save className="h-3.5 w-3.5" /> Save Changes
                        </button>
                      </div>
                    </motion.div>
                  );
                }

                return (
                  <motion.div
                    key={block.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border p-4 transition ${
                      block.completed
                        ? 'border-emerald-500/20 bg-slate-900/40 opacity-70'
                        : 'border-white/10 bg-slate-900/90 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <button
                        type="button"
                        onClick={() => onToggleBlock(block.id)}
                        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-lg border transition ${
                          block.completed
                            ? 'border-emerald-500 bg-emerald-500 text-slate-950'
                            : 'border-slate-600 bg-slate-950 hover:border-cyan-400'
                        }`}
                      >
                        {block.completed && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                      </button>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p
                            className={`text-sm font-bold ${
                              block.completed ? 'text-slate-400 line-through' : 'text-white'
                            }`}
                          >
                            {block.title}
                          </p>
                          {block.startTime && block.endTime && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-cyan-300 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded-md">
                              <Clock className="h-3 w-3 text-cyan-400" />
                              {block.startTime} – {block.endTime}
                            </span>
                          )}
                        </div>
                        <p className="mt-0.5 text-xs text-slate-400">
                          Category: <span className="text-slate-200 font-semibold">{block.category}</span> • {block.durationMinutes} mins
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      {onEditBlock && (
                        <button
                          type="button"
                          onClick={() => startEditingBlock(block)}
                          className="rounded-xl border border-white/5 bg-white/5 p-2 text-slate-400 hover:text-cyan-300 hover:bg-slate-800 transition"
                          title="Edit Timing & Details"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => onToggleBlock(block.id)}
                        className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                          block.completed
                            ? 'bg-slate-800 text-slate-300'
                            : 'bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/30'
                        }`}
                      >
                        {block.completed ? 'Completed' : 'Mark Done'}
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteBlock(block.id)}
                        className="rounded-xl border border-white/5 bg-white/5 p-2 text-slate-400 hover:text-red-400 transition"
                        title="Remove"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-white/10 p-6 text-center text-xs text-slate-400">
              No active focus blocks yet. Pick a suggested block above or create a custom one!
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
