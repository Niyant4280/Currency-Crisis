import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const isoToFlag = {
  'IND': 'in', 'TUR': 'tr', 'ARG': 'ar', 'PAK': 'pk', 'LKA': 'lk',
  'EGY': 'eg', 'NGA': 'ng', 'BRA': 'br', 'ZAF': 'za', 'IDN': 'id',
  'MEX': 'mx', 'BGD': 'bd', 'GHA': 'gh', 'KEN': 'ke', 'PHL': 'ph'
};

const getRiskColor = (level) => {
  switch (level) {
    case 'CRITICAL': return 'text-rose-400';
    case 'HIGH': return 'text-orange-400';
    case 'MEDIUM': return 'text-amber-400';
    case 'LOW': return 'text-emerald-400';
    default: return 'text-slate-400';
  }
};

const SearchPalette = ({ countries, isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(0);
  const navigate = useNavigate();
  const inputRef = useRef(null);

  const filtered = countries.filter(c =>
    c.name?.toLowerCase().includes(query.toLowerCase()) ||
    c.iso_code?.toLowerCase().includes(query.toLowerCase()) ||
    c.currency?.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setSelected(0);
    }
  }, [isOpen]);

  const handleSelect = (country) => {
    navigate(`/country/${country.iso_code}`);
    onClose();
  };

  const handleKey = (e) => {
    if (e.key === 'ArrowDown') setSelected(s => Math.min(s + 1, filtered.length - 1));
    if (e.key === 'ArrowUp') setSelected(s => Math.max(s - 1, 0));
    if (e.key === 'Enter' && filtered[selected]) handleSelect(filtered[selected]);
    if (e.key === 'Escape') onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-start justify-center pt-24 bg-slate-950/80 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, y: -10 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: -10 }}
          onClick={e => e.stopPropagation()}
          className="w-full max-w-xl glass-panel rounded-3xl border border-slate-700/60 shadow-2xl overflow-hidden"
        >
          <div className="flex items-center px-5 py-4 border-b border-slate-700/50 space-x-3">
            <svg className="w-5 h-5 text-indigo-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              ref={inputRef}
              value={query}
              onChange={e => { setQuery(e.target.value); setSelected(0); }}
              onKeyDown={handleKey}
              placeholder="Search countries..."
              className="flex-1 bg-transparent text-white placeholder-slate-500 text-lg font-medium focus:outline-none"
            />
            <kbd className="px-2 py-1 text-xs bg-slate-800 text-slate-400 rounded-lg border border-slate-700">ESC</kbd>
          </div>
          
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/50">
            {filtered.length === 0 ? (
              <p className="text-slate-500 text-center py-8 font-medium">No countries found</p>
            ) : filtered.map((c, i) => (
              <button
                key={c.iso_code}
                onClick={() => handleSelect(c)}
                className={`w-full flex items-center space-x-4 px-5 py-3.5 text-left transition-all ${i === selected ? 'bg-indigo-500/10' : 'hover:bg-slate-800/50'}`}
              >
                <span className={`fi fi-${isoToFlag[c.iso_code] || 'un'} text-2xl flex-shrink-0`}></span>
                <div className="flex-1">
                  <p className="font-semibold text-white">{c.name}</p>
                  <p className="text-xs text-slate-500">{c.iso_code} · {c.currency}</p>
                </div>
                <div className="text-right">
                  <p className="text-white font-bold">{(c.latest_stress_score || 0).toFixed(1)}</p>
                  <p className={`text-xs font-bold ${getRiskColor(c.risk_level)}`}>{c.risk_level}</p>
                </div>
                <svg className="w-4 h-4 text-slate-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ))}
          </div>
          <div className="px-5 py-2.5 border-t border-slate-800/50 flex items-center space-x-4 text-xs text-slate-600">
            <span>↑↓ navigate</span>
            <span>↵ select</span>
            <span>ESC close</span>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SearchPalette;
