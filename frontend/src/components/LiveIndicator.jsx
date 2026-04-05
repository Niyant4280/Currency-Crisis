import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * LiveIndicator – shows a pulsing LIVE badge, last-updated time,
 * and a countdown to the next auto-refresh.
 */
const LiveIndicator = ({ status, countdown, lastRefresh }) => {
  const formatRelative = (dateStr) => {
    if (!dateStr) return '—';
    const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000 / 60 / 60);
    if (diff < 1) return 'less than an hour ago';
    if (diff < 24) return `${diff}h ago`;
    return `${Math.floor(diff / 24)}d ago`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col sm:flex-row items-start sm:items-center gap-3 px-4 py-3 glass-panel rounded-2xl border border-slate-700/50"
    >
      {/* Pulsing LIVE dot */}
      <div className="flex items-center space-x-2">
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
        </span>
        <span className="text-emerald-400 font-bold text-xs tracking-widest uppercase">Live</span>
      </div>

      <div className="h-4 w-px bg-slate-700 hidden sm:block"></div>

      {/* Stats row */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 font-medium">
        {status?.last_score_update && (
          <span>
            Scores updated: <span className="text-slate-200">{formatRelative(status.last_score_update)}</span>
          </span>
        )}
        {status?.total_indicators && (
          <span>
            Indicators: <span className="text-slate-200">{status.total_indicators.toLocaleString()}</span>
          </span>
        )}
        {status?.total_countries && (
          <span>
            Countries: <span className="text-slate-200">{status.total_countries}</span>
          </span>
        )}
      </div>

      <div className="h-4 w-px bg-slate-700 hidden sm:block ml-auto"></div>

      {/* Countdown */}
      <div className="flex items-center space-x-2 text-xs text-slate-500 font-mono sm:ml-auto">
        <svg className="w-3 h-3 text-indigo-400 animate-spin" style={{ animationDuration: '3s' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        <span className="text-slate-400">Refreshing in <span className="text-indigo-400 font-bold">{countdown}s</span></span>
      </div>
    </motion.div>
  );
};

export default LiveIndicator;
