import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckSquare, Square, Plus, Trash2, Target, Award } from 'lucide-react';
import { DailyMissionTask } from '../types/auralife';
import { getDailyMissionTasks, saveDailyMissionTasks } from '../utils/auralifeData';

export function DailyMission() {
  const [tasks, setTasks] = useState<DailyMissionTask[]>(() => getDailyMissionTasks());
  const [newTaskText, setNewTaskText] = useState('');

  useEffect(() => {
    saveDailyMissionTasks(tasks);
  }, [tasks]);

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;
    const newTask: DailyMissionTask = {
      id: `task-${Date.now()}`,
      text: newTaskText.trim(),
      completed: false,
      category: 'general',
    };
    setTasks((prev) => [...prev, newTask]);
    setNewTaskText('');
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const completedCount = tasks.filter((t) => t.completed).length;
  const totalCount = tasks.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-6 shadow-2xl backdrop-blur-xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-cyan-400" />
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">
              Daily Target
            </p>
          </div>
          <h2 className="text-2xl font-bold text-white mt-1">Today's Mission</h2>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Completion</p>
            <p className="text-xl font-black text-cyan-300">{progressPercent}%</p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-bold text-sm">
            {completedCount}/{totalCount}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1.5">
        <div className="h-3 w-full overflow-hidden rounded-full bg-slate-900 border border-white/5 p-0.5">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-blue-500 to-violet-500 shadow-md"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>
        <div className="flex justify-between text-[11px] text-slate-400 font-medium px-1">
          <span>0%</span>
          <span>{progressPercent === 100 ? '🎉 Mission Accomplished!' : 'Keep going!'}</span>
          <span>100%</span>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {tasks.map((task) => (
            <motion.div
              key={task.id}
              layout
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className={`flex items-center justify-between gap-3 rounded-2xl border p-3.5 transition ${
                task.completed
                  ? 'border-emerald-500/20 bg-slate-900/30 text-slate-400'
                  : 'border-white/10 bg-slate-900/80 text-white hover:border-cyan-400/40'
              }`}
            >
              <button
                type="button"
                onClick={() => toggleTask(task.id)}
                className="flex items-center gap-3 text-left font-semibold text-sm flex-1"
              >
                {task.completed ? (
                  <CheckSquare className="h-5 w-5 text-emerald-400 shrink-0" />
                ) : (
                  <Square className="h-5 w-5 text-slate-500 shrink-0 hover:text-cyan-400" />
                )}
                <span className={task.completed ? 'line-through text-slate-400' : 'text-slate-100'}>
                  {task.text}
                </span>
              </button>

              <button
                type="button"
                onClick={() => deleteTask(task.id)}
                className="text-slate-500 hover:text-red-400 p-1.5 transition"
                title="Delete task"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Add New Mission Task */}
      <form onSubmit={addTask} className="flex gap-2">
        <input
          type="text"
          value={newTaskText}
          onChange={(e) => setNewTaskText(e.target.value)}
          placeholder="+ Add new daily mission goal..."
          className="flex-1 rounded-2xl border border-white/10 bg-slate-900/90 px-4 py-3 text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-400"
        />
        <button
          type="submit"
          className="rounded-2xl bg-cyan-500 px-5 py-3 text-xs font-bold text-slate-950 transition hover:bg-cyan-400 shrink-0"
        >
          Add Goal
        </button>
      </form>
    </div>
  );
}
