import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock,
  BookOpen,
  FlaskConical,
  CheckCircle2,
  Calendar,
  Sparkles,
  Plus,
  Trash2,
  Building,
  Zap,
  Coffee,
  Check,
  Pencil,
  RotateCcw,
  Sliders,
  X,
  Save,
} from 'lucide-react';
import {
  getTodayDayName,
  getScheduleSlotsForDay,
  getStoredTimetable,
  saveStoredTimetable,
  getStoredSubjects,
  timeToMinutes,
  DEFAULT_TIMETABLE,
} from '../utils/auralifeData';
import { TimetableSlot, Subject } from '../types/auralife';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;

interface TodayTimelineProps {
  selectedDayProp?: string;
  onSelectDay?: (day: string) => void;
}

export function TodayTimeline({ selectedDayProp, onSelectDay }: TodayTimelineProps = {}) {
  const actualToday = getTodayDayName();
  const [selectedDay, setSelectedDay] = useState<string>(selectedDayProp || actualToday);
  const [slots, setSlots] = useState(() => getScheduleSlotsForDay(selectedDayProp || actualToday));
  const [subjects] = useState(() => getStoredSubjects());
  const [showAddForm, setShowAddForm] = useState(false);
  const [showBatchEdit, setShowBatchEdit] = useState(false);

  // Edit slot modal state
  const [editingSlot, setEditingSlot] = useState<TimetableSlot | null>(null);

  useEffect(() => {
    if (selectedDayProp) {
      setSelectedDay(selectedDayProp);
    }
  }, [selectedDayProp]);

  const refreshSlots = () => {
    setSlots(getScheduleSlotsForDay(selectedDay));
  };

  useEffect(() => {
    refreshSlots();
    const handleUpdate = () => refreshSlots();
    window.addEventListener('auralife_schedule_updated', handleUpdate);
    return () => window.removeEventListener('auralife_schedule_updated', handleUpdate);
  }, [selectedDay]);

  // New slot form state
  const [newSubjectId, setNewSubjectId] = useState(subjects[0]?.id || 'subj-dsa');
  const [customTitle, setCustomTitle] = useState('');
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('11:00');
  const [room, setRoom] = useState('LH-101');
  const [slotType, setSlotType] = useState<'theory' | 'lab' | 'self'>('theory');

  const [nowMins, setNowMins] = useState(() => {
    const now = new Date();
    return now.getHours() * 60 + now.getMinutes();
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setNowMins(now.getHours() * 60 + now.getMinutes());
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  // Update slots whenever selected day changes
  useEffect(() => {
    setSlots(getScheduleSlotsForDay(selectedDay));
  }, [selectedDay]);

  const isTodaySelected = selectedDay === actualToday;
  const isWeekend = selectedDay === 'Sunday' || selectedDay === 'Saturday';

  // Find active slot if selected day is today
  const activeIndex = isTodaySelected
    ? slots.findIndex(
        (slot) => nowMins >= timeToMinutes(slot.startTime || '00:00') && nowMins < timeToMinutes(slot.endTime || '23:59')
      )
    : -1;

  const nextSlot = isTodaySelected
    ? slots.find((slot) => timeToMinutes(slot.startTime || '00:00') > nowMins)
    : null;

  let countdownText = 'Schedule Loaded';
  if (isTodaySelected) {
    if (activeIndex >= 0) {
      const currentSlot = slots[activeIndex];
      const minsLeft = timeToMinutes(currentSlot.endTime || '23:59') - nowMins;
      countdownText = `${minsLeft > 0 ? minsLeft : 0} min left in current session`;
    } else if (nextSlot) {
      const minsUntil = timeToMinutes(nextSlot.startTime || '00:00') - nowMins;
      const hours = Math.floor(minsUntil / 60);
      const mins = minsUntil % 60;
      countdownText = hours > 0 ? `Next session in ${hours}h ${mins}m` : `Next session in ${mins}m`;
    } else {
      countdownText = 'All sessions completed today!';
    }
  }

  const handleAddSlot = (e: React.FormEvent) => {
    e.preventDefault();
    const timetable = getStoredTimetable();
    const currentDaySlots = timetable[selectedDay] || [];

    const newSlot: TimetableSlot = {
      id: `slot-${selectedDay}-${Date.now()}`,
      subjectId: slotType === 'self' ? 'subj-gen' : newSubjectId,
      startTime: startTime || '09:00',
      endTime: endTime || '10:00',
      room: room || (slotType === 'self' ? 'Home Focus Studio' : 'LH-101'),
      type: slotType,
    };

    const updatedSlots = [...currentDaySlots, newSlot].sort(
      (a, b) => timeToMinutes(a.startTime || '00:00') - timeToMinutes(b.startTime || '00:00')
    );

    const updatedTimetable = { ...timetable, [selectedDay]: updatedSlots };
    saveStoredTimetable(updatedTimetable);
    setSlots(getScheduleSlotsForDay(selectedDay));
    setShowAddForm(false);
    setCustomTitle('');
  };

  const handleSaveEditSlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSlot) return;

    const timetable = getStoredTimetable();
    const currentDaySlots = timetable[selectedDay] || [];

    const updatedDaySlots = currentDaySlots.map((s) => (s.id === editingSlot.id ? editingSlot : s));
    const sorted = updatedDaySlots.sort(
      (a, b) => timeToMinutes(a.startTime || '00:00') - timeToMinutes(b.startTime || '00:00')
    );

    const updatedTimetable = { ...timetable, [selectedDay]: sorted };
    saveStoredTimetable(updatedTimetable);
    setSlots(getScheduleSlotsForDay(selectedDay));
    setEditingSlot(null);
  };

  const handleDeleteSlot = (slotId: string) => {
    const timetable = getStoredTimetable();
    const currentDaySlots = timetable[selectedDay] || [];
    const filtered = currentDaySlots.filter((s) => s.id !== slotId);
    const updatedTimetable = { ...timetable, [selectedDay]: filtered };
    saveStoredTimetable(updatedTimetable);
    setSlots(getScheduleSlotsForDay(selectedDay));
  };

  const handleResetDayTimetable = () => {
    if (confirm(`Reset ${selectedDay}'s class schedule to default template?`)) {
      const timetable = getStoredTimetable();
      const updatedTimetable = { ...timetable, [selectedDay]: DEFAULT_TIMETABLE[selectedDay] || [] };
      saveStoredTimetable(updatedTimetable);
      setSlots(getScheduleSlotsForDay(selectedDay));
    }
  };

  return (
    <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-5 sm:p-7 shadow-2xl shadow-cyan-500/5 backdrop-blur-xl space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-400">
              Class Timings & Schedule Editor
            </p>
          </div>
          <h2 className="mt-1 text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <Calendar className="h-6 w-6 text-cyan-400" />
            <span>{selectedDay}'s Class Timings</span>
            {isTodaySelected && (
              <span className="rounded-full bg-cyan-500/20 border border-cyan-400/40 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-widest text-cyan-300">
                Today
              </span>
            )}
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-2 rounded-2xl border border-cyan-500/20 bg-cyan-500/10 px-3.5 py-2 text-xs font-semibold text-cyan-300">
            <Clock className="h-4 w-4 text-cyan-400" />
            <span>{countdownText}</span>
          </div>

          <button
            type="button"
            onClick={() => setShowBatchEdit(!showBatchEdit)}
            className="inline-flex items-center gap-1.5 rounded-2xl bg-violet-500/20 border border-violet-400/40 px-3.5 py-2 text-xs font-bold text-violet-200 hover:bg-violet-500/30 transition"
            title="Batch Edit All Class Timings"
          >
            <Sliders className="h-4 w-4" />
            <span>Edit Timings</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setEditingSlot(null);
              setShowAddForm(!showAddForm);
            }}
            className="inline-flex items-center gap-1.5 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 px-3.5 py-2 text-xs font-bold text-cyan-200 hover:bg-cyan-500/30 transition"
          >
            <Plus className="h-4 w-4" />
            <span>Add Slot</span>
          </button>

          <button
            type="button"
            onClick={handleResetDayTimetable}
            className="inline-flex items-center gap-1 rounded-2xl border border-white/10 bg-slate-900/80 px-2.5 py-2 text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title="Reset to Default"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Day Selector Strip */}
      <div className="flex overflow-x-auto gap-2 p-1.5 rounded-2xl bg-slate-900/90 border border-white/10 scrollbar-none">
        {DAYS.map((day) => {
          const isSelected = selectedDay === day;
          const isActualToday = day === actualToday;

          return (
            <button
              key={day}
              type="button"
              onClick={() => {
                setSelectedDay(day);
                if (onSelectDay) onSelectDay(day);
              }}
              className={`relative flex items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
                isSelected
                  ? 'bg-gradient-to-r from-cyan-500 to-violet-600 text-slate-950 shadow-md shadow-cyan-500/20 font-black'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <span>{day}</span>
              {isActualToday && (
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider ${
                    isSelected ? 'bg-slate-950 text-cyan-300' : 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/30'
                  }`}
                >
                  Today
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Weekend / Sunday Banner */}
      {isWeekend && (
        <div className="rounded-2xl border border-violet-500/30 bg-gradient-to-r from-violet-950/50 via-slate-900 to-cyan-950/40 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/20 text-violet-300 border border-violet-500/30">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-white">
                {selectedDay} — College Off / Full-Day Deep Work Window
              </h3>
              <p className="text-xs text-slate-400">
                No college lectures scheduled. Ideal for uninterrupted DSA, portfolio projects, and week prep.
              </p>
            </div>
          </div>
          <span className="rounded-xl border border-violet-400/30 bg-violet-500/10 px-3 py-1.5 text-xs font-extrabold text-violet-300">
            Self-Paced Mode
          </span>
        </div>
      )}

      {/* College Day Banner */}
      {!isWeekend && (
        <div className="rounded-2xl border border-cyan-500/20 bg-slate-900/60 p-3.5 flex items-center justify-between text-xs text-slate-300">
          <span className="flex items-center gap-2">
            <Building className="h-4 w-4 text-cyan-400" />
            <span><strong>{selectedDay} College Schedule:</strong> Regular lectures & practical lab sessions active.</span>
          </span>
          <span className="text-slate-400 hidden sm:inline">{slots.length} Classes Configured</span>
        </div>
      )}

      {/* Batch Timings Editor Table (Opens when clicking 'Edit Timings') */}
      <AnimatePresence>
        {showBatchEdit && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden rounded-2xl border border-violet-500/40 bg-slate-900/95 p-5 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h4 className="text-sm font-black uppercase tracking-wider text-violet-300 flex items-center gap-2">
                  <Sliders className="h-4 w-4 text-violet-400" />
                  Quick Class Timings Configurator ({selectedDay})
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Directly adjust start time, end time, room number, or subject for every class in {selectedDay}'s schedule.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowBatchEdit(false)}
                className="rounded-lg p-1 text-slate-400 hover:text-white hover:bg-white/10"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1">
              {slots.map((slot, index) => (
                <div
                  key={slot.id || index}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 rounded-xl border border-white/5 bg-slate-950/80"
                >
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <span className="text-xs font-mono font-bold text-violet-400 w-6">#{index + 1}</span>
                    <select
                      value={slot.subjectId}
                      onChange={(e) => {
                        const newSubjId = e.target.value;
                        const timetable = getStoredTimetable();
                        const currentDaySlots = timetable[selectedDay] || [];
                        const updated = currentDaySlots.map((s) =>
                          s.id === slot.id ? { ...s, subjectId: newSubjId } : s
                        );
                        saveStoredTimetable({ ...timetable, [selectedDay]: updated });
                        setSlots(getScheduleSlotsForDay(selectedDay));
                      }}
                      className="rounded-lg border border-white/10 bg-slate-900 px-2.5 py-1.5 text-xs font-bold text-white focus:border-cyan-400"
                    >
                      {subjects.map((subj) => (
                        <option key={subj.id} value={subj.id}>
                          {subj.code} - {subj.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <label className="text-[11px] text-slate-400 font-semibold">Start:</label>
                    <input
                      type="time"
                      value={slot.startTime || '09:00'}
                      onChange={(e) => {
                        const newStart = e.target.value;
                        const timetable = getStoredTimetable();
                        const currentDaySlots = timetable[selectedDay] || [];
                        const updated = currentDaySlots.map((s) =>
                          s.id === slot.id ? { ...s, startTime: newStart } : s
                        );
                        saveStoredTimetable({ ...timetable, [selectedDay]: updated });
                        setSlots(getScheduleSlotsForDay(selectedDay));
                      }}
                      className="rounded-lg border border-white/10 bg-slate-900 px-2 py-1 text-xs font-mono text-cyan-300 font-bold focus:border-cyan-400"
                    />

                    <label className="text-[11px] text-slate-400 font-semibold">End:</label>
                    <input
                      type="time"
                      value={slot.endTime || '10:00'}
                      onChange={(e) => {
                        const newEnd = e.target.value;
                        const timetable = getStoredTimetable();
                        const currentDaySlots = timetable[selectedDay] || [];
                        const updated = currentDaySlots.map((s) =>
                          s.id === slot.id ? { ...s, endTime: newEnd } : s
                        );
                        saveStoredTimetable({ ...timetable, [selectedDay]: updated });
                        setSlots(getScheduleSlotsForDay(selectedDay));
                      }}
                      className="rounded-lg border border-white/10 bg-slate-900 px-2 py-1 text-xs font-mono text-cyan-300 font-bold focus:border-cyan-400"
                    />

                    <input
                      type="text"
                      value={slot.room || 'LH-101'}
                      onChange={(e) => {
                        const newRoom = e.target.value;
                        const timetable = getStoredTimetable();
                        const currentDaySlots = timetable[selectedDay] || [];
                        const updated = currentDaySlots.map((s) =>
                          s.id === slot.id ? { ...s, room: newRoom } : s
                        );
                        saveStoredTimetable({ ...timetable, [selectedDay]: updated });
                        setSlots(getScheduleSlotsForDay(selectedDay));
                      }}
                      placeholder="Room"
                      className="w-20 rounded-lg border border-white/10 bg-slate-900 px-2 py-1 text-xs text-slate-200 focus:border-cyan-400"
                    />

                    <button
                      type="button"
                      onClick={() => handleDeleteSlot(slot.id)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 transition"
                      title="Delete Slot"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setShowBatchEdit(false)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-violet-500 px-4 py-2 text-xs font-bold text-slate-950 shadow-md"
              >
                <Check className="h-4 w-4" />
                <span>Done Editing Timings</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Single Slot Modal Form */}
      <AnimatePresence>
        {editingSlot && (
          <motion.form
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            onSubmit={handleSaveEditSlot}
            className="rounded-2xl border border-cyan-400/50 bg-slate-900 p-4 space-y-4 shadow-2xl ring-1 ring-cyan-400/30"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-cyan-300 flex items-center gap-2">
                <Pencil className="h-3.5 w-3.5" />
                Edit Class Timing & Room ({selectedDay})
              </h4>
              <button
                type="button"
                onClick={() => setEditingSlot(null)}
                className="text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">Subject</label>
                <select
                  value={editingSlot.subjectId}
                  onChange={(e) => setEditingSlot({ ...editingSlot, subjectId: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-xs font-medium text-white focus:border-cyan-400"
                >
                  {subjects.map((subj) => (
                    <option key={subj.id} value={subj.id}>
                      {subj.code} - {subj.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">Slot Type</label>
                <select
                  value={editingSlot.type}
                  onChange={(e) => setEditingSlot({ ...editingSlot, type: e.target.value as any })}
                  className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-xs font-medium text-white focus:border-cyan-400"
                >
                  <option value="theory">Theory Lecture</option>
                  <option value="lab">Practical Lab</option>
                  <option value="self">Self Study / Project</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">Start & End Time</label>
                <div className="flex gap-2">
                  <input
                    type="time"
                    value={editingSlot.startTime || '09:00'}
                    onChange={(e) => setEditingSlot({ ...editingSlot, startTime: e.target.value })}
                    className="w-1/2 rounded-xl border border-white/10 bg-slate-950 px-2.5 py-2 text-xs text-white font-mono"
                  />
                  <input
                    type="time"
                    value={editingSlot.endTime || '10:00'}
                    onChange={(e) => setEditingSlot({ ...editingSlot, endTime: e.target.value })}
                    className="w-1/2 rounded-xl border border-white/10 bg-slate-950 px-2.5 py-2 text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">Room / Location</label>
                <input
                  type="text"
                  value={editingSlot.room || ''}
                  onChange={(e) => setEditingSlot({ ...editingSlot, room: e.target.value })}
                  placeholder="e.g. LH-101 / CS-LAB2"
                  className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-xs text-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingSlot(null)}
                className="rounded-xl border border-white/10 bg-slate-950 px-4 py-2 text-xs font-semibold text-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2 text-xs font-bold text-slate-950 shadow-md"
              >
                <Save className="h-3.5 w-3.5" />
                <span>Save Timings</span>
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Add Slot Form Inline Panel */}
      <AnimatePresence>
        {showAddForm && !editingSlot && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleAddSlot}
            className="overflow-hidden rounded-2xl border border-cyan-500/30 bg-slate-900 p-4 space-y-4 shadow-xl"
          >
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-cyan-300">
                Add Slot to {selectedDay}'s Schedule
              </h4>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">Slot Category</label>
                <select
                  value={slotType}
                  onChange={(e) => setSlotType(e.target.value as any)}
                  className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-xs font-medium text-white focus:border-cyan-400 focus:outline-none"
                >
                  <option value="theory">College Lecture (Theory)</option>
                  <option value="lab">College Practical (Lab)</option>
                  <option value="self">Self-Study / Project Block</option>
                </select>
              </div>

              {slotType !== 'self' ? (
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">Select Subject</label>
                  <select
                    value={newSubjectId}
                    onChange={(e) => setNewSubjectId(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-xs font-medium text-white focus:border-cyan-400 focus:outline-none"
                  >
                    {subjects.map((subj) => (
                      <option key={subj.id} value={subj.id}>
                        {subj.code} - {subj.name}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">Custom Activity Title</label>
                  <input
                    type="text"
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    placeholder="e.g. DSA Tree Hard Problems"
                    className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-xs text-white placeholder-slate-600 focus:border-cyan-400 focus:outline-none"
                  />
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">Start & End Time</label>
                <div className="flex gap-2">
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-1/2 rounded-xl border border-white/10 bg-slate-950 px-2.5 py-2 text-xs text-white focus:border-cyan-400 focus:outline-none"
                  />
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-1/2 rounded-xl border border-white/10 bg-slate-950 px-2.5 py-2 text-xs text-white focus:border-cyan-400 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">Room / Location</label>
                <input
                  type="text"
                  value={room}
                  onChange={(e) => setRoom(e.target.value)}
                  placeholder="e.g. LH-101 / Home"
                  className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-xs text-white placeholder-slate-600 focus:border-cyan-400 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 px-5 py-2.5 text-xs font-bold text-slate-950 shadow-md hover:opacity-90"
            >
              <Check className="h-4 w-4" />
              <span>Save Slot to {selectedDay}</span>
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Timeline Slot Cards */}
      {slots.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center space-y-3">
          <Coffee className="mx-auto h-8 w-8 text-slate-500" />
          <p className="text-sm font-semibold text-slate-300">No events or lectures added for {selectedDay}</p>
          <p className="text-xs text-slate-500">Click "+ Add Slot" above to configure your day schedule!</p>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row gap-3 overflow-x-auto pb-2 scrollbar-none">
          {slots.map((slot, index) => {
            const startStr = slot.startTime || '09:00';
            const endStr = slot.endTime || '10:00';
            const start = timeToMinutes(startStr);
            const end = timeToMinutes(endStr);

            const isCompleted = isTodaySelected && nowMins >= end;
            const isActive = isTodaySelected && nowMins >= start && nowMins < end;
            const isSelf = slot.type === 'self';
            const subjectName = slot.subject?.name || 'Class Session';
            const subjectCode = slot.subject?.code || subjectName || 'CLASS';
            const isLab = slot.type === 'lab' || subjectName.toLowerCase().includes('lab');

            return (
              <motion.div
                key={slot.id || index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`relative min-w-[220px] flex-1 rounded-2xl border p-4.5 transition-all group ${
                  isActive
                    ? 'border-cyan-400/80 bg-gradient-to-br from-cyan-950/70 to-slate-900 shadow-xl shadow-cyan-500/20 ring-1 ring-cyan-400/50'
                    : isCompleted
                    ? 'border-white/5 bg-slate-900/40 opacity-75'
                    : 'border-white/10 bg-slate-900/80 hover:border-white/20'
                }`}
              >
                {isActive && (
                  <div className="absolute -top-2.5 right-4 rounded-full bg-cyan-400 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-950 shadow-md">
                    LIVE NOW
                  </div>
                )}

                <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
                  <span className="flex items-center gap-1 text-slate-300 font-mono font-bold">
                    <Clock className="h-3.5 w-3.5 text-cyan-400" />
                    {startStr} - {endStr}
                  </span>

                  {isSelf ? (
                    <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-300 border border-emerald-500/30">
                      <Zap className="h-2.5 w-2.5" /> Self Work
                    </span>
                  ) : isLab ? (
                    <span className="inline-flex items-center gap-1 rounded-md bg-violet-500/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-violet-300 border border-violet-500/30">
                      <FlaskConical className="h-2.5 w-2.5" /> Lab
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-md bg-blue-500/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-300 border border-blue-500/30">
                      <BookOpen className="h-2.5 w-2.5" /> Theory
                    </span>
                  )}
                </div>

                <div className="mt-3">
                  <h3
                    className={`text-base font-extrabold ${
                      isActive
                        ? 'text-white'
                        : isCompleted
                        ? 'text-slate-300 line-through decoration-slate-600'
                        : 'text-slate-100'
                    }`}
                  >
                    {subjectCode}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-1">{subjectName}</p>
                </div>

                <div className="mt-3.5 flex items-center justify-between border-t border-white/5 pt-2.5 text-xs">
                  <span className="text-slate-400 font-medium">{slot.room || 'LH-101'}</span>

                  <div className="flex items-center gap-1.5">
                    {isCompleted ? (
                      <span className="flex items-center gap-1 text-emerald-400 font-medium text-[11px]">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Done
                      </span>
                    ) : isActive ? (
                      <span className="text-cyan-300 font-bold text-[11px]">In Session</span>
                    ) : (
                      <span className="text-slate-400 font-medium text-[11px]">Scheduled</span>
                    )}

                    <button
                      type="button"
                      onClick={() => setEditingSlot(slot)}
                      className="p-1 text-slate-400 hover:text-cyan-300 hover:bg-white/10 rounded transition"
                      title="Edit Class Timing"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteSlot(slot.id)}
                      className="p-1 text-slate-500 hover:text-rose-400 transition"
                      title="Remove Slot"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

