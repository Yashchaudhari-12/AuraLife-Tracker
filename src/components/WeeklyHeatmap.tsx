import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Activity, Info } from 'lucide-react';
import { getHeatmapData } from '../utils/auralifeData';
import { HeatmapDay } from '../types/auralife';

export function WeeklyHeatmap() {
  const [heatmapDays] = useState<HeatmapDay[]>(() => getHeatmapData());
  const [hoveredDay, setHoveredDay] = useState<HeatmapDay | null>(null);

  // Intensity color maps
  const intensityColors = {
    0: 'bg-slate-900 border-white/5',
    1: 'bg-cyan-950/80 border-cyan-800/40',
    2: 'bg-cyan-800/80 border-cyan-600/50',
    3: 'bg-cyan-600 border-cyan-400',
    4: 'bg-cyan-400 border-cyan-200 shadow-md shadow-cyan-400/30',
  };

  const totalFocusHours = heatmapDays.reduce((sum, d) => sum + d.hours, 0).toFixed(1);
  const avgFocusHours = (Number(totalFocusHours) / heatmapDays.length).toFixed(1);

  return (
    <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-6 shadow-2xl backdrop-blur-xl space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">
            Activity Matrix
          </p>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Activity className="h-6 w-6 text-cyan-400" />
            Weekly Focus Heatmap
          </h2>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div>
            <span className="text-slate-400">60-Day Total: </span>
            <strong className="text-white font-bold">{totalFocusHours} hrs</strong>
          </div>
          <div>
            <span className="text-slate-400">Avg/Day: </span>
            <strong className="text-cyan-300 font-bold">{avgFocusHours} hrs</strong>
          </div>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="rounded-2xl border border-white/5 bg-slate-900/60 p-4 space-y-3">
        <div className="grid grid-flow-col grid-rows-7 gap-1.5 overflow-x-auto pb-2 scrollbar-none">
          {heatmapDays.map((day, idx) => (
            <motion.div
              key={day.date || idx}
              whileHover={{ scale: 1.25, zIndex: 10 }}
              onMouseEnter={() => setHoveredDay(day)}
              onMouseLeave={() => setHoveredDay(null)}
              className={`h-4 w-4 rounded-md border cursor-pointer transition-colors ${
                intensityColors[day.intensity]
              }`}
            />
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-white/5 pt-2">
          <span>Less Focus</span>
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded bg-slate-900 border border-white/5" />
            <span className="h-3 w-3 rounded bg-cyan-950/80 border border-cyan-800/40" />
            <span className="h-3 w-3 rounded bg-cyan-800/80 border border-cyan-600/50" />
            <span className="h-3 w-3 rounded bg-cyan-600 border border-cyan-400" />
            <span className="h-3 w-3 rounded bg-cyan-400 border border-cyan-200" />
          </div>
          <span>More Focus (4h+)</span>
        </div>
      </div>

      {/* Hover Info Tooltip Bar */}
      {hoveredDay ? (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between rounded-xl border border-cyan-500/30 bg-slate-900 p-3 text-xs text-slate-200"
        >
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-cyan-400" />
            <span className="font-bold text-white">{hoveredDay.date}</span>
          </div>
          <div className="flex items-center gap-4">
            <span>Hours Studied: <strong className="text-cyan-300">{hoveredDay.hours}h</strong></span>
            <span>Tasks Done: <strong className="text-violet-300">{hoveredDay.tasksCount}</strong></span>
            <span>Focus Score: <strong className="text-emerald-300">{hoveredDay.score}%</strong></span>
          </div>
        </motion.div>
      ) : (
        <div className="flex items-center gap-2 text-xs text-slate-500 italic">
          <Info className="h-3.5 w-3.5" />
          <span>Hover over any day square above to view detailed study stats.</span>
        </div>
      )}
    </div>
  );
}
