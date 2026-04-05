import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ISO_TO_FLAG } from '../constants/countries';

const getRiskColor = (level) => {
  switch (level) {
    case 'CRITICAL': return 'bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.6)]';
    case 'HIGH': return 'bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]';
    case 'MEDIUM': return 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]';
    case 'LOW': return 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]';
    default: return 'bg-slate-600';
  }
};

const getRiskBadge = (level) => {
  switch (level) {
    case 'CRITICAL': return 'badge-critical';
    case 'HIGH': return 'badge-high';
    case 'MEDIUM': return 'badge-medium';
    case 'LOW': return 'badge-low';
    default: return 'badge-unknown';
  }
};

const getCrisisCountdown = (score, risk) => {
  if (risk === 'CRITICAL') return { label: 'CRITICAL NOW', color: 'text-rose-400' };
  if (score <= 0) return null;
  // Extrapolate months assuming score grows ~1.5 points/month (simplified model)
  const remaining = 75 - score;
  if (remaining <= 0) return { label: 'CRITICAL NOW', color: 'text-rose-400' };
  const months = Math.round(remaining / 1.2);
  const color = months < 6 ? 'text-rose-400' : months < 18 ? 'text-orange-400' : 'text-amber-400';
  if (months <= 0) return { label: 'Nearly Critical', color: 'text-rose-400' };
  return { label: `Crisis in ${months}mo`, color };
};

const CountryCard = ({ country, rank, animationDelay, isWatched, onWatchToggle, compact }) => {
  const navigate = useNavigate();
  const stress_score = country.latest_stress_score || 0;
  const risk_level = country.risk_level || 'UNKNOWN';
  const flagCode = ISO_TO_FLAG[country.iso_code] || 'un';
  const countdown = getCrisisCountdown(stress_score, risk_level);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: animationDelay * 0.05, ease: "easeOut" }}
      whileHover={{ y: -5, scale: 1.02 }}
      onClick={() => navigate(`/country/${country.iso_code}`)}
      className={`glass-card ${compact ? 'p-3' : 'p-5'} cursor-pointer relative overflow-hidden group`}
    >
      {/* Ambient glow */}
      <div className={`absolute -right-20 -top-20 w-40 h-40 blur-3xl opacity-20 rounded-full transition-all duration-500 group-hover:opacity-40 ${
        risk_level === 'CRITICAL' ? 'bg-rose-500' : 
        risk_level === 'HIGH' ? 'bg-orange-500' : 
        risk_level === 'MEDIUM' ? 'bg-amber-500' : 
        risk_level === 'LOW' ? 'bg-emerald-500' : 'bg-transparent'
      }`}></div>

      {/* Watchlist Star */}
      {onWatchToggle && (
        <button
          onClick={e => { e.stopPropagation(); onWatchToggle(); }}
          className={`absolute top-3 right-3 z-20 p-1.5 rounded-full transition-all text-lg ${
            isWatched ? 'text-amber-400' : 'text-slate-700 hover:text-slate-400'
          }`}
        >
          {isWatched ? '⭐' : '☆'}
        </button>
      )}

      <div className={`flex justify-between items-start ${compact ? 'mb-3' : 'mb-6'} relative z-10`}>
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-slate-700/50 shadow-lg flex items-center justify-center bg-slate-800 flex-shrink-0">
            <span className={`fi fi-${flagCode} text-xl`}></span>
          </div>
          <div>
            <h3 className={`${compact ? 'text-base' : 'text-xl'} font-bold text-white tracking-tight`}>{country.name}</h3>
            <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-400 mt-0.5 uppercase">
              <span className="text-indigo-400">{country.currency}</span>
              <span className="w-1 h-1 rounded-full bg-slate-600"></span>
              <span>{country.iso_code}</span>
            </div>
          </div>
        </div>
        <div className={`px-2.5 py-1 rounded-full text-xs font-bold tracking-wider ${getRiskBadge(risk_level)} ${onWatchToggle ? 'mr-6' : ''}`}>
          {risk_level}
        </div>
      </div>

      <div className="mt-2 relative z-10">
        <div className="flex justify-between text-sm mb-1.5">
          <span className="text-slate-400 font-medium text-xs">Stress Score</span>
          <span className="font-bold text-white">{stress_score.toFixed(1)}</span>
        </div>
        <div className="w-full bg-slate-800/80 rounded-full h-2 overflow-hidden border border-slate-700/30">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(stress_score, 100)}%` }}
            transition={{ duration: 1, ease: "easeOut", delay: animationDelay * 0.05 + 0.2 }}
            className={`h-2 rounded-full ${getRiskColor(risk_level)}`}
          ></motion.div>
        </div>
        {/* Feature 5: Countdown badge */}
        {countdown && !compact && (
          <p className={`text-xs mt-2 font-semibold ${countdown.color}`}>⏱ {countdown.label}</p>
        )}
      </div>
      
      {rank && !compact && (
        <div className="absolute bottom-3 right-4 text-[3rem] font-bold text-slate-800/20 pointer-events-none select-none z-0">
          #{rank}
        </div>
      )}
    </motion.div>
  );
};

export default CountryCard;
