import React from 'react';
import { motion } from 'framer-motion';

const StressGauge = ({ score, riskLevel }) => {
  // Map score (0-100) to rotation degree (-90 to 90)
  const rotation = -90 + (score / 100) * 180;

  const getColor = () => {
    switch(riskLevel) {
      case 'CRITICAL': return '#f43f5e'; // rose-500
      case 'HIGH': return '#f97316';     // orange-500
      case 'MEDIUM': return '#f59e0b';   // amber-500
      case 'LOW': return '#10b981';      // emerald-500
      default: return '#64748b';         // slate-500
    }
  };

  const color = getColor();

  return (
    <div className="flex flex-col items-center justify-center relative py-10">
      {/* Background ambient glow */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full blur-[50px] opacity-20 pointer-events-none"
        style={{ backgroundColor: color }}
      ></div>

      <div className="relative w-64 h-32 overflow-hidden mx-auto z-10">
        {/* Track */}
        <div className="absolute top-0 left-0 w-64 h-64 border-[30px] border-slate-800 rounded-full box-border"></div>
        
        {/* Glowing Gradient Fill */}
        <motion.div 
          initial={{ rotate: -90 }}
          animate={{ rotate: rotation }}
          transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
          className="absolute top-0 left-0 w-64 h-64 border-[30px] border-transparent rounded-full box-border border-b-transparent border-l-transparent"
          style={{ 
            borderTopColor: color, 
            borderRightColor: color,
            filter: `drop-shadow(0 0 10px ${color})`
          }}
        ></motion.div>
        
        {/* Needle Anchor */}
        <div className="absolute bottom-[-15px] left-[113px] w-[30px] h-[30px] rounded-full bg-slate-700 shadow-xl border-4 border-slate-900 z-20"></div>
        <div className="absolute bottom-[-5px] left-[123px] w-[10px] h-[10px] rounded-full bg-slate-400 shadow-inner z-30"></div>
      </div>
      
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-6 text-center z-10"
      >
        <div className="text-[4rem] font-bold tracking-tighter" style={{ color }}>
          {score.toFixed(1)}
        </div>
        <div className={`text-xl font-bold uppercase tracking-widest mt-1 drop-shadow-md`} style={{ color }}>
          {riskLevel} RISK
        </div>
      </motion.div>
    </div>
  );
};

export default StressGauge;
