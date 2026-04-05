import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

/**
 * Shows a GitHub-style calendar heatmap of monthly stress scores.
 */
const StressCalendar = ({ stressHistory }) => {
  const cells = useMemo(() => {
    if (!stressHistory?.length) return [];
    const map = {};
    stressHistory.forEach(d => {
      const key = `${d.year}`;
      if (!map[key] || d.score > map[key]) map[key] = d.score;
    });

    const currentYear = new Date().getFullYear();
    const result = [];
    for (let y = currentYear - 9; y <= currentYear; y++) {
      result.push({ year: y, score: map[y] || null });
    }
    return result;
  }, [stressHistory]);

  const getColor = (score) => {
    if (score === null) return 'bg-slate-800/60';
    if (score >= 75) return 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]';
    if (score >= 55) return 'bg-orange-500 shadow-[0_0_6px_rgba(249,115,22,0.5)]';
    if (score >= 35) return 'bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.4)]';
    return 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.4)]';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      className="glass-card p-6"
    >
      <h3 className="text-xl font-bold text-white tracking-tight mb-1">10-Year Stress Heatmap</h3>
      <p className="text-slate-500 text-sm mb-5">Annual risk intensity at a glance</p>

      <div className="flex items-end gap-2 flex-wrap">
        {cells.map(({ year, score }) => (
          <div key={year} className="flex flex-col items-center gap-1 group">
            <div
              className={`w-10 h-10 rounded-lg transition-all duration-300 group-hover:scale-125 cursor-default ${getColor(score)}`}
              title={score !== null ? `${year}: ${score.toFixed(1)}` : `${year}: No data`}
            ></div>
            <span className="text-[10px] text-slate-600 font-mono">{year}</span>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center space-x-4 mt-5 text-xs text-slate-500">
        <span>Low risk</span>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 rounded-sm bg-emerald-500"></div>
          <div className="w-3 h-3 rounded-sm bg-amber-500"></div>
          <div className="w-3 h-3 rounded-sm bg-orange-500"></div>
          <div className="w-3 h-3 rounded-sm bg-rose-500"></div>
        </div>
        <span>Critical</span>
      </div>
    </motion.div>
  );
};

export default StressCalendar;
