import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

/**
 * WakingPanel
 * Shown when the Render backend is cold-starting.
 * Displays an animated progress bar, countdown, and a "Retry Now" button.
 */
const WakingPanel = ({ retryIn, retryWaitSecs = 15, attemptNum, maxAttempts, onRetryNow }) => {
  const progressPct = Math.max(0, Math.min(100, ((retryWaitSecs - retryIn) / retryWaitSecs) * 100));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="flex flex-col items-center justify-center min-h-[60vh] px-4"
    >
      <div className="w-full max-w-md glass-panel border border-amber-500/20 rounded-3xl p-8 text-center shadow-[0_0_60px_rgba(245,158,11,0.08)]">

        {/* Animated Server Icon */}
        <div className="relative inline-flex items-center justify-center w-20 h-20 mb-6 mx-auto">
          <div className="absolute inset-0 rounded-full bg-amber-500/10 animate-ping" style={{ animationDuration: '2s' }} />
          <div className="absolute inset-2 rounded-full bg-amber-500/10 animate-ping" style={{ animationDuration: '2s', animationDelay: '0.5s' }} />
          <div className="relative z-10 w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center backdrop-blur-md">
            <ServerIcon />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-xl font-black text-white tracking-tight mb-1">
          Backend Waking Up
        </h2>
        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-4">
          Render Free Tier · Cold Start
        </p>

        {/* Explanation */}
        <p className="text-sm text-slate-400 leading-relaxed mb-6 max-w-xs mx-auto">
          The server sleeps after inactivity. It's waking up now — this typically takes{' '}
          <span className="text-amber-400 font-bold">30–60 seconds</span>.
        </p>

        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mb-3">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-400"
            initial={{ width: '0%' }}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.8, ease: 'linear' }}
          />
        </div>

        {/* Countdown & Attempt */}
        <div className="flex items-center justify-between mb-6">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
            Attempt {attemptNum} / {maxAttempts}
          </span>
          <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest">
            {retryIn > 0 ? `Retrying in ${retryIn}s` : 'Connecting…'}
          </span>
        </div>

        {/* Pulse dots row */}
        <div className="flex items-center justify-center gap-1.5 mb-6">
          {[0, 1, 2, 3, 4].map(i => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-amber-400/60"
              style={{
                animation: 'pulse 1.4s ease-in-out infinite',
                animationDelay: `${i * 0.2}s`,
              }}
            />
          ))}
        </div>

        {/* Retry Now button */}
        <button
          onClick={onRetryNow}
          className="w-full py-3 px-6 bg-amber-500 hover:bg-amber-400 text-black font-black text-sm uppercase tracking-widest rounded-2xl transition-all duration-200 shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:shadow-[0_0_30px_rgba(245,158,11,0.5)] active:scale-95"
        >
          Retry Now
        </button>
      </div>
    </motion.div>
  );
};

const ServerIcon = () => (
  <svg className="w-7 h-7 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"
    />
  </svg>
);

export default WakingPanel;
