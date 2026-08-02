import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, ShieldCheck, AlertCircle, ArrowUpRight, GraduationCap, Plus, Minus, Check, X, Edit3, Save } from 'lucide-react';
import { getStoredSubjects, calculateAttendanceStats, saveStoredSubjects, getOverallAttendanceStats, isLabSubject } from '../utils/auralifeData';
import { Subject } from '../types/auralife';

export function AttendanceIntelligence() {
  const [subjects, setSubjects] = useState<Subject[]>(() => getStoredSubjects());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{ attended: number; total: number }>({ attended: 0, total: 0 });

  const refreshSubjects = () => {
    setSubjects(getStoredSubjects());
  };

  useEffect(() => {
    refreshSubjects();
    const handleUpdate = () => refreshSubjects();
    window.addEventListener('auralife_subjects_updated', handleUpdate);
    return () => window.removeEventListener('auralife_subjects_updated', handleUpdate);
  }, []);

  const handleMarkAttendance = (id: string, isPresent: boolean) => {
    const updated = subjects.map((s) => {
      if (s.id === id) {
        return {
          ...s,
          attended: isPresent ? s.attended + 1 : s.attended,
          total: s.total + 1,
        };
      }
      return s;
    });
    setSubjects(updated);
    saveStoredSubjects(updated);
  };

  const handleStartEdit = (subject: Subject) => {
    setEditingId(subject.id);
    setEditForm({ attended: subject.attended, total: subject.total });
  };

  const handleSaveEdit = (id: string) => {
    const updated = subjects.map((s) => {
      if (s.id === id) {
        return {
          ...s,
          attended: Math.max(0, editForm.attended),
          total: Math.max(1, editForm.total),
        };
      }
      return s;
    });
    setSubjects(updated);
    saveStoredSubjects(updated);
    setEditingId(null);
  };

  const subjectStats = subjects.map((subj) => ({
    subject: subj,
    stats: calculateAttendanceStats(subj),
  }));

  const overallStats = getOverallAttendanceStats();
  const totalAttended = overallStats.totalAttended;
  const totalClasses = overallStats.totalClasses;
  const overallPercentage = overallStats.percentage;

  // Find critical or warning subjects
  const criticals = subjectStats.filter((s) => s.stats.status === 'CRITICAL');
  const warnings = subjectStats.filter((s) => s.stats.status === 'WARNING');
  const primaryAlert = criticals[0] || warnings[0];

  return (
    <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-6 shadow-2xl backdrop-blur-xl space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-white/10 pb-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            College Intelligence Engine
          </p>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-cyan-400" />
            Attendance Intelligence Sync
          </h2>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="rounded-2xl border border-white/10 bg-slate-900/80 px-3.5 py-1.5 text-right">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Theory Attendance</p>
            <p className="text-sm font-extrabold text-white">{overallStats.theoryPercentage}% <span className="text-[10px] font-normal text-slate-400">({overallStats.theoryAttended}/{overallStats.theoryTotal})</span></p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-900/80 px-3.5 py-1.5 text-right">
            <p className="text-[10px] font-bold uppercase tracking-wider text-violet-300">Labs Attendance</p>
            <p className="text-sm font-extrabold text-white">{overallStats.labPercentage}% <span className="text-[10px] font-normal text-slate-400">({overallStats.labAttended}/{overallStats.labTotal})</span></p>
          </div>
          <div className="rounded-2xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-1.5 text-right">
            <p className="text-[10px] font-bold uppercase tracking-wider text-cyan-300">Overall Average</p>
            <p className="text-lg font-black text-white">{overallPercentage}%</p>
          </div>
        </div>
      </div>

      {primaryAlert ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`rounded-2xl border p-5 ${
            primaryAlert.stats.status === 'CRITICAL'
              ? 'border-red-500/40 bg-gradient-to-r from-red-950/50 via-slate-900 to-slate-950 shadow-lg shadow-red-500/10'
              : 'border-amber-500/40 bg-gradient-to-r from-amber-950/50 via-slate-900 to-slate-950 shadow-lg shadow-amber-500/10'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <span className={`flex h-3 w-3 rounded-full animate-ping ${
                primaryAlert.stats.status === 'CRITICAL' ? 'bg-red-500' : 'bg-amber-500'
              }`} />
              <span className={`text-xs font-extrabold uppercase tracking-wider ${
                primaryAlert.stats.status === 'CRITICAL' ? 'text-red-400' : 'text-amber-400'
              }`}>
                ATTENDANCE ALERT
              </span>
            </div>
            <span className="text-2xl font-black text-white">{primaryAlert.stats.percentage}%</span>
          </div>

          <div className="mt-2">
            <h3 className="text-lg font-bold text-white">
              {primaryAlert.subject.name} ({primaryAlert.subject.code})
            </h3>
            <p className="mt-1 text-xs text-slate-300">{primaryAlert.stats.message}</p>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-white/5 pt-3 text-xs">
            <div className="rounded-lg bg-white/5 px-3 py-1.5 font-medium text-slate-200">
              Attended: {primaryAlert.subject.attended}/{primaryAlert.subject.total} classes
            </div>
            {primaryAlert.stats.requiredClasses > 0 && (
              <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-1.5 font-bold text-red-300">
                Need {primaryAlert.stats.requiredClasses} consecutive classes
              </div>
            )}
            <div className="ml-auto flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleMarkAttendance(primaryAlert.subject.id, true)}
                className="rounded-lg bg-emerald-500/20 border border-emerald-500/40 px-3 py-1 text-xs font-bold text-emerald-300 hover:bg-emerald-500/30 transition"
              >
                + Attended Today
              </button>
            </div>
          </div>
        </motion.div>
      ) : (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-4 text-xs text-emerald-300 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 shrink-0 text-emerald-400" />
            <span>All subjects are safely above the 75% target threshold! Total Attendance: <strong>{overallPercentage}%</strong>.</span>
          </div>
        </div>
      )}

      {/* Grid of Subject Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {subjectStats.map(({ subject, stats }) => {
          const isSafe = stats.status === 'SAFE';
          const isWarning = stats.status === 'WARNING';
          const isCritical = stats.status === 'CRITICAL';
          const isEditing = editingId === subject.id;

          return (
            <div
              key={subject.id}
              className={`rounded-2xl border p-4 transition-all space-y-3 ${
                isCritical
                  ? 'border-red-500/30 bg-slate-900/90'
                  : isWarning
                  ? 'border-amber-500/30 bg-slate-900/90'
                  : 'border-white/10 bg-slate-900/60'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">{subject.code}</span>
                  <span
                    className={`rounded px-1.5 py-0.5 text-[9px] font-mono font-bold uppercase ${
                      isLabSubject(subject)
                        ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                        : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    }`}
                  >
                    {isLabSubject(subject) ? 'LAB' : 'THEORY'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider ${
                      isCritical
                        ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                        : isWarning
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}
                  >
                    {stats.status}
                  </span>
                  <button
                    type="button"
                    onClick={() => (isEditing ? handleSaveEdit(subject.id) : handleStartEdit(subject))}
                    className="p-1 text-slate-400 hover:text-cyan-300 transition"
                    title={isEditing ? 'Save' : 'Edit Attendance'}
                  >
                    {isEditing ? <Save className="h-3.5 w-3.5 text-cyan-400" /> : <Edit3 className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-baseline justify-between">
                <p className="text-sm font-bold text-white line-clamp-1">{subject.name}</p>
                <p className="text-lg font-black text-white">{stats.percentage}%</p>
              </div>

              {isEditing ? (
                <div className="p-2.5 rounded-xl bg-slate-950 border border-cyan-500/30 space-y-2 text-xs">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400">Attended</label>
                      <input
                        type="number"
                        min="0"
                        value={editForm.attended}
                        onChange={(e) => setEditForm({ ...editForm, attended: parseInt(e.target.value) || 0 })}
                        className="w-full rounded-lg bg-slate-900 border border-white/10 px-2 py-1 text-xs text-white font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400">Total Held</label>
                      <input
                        type="number"
                        min="1"
                        value={editForm.total}
                        onChange={(e) => setEditForm({ ...editForm, total: parseInt(e.target.value) || 1 })}
                        className="w-full rounded-lg bg-slate-900 border border-white/10 px-2 py-1 text-xs text-white font-bold"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSaveEdit(subject.id)}
                    className="w-full rounded-lg bg-cyan-500 py-1 text-xs font-bold text-slate-950 hover:bg-cyan-400"
                  >
                    Save Attendance
                  </button>
                </div>
              ) : (
                <div className="text-xs text-slate-400 flex items-center justify-between border-t border-white/5 pt-2">
                  <span>Classes: <strong className="text-white">{subject.attended}/{subject.total}</strong></span>
                  {isSafe ? (
                    <span className="text-emerald-400 font-medium">
                      {stats.safeBunks > 0 ? `${stats.safeBunks} bunks left` : 'At 75% limit'}
                    </span>
                  ) : (
                    <span className={isCritical ? 'text-red-400 font-semibold' : 'text-amber-400 font-semibold'}>
                      Need +{stats.requiredClasses} class{stats.requiredClasses > 1 ? 'es' : ''}
                    </span>
                  )}
                </div>
              )}

              {/* Quick Log Buttons */}
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleMarkAttendance(subject.id, true)}
                  className="flex-1 rounded-xl bg-emerald-500/10 border border-emerald-500/30 py-1.5 text-[11px] font-bold text-emerald-300 hover:bg-emerald-500/20 active:scale-95 transition text-center"
                >
                  + Attended
                </button>
                <button
                  type="button"
                  onClick={() => handleMarkAttendance(subject.id, false)}
                  className="flex-1 rounded-xl bg-red-500/10 border border-red-500/30 py-1.5 text-[11px] font-bold text-red-300 hover:bg-red-500/20 active:scale-95 transition text-center"
                >
                  + Missed
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
