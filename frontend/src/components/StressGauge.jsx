import React from 'react';
import { motion } from 'framer-motion';

const StressGauge = ({ score, riskLevel }) => {
  const getGradient = (score) => {
    if (score > 75) return 'from-red-500 to-orange-600 shadow-[0_0_30px_rgba(239,68,68,0.4)]';
    if (score > 55) return 'from-orange-400 to-red-500 shadow-[0_0_30px_rgba(251,146,60,0.3)]';
    if (score > 30) return 'from-yellow-400 to-orange-400 shadow-[0_0_30px_rgba(250,204,21,0.2)]';
    return 'from-emerald-400 to-cyan-500 shadow-[0_0_30px_rgba(52,211,153,0.2)]';
  };

  const getTextColor = (level) => {
    if (level === 'CRITICAL') return 'text-red-500';
    if (level === 'HIGH') return 'text-orange-500';
    if (level === 'MEDIUM') return 'text-yellow-500 font-bold';
    return 'text-emerald-500';
  };

  return (
    <div className="relative flex flex-col items-center w-full">
      {/* 3D Reflection Layer */}
      <div className="absolute inset-0 bg-gradient-to-t from-white/5 to-transparent rounded-full opacity-20 pointer-events-none"></div>
      
      <div className="w-40 h-20 relative group flex justify-center">
        {/* Track */}
        <div className="absolute w-36 h-18 border-[10px] border-slate-800 rounded-t-full top-0"></div>
        {/* Value Fill with Glow */}
        <motion.div 
          initial={{ rotate: -90 }}
          animate={{ rotate: -90 + (score * 1.8) }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className={`absolute w-36 h-18 border-[10px] bg-gradient-to-r rounded-t-full origin-bottom top-0 ${getGradient(score)}`}
          style={{ clipPath: 'inset(0 0 0 0 round 9999px 9999px 0 0)' }}
        ></motion.div>
      </div>

      <div className="mt-4 flex flex-col items-center group cursor-default">
        <motion.span 
          key={score}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-5xl font-black text-white tracking-tighter drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]"
        >
          {score.toFixed(1)}
        </motion.span>
        <span className={`text-[10px] font-black uppercase tracking-[0.3em] mt-1 transition-all group-hover:tracking-[0.5em] duration-500 ${getTextColor(riskLevel)}`}>
          {riskLevel}
        </span>
      </div>
    </div>
  );
};

export default StressGauge;
