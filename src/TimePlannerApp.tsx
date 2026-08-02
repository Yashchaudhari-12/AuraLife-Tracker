import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { loadPlannerData, savePlannerData, TimeBlock, TimePlannerState } from './plannerStorage';

const DEFAULT_BLOCKS: TimeBlock[] = [];

function formatDuration(minutes: number) {
  return `${minutes} min`;
}

export function TimePlannerApp() {
  const initialState = useMemo(() => loadPlannerData(), []);
  const [state, setState] = useState<TimePlannerState>(initialState);
  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState(25);
  const [category, setCategory] = useState('Focus');

  const metrics = useMemo(() => {
    const blocks = state.focusBlocks;
    const completedBlocks = blocks.filter((block) => block.completed).length;
    const completedRoutines = state.dailyRoutines.filter((routine) => routine.completed).length;
    return {
      totalBlocks: blocks.length,
      completedBlocks,
      totalRoutines: state.dailyRoutines.length,
      completedRoutines,
      routineCompletionRate: state.dailyRoutines.length
        ? Math.round((completedRoutines / state.dailyRoutines.length) * 100)
        : 0,
      totalDuration: blocks.reduce((sum, block) => sum + block.durationMinutes, 0),
    };
  }, [state]);

  const saveState = (next: TimePlannerState) => {
    setState(next);
    savePlannerData(next);
  };

  const addFocusBlock = () => {
    if (!title.trim() || duration <= 0) return;
    const next: TimePlannerState = {
      ...state,
      focusBlocks: [
        {
          id: `block-${Date.now()}`,
          title: title.trim(),
          durationMinutes: duration,
          category: category.trim() || 'Focus',
          completed: false,
          createdAt: new Date().toISOString(),
        },
        ...state.focusBlocks,
      ],
    };
    saveState(next);
    setTitle('');
    setDuration(25);
    setCategory('Focus');
  };

  const toggleFocusBlock = (id: string) => {
    const next = {
      ...state,
      focusBlocks: state.focusBlocks.map((block) =>
        block.id === id ? { ...block, completed: !block.completed } : block,
      ),
    };
    saveState(next);
  };

  const deleteFocusBlock = (id: string) => {
    saveState({
      ...state,
      focusBlocks: state.focusBlocks.filter((block) => block.id !== id),
    });
  };

  const toggleRoutine = (id: string) => {
    saveState({
      ...state,
      dailyRoutines: state.dailyRoutines.map((routine) =>
        routine.id === id ? { ...routine, completed: !routine.completed } : routine,
      ),
    });
  };

  const completeWeeklyReview = () => {
    saveState({
      ...state,
      weeklyReview: {
        completed: !state.weeklyReview.completed,
        lastReviewed: new Date().toISOString(),
      },
    });
  };

  const resetRoutines = () => {
    saveState({
      ...state,
      dailyRoutines: state.dailyRoutines.map((routine) => ({ ...routine, completed: false })),
    });
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] p-6 text-white">
      <div className="space-y-6">
        <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-6 shadow-2xl shadow-cyan-500/10">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-cyan-300/80">AuraLife Time Planner</p>
              <h1 className="mt-2 text-3xl font-semibold text-white">Plan your study flow with focus blocks</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300/90">
                Add dedicated sessions, track daily routine wins, and keep weekly reviews consistent — all inside AuraLife.
              </p>
            </div>
            <button
              type="button"
              onClick={() => saveState(loadPlannerData())}
              className="inline-flex items-center justify-center rounded-2xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
            >
              Refresh
            </button>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-3xl bg-slate-900/80 p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Focus blocks</p>
              <p className="mt-3 text-3xl font-semibold text-white">{metrics.totalBlocks}</p>
            </div>
            <div className="rounded-3xl bg-slate-900/80 p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Completed blocks</p>
              <p className="mt-3 text-3xl font-semibold text-white">{metrics.completedBlocks}</p>
            </div>
            <div className="rounded-3xl bg-slate-900/80 p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Routine completion</p>
              <p className="mt-3 text-3xl font-semibold text-white">{metrics.routineCompletionRate}%</p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.7fr_1fr]">
          <div className="space-y-6 rounded-3xl border border-white/10 bg-slate-950/80 p-6 shadow-2xl shadow-violet-500/10">
            <div className="space-y-3">
              <h2 className="text-xl font-semibold text-white">Create a Focus Block</h2>
              <p className="text-sm text-slate-400">Use this planner to schedule study, review, or deep work sessions aligned to your weekly goals.</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <label className="block space-y-2">
                <span className="text-sm text-slate-300">Title</span>
                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Study OOPL / Revision sprint"
                  className="w-full rounded-2xl border border-white/10 bg-slate-900/90 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400"
                />
              </label>
              <label className="block space-y-2">
                <span className="text-sm text-slate-300">Duration</span>
                <input
                  type="number"
                  min={5}
                  value={duration}
                  onChange={(event) => setDuration(Number(event.target.value))}
                  className="w-full rounded-2xl border border-white/10 bg-slate-900/90 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400"
                />
              </label>
              <label className="block space-y-2">
                <span className="text-sm text-slate-300">Category</span>
                <input
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                  placeholder="Focus, Review, Project"
                  className="w-full rounded-2xl border border-white/10 bg-slate-900/90 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400"
                />
              </label>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-400">Quickly add a planned focus block and execute it during your study flow.</p>
              <button
                type="button"
                onClick={addFocusBlock}
                className="rounded-2xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-500"
              >
                Add Focus Block
              </button>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white">Today’s Focus Blocks</h3>
              <AnimatePresence mode="popLayout">
                <div className="mt-4 space-y-3">
                  {state.focusBlocks.length > 0 ? (
                    state.focusBlocks.map((block) => (
                      <motion.div
                        key={block.id}
                        layout
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -12 }}
                        className="rounded-3xl border border-white/10 bg-slate-900/90 p-4"
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="text-base font-semibold text-white">{block.title}</p>
                            <p className="mt-1 text-sm text-slate-400">{block.category} • {formatDuration(block.durationMinutes)}</p>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              type="button"
                              onClick={() => toggleFocusBlock(block.id)}
                              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${block.completed ? 'bg-slate-700 text-cyan-300' : 'bg-cyan-500 text-slate-950 hover:bg-cyan-400'}`}
                            >
                              {block.completed ? 'Completed' : 'Mark done'}
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteFocusBlock(block.id)}
                              className="rounded-full bg-white/5 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:bg-white/10"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="rounded-3xl border border-dashed border-white/10 bg-slate-900/80 p-6 text-sm text-slate-400">No focus blocks added yet. Start by planning one block and complete it to build momentum.</div>
                  )}
                </div>
              </AnimatePresence>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Daily Rhythm</p>
                  <h2 className="mt-2 text-xl font-semibold text-white">Routine wins</h2>
                </div>
              </div>
              <div className="mt-5 space-y-3">
                {state.dailyRoutines.map((routine) => (
                  <button
                    key={routine.id}
                    type="button"
                    onClick={() => toggleRoutine(routine.id)}
                    className="flex w-full items-start justify-between rounded-3xl border border-white/10 bg-slate-900/90 p-4 text-left transition hover:border-cyan-400"
                  >
                    <div>
                      <p className="font-semibold text-white">{routine.title}</p>
                      <p className="mt-1 text-sm text-slate-400">{routine.note}</p>
                    </div>
                    <div className={`rounded-full px-3 py-1 text-sm font-semibold ${routine.completed ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-300'}`}>
                      {routine.completed ? 'Done' : 'Pending'}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Weekly Review</p>
                  <h2 className="mt-2 text-xl font-semibold text-white">Keep the loop tight</h2>
                </div>
                <span className="rounded-full bg-slate-800 px-3 py-1 text-sm text-slate-300">{state.weeklyReview.completed ? 'Done' : 'Open'}</span>
              </div>
              <div className="mt-5 space-y-4 text-sm text-slate-400">
                <p>Last reviewed: {state.weeklyReview.lastReviewed ? new Date(state.weeklyReview.lastReviewed).toLocaleDateString() : 'Never'}</p>
                <p>{metrics.completedBlocks} completed focus blocks out of {metrics.totalBlocks} planned.</p>
              </div>
              <div className="mt-6 grid gap-3">
                <button
                  type="button"
                  onClick={completeWeeklyReview}
                  className="rounded-2xl bg-cyan-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
                >
                  {state.weeklyReview.completed ? 'Undo Review' : 'Complete Weekly Review'}
                </button>
                <button
                  type="button"
                  onClick={resetRoutines}
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:border-cyan-400"
                >
                  Reset Daily Routines
                </button>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-6">
              <p className="text-sm text-slate-400">Use the Time Planner for focused study sessions, then mark them complete to build routine momentum. Your completed blocks and review cadence are designed to align with your weekly productivity rhythm.</p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
